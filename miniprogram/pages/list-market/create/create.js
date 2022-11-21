// pages/list-market/create/create.js
import request from "../../../utils/request"
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    formData: {
      title:"",
      fileName: "",
      fileId: undefined,
      wordCount: undefined,
      listCount: undefined,
    },
    rules: [{
      name: 'title',
      rules: {
        required: true,
        message: '分组名必填'
      },
    },
    {
      name: 'fileId',
      rules: {
        required: true,
        message: 'Excel文件必选'
      },
    },
    {
      name: 'fileName',
      rules: {
        required: false,
      },
    },
    {
      name: 'wordCount',
      rules: {
        required: false,
      },
    },
    {
      name: 'listCount',
      rules: {
        required: false,
      },
    },
  ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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

  formInputChange: function (e) {
    const {
      field
    } = e.currentTarget.dataset
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },

  onSelectGroupFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success:res => {
        // tempFilePath可以作为img标签的src属性显示图片
        let file = res.tempFiles[0]
        this.setData({
          'formData.fileName': file.name
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

  getXlsxInfo(fileId){
    request.post({
      url: app.globalData.wordUtilsXlsxInfo,
      data: {fileId},
      success: res => {
        const {listCount,wordCount} = res.result
        this.setData({
          'formData.fileId':fileId,
          'formData.listCount':listCount,
          'formData.wordCount':wordCount,
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
      url: app.globalData.wordListCreate,
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