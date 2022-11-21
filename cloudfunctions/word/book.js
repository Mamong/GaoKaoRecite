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
    case 'list':
      return await getBookList(event, context);
    case 'words':
      return await getBookWords(event, context);
  }
};

async function getBookList(event) {
  const wxContext = cloud.getWXContext()
  const {
    page = 0,
    perpage = 20,
    key
  } = event

  const db = cloud.database()
  const _ = db.command
  var $ = db.command.aggregate

  let match = {
    major_type:key
  }
  if(key == 0){
    match = {
      major_type:_.gte(0)
    }
  }else if(key == 12){
    match = {
      major_type:_.or([_.lt(6),_.gt(11)])
    }
  }

  let res = await db.collection("Book")
    .aggregate()
    .match(match)
    .sort({
      _id: 1
    })
    .lookup({
      from: 'Ripe',
      let: {
        id: '$_id',
      },
      pipeline: $.pipeline()
        .match(_.expr($.and([
          $.eq(['$bookId', '$$id']),
          $.eq(['$uid', wxContext.OPENID])
        ])))
        .project({
          _id: 0,
          ripeCount: '$total'
        })
        .done(),
      as: 'ripes',
    })
    .replaceRoot({
      newRoot: $.mergeObjects(['$$ROOT', $.arrayElemAt(['$ripes', 0])])
    })
    .project({
      ripes: 0
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

async function getBookWords(event) {
  const wxContext = cloud.getWXContext()
  const {
    bookId,
    status,
    page = 0,
    perpage = 20
  } = event

  const db = cloud.database()
  const _ = db.command
  var $ = db.command.aggregate

  let bookRes = await db.collection("Book").where({
    _id: bookId
  }).get()
  let {
    name,
    word_count
  } = bookRes.data[0]

  let ripeRes = await db.collection("Ripe").where({
    uid: wxContext.OPENID
  }).get()
  let ripeList = ripeRes.data[0].list

  let op = _.nin(ripeList)
  if (status == 1) {
    op = _.in(ripeList)
  }
  let res = await db.collection("Word")
    .where({
      bookId,
      word_name: op
    })
    .orderBy('word_name', 'asc')
    .limit(perpage)
    .skip(page * perpage)
    .get()

  let result = {
    page,
    perpage,
    list: res.data,
    book: {
      name,
      word_count,
      fresh: word_count - ripeList.length,
      ripe: ripeList.length
    }
  }
  return resultMsg(1000, 'OK', result)
}