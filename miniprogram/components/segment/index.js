// components/segment/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    items: Array,
    selectedIndex:{
      type:Number,
      value:0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    offsetX: 0,
    widthX: 0,
  },

  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      this.selectItem(this.data.selectedIndex)
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },

  observers: {
    selectedIndex: function(selectedIndex) {
      this.selectItem(selectedIndex)
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTapSegment(e) {
      let {
        index
      } = e.currentTarget.dataset
      this.setData({
        selectedIndex: index
      })
      this.triggerEvent("change", {
        value: this.data.selectedIndex
      })
    },
    selectItem(index) {
      let numberOfItems = this.data.items.length
      let widthX = 100.0 / numberOfItems
      let offsetX = widthX * index
      this.setData({
        widthX,
        offsetX
      })
    },
    updateItems(items){

    }
  }
})