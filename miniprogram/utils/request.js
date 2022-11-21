const log = require('./log.js')
log.setFilterMsg('callFunction')

//请求适配层
const request = {
  get(options) {
    sendRequest('get', options)
  },
  post(options) {
    sendRequest('post', options)
  }
}

async function sendRequest(method, options) {
  //采用网络请求的话，使用这个
  /*wx.request({
    url: options.url,
    data:options.data,
    method:method,
    success:options.success,
    fail:options.fail
  })*/

  //假设我们的API的URL是"/user/info/create",那么user对应云函数名称,
  //info对应_module参数,create对应_action参数
  let name = options.url
  let _module = ""
  let _action = ""
  if (name.indexOf('/') != 0) {
    name = '/' + name
  }

  const arr = name.split('/')
  name = arr[1]
  if (arr.length == 3) {
    //无module，例如/user/login
    _action = arr[2]
  } else if (arr.length == 4) {
    //有module，例如/manager/course/create
    _module = arr[2]
    _action = arr[3]
  }
  if (!options.data) options.data = {}
  options.data._module = _module
  options.data._action = _action
  options.data._v = "2.6.0"

  const userInfo = wx.getStorageSync('userInfo')
  if (userInfo) {
    if(userInfo.id){
      options.data._uid = userInfo.id
    }else{
      //异常上报
      // name = "user"
      // options.data._module = ''
      // options.data._action = 'uploadlog'
      options.data._log = JSON.stringify(userInfo)
    }
  }

  let showMask = method == 'post'

  //options.hideLoading = true
  //post要防止触摸穿透
  //iOS上showLoading和hideLoading有bug
  if (!options.hideLoading) {
    wx.showLoading({
      title: '数据加载中',
      mask: showMask,
      success:()=>{
        console.log("showLoading success")
      },
      fail:err=>{
        console.log(err)
      }
    })
  }
  wx.cloud.callFunction({
    name: name,
    data: options.data,
    success: res => {
      console.log("request success")
      if (!options.hideLoading) {
        //iOS上，hideLoading和showLoading相隔时间过短,
        //会导致loading不出现，但是loading的success会执行,
        //但是hideLoading回调不执行，因此不能将回调写在hideLoading里，
        //暂时通过一定延迟，确保回调在hideLoading后执行
        // wx.hideLoading({
        //   success: () => {
        //     console.log("hideLoading success")
        //   },
        //   fail:err=>{
        //     console.log("hideLoading:"+err)
        //   }
        // })
        wx.hideLoading()
        setTimeout(function(){
          successResult(res,options)
        },100)
      } else {
        successResult(res,options)
      }
    },
    fail: err => {
      console.error('[云函数] [login] 调用失败：', err)
      log.error('error',err)
      let error = {
        code: 1200,
        message: "请求失败"
      }
      if(!options.hideLoading){
        wx.hideLoading()
        setTimeout(function(){
          options.fail && options.fail(error)
        },500)
      }else{
        options.fail && options.fail(error)
      }
    },
    complete: () => {
      options.complete && options.complete()
    }
  })
}

function successResult(res, options) {
  let code = res.result.status.code
  if (code == 1000) {
    options.success && options.success(res.result)
    //强制退出
  } else {
    options.fail && options.fail(res.result.status)
    if (code == 1001) {
      setTimeout(function(){
        wx.removeStorageSync('userInfo')
        wx.reLaunch({
          url: '/pages/login/login',
        })
      },1000)
    }
  }
}

export default request