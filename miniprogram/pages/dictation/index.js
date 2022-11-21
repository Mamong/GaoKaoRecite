// pages/dictation/index.js
import request from "../../utils/request"
import utils from "../../utils/utils"
import CustomPage from '../../base/CustomPage'

const app = getApp()
const host = {
  "ph_am_mp3": "http://res.iciba.com/resource/amp3",
  "ph_tts_mp3": "http://res-tts.iciba.com"
}

CustomPage({

  /**
   * 页面的初始数据
   */
  data: {
    nbTitle: "",
    nbFrontColor: {
      light:'#000',
      dark:'#fff'
    },
    background:{
      light:'#f6f6f6',
      dark:'#121212'
    },
    nbShow: true,

    olist: [],
    list: [],
    current: 0,
    recordMap: {},
    focus: false,
    input_word: "",

    formData: {
      display: 0,
      pron: 1,
      input: 1,
      ignoreCapital: true,
      interval: 10,
      pronTimes: 2
    },

    playing: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {
      scheduleId,
      index,
      day
    } = options
    this.data.scheduleId = scheduleId
    this.data.day = parseInt(day)
    this.setData({
      index:Number(index)
    })

    this.restoreSettings()

    const eventChannel = this.getOpenerEventChannel()
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    let that = this
    eventChannel.on('acceptDataFromOpenerPage', function (data) {
      that.data.olist = data
      that.data.list = data
      that.setData({
        item: data[0],
        total: data.length,
      })
    })
    this.loadData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.settings_popover = this.selectComponent('#settings-popover');

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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  onTapBack() {
    this.stopPlay()
  },

  onTapTitle(e) {
    // 获取元素的坐标信息
    wx.createSelectorQuery().select('#' + e.target.id).boundingClientRect(res => {
      this.settings_popover.onDisplay(res);
    }).exec();
  },

  onTapList() {
    let {
      olist,
      list,
      recordMap
    } = this.data
    let that = this
    wx.navigateTo({
      url: './list/index',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        acceptDataFromOpenedPage: function (data) {
          olist.forEach(item => item.checked = data.includes(item.word_name))
          let nlist = olist.filter(item => item.checked)
          if (nlist.length == 0) return
          that.data.list = nlist
          that.setData({
            current: 0,
            item: nlist[0],
            total: nlist.length,
            input_word:""
          })
        },
      },
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        list.forEach(item => item.checked = true)

        const ripeList = [],
          freshList = []
        olist.forEach(item => {
          const record = recordMap[item.word_name]
          const word = {
            word: item.word_name,
            checked: !!item.checked
          }
          if (record && record.correct) {
            word.checked = false
            ripeList.push(word)
          } else {
            freshList.push(word)
          }
        })
        res.eventChannel.emit('acceptDataFromOpenerPage', {
          ripeList,
          freshList
        })
      }
    })
  },

  onSwitchChange(e) {
    const {
      field
    } = e.currentTarget.dataset
    this.setData({
      [`formData.${field}`]: e.detail.value,
    })
  },

  onSegmentChange(e) {
    const {
      field
    } = e.currentTarget.dataset
    if (field == 'display') {
      const display = e.detail.value
      this.setData({
        [`formData.${field}`]: display,
        showWord: (display & 1) == 1,
        showMeans: (display & 2) == 2
      })
    } else {
      this.setData({
        [`formData.${field}`]: e.detail.value,
      })
    }
  },

  formInputChange: function (e) {
    const {
      field
    } = e.currentTarget.dataset
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },

  saveSettings() {
    wx.setStorage({
      key: "dictation",
      data: this.data.formData
    })
  },

  restoreSettings() {
    let that = this
    wx.getStorage({
      key: 'dictation',
      success(res) {
        const formData = res.data
        const display = formData.display
        that.setData({
          formData,
          showWord: display & 1 == 1,
          showMeans: display & 2 == 2
        })
      }
    })
  },

  onTapPron(e) {
    let {
      pron,
      type
    } = e.currentTarget.dataset

    this.playAudio(host[type] + pron)
  },

  // loadData(more) {
  //   let {
  //     scheduleId
  //   } = this.data

  //   let data = {
  //     scheduleId,
  //   }
  //   request.get({
  //     url: app.globalData.wordScheduleIndex,
  //     data: data,
  //     success: res => {
  //       const {
  //         list
  //       } = res.result
  //       this.data.list = list
  //       this.setData({
  //         current: 0,
  //         total: list.length,
  //         item: list[this.data.current],
  //       })
  //     },
  //     fail: err => {
  //       this.setData({
  //         error: err.message
  //       })
  //     },
  //     complete: () => {
  //       wx.stopPullDownRefresh()
  //     }
  //   })
  // },

  loadData() {
    let {
      scheduleId,
      day,
      index
    } = this.data

    let data = {
      scheduleId,
      day,
      index,
      type: "dictation"
    }
    request.get({
      url: app.globalData.scheduleRecords,
      data: data,
      success: res => {
        const {
          records = []
        } = res.result
        let recordMap = {}
        records.forEach(item => {
          recordMap[item.word] = item
        })
        this.data.recordMap = recordMap
      },
      fail: err => {
        this.setData({
          error: err.message
        })
      },
      complete: () => {}
    })
  },

  playAudio(url) {
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

    this.audioPlayer.src = url
    this.audioPlayer.play()
  },

  playWord() {
    let item = this.data.item
    let sound = item.symbols[0].ph_en_mp3
    let type = "ph_am_mp3"
    const {
      pron = 0
    } = app.globalData.settings
    if (pron == 1) {
      sound = item.symbols[0].ph_am_mp3
    }
    if (!sound) {
      sound = item.symbols[0].ph_tts_mp3
      type = "ph_tts_mp3"
    }
    this.playAudio(host[type] + sound)
  },

  onTapPlay() {
    this.setData({
      focus: true,
      playing: !this.data.playing
    }, () => {
      const {
        playing,
        formData
      } = this.data

      if (playing) {
        this.intervalPlay()
        //播放
        this.timeout = setTimeout(this.onTapNext, formData.interval * 1000)
      } else {
        this.stopPlay(false)
      }

      wx.setKeepScreenOn({
        keepScreenOn: playing,
      })
    })
  },

  stopPlay(finish) {
    if (this.timeout) clearInterval(this.timeout)
    if (this.playInterval) clearInterval(this.playInterval)
    this.setData({
      playing: false,
      focus: !finish
    })
    if (finish) {
      this.uploadRecords()
      this.showResult()
    }
  },

  intervalPlay() {
    const {
      pronTimes,
      interval,
      pron
    } = this.data.formData
    if (pron == 0) return

    const ms = interval * 1000 / pronTimes
    if (this.playInterval) clearInterval(this.playInterval)
    this.playInterval = utils.setInterval2(this.playWord, ms, pronTimes, true)
  },

  recordLast() {
    const {
      formData: {
        ignoreCapital
      },
      item: {
        word_name
      },
      input_word
    } = this.data

    if (!word_name) {
      console.log("word_name为空")
      return
    }

    let correct = false
    if (ignoreCapital) {
      correct = input_word.toLowerCase() == word_name.toLowerCase()
    } else {
      correct = input_word == word_name
    }
    this.data.recordMap[word_name] = {
      word: word_name,
      answer: input_word,
      correct
    }
  },

  switchTo(index) {
    const {
      playing,
      list,
      formData: {
        display,
        interval
      }
    } = this.data
    const item = list[index]
    this.setData({
      current: index,
      item,
      input_word: "",
      showWord: (display & 1) == 1,
      showMeans: (display & 2) == 2
    }, () => {
      this.intervalPlay()
      if (playing) {
        if (this.timeout) clearTimeout(this.timeout)
        this.timeout = setTimeout(this.onTapNext, interval * 1000)
      }
    })
  },

  onTapFirst() {
    this.switchTo(0)
  },

  onTapShuffle() {
    utils.shuffle(this.data.list)
    this.stopPlay()
    this.switchTo(0)
  },

  onTapFinish() {
    const {
      playing,
    } = this.data

    if (playing) {
      this.stopPlay(true)
    } else {
      this.setData({
        focus: false
      })
    }
  },

  onTapPrev() {
    if (this.data.current <= 0) {
      return
    }
    this.switchTo(this.data.current - 1)
  },

  onTapNext() {
    const {
      playing,
      current
    } = this.data

    //记录上一次结果
    if (playing) this.recordLast()

    if (current >= this.data.list.length - 1) {
      if (playing) {
        this.stopPlay(true)
      }
      return
    }
    this.switchTo(current + 1)
  },

  showResult() {
    const total = this.data.list.length
    const {
      recordMap,
      formData: {
        input
      }
    } = this.data
    let correct = 0
    const result = []
    this.data.list.forEach(item => {
      let data = recordMap[item.word_name]
      if (data) {
        correct += data.correct ? 1 : 0
      } else {
        data = {
          word: item.word_name,
          answer: null,
          correct: false
        }
      }
      result.push(data)
    })

    //保存进度


    if (input == 0) {
      let that = this
      wx.showModal({
        title: '听写结束',
        content: `听写结束，请自行对比结果。重新开始听写？`,
        success(res) {
          if (res.confirm) {
            that.switchTo(0)
          } else if (res.cancel) {}
        }
      })
    } else {
      wx.showModal({
        title: '听写结果',
        content: `共计${total}个，正确${correct}个，错误${total-correct}个,查看详情？`,
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: './result/index',
              success: function (res) {
                // 通过eventChannel向被打开页面传送数据
                res.eventChannel.emit('acceptDataFromOpenerPage', result)
              }
            })
          } else if (res.cancel) {}
        }
      })
    }
  },

  wordInputChange(e) {
    let {
      formData: {
        ignoreCapital
      },
      item: {
        word_name
      }
    } = this.data
    let input = e.detail.value.trim()
    this.data.input_word = input
    let match = false
    if (ignoreCapital) {
      match = input.toLowerCase() == word_name.toLowerCase()
    } else {
      match = input == word_name
    }
    if (match) {
      this.onTapNext()
    }
  },

  onTapWord() {
    this.setData({
      showWord: !this.data.showWord
    })
  },

  onTapMeans() {
    this.setData({
      showMeans: !this.data.showMeans
    })
  },

  uploadRecords() {
    let {
      scheduleId,
      index,
      day,
      recordMap,
    } = this.data

    let records = []
    for (let key in recordMap) {
      records.push(recordMap[key])
    }
    const data = {
      scheduleId,
      index,
      day,
      type: "dictation",
      records
    }
    request.post({
      url: app.globalData.scheduleUploadRecords,
      data: data,
      hideLoading: true,
      success: res => {},
      fail: err => {
        this.setData({
          error: err.message
        })
      },
      complete: () => {}
    })
  },

  onPopoverHide() {
    this.saveSettings()
  }
})