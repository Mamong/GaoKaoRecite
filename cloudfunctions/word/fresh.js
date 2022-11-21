const {
  resultMsg
} = require('./common.js')

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
  throwOnNotFound: false
});

// 获取openId云函数入口函数
exports.main = async (event, context) => {
  switch (event._action) {
    case 'add':
      return await wordRipeAdd(event, context);
    case 'remove':
      return await wordRipeRemove(event, context);
  }
};