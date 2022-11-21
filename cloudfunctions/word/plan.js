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
    case 'list':
      return await getWordPlanList(event, context);
    case 'list-market':
      return await getListMarket(event, context);
    case 'info':
      return await getWordPlanInfo(event, context);
    case 'create':
      return await createWordPlan(event, context);
    case 'updateProgress':
      return await updateProgress(event, context);
  }
};


async function getWordPlanList(event) {
  const wxContext = cloud.getWXContext()
  const {
    page = 0,
      perpage = 20
  } = event

  const db = cloud.database()
  const _ = db.command
  var $ = db.command.aggregate

  let res = await db.collection("Plan").aggregate()
    .match({
      uid: wxContext.OPENID
    })
    .sort({
      updateAt: -1
    })
    .lookup({
      from: 'Exercise',
      let: {
        id: '$_id',
      },
      pipeline: $.pipeline()
        .match(_.expr($.and([
          $.eq(['$planId', '$$id']),
          $.eq(['$uid', wxContext.OPENID]),
          $.eq(['$status', 2])
        ])))
        .done(),
      as: 'learns',
    })
    .lookup({
      from: "List",
      let: {
        id: '$_id',
      },
      pipeline: $.pipeline()
        .match(_.expr($.and([
          $.eq(['$planId', '$$id']),
          $.eq(['$uid', wxContext.OPENID]),
        ])))
        .project({
          _id: 0,
          study: 1,
        })
        .done(),
      as: 'lists',
    })
    .project({
      title: 1,
      scheduleId:1,
      currentDay: 1,
      scheduleCount: 1,
      wordCount: 1,
      learned: $.size('$learns'),
      study: $.let({
        vars: {
          list: $.arrayElemAt(['$lists', 0])
        },
        in: $.sum(['$$list.study'])
      })
    })
    .skip(page * perpage)
    .limit(perpage)
    .end()

  res.list.forEach(item => {
    item.progress = (100 * item.learned / item.scheduleCount).toFixed(2)
  })
  let result = {
    page,
    perpage,
    list: res.list
  }
  return resultMsg(1000, 'OK', result)
}



async function getWordPlanInfo(event) {
  const wxContext = cloud.getWXContext()
  const {
    planId
  } = event

  const db = cloud.database()
  const _ = db.command
  var $ = db.command.aggregate

  let res = await db.collection("Plan").doc(planId).get()
  let result = res.data
  return resultMsg(1000, 'OK', result)
}

async function createWordPlan(event) {
  const wxContext = cloud.getWXContext()
  const {
    title,
    name,
    bookId,
    //fileId,
    wordCount,
    strategyId,
    listCount,
    perlist,
    //costDays,
  } = event

  const db = cloud.database()
  const _ = db.command
  var $ = db.command.aggregate


  let intervals
  if (strategyId == 1) {
    intervals = [0, 1, 2, 4, 7, 15]
  } else if (strategyId == 2) {
    intervals = [0, 1, 2]
  }

  const transaction = await db.startTransaction()

  const date = new Date()
  const scheduleCount = listCount * intervals.length
  const costDays = listCount + intervals[intervals.length - 1]



  let days = Array(costDays).fill(0).map(item => [])
  for (let row = 0; row < costDays; row++) {
    for (interval of intervals) {
      let index = row + 1 - interval
      if (index >= 1 && index <= listCount) {
        days[row].push(index)
      } else {
        days[row].push(0)
      }
    }
  }

  try {
    // for (let i = 0; i < groups.length; i++) {
    //   await transaction.collection("List").add({
    //     data: {
    //       planId,
    //       list: groups[i],
    //       index: i + 1,
    //       createAt: date,
    //       uid: wxContext.OPENID
    //     }
    //   })
    // }
    let listId = event.listId
    if (!listId) {
      //产生schedule
      let ripeRes = await transaction.collection("Ripe").where({
        bookId,
        uid: wxContext.OPENID
      }).get()
      let ripeList = ripeRes.data[0].list

      //let index = 1
      let lists = []
      do {
        let res = await transaction.collection("Word")
          .aggregate()
          .match({
            bookId: bookId,
            word_name: _.nin(ripeList)
          })
          .sample({
            size: perlist
          })
          .limit(perlist)
          .end()
        let list = res.list.map(item => item.word_name)
        lists.push(list)
        // await transaction.collection("List").add({
        //   data: {
        //     planId,
        //     list,
        //     index,
        //     createAt: date,
        //     uid: wxContext.OPENID
        //   }
        // })
        // index++
        ripeList = ripeList.concat(list)
      } while (index <= listCount)

      let listRes = await transaction.collection("List").add({
        data: {
          bookId,
          //planId,
          lists,
          createAt: date,
          uid: wxContext.OPENID
        }
      })
      listId = listRes._id
    }

    let planRes = await transaction.collection("Plan").add({
      data: {
        listId,
        title,
        name,
        bookId,
        wordCount,
        strategyId,
        listCount,
        scheduleCount,
        currentDay: 1,
        perlist,
        costDays,
        // days,
        createAt: date,
        updateAt: date,
        uid: wxContext.OPENID
      }
    })
    let planId = planRes._id
    let scheduleRes = await transaction.collection("Schedule").add({
      data: {
        planId,
        listId,
        //day: row + 1,
        lists: days,
        uid: wxContext.OPENID
      }
    })
    let scheduleId = scheduleRes._id
    await transaction.collection("Plan").doc(planId)
    .update({
      data:{
        scheduleId
      }
    })

    if(bookId){
      await transaction.collection("List").doc(listId)
      .update({
        data:{
          planId
        }
      })
    }

    await transaction.commit()
    return resultMsg(1000, '创建完成')
  } catch (e) {
    console.error(`transaction error`, e)
    return resultMsg(1006, '提交失败')
  }
}

async function updateProgress(event) {
  const wxContext = cloud.getWXContext()
  const {
    planId,
    day,
  } = event

  const db = cloud.database()
  const _ = db.command
  var $ = db.command.aggregate

  await db.collection("Plan")
    .where({
      _id: planId,
      uid: wxContext.OPENID
    })
    .update({
      data: {
        currentDay: day
      }
    })
  return resultMsg(1000, 'OK')
}