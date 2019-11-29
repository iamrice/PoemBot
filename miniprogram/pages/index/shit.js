import ai_request from '../../common/ai_request.js'
var Util = require('../../common/util.js')

const app = getApp()
wx.cloud.init()
const db = wx.cloud.database()

Page({

  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    info: [],
    result: [],
    show_index: 0,
    state: '',
    search_able: 1,
    upload_times: 0
  },

  main: function () {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        that.data.upload_times += 1
        var times = that.data.upload_times
        wx.showLoading({
          title: '正在上传图片',
        })
        setTimeout(function () {
          if (that.data.upload_times == times) {
            wx.hideLoading()
            if (that.data.result.length == 0) {
              that.setData({
                state: '没有找到相关的诗句，换个图片试试吧'
              })
            }
          }
        }, 10000)
        that.setData({
          image: res.tempFilePaths[0],
          result: [],
          info: [],
          state: ''
        })
        that.ai.multilabel(res.tempFilePaths[0])
          //that.ai.object(res.tempFilePaths[0])
          .then(function (data) {
            wx.hideLoading()
            wx.showLoading({
              title: '正在检索诗句',
            })
            var label = data['data']['tag_list']
            that.setData({
              info: label,
              //state:'识别成功，正在为你检索相关诗句'
            })
            return that.check_db(label)
          })
          .then(function (data) {
            that.handle(data)
          })
          .catch(function (error) {
            console.log(error)
          })
      },
    })
  },

  search_api: function (keyword, number) {
    console.log(keyword)
    var that = this
    return new Promise((reslove, reject) => {
      if (that.data.search_able == 1) {
        console.log('search_able')
        that.data.search_able = 0
        wx.request({
          url: 'http://service-p1cgyxqe-1300620164.gz.apigw.tencentcs.com/release/poemSearch',
          method: 'GET',
          header: {
            'content-type': 'application/x-www-form-urlencoded',
            'label': this.ai.urlEncode(keyword),
            'nums': number
          },
          success(res) {
            if (Object.prototype.toString.call(res.data) === "[object String]") {
              console.log(JSON.parse(res.data))
              reslove([keyword, JSON.parse(res.data)])
            }
          },
          fail(res) {
            reject('请求失败，请检查网络是否正常')
            console.log('请求失败')
          },
          complete: function () {
            that.data.search_able = 1
          }
        })
      } else {
        console.log('not searchable')
        setTimeout(function () {
          that.search_api(keyword, number)
        }, 2000)
      }
    })
  },

  change: function () {
    var num = this.data.result.length
    this.setData({
      show_index: Math.floor(Math.random() * num)
    })
  },
})