// pages/login/login.js
import request from "../../utils/request"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
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

  loadData(more) {
    let page = this.data.page
    let isEnd = this.data.isEnd

    if (more) {
      if (isEnd) {
        return
      }
      page += 1
    } else {
      page = 0
    }

    let data = {
      page
    }
    request.get({
      url: app.globalData.wordList,
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