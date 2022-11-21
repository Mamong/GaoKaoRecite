// pages/plan/index.js
import request from "../../utils/request"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    formData: {
      title: "",
      name: "",
      bookId: undefined,
      listId: undefined,

      wordCount: undefined,
      strategyId: 1,
      listCount: undefined,
      perlist: undefined,
      costDays: undefined,
    },
    rules: [{
        name: 'title',
        rules: {
          required: true,
          message: '标题必填'
        },
      },
      {
        name: 'bookId',
        rules: {
          required: false,
        },
      },
      {
        name: 'listId',
        rules: {
          required: false,
        },
      },
      {
        name: 'name',
        rules: {
          required: true,
          message: '词库必选'
        },
      },
      {
        name: 'wordCount',
        rules: {
          required: true,
          message: '词库必选'
        },
      },
      {
        name: 'strategyId',
        rules: {
          required: true,
          message: '复习方法必填'
        },
      },
      {
        name: 'listCount',
        rules: {
          required: true,
          min: 1,
          message: '列表数必填'
        },
      },
      {
        name: 'perlist',
        rules: {
          message: '每列单词个数1-1000',
          validator: function (rule, value, param, models) {
            if (value < 1 || value > 1000) {
              return rule.message
            }
          }
        },
      },
      {
        name: 'costDays',
        rules: {
          required: true,
          min: 1,
          message: '所需天数必填'
        },
      },
    ],
    strategies: [{
        name: '艾宾浩斯',
        id: 1,
        cost: function (listCount) {
          return listCount + 15
        }
      },
      {
        name: '2倍复习',
        id: 2,
        cost: function (listCount) {
          return listCount + 2
        }
      }
    ],
    strategyIndex: 0,
    groupIndex: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  formInputChange: function (e) {
    const {
      field
    } = e.currentTarget.dataset

    if (field == 'listCount') {
      let listCount = parseInt(e.detail.value)
      let perlist = "",
        costDays = ""
      if (isNaN(listCount)) {
        listCount = ""
      } else {
        const {
          strategies,
          strategyIndex,
          formData: {
            wordCount
          }
        } = this.data
        let strategy = strategies[strategyIndex]
        if (listCount < 1) {
          listCount = 1
        } else if (listCount > wordCount) {
          listCount = wordCount
        }
        perlist = Math.ceil(wordCount / listCount)
        costDays = strategy.cost(listCount)
      }
      this.setData({
        'formData.listCount': listCount,
        'formData.perlist': perlist,
        'formData.costDays': costDays
      })
    } else {
      this.setData({
        [`formData.${field}`]: e.detail.value
      })
    }
  },

  bindStrategyChange(e) {
    console.log('picker account 发生选择改变，携带值为', e.detail.value);
    let strategyIndex = e.detail.value
    let strategy = this.data.strategies[strategyIndex]
    let listCount = this.data.formData.listCount
    this.setData({
      strategyIndex,
      [`formData.strategyId`]: strategy.id,
      [`formData.costDays`]: strategy.cost(listCount)
    })
  },

  onTapSegment(e) {
    let groupIndex = e.currentTarget.dataset.index
    let formData = this.data.formData
    Object.assign(formData, {
      name: "",
      bookId: undefined,
      fileId: undefined,
      wordCount: undefined,
      listCount: undefined,
      perlist: undefined,
      costDays: undefined,
    })

    this.setData({
      groupIndex,
      formData
    })
  },

  onTapPickBook() {
    let that = this
    wx.navigateTo({
      url: '../bookPicker/index',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        didPickBook: function (data) {
          const {
            bookName,
            bookId,
            wordCount,
            ripeCount = 0
          } = data
          const {
            formData,
            strategies,
            strategyIndex
          } = that.data
          let listCount = formData.listCount
          let change = {
            name: bookName,
            bookId,
            wordCount: wordCount - ripeCount
          }
          if (listCount) {
            let perlist = Math.ceil(wordCount / listCount)
            let strategy = strategies[strategyIndex]
            let costDays = strategy.cost(listCount)
            change.perlist = perlist
            change.costDays = costDays
          }
          Object.assign(formData, change)
          that.setData({
            formData
          })
        },
      },
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        console.log(res)
      },
      fail: function (error) {
        // 通过eventChannel向被打开页面传送数据
        console.log(error)
      }
    })
  },

  onTapPickList() {
    let that = this
    wx.navigateTo({
      url: '../list-market/index',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        didPickList: function (data) {
          const {
            title:name,
            listId,
            wordCount,
            listCount
          } = data
          const {
            formData,
            strategies,
            strategyIndex
          } = that.data

          let strategy = strategies[strategyIndex]
          let costDays = strategy.cost(listCount)

          let change = {
            name,
            listId,
            wordCount,
            listCount,
            costDays
          }
          Object.assign(formData, change)
          that.setData({
            formData
          })
        },
      },
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        console.log(res)
      },
      fail: function (error) {
        // 通过eventChannel向被打开页面传送数据
        console.log(error)
      }
    })
  },

  onSelectGroupFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: res => {
        // tempFilePath可以作为img标签的src属性显示图片
        let file = res.tempFiles[0]
        this.setData({
          'formData.name': file.name
        })
        this.uploadExcel(file.path)
      }
    })
  },

  uploadExcel(filePath) {
    const cloudPath = "excels/" + Date.now() + filePath.match(/\.[^.]+?$/)[0]
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath,
      success: res => {
        this.getXlsxInfo(res.fileID)
      }
    })
  },

  getXlsxInfo(fileId) {
    request.post({
      url: app.globalData.wordUtilsXlsxInfo,
      data: {
        fileId
      },
      success: res => {
        const {
          listCount,
          wordCount
        } = res.result
        const {
          strategies,
          strategyIndex,
        } = this.data
        let strategy = strategies[strategyIndex]
        let costDays = strategy.cost(listCount)
        this.setData({
          'formData.fileId': fileId,
          'formData.listCount': listCount,
          'formData.wordCount': wordCount,
          'formData.costDays': costDays
        })
      },
      fail: err => {
        this.setData({
          error: err.message
        })
      }
    })
  },

  submitForm() {
    this.selectComponent('#form').validate((valid, errors) => {
      console.log('valid', valid, errors)
      if (!valid) {
        const firstError = Object.keys(errors)
        if (firstError.length) {
          this.setData({
            error: errors[firstError[0]].message
          })
        }
      } else {
        this.uploadForm()
      }
    })
  },

  uploadForm() {
    request.post({
      url: app.globalData.wordPlanCreate,
      data: this.data.formData,
      success: res => {
        wx.showToast({
          title: res.status.message,
        })
        //实现请求》结果反馈》返回》刷新，
        setTimeout(() => {
          wx.navigateBack({
            delta: 1,
            success: () => {
              app.reloadCurrentPage()
            }
          })
        }, 1000)
      },
      fail: err => {
        this.setData({
          error: err.message
        })
      }
    })
  }
})