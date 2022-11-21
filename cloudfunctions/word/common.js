function resultMsg(code, message, result) {
  let status = {
    code: code || 1000,
    message: message || "OK"
  }
  return {
    status,
    result: result || null
  }
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':')
}

const formatTime2 = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute,second].map(formatNumber).join(':')
}

const formatTime3 = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + '_' + [hour, minute,second].map(formatNumber).join('.')
}

const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join('-')
}


module.exports = {
  resultMsg,
  formatTime,
  formatTime2,
  formatTime3,
  formatDate,
}