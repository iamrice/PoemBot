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
    upload_times: 0,
    cliped: 0,
    canvasHidden: true,
    bg:['type1.jpg','type2.png','type3.png','type4.png'],
    bg_index:0
  },

  rpx2px: function(a) {
    return a * this.data.width / 750
  },

  createNewImg: function() {
    wx.showLoading({
      title: '正在生成',
    })
    console.log('processing canvas')
    var that = this;
    var context = wx.createCanvasContext('mycanvas')
    var img_radius
    if (this.data.cliped > 0) {
      img_radius = 2 / 3
    } else {
      img_radius = that.data.img_height / that.data.img_width
    }
    that.setData({
      img_radius,
      bg_index:Math.floor(Math.random()*5)
    })

    wx.getImageInfo({
      src: 'cloud://cloudforfdemo-mhxfi.636c-cloudforfdemo-mhxfi/'+that.data.bg[that.data.bg_index],
      fail:function(e){
        console.log(e)
        that.createNewImg()
      },
      success: function (res) {
        context.drawImage(res.path, 0, 0, that.rpx2px(650), that.rpx2px(600) * (img_radius + 1))

        if (that.data.cliped == 1) {

          context.drawImage(that.data.image, 0, that.data.img_top * that.data.img_height, that.data.img_width, that.data.img_width / 1.5, that.rpx2px(50), that.rpx2px(50), that.rpx2px(550), that.rpx2px(550) * img_radius)

        } else if (that.data.cliped == 2) {

          context.drawImage(that.data.image, that.data.img_left * that.data.img_width, 0, that.data.img_height * 1.5, that.data.img_height, that.rpx2px(50), that.rpx2px(50), that.rpx2px(550), that.rpx2px(550) * img_radius)

        } else {
          context.drawImage(that.data.image, that.rpx2px(that.data.img_left), that.rpx2px(that.data.img_top), that.data.img_width, that.data.img_height, that.rpx2px(50), that.rpx2px(50), that.rpx2px(550), that.rpx2px(550) * img_radius)
        }
        /*context.drawImage('左上角.png', that.rpx2px(0), that.rpx2px(0), that.rpx2px(200), that.rpx2px(200))
        context.drawImage('右下角.png', that.rpx2px(480), that.rpx2px(550) * img_radius - that.rpx2px(20), that.rpx2px(150), that.rpx2px(150))*/
        var nowheight = that.rpx2px(600) * img_radius
        context.setFontSize(15 * that.data.width / 375)
        context.setFillStyle('#4d4531')
        var str = that.data.result[that.data.show_index].key
        if (str == '') str = that.data.result[that.data.show_index].content
        var text_limit = that.rpx2px(580) / (15 * that.data.width / 375)
        if (str.length > text_limit) {
          var strlist = []
          for (var i = 0; i < str.length; i += text_limit) {
            strlist.push(str.substr(i, text_limit))
          }
          for (var i = 0; i < strlist.length; i++) {
            context.fillText(strlist[i], that.rpx2px(35), that.rpx2px(600) * img_radius + 50 + 20 * i)
          }
          console.log(nowheight)
          nowheight += 50 + 20 * strlist.length
        } else {
          console.log(context.measureText(str).width)
          context.fillText(str, (that.rpx2px(650) - context.measureText(str).width) * 0.5, nowheight + 50)
          nowheight += 50 + 20
        }
        console.log('nowheight' + nowheight)
        context.stroke()

        str = '----' + '《' + that.data.result[that.data.show_index].title + '》' + ' 【' + that.data.result[that.data.show_index].dynasty + '】' + that.data.result[that.data.show_index].author

        if (context.measureText(str).width>that.rpx2px(580)) {
          var title = '----' + '《' + that.data.result[that.data.show_index].title + '》'
          context.fillText(title, (that.rpx2px(615) - context.measureText(title).width), nowheight + 20)
          nowheight += 20
          var author = ' 【' + that.data.result[that.data.show_index].dynasty + '】' + that.data.result[that.data.show_index].author
          context.fillText(author, (that.rpx2px(615) - context.measureText(author).width), nowheight + 20)
          nowheight += 20
        }
        else {
          context.fillText(str, (that.rpx2px(615) - context.measureText(str).width), nowheight + 20)
          nowheight += 20
        }

        nowheight += 20
        wx.hideLoading()
        context.draw()
        that.setData({
          canvasHidden: false
        })
        setTimeout(function () {
          context.draw(false, wx.canvasToTempFilePath({
            canvasId: 'mycanvas',
            //destWidth: that.rpx2px(650) * 2, 
            //destHeight: that.rpx2px(1000) * 2,
            quality: 1,
            fileType: 'jpg',
            success: function (res) {
              var tempFilePath = res.tempFilePath;
              that.setData({
                imagePath: tempFilePath
              });
            },
            fail: function (res) {
              console.log(res);
            }
          }, that))
        }, 1000)
        /*wx.getImageInfo({
          src: 'cloud://cloudforfdemo-mhxfi.636c-cloudforfdemo-mhxfi/QRcode2.PNG',
          success: function (res) {
            context.drawImage(res.path, that.rpx2px(400), (nowheight + that.rpx2px(600) * (img_radius + 1)) / 2 - that.rpx2px(112.5), that.rpx2px(225), that.rpx2px(225))

            wx.getImageInfo({
              src: 'cloud://cloudforfdemo-mhxfi.636c-cloudforfdemo-mhxfi/引导语.PNG',
              success: function (res) {
                context.drawImage(res.path, that.rpx2px(0), (nowheight + that.rpx2px(600) * (img_radius + 1)) / 2 - that.rpx2px(78), that.rpx2px(400), that.rpx2px(156))
                
              }
            })

          }
        })*/
      }
    })
  },

  notsave:function(){
    this.setData({
      canvasHidden:true,
      imagePath:''
    })
  },

  saveImg: function() {
    var that = this
    wx.saveImageToPhotosAlbum({
      filePath: that.data.imagePath,
      success(res) {
        wx.showModal({
          content: '图片已保存到相册，赶紧晒一下吧~',
          showCancel: false,
          confirmText: '好的',
          confirmColor: '#333',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定');
              /* 该隐藏的隐藏 */
              that.setData({
                canvasHidden:true,
                imagePath:''
              })
            }
          }, 
          fail: function (res) {
            console.log(res)
          }
        })
      }
    })
  },

  /*SimilarWord: function(keyword) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://nlp.tencentcloudapi.com',
        method: 'POST',
        header: {
          Action: 'SimilarWords',
          Version: '2019-04-08',
          WordNumber: 20,
          Text: '腾讯',
          Timestamp: Date.parse(new Date()) / 1000,
          Region: 'ap-guangzhou',
          Nonce: Math.random().toString(36).substr(2),
          SecretId: 'AKIDgNvUs5Fwa3SeaOddst9H9pPmtlNomnod',
          Signature: '待定',
          SignatureMethod: 'HmacSHA1',
          'content-type': 'application/x-www-form-urlencoded',
        }
      })
    })
  },*/

  search_api: function(keyword, number) {
    console.log(keyword)
    var that = this
    return new Promise((reslove, reject) => {
      if (that.data.search_able == 1) {
        console.log('search_able')
        that.data.search_able = 0
        wx.request({
          url: 'https://service-p1cgyxqe-1300620164.gz.apigw.tencentcs.com/release/poemSearch',
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
          complete: function() {
            that.data.search_able = 1
          }
        })
      } else {
        console.log('not searchable')
        setTimeout(function() {
          that.search_api(keyword, number)
        }, 2000)
      }
    })
  },

  change: function() {
    var num = this.data.result.length
    this.setData({
      show_index: Math.floor(Math.random() * num)
    })
  },

  access_db: function(label, index) {
    var that = this
    return new Promise((resolve) => {
      db.collection('label_success').doc(label).get({
        success: res => {
          console.log('label_success')
          wx.hideLoading()
          let result = that.data.result
          var randomIndex = Math.floor(Math.random() * res.data.result.length)
          res.data.result[randomIndex]['label'] = label
          result.push(res.data.result[randomIndex])
          for (var j = 0; j < res.data.result.length; j++) {
            res.data.result[j]['label'] = label
            result.push(res.data.result[j])
          }
          that.setData({
            result
          })
          resolve([index, 1])
        },
        fail: function(e) {
          db.collection('label_fail').doc(label).get({
            success: res => {
              console.log('label_fail')
              if (res.data.change) {
                db.collection('label_success').doc(res.data.change).get({
                  success: res => {
                    console.log('change_label_success')
                    wx.hideLoading()
                    let result = that.data.result
                    var randomIndex = Math.floor(Math.random() * res.data.result.length)
                    res.data.result[randomIndex]['label'] = label
                    result.push(res.data.result[randomIndex])
                    for (var j = 0; j < res.data.result.length; j++) {
                      res.data.result[j]['label'] = label
                      result.push(res.data.result[j])
                    }
                    that.setData({
                      result
                    })
                  },
                  fail: function() {
                    that.search_api(res.data.change, 0)
                      .then(function([name, data]) {
                        if (data.length) {
                          wx.hideLoading()
                          let result = that.data.result
                          var randomIndex = Math.floor(Math.random() * data.length)
                          data[randomIndex]['label'] = label
                          result.push(data[randomIndex])
                          console.log(data.length)
                          console.log(randomIndex)
                          console.log(result)
                          for (var j = 0; j < data.length; j++) {
                            data[j]['label'] = name
                            result.push(data[j])
                          }
                          that.setData({
                            result: result
                          })
                          db.collection('label_success').add({
                            data: {
                              _id: name,
                              result: data
                            }
                          })
                        }
                      })
                  }
                })
                resolve([index, 1])
              } else {
                resolve([index, 0])
              }
            },
            fail: function(e) {
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
          .then(function([name, data]) {
            if (data.length) {
              wx.hideLoading()
              let result = that.data.result
              var randomIndex = Math.floor(Math.random() * data.length)
              data[randomIndex]['label'] = name
              result.push(data[randomIndex])
              for (var j = 0; j < data.length; j++) {
                data[j]['label'] = name
                result.push(data[j])
              }
              that.setData({
                result: result
              })
            }
          })
          .catch(function(err) {
            that.setData({
              state: err
            })
          })
      }
    }
    for (var i = 0; i < that.data.info.length; i++) {
      if (if_in_db[i] == 2) {
        that.search_all(that.data.info[i].tag_name)
      }
    }
  },

  search_all: function(label) {
    var that = this
    setTimeout(function() {
      that.search_api(label, 0)
        .then(function([name, data]) {
          if (data.length) {
            if (data[0] == '<') {
              that.search_all(label)
            } else {
              let result = that.data.result
              for (var j = 3; j < data.length; j++) {
                data[j]['label'] = name
                result.push(data[j])
              }
              that.setData({
                result
              })
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
                _id: name,
                change: ''
              }
            })
          }
        })
    }, 5000)
  },

  test: function() {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        that.data.upload_times += 1
        var times = that.data.upload_times
        wx.showLoading({
          title: '正在上传图片',
        })
        setTimeout(function() {
          if (that.data.upload_times == times) {
            wx.hideLoading()
            if (that.data.result.length == 0) {
              that.setData({
                state: '没有找到相关的诗句，换个图片试试吧'
              })
            }
          }
        }, 10000)
        console.log(res.tempFilePaths[0])
        that.setData({
          image: res.tempFilePaths[0],
          result: [],
          info: [],
          state: '',
          show_index: 0,
          cliped: 0,
          img_left: 0,
          img_top: 0,
          imagePath:''
        })
        wx.getImageInfo({
          src: res.tempFilePaths[0],
          success: function(result) {
            that.setData({
              img_width: result.width,
              img_height: result.height
            })
          }
        })
        that.ai.multilabel(res.tempFilePaths[0])
          //that.ai.object(res.tempFilePaths[0])
          .then(function(data) {
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
          .then(function(data) {
            that.handle(data)
          })
          .catch(function(error) {
            console.log(error)
          })
      },
    })
  },

  toDetail: function() {
    console.log('/pages/detail/detail?detail=' + JSON.stringify(this.data.result[this.data.show_index]))
    wx.navigateTo({
      url: '/pages/detail/detail?detail=' + JSON.stringify(this.data.result[this.data.show_index])
    })
  },

  makeCard: function() {
    if (this.data.cliped == 0) {
      this.toCard()
    } else {
      this.createNewImg()
    }
  },

  toCard: function() {
    wx.navigateTo({
      url: '/pages/card/card?img_path=' + this.data.image,
    })
    /*wx.navigateTo({
      url: '/pages/card/card?img_path=/pages/index/' + this.data.image,
    })*/
  },

  onShow: function() {},

  onLoad: function(options) {
    var that = this
    this.ai = new ai_request()
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          width : res.windowWidth,
          height : res.windowHeight
        })
      },
    })
    /*this.setData({
      result : [{ 'key': '测试：假设这是一首古诗' }],
      image:'http://tmp/wxa979616a25cb05b1.o6zAJs_2tqxhQGjyEU6np_F_U7dk.geqOrkeNA0vaf95e170dc75986949c2d08f478902a8d.jpg',
      cliped:2
    })*/
    
    /*
    this.data.image='han.jpg'
    wx.getImageInfo({
      src: that.data.image,
      success: function (result) {
        that.setData({
          img_width: result.width,
          img_height: result.height,
        })
        that.createNewImg()
      }
    })*/

    /*wx.navigateTo({
      url:'/pages/card/card?detail={"author":"唐寅","comment":{},"content":"侠客重功名，西北请专征。;惯战弓刀捷，酬知性命轻。;孟公好惊座，郭解始横行。;相将李都尉，一夜出平城。","dynasty":"明","key":"侠客重功名，西北请专征。惯战弓刀捷，酬知性命轻。孟公好惊...","label":"男孩","title":"侠客"}&img_path=http://tmp/wxa979616a25cb05b1.o6zAJs_2tqxhQGjyEU6np_F_U7dk.ITSsiyk6LJwU846048b7c71605d650e317db4d36e028.jpg'
    })*/
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

})