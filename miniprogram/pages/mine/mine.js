// pages/mine/mine.js
import CustomPage from '../../base/CustomPage'

const app = getApp()

CustomPage({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    show: true,
    animated: false,
    mode: 0,
    ...app.globalData.settings
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

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
  onSegmentChange(e) {
    const {
      field
    } = e.currentTarget.dataset
    this.setData({
      [`${field}`]: e.detail.value,
    })
    app.globalData.settings[field] = e.detail.value
    this.saveSettings()
  },

  saveSettings() {
    wx.setStorage({
      key: "settings",
      data: app.globalData.settings
    })
  },

  onThemeChange(e) {
    let mode = e.detail.value
    this.data.mode = mode

    const App = getApp()

    if (App.onThemeChange) {
      if (mode == 0) {
        const {
          theme
        } = wx.getSystemInfoSync()
        App.onThemeChange({
          theme
        })
      } else if (mode == 2) {
        App.onThemeChange({
          theme: 'dark'
        })
      } else if (mode == 1) {
        App.onThemeChange({
          theme: 'light'
        })
      }
    }
  }
})