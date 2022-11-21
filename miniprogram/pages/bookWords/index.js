// pages/index/index.js
import request from "../../utils/request"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status:0,
    page: 0,
    isEnd: false,
    flist:[],
    rlist:[],
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.bookId = parseInt(options.bookId)
    this.loadData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.loadData(true)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  onTapNavi(e){
    let status = e.currentTarget.dataset.value
    this.setData({
      status
    },()=>{
      this.loadData()
    })
  },

  onTapPron(e){
    let { pron, type } = e.currentTarget.dataset
    if(!this.audioPlayer){
      wx.setInnerAudioOption({obeyMuteSwitch:false})
      let innerAudioContext = wx.createInnerAudioContext({useWebAudioImplement:true})
      innerAudioContext.autoplay = true
      innerAudioContext.onPlay(() => {
        console.log('开始播放')
      })
      innerAudioContext.onError((res) => {
        console.log(res.errMsg)
        console.log(res.errCode)
      })
      this.audioPlayer = innerAudioContext
    }
    let host = {
      "ph_am_mp3":"http://res.iciba.com/resource/amp3",
      "ph_tts_mp3":"http://res-tts.iciba.com"
    }
    this.audioPlayer.src = host[type] + pron
    this.audioPlayer.play()
  },
  onTapAdd(e){
    let index = e.currentTarget.dataset.index
    let word = this.data.list[index]
    let data = {
      word : word.word_name
    }
    request.post({
      url: app.globalData.wordRipeAdd,
      data: data,
      success: res => {
        this.data.list.splice(index,1)
        this.setData({
          list:this.data.list,
          ripe:this.data.ripe + 1,
          fresh:this.data.fresh - 1
        })
      },
      fail: err => {
        
      },
      complete: () => {
      }
    })
  },

  onTapRemove(e){
    let index = e.currentTarget.dataset.index
    let word = this.data.list[index]
    let data = {
      word : word.word_name
    }
    request.post({
      url: app.globalData.wordRipeRemove,
      data: data,
      success: res => {
        this.data.list.splice(index,1)
        this.setData({
          list:this.data.list,
          ripe:this.data.ripe - 1,
          fresh:this.data.fresh + 1
        })
      },
      fail: err => {
        
      },
      complete: () => {
      }
    })
  },

  loadData(more) {
    let {page, isEnd, status, bookId } = this.data

    if (more) {
      if (isEnd) {
        return
      }
      page += 1
    } else {
      page = 0
    }

    let data = {
      status,
      bookId,
      page
    }
    request.get({
      url: app.globalData.wordBookWords,
      data: data,
      success: res => {
        const {page, perpage, book:{name, word_count, ripe, fresh}} = res.result
        let list = res.result.list
        let isEnd = list.length < perpage
        this.data.page = page
        if (more) {
          list = this.data.list.concat(list)
        } 
        this.setData({
          list,
          isEnd,
          word_count, ripe, fresh
        })
        wx.setNavigationBarTitle({
          title: `${name}(${word_count})`,
        })
      },
      fail: err => {
        this.setData({
          error: err.message
        })
      },
      complete: () => {
        wx.stopPullDownRefresh()
      }
    })
  },
})