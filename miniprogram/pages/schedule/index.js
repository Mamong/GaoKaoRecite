// pages/schedule/index.js
import request from "../../utils/request"
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        colors: [
            '',
            '#c9c9c9',
            '#1ab20a'
        ]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.data.scheduleId = options.scheduleId
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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },

    ebbinghaus(gCount, intervals, limit = 0) {

        let intvalCount = intervals.length
        var gIndex = 1
        var isFinished = false
        var ebList = []
        do {
            var dayList = []
            for (let intvalIndex = 0; intvalIndex < intvalCount; intvalIndex++) {
                let interval = intervals[intvalIndex]
                let length = ebList.length
                if (length < interval) {
                    break
                }
                let firstList = ebList[length - interval]
                if (firstList.length == 0) {
                    continue
                }
                let last = firstList[0]
                if (last == null) {
                    continue
                }
                let g = last["group"],
                    index = last["intvalIndex"]
                if (index == 0) {
                    let it = {
                        group: g,
                        intvalIndex: intvalIndex + 1
                    }
                    dayList.push(it)
                    if ((g == gCount) && (1 + intvalIndex == intvalCount)) {
                        isFinished = true
                    }
                }
            }

            //是否要学习新知识
            if (gIndex <= gCount) {
                if (limit <= 0 || dayList.count <= limit) {
                    let it = {
                        group: gIndex,
                        intvalIndex: 0
                    }
                    dayList.unshift(it)
                    //dayList.append((gIndex,1))
                    gIndex += 1
                } else {
                    dayList.unshift(null)
                    //dayList.append(nil)
                }
            } else {
                dayList.unshift(null)
            }

            ebList.push(dayList)
        } while (!isFinished)
        //美化打印
        var ebList2 = []
        for (let day of ebList) {
            var ls = Array(intvalCount + 1)
            for (let group of day) {
                if (group != null) {
                    ls[group.intvalIndex] = group.group
                }
            }
            ebList2.push(ls)
        }
        return ebList2
    },

    onTapDay(e) {
        let {
            index
        } = e.currentTarget.dataset
        let {
            list,
            scheduleId
        } = this.data
        if (index > 0) {
            if (!list[index - 1].finish) {
                wx.showToast({
                    title: '尚未开始',
                    icon: 'error'
                })
                return
            }
        }
        //let day = list[index]
        wx.navigateTo({
            url: `../dayWords/list/index?scheduleId=${scheduleId}&day=${index+1}`,
        })
    },

    loadData() {
        let data = {
          scheduleId: this.data.scheduleId
        }
        request.get({
            url: app.globalData.wordScheduleIndex,
            data: data,
            success: res => {
                let {
                    intervals,
                    list
                } = res.result
                this.setData({
                    list,
                    intervals
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
    }
})