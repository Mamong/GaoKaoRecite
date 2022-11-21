// pages/plan/list-market/index.js
import request from "../../utils/request"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
type:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  loadData(more) {
    let {
      type,
      page,
      isEnd,
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
      type,
      page
    }
    request.get({
      url: app.globalData.wordListMarket,
      data: data,
      success: res => {
        const {list} = res.result
        this.setData({
          list
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

  createLists(){
    wx.navigateTo({
      url: './create/create',
    })
  },

  onTapList(e){
    let {
      index
    } = e.currentTarget.dataset
    let {
      list
    } = this.data
    let lists = list[index]

    let {
      _id: listId,
      title,
      wordCount,
      listCount
    } = lists
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.emit("didPickList", {
      listId,
      title,
      wordCount,
      listCount
    })
    wx.navigateBack({
      delta: 1,
    })
  }
})