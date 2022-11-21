const formatDateTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join('-')
}

const formatDate2 = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].join('-')
}

const formatLocalDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  let coms = [year, month, day].map(formatNumber)
  return coms[0] + "年" + coms[1] + "月" + coms[2] + "日"
}

const formatTime = (date, hideSecond) => {

  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return (hideSecond ? [hour, minute] : [hour, minute, second]).map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//传入unix时间戳，得到倒计时
const changeTimeStamp = timeStamp => {
  var distancetime = new Date(timeStamp * 1000).getTime() - new Date().getTime();
  if (distancetime > 0) {
    //如果大于0.说明尚未到达截止时间
    var sec = Math.floor(distancetime / 1000 % 60);
    var min = Math.floor(distancetime / 1000 / 60 % 60);
    var hour = Math.floor(distancetime / 1000 / 60 / 60);

    if (sec < 10) {
      sec = "0" + sec;
    }
    if (min < 10) {
      min = "0" + min;
    }
    if (hour < 10) {
      hour = "0" + hour;
    }

    return hour + ":" + min + ":" + sec;
  } else {
    //若否，就是已经到截止时间了
    return "00:00:00";
  }
}

/**
 * param 将要转为URL参数字符串的对象
 * key URL参数字符串的前缀
 * encode true/false 是否进行URL编码,默认为true
 * 
 * return URL参数字符串
 */
const urlEncode = function (param, key, encode) {
  if (param == null) return '';
  var paramStr = '';
  var t = typeof (param);
  if (t == 'string' || t == 'number' || t == 'boolean') {
    paramStr += '&' + key + '=' + ((encode == null || encode) ? encodeURIComponent(param) : param);
  } else {
    for (var i in param) {
      var k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
      paramStr += urlEncode(param[i], k, encode);
    }
  }
  return paramStr;
};

const setInterval2 = function(func,ms,times,immediately = false) {
  let i = 0
  if(immediately){
    func()
    i++
  }
  const it = setInterval(() => {
    if(i < times){
      func()
      i++
    }else{
      clearInterval(it)
    }
  }, ms);
  return it
}

const shuffle = function (array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

module.exports = {
  formatDateTime,
  formatDate,
  formatDate2,
  formatTime,
  changeTimeStamp,
  formatLocalDate,
  urlEncode,
  setInterval2,
  shuffle
}