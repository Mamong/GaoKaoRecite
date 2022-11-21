// app.js
const themeListeners = []

App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      });
    }

    const {
      theme
    } = wx.getSystemInfoSync()

    this.globalData = {
      theme,

      userLogin: "/user/login",

      wordBookList: "/word/book/list",
      wordBookWords: "/word/book/words",
      wordFreshAdd: "/word/fresh/add",
      wordFreshRemove: "/word/fresh/remove",
      wordRipeAdd: "/word/ripe/add",
      wordRipeRemove: "/word/ripe/remove",

      wordPlanList: "/word/plan/list",
      wordPlanInfo: "/word/plan/info",
      wordPlanCreate: "/word/plan/create",

      wordListMarket: "/word/list/market",
      wordListCreate: "/word/list/create",


      wordScheduleIndex: "/word/schedule/index",
      wordScheduleList: "/word/schedule/list",
      scheduleUploadRecords: "/word/schedule/uploadRecords",
      scheduleRecords: "/word/schedule/records",

      wordUtilsXlsxInfo: "/word/utils/getXlsxInfo"
    }

    // let a = BigInt(100n)
    // console.log(a)

    //读取用户信息
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }

    var settings = wx.getStorageSync('settings');
    if (settings) {
      this.globalData.settings = settings;
    } else {
      this.globalData.settings = {
        pron: 0
      }
    }
  },

  onShow: function () {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate)
    })

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })

    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
    })
  },

  onThemeChange({theme}) {
    this.globalData.theme = theme
    themeListeners.forEach((listener) => {
      listener(theme)
    })
  },
  watchThemeChange(listener) {
    if (themeListeners.indexOf(listener) < 0) {
      themeListeners.push(listener)
    }
  },
  unWatchThemeChange(listener) {
    const index = themeListeners.indexOf(listener)
    if (index > -1) {
      themeListeners.splice(index, 1)
    }
  },

  reloadLastPage() {
    //刷新上一页，更好的做法是使用通知，而不是依赖页面间的关系
    let pagesNumber = getCurrentPages().length
    let lastPage = getCurrentPages()[pagesNumber - 2]
    lastPage.loadData()
  },
  reloadCurrentPage() {
    //刷新上一页，更好的做法是使用通知，而不是依赖页面间的关系
    let pagesNumber = getCurrentPages().length
    let currentPage = getCurrentPages()[pagesNumber - 1]
    currentPage.loadData()
  }

});