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

async function wordRipeAdd(event) {
  const wxContext = cloud.getWXContext()
  const {
    word
  } = event

  const db = cloud.database()
  const _ = db.command
  var $ = db.command.aggregate

  let res = await db.collection("Ripe").where({
    uid: wxContext.OPENID
  }).get()

  if (res.data.length == 0) {
    await db.collection("Ripe").add({
      data: {
        uid: wxContext.OPENID,
        createAt: new Date(),
        list: [word]
      }
    })
  } else {
    await db.collection("Ripe").where({
      uid: wxContext.OPENID
    }).update({
      data: {
        list: _.addToSet(word)
      }
    })
  }
  return resultMsg(1000, 'OK')
}

async function wordRipeRemove(event) {
  const wxContext = cloud.getWXContext()
  const {
    word
  } = event

  const db = cloud.database()
  const _ = db.command
  var $ = db.command.aggregate

  await db.collection("Ripe").where({
    uid: wxContext.OPENID
  }).update({
    list: _.pull(word)
  })

  return resultMsg(1000, 'OK')
}