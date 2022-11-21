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
    case 'index':
      return await getScheduleIndex(event, context);
    case 'list':
      return await getScheduleList(event, context);

    case 'uploadRecords':
      return await uploadRecords(event, context);
    case 'records':
      return await getRecords(event, context);
  }
};

async function getScheduleIndex(event) {
  const wxContext = cloud.getWXContext()
  const {
    scheduleId,
    // page = 0,
    // perpage = 20
  } = event

  const db = cloud.database()
  const _ = db.command
  var $ = db.command.aggregate

  let scheduleRes = await db.collection("Schedule").doc(scheduleId).get()
  const { planId } = scheduleRes.data

  let planRes = await db.collection("Plan").doc(planId).get()

  const {
    strategyId
  } = planRes.data
  const intervals = strategyId == 1 ? [1, 2, 4, 7, 15] : [1, 2]

  // let scheduleRes = await db.collection("Schedule").where({
  //     planId,
  //     uid: wxContext.OPENID
  //   })
  //   .field({
  //     day: true,
  //     lists: true
  //   })
  //   .orderBy('day', 'asc')
  //   .get()


  let exerciseRes = await db.collection("Exercise").where({
    planId,
    uid: wxContext.OPENID
  }).get()

  let map = {}
  for (item of exerciseRes.data) {
    const {
      day,
      index
    } = item
    map[day + '-' + index] = item
  }

  let lists = scheduleRes.data.lists
  lists.forEach((item,index) => {
    let lists = item
    //let finishAll = true
    for (let gIndex = 0; gIndex < lists.length; gIndex++) {
      let list = lists[gIndex]
      const {
        status = 0
      } = map[(index +1) + '-' + list] || {}
      //if (list != 0 && status != 2) finishAll = false
      lists[gIndex] = {
        list,
        status
      }
    }
    //item.finish = finishAll
  })

  let result = {
    intervals,
    list:lists
  }
  return resultMsg(1000, 'OK', result)
}

/**
 * 
 * 某一天某个列表的单词
 */
async function getScheduleList(event) {
  const wxContext = cloud.getWXContext()
  let {
    scheduleId,
    day,
    index,
    // page = 0,
    // perpage = 20
  } = event

  const db = cloud.database()
  const _ = db.command
  var $ = db.command.aggregate

  let dayRes = await db.collection("Schedule").doc(scheduleId).get()
  const {
    //day,
    //planId,
    listId
  } = dayRes.data

  let lists = dayRes.data.lists[day-1].filter(item => item > 0)
  if (!index) {
    index = lists[0]
  }

  let listRes = await db.collection("List").doc(listId).get()

  let {
    _id,
    bookId,
  } = listRes.data

  let res
  if (bookId) {
      res = await db.collection("List").aggregate()
      .match({
        _id:listId
        //planId,
        //index
      })
      .project({
        _id:0,
        word_name:$.arrayElemAt(['$lists', day-1]),
      })
      .unwind({
        path: '$word_name',
      })
      .lookup({
        from: 'Word',
        let: {
          word_name: '$word_name',
        },
        pipeline: $.pipeline()
        .match(_.expr($.and([
          $.eq(['$$bookId', bookId]),
          $.in(['$word_name', '$$word_name'])
        ])))
        .done(),
        as: 'words',
      })
      .replaceRoot({
        newRoot: $.mergeObjects(['$$ROOT', $.arrayElemAt(['$words', 0])])
      })
      .project({
        words:0
      })
      .limit(1000)
      .end()
  } else {
    res = await db.collection("List").aggregate()
      .match({
        _id:listId
        //planId,
        //index
      })
      .project({
        _id:0,
        word_name:$.arrayElemAt(['$lists', day-1]),
        //word_name:'$list'
      })
      .unwind({
        path: '$word_name',
      })
      .lookup({
        from: 'Dictionary',
        let: {
          word_name: '$word_name',
        },
        pipeline: $.pipeline()
        .match(
          _.expr($.eq(['$word_name', '$$word_name']))
        )
        .done(),
        as: 'words',
      })
      .replaceRoot({
        newRoot: $.mergeObjects(['$$ROOT', $.arrayElemAt(['$words', 0])])
      })
      .project({
        words:0
      })
      .limit(1000)
      .end()

    // res = await db.collection("Dictionary")
    //   .where({
    //     word_name: _.in(list)
    //   })
    //   .limit(1000)
    //   .get()
  }
  let result = {
    // page,
    // perpage,
    listId: _id,
    bookId,
    day,
    index,
    lists,
    list: res.list,
  }
  return resultMsg(1000, 'OK', result)
}

async function uploadRecords(event) {
  const wxContext = cloud.getWXContext()
  const {
    scheduleId,
    day,
    index,
    records,
    type,
  } = event

  const db = cloud.database()
  const _ = db.command
  var $ = db.command.aggregate

  const scheduleRes = await db.collection("Schedule").doc(scheduleId).get()

  const {
    //day,
    planId,
    listId
  } = scheduleRes.data

  let list = null
  if (planId) {
    console.log(planId + ";" + index)
    let dayRes = await db.collection("List").doc(listId).get()
    list = dayRes.data.lists[index]
    console.log(JSON.stringify(dayRes))
  }
  if (!list) {
    return resultMsg(1006, '该清单为空')
  }
  // const {
  //   list,
  // } = wlist
  const total = list.length
  const study = records.length
  const learn = records.filter(item => item.correct).length

  const transaction = await db.startTransaction()

  const res = await transaction.collection("Exercise").where({
    scheduleId,
    index,
    type,
    uid: wxContext.OPENID
  }).get()

  let data = {
    planId,
    scheduleId,
    day,
    index,
    records,
    type,
    total,
    study,
    learn,
    uid: wxContext.OPENID,
  }
  let status = total == learn ? 2 : (study > 0 ? 1 : 0)
  if (res.data.length == 0) {
    data.updateAt = data.createAt = new Date()
    data.status = status
    await transaction.collection("Exercise").add({
      data
    })
  } else {
    data.updateAt = new Date()
    data.status = _.max(status)
    await transaction.collection("Exercise").where({
      scheduleId,
      day,
      type,
      uid: wxContext.OPENID
    }).update({
      data
    })
  }
  await transaction.collection("Plan")
    .where({
      _id: planId,
      uid: wxContext.OPENID
    })
    .update({
      data: {
        current: day,
        newest: _.max(day),
        updateAt: new Date()
      }
    })

  // await transaction.collection("List")
  //   .where({
  //     planId,
  //     index,
  //     uid: wxContext.OPENID
  //   })
  //   .update({
  //     data: {
  //       study: _.max(study),
  //     }
  //   })
  await transaction.commit()
  return resultMsg(1000, 'OK')
}

async function getRecords(event) {
  const wxContext = cloud.getWXContext()
  const {
    scheduleId,
    index,
    day,
    type,
  } = event

  const db = cloud.database()
  const _ = db.command
  var $ = db.command.aggregate

  const res = await db.collection("Exercise").where({
    scheduleId,
    day,
    index,
    type,
    uid: wxContext.OPENID
  }).get()

  if (res.data.length > 0) {
    const {
      records
    } = res.data[0]
    const result = {
      records
    }
    return resultMsg(1000, 'OK', result)
  } else {
    return resultMsg(1000, 'OK', {})
  }
}