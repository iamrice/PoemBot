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
    show_index:0
  },

  search_api: function(keyword, number) {
    var that = this
    return new Promise((reslove, reject) => {
      console.log(keyword)
      wx.request({
        url: 'https://www.enceladus.cf/CTY/test.php?input=' + number + keyword,
        method: 'GET',
        header: {
          'content-type': 'application/json',
        },
        success(res) {
          console.log(res.data)
          reslove([keyword, res.data])
        },
        fail(res) {
          reject('查询失败，请检查网络是否连接')
          console.log('请求失败')
        }
      })
    })

  },

  change: function() {
    var num=this.data.result.length
    this.setData({
      show_index:Math.floor(Math.random()*num)
    })
  },

  access_db: function(label, index) {
    var that = this
    return new Promise((resolve) => {
      db.collection('label_success').doc(label).get({
        success: res => {
          console.log('label_success')
          let result=that.data.result
          for (var j = 0; j < res.data.result.length; j++) {
            res.data.result[j]['label']=label
            result.push(res.data.result[j])
          }
          that.setData({result})
          resolve([index, 1])
        },
        fail: function(e) {
          console.log(e)
          db.collection('label_fail').doc(label).get({
            success: res => {
              console.log('label_fail')
              resolve([index, 0])
            },
            fail: function(e) {
              console.log(e)
              console.log('label_unknown')
              resolve([index, 2])
            }
          })
        },
      })
    })

  },

  check_db: function(label) {
    var that = this
    return new Promise(resolve => {
      var if_in_db = {}
      //debugger
      console.log(label)
      for (var a = 0; a < label.length; a++) {
        that.access_db(label[a].tag_name, a)
          .then(function([index, state]) {
            console.log('look at me')
            if_in_db[index] = state
          })
      }
      var t = setInterval(function() {
        console.log('waiting...')
        console.log(Object.keys(if_in_db).length)
        console.log(that.data.info.length)
        console.log(if_in_db)
        if (Object.keys(if_in_db).length == that.data.info.length) {
          console.log('resolve')
          clearInterval(t)
          resolve(if_in_db)
        }
      }, 100)
    })
  },



  handle: function(if_in_db) {
    var that = this
    for (var i = 0; i < that.data.info.length; i++) {
      if (if_in_db[i] == 2) {
        that.search_api(that.data.info[i].tag_name, 3)
          .then(function([name,data]) {
            if (data.length) {
              let result=that.data.result
              for (var j = 0; j < data.length; j++) {
                data[j]['label']=name
                result.push(data[j])
              }
              that.setData({result})
            }
          })
      }
    }
    for (var i = 0; i < that.data.info.length; i++) {
      if(if_in_db[i]==2){
        that.search_all(that.data.info[i].tag_name)
      }
    }
  },

  search_all:function(label){
      var that=this
      setTimeout(function(){
        that.search_api(label, 0)
          .then(function ([name, data]) {
            if (data.length) {
              if (data[0] == '<') {
                that.search_all(label)
              }
              else {
                let result=that.data.result
                for (var j = 3; j < data.length; j++) {
                  result.push(data[j])
                }
                that.setData({result})
                db.collection('label_success').add({
                  data: {
                    _id: name,
                    result: data
                  }
                })
              }
            } else if (data && !data.length) {
              db.collection('label_fail').add({
                data: {
                  _id: name
                }
              })
            }
          })
      },5000)
      
  },

  test: function() {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        that.setData({
          image: res.tempFilePaths[0]
        })
        that.ai.multilabel(res.tempFilePaths[0])
          //that.ai.object(res.tempFilePaths[0])
          .then(function(data) {
            var label = data['data']['tag_list']
            that.setData({
              info: label
            })
            return that.check_db(label)
          })
          .then(function(data) {
            that.handle(data)
          })
          .catch(function(error) {
            console.log(error)
          })
      },
    })
  },

  toDetail:function(){
    wx.navigateTo({
      url: '/pages/detail/detail?detail='+JSON.stringify(this.data.result[this.data.show_index])
    })
  },

  onLoad: function() {
    this.ai = new ai_request()
    /*if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })*/
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload: function() {
    // 选择图片
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        console.log(filePath)
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        console.log(cloudPath)
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath

            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },


  testOfSign: function() {
    this.ai.testOfSign()
  },

  testOfYoudao: function() {
    this.ai.requestForTranslate()
  },

  youdao() {
    wx.request({
      url: 'http://fanyi.youdao.com/translate?smartresult=dict&smartresult=rule',
      data: Util.json2Form({
        'i': 'china',
        'doctype': 'json',
        'from': 'AUTO',
      }),
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      responseType: 'text',
      method: 'POST',
      success(res) {
        console.log(res.data)
      }
    })
  },

  juzikong(label) {
    var that = this
    wx.request({
      url: 'https://www.juzikong.com/s?q=' + this.ai.urlEncode(label) + '&type=posts',
      method: 'GET',
      header: {
        'content-type': 'application/json',
      },
      success(res) {
        var req = res.data
        console.log(req)
        var test = req.match(/\"content_3x7kU\"([\d\D]*?)<!---->/gi)
        console.log(test)
        for (var i = 0; i < test.length; i++) {
          test[i] = '<' + test[i]
          test[i] = test[i].replace(/<.*?>/ig, '')
          test[i].split(' ').join('')
          test[i].split('\n').join('')
        }
        console.log(test)
        that.setData({
          sentence: test
        })
      }
    })
  },

})