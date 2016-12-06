'use strict';

const _ = require('lodash');

const errors = require('../../lib/errors');
const birthday = require('../../service/birthday');

let format = function (setting) {
  let filter = ['setting_id', 'advance', 'time'];
  return _.pick(setting, filter);
};

module.exports = {
  *get(req, res) {
    let user_id = req.session.user.user_id;
    let birth_id = req.query.birth_id;

    // 判断所有权
    let birth = yield birthday.getBirthAsync(birth_id);
    if (!birth || birth.user_id !== user_id) {
      throw new errors.NotFound('未找到相关生日');
    }

    let result = [];
    let settings = yield birthday.findSettingAsync(birth_id);
    for (let setting of settings) {
      result.push(format(setting));
    }
    res.json(result);
  },

  *post(req, res) {
    let user_id = req.session.user.user_id;
    let birth_id = req.body.birth_id;
    let data = _.pick(req.body, ['advance', 'time']);

    // 判断所有权
    let birth = yield birthday.getBirthAsync(birth_id);
    if (!birth || birth.user_id !== user_id) {
      throw new errors.NotFound('未找到相关生日');
    }

    let setting = yield birthday.addSettingAsync(birth_id, data);
    res.json(format(setting));
  },

  *delete(req, res) {
    let user_id = req.session.user.user_id;
    let setting_id = req.query.setting_id;

    // 获取设置信息
    let setting = yield birthday.getSettingAsync(setting_id);
    if (!setting) {
      res.json({result: true});
      return;
    }

    // 获取设置对应的生日
    let birth = yield birthday.getBirthAsync(setting.birth_id);
    if (!birth || birth.user_id !== user_id) {
      res.json({result: true});
      return;
    }

    // 删除设置
    yield birthday.deleteSettingAsync(setting_id);
    res.json({result: true});
  },
};
