// pages/index/index.js
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

  onTapAdd(e){
    wx.navigateTo({
      url: '../plan/index',
    })
  },

  
  loadData(more) {
    let {page, isEnd } = this.data

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
      url: app.globalData.wordPlanList,
      data: data,
      success: res => {
        const {page, perpage} = res.result
        let list = res.result.list
        let isEnd = list.length < perpage
        this.data.page = page
        if (more) {
          list = this.data.list.concat(list)
        } 
        this.setData({
          current:list[0],
          list,
          isEnd,
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