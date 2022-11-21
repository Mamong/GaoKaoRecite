const {
  resultMsg
} = require('./common.js')

const xlsx = require('node-xlsx')

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
  throwOnNotFound: false
});

// 获取openId云函数入口函数
exports.main = async (event, context) => {
  switch (event._action) {
    case 'getXlsxInfo':
      return await getXlsxInfo(event, context);
  }
};

async function getXlsxInfo(event) {
  const {
    fileId
  } = event

  let {
    listCount,
    wordCount
  } = await readXlsx(fileId)

  let result = {
    listCount,
    wordCount
  }
  return resultMsg(1000, 'OK', result)
}

async function readXlsx (fileID) {

  //1、通过fileID下载云存储里的excel文件
  const res = await cloud.downloadFile({
    fileID
  })
  const buffer = res.fileContent
  //2,解析excel文件里的数据
  var sheets = xlsx.parse(buffer); //获取到所有sheets
  const sheet = sheets[0]['data']; //获取到第一个表格的数据：格式：[[],[],[]]
  
  const listCount = sheet[0].length
  let wordCount = 0
  let groups = []
  for(let i = 0; i < listCount; i++){
    groups.push([])
  }
  for(let i = 0; i < sheet.length; i++){
    wordCount += sheet[i].length
    for(let j = 0; j < sheet[i].length; j++){
      groups[j].push(sheet[i][j])
    }
  }
  return {
    listCount,
    wordCount,
    groups
  }
}

exports.readXlsx = readXlsx