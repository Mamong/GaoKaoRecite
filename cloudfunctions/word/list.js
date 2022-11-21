const {
  resultMsg
} = require('./common.js')
const utils = require('./utils');

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
  throwOnNotFound: false
});

// 获取openId云函数入口函数
exports.main = async (event, context) => {
  switch (event._action) {
    case 'market':
      return await getListMarket(event, context);
    case 'create':
      return await createList(event, context);
  }
};


async function getListMarket(event) {
  const wxContext = cloud.getWXContext()
  const {
    type = 0,//0自己，1市场
    page = 0,
      perpage = 20
  } = event

  const db = cloud.database()
  const _ = db.command
  var $ = db.command.aggregate

  let match = {
    uid: wxContext.OPENID
  }
  if(type == 1){
    match = {
      bookId: _.exists(false)
    }
  }

  let res = await db.collection("List").aggregate()
    .match(match)
    .sort({
      updateAt: -1
    })
    .skip(page * perpage)
    .limit(perpage)
    .end()

  let result = {
    page,
    perpage,
    list: res.list
  }
  return resultMsg(1000, 'OK', result)
}

async function createList(event) {
  const wxContext = cloud.getWXContext()
  const {
    title,
    fileName,
    fileId,
    wordCount,
    listCount,
  } = event

  const db = cloud.database()
  const _ = db.command
  var $ = db.command.aggregate
   
  let {
    groups
  } = await utils.readXlsx(fileId)

  await db.collection("List").add({
    data: {
      title,
      fileName,
      fileId,
      wordCount,
      listCount,
      lists: groups,
      createAt: new Date(),
      uid: wxContext.OPENID
    }
  })
  return resultMsg(1000, '创建完成')
}
