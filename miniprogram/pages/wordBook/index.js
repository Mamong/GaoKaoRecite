// pages/wordBook/index.js
import request from "../../utils/request"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    key:0,
    major_data: [
      {
        "name": "全部",
        "name_en": "All",
        "key": 0
      },
      {
        "name": "自建",
        "name_en": "Self",
        "key": 1
      },
      {
        "name": "小学",
        "name_en": "Primary",
        "key": 6
      },
      {
        "name": "初中",
        "name_en": "Junior",
        "key": 7
      },
      {
        "name": "高中",
        "name_en": "High",
        "key": 8
      },
      {
        "name": "大学",
        "name_en": "University",
        "key": 9
      },
      {
        "name": "出国留学",
        "name_en": "Abroad",
        "key": 10
      },
      {
        "name": "剑桥五级",
        "name_en": "MSE",
        "key": 11
      },
      {
        "name": "其他",
        "name_en": "Others",
        "key": 12
      }
    ],
    page: 0,
    isEnd: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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

  onTapBook(e){
    let {index} = e.currentTarget.dataset
    let {list} = this.data
    let book = list[index]
    wx.navigateTo({
      url: `../bookWords/index?bookId=${book._id}`,
    })
  },

  onTapCate(e) {
    let {
      key
    } = e.currentTarget.dataset
    this.setData({
      key
    },()=>{
      this.loadData()
    })
  },

  loadData(more) {
    let {
      page,
      isEnd,
      key
    } = this.data

    if (more) {
      if (isEnd) {
        return
      }
      page += 1
    } else {
      page = 0
    }

    let data = {
      page,
      key
    }
    request.get({
      url: app.globalData.wordBookList,
      data: data,
      success: res => {
        this.data.isEnd = res.result.list.length < res.result.perpage
        this.data.page = res.result.page
        if (more) {
          let list = this.data.list.concat(res.result.list)
          this.setData({
            list,
            isEnd: this.data.isEnd
          })
        } else {
          this.setData({
            list: res.result.list,
            isEnd: this.data.isEnd
          })
        }
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