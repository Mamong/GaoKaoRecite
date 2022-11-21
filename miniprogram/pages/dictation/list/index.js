// pages/dictation/list/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ripeAll: false,
    freshAll: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const eventChannel = this.getOpenerEventChannel()
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    let that = this
    eventChannel.on('acceptDataFromOpenerPage', function (data) {
      const {
        ripeList,
        freshList
      } = data
      that.setData({
        ripeList,
        freshList
      })
    })
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

  onRipeAll() {
    let {
      ripeAll,
      ripeList
    } = this.data
    ripeAll = !ripeAll
    ripeList.forEach(item => item.checked = ripeAll)
    this.setData({
      ripeAll,
      ripeList,
    })
  },

  onFreshAll() {
    let {
      freshAll,
      freshList
    } = this.data
    freshAll = !freshAll
    freshList.forEach(item => item.checked = freshAll)
    this.setData({
      freshAll,
      freshList,
    })
  },

  onTapWord(e) {
    const {
      section,
      index
    } = e.currentTarget.dataset
    const {
      freshList,
      ripeList
    } = this.data
    if (section == 0) {
      freshList[index].checked = !freshList[index].checked
      this.setData({
        freshList
      })
    } else {
      ripeList[index].checked = !ripeList[index].checked
      this.setData({
        ripeList
      })
    }
  },

  onTapClear() {
    // let {freshList, ripeList} = this.data
    // freshList = freshList.concat(ripeList)
    // ripeList = []
    // this.setData({
    //   freshList,
    //   ripeList
    // })
  },

  onTapFinish() {
    const {
      freshList,
      ripeList
    } = this.data
    const list = freshList.concat(ripeList).filter(item => item.checked).map(item => item.word)
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.emit('acceptDataFromOpenedPage', list)
    wx.navigateBack({
      delta: 1,
    })
  }
})