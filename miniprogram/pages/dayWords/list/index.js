// pages/dayWords/list/index.js
import request from "../../../utils/request"
import CustomPage from '../../../base/CustomPage'

const app = getApp()
CustomPage({

  /**
   * 页面的初始数据
   */
  data: {
    nbShow: true,
    nbFrontColor: {
      light: '#000',
      dark: '#fff'
    },
    background: {
      light: '#f6f6f6',
      dark: '#121212'
    },
    formData: {
      display: 0,
      order: 0,
      layout: 0,
      interval: 10,
      pronTimes: 2
    },
    layouts: [
      'v',
      'v right',
      'h',
    ],

    // page: 0,
    isEnd: true,
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {
      scheduleId,
      day,
    } = options
    this.data.scheduleId = scheduleId
    this.data.day = parseInt(day)
    this.restoreSettings()
    this.loadData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.settings_popover = this.selectComponent('#settings-popover');
    this.mode_popover = this.selectComponent('#mode-popover');
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
    //this.loadData(true)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  onTapTitle(e) {
    // 获取元素的坐标信息
    wx.createSelectorQuery().select('#' + e.target.id).boundingClientRect(res => {
      this.settings_popover.onDisplay(res);
    }).exec();
  },

  onTapMode(e) {
    wx.createSelectorQuery().select('#' + e.target.id).boundingClientRect(res => {
      this.mode_popover.onDisplay(res);
    }).exec();
  },

  onTapToolItem(e) {
    let {
      index
    } = e.currentTarget.dataset
    this.setData({
      index
    }, () => {
      this.loadData()
    })
  },

  onTapPron(e) {
    let {
      pron,
      type
    } = e.currentTarget.dataset
    if (!this.audioPlayer) {
      wx.setInnerAudioOption({
        obeyMuteSwitch: false
      })
      let innerAudioContext = wx.createInnerAudioContext({
        useWebAudioImplement: true
      })
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
      "ph_am_mp3": "http://res.iciba.com/resource/amp3",
      "ph_tts_mp3": "http://res-tts.iciba.com"
    }
    this.audioPlayer.src = host[type] + pron
    this.audioPlayer.play()
  },

  onTapMenu(e) {
    let {
      url
    } = e.currentTarget.dataset
    let {
      list,
      scheduleId,
      index,
      day
    } = this.data
    url = url + `?scheduleId=${scheduleId}&index=${index}&day=${day}`
    this.mode_popover.onHide()
    wx.navigateTo({
      url: url,
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
      },
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', list)
      }
    })
  },

  loadData(more) {
    let {
      page,
      isEnd,
      scheduleId,
      day,
      index,
    } = this.data

    // if (more) {
    //   if (isEnd) {
    //     return
    //   }
    //   page += 1
    // } else {
    //   page = 0
    // }

    let data = {
      scheduleId,
      day,
      index,
      // page
    }
    request.get({
      url: app.globalData.wordScheduleList,
      data: data,
      success: res => {
        const {
          formData: {
            display
          }
        } = this.data
        let showWord = display != 1
        let showMeans = display != 0
        res.result.list.forEach(item => {
          item.showMeans = showMeans
          item.showWord = showWord
        })
        this.setData({
          ...res.result
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

  onSegmentChange(e) {
    const {
      field
    } = e.currentTarget.dataset
    if (field == 'display') {
      const display = e.detail.value
      const {
        list
      } = this.data
      let showWord = display != 1
      let showMeans = display != 0
      list.forEach(item => {
        item.showMeans = showMeans
        item.showWord = showWord
      })
      this.setData({
        [`formData.${field}`]: display,
        list
      })
    } else {
      this.setData({
        [`formData.${field}`]: e.detail.value,
      })
    }
  },

  onTapMeans(e) {
    let {
      index
    } = e.currentTarget.dataset
    let {
      list
    } = this.data
    list[index].showMeans = !list[index].showMeans
    this.setData({
      list
    })
  },

  onTapWord(e) {
    let {
      index
    } = e.currentTarget.dataset
    let {
      list
    } = this.data
    list[index].showWord = !list[index].showWord
    this.setData({
      list
    })
  },

  saveSettings() {
    wx.setStorage({
      key: "learn",
      data: this.data.formData
    })
  },

  restoreSettings() {
    let that = this
    wx.getStorage({
      key: 'learn',
      success(res) {
        const formData = res.data
        that.setData({
          formData,
        })
      }
    })
  },
})