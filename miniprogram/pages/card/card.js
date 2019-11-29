var box_width = 600; //截取框尺寸
var box_height = 400;

var tran_left = 0; //保存图片偏移值，默认不偏移
var tran_top = 0;

var window_width = 750; //最外层宽度、高度
var window_height = 1000;

var rpx = 0; //单位换算

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show_canvas: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showModal({
      title: '请适当裁剪图片',
      showCancel:false
    })
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        rpx = (750 / res.windowWidth).toFixed(2)
        that.setData({
          bottom_height: res.windowHeight * rpx - 1000,
          height: res.windowHeight * rpx
        })
      },
    })
    this.data.img=options.img_path
    this.clipImg()
  },

  check:function(){
    if(this.data.rate<1.5){
      console.log('/pages/index/index?top=' + (this.data.mask_height - this.data.img_top) + '&left=0')
      let pages = getCurrentPages(); 
      let prevPage = pages[ pages.length - 2 ]; 
      prevPage.setData({
        img_left:0,
        img_top: (this.data.mask_height - this.data.img_top)/this.data.img_height,
        cliped:1
      })
      wx.navigateBack({
        delta:1,
        success:function(){
          prevPage.createNewImg()
        }
      })
    }
    else{
      console.log('/pages/index/index?top=0&left=' + (this.data.mask_width - this.data.img_left))
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2];
      prevPage.setData({
        img_left: (this.data.mask_width - this.data.img_left)/this.data.img_width,
        img_top: 0,
        cliped: 2
      })
      wx.navigateBack({
        delta: 1,
        success: function () {
          prevPage.createNewImg()
        }
      })
    }
  },

  clipImg() {
    var that = this;
    var img=this.data.img
    wx.getImageInfo({
      src: img,
      success(res) {
        // console.log(res)
        var img_width = res.width * rpx, //转成rpx单位
          img_height = res.height * rpx,
          img_left = 0, //图片左偏移
          img_top = 0, //图片上偏移
          clip_top = 0, //截取框上偏移
          clip_left = 0; //截取框左偏移

        var mask_width, mask_height, mask_top, mask_left; //图片遮罩层

        var rate = (img_width / img_height).toFixed(2); //判断图片类型
        if (rate >= 1.5) { //横图
          img_width = box_height * rate;
          img_height = box_height;
          img_left = 0;
          img_top = 0;
          clip_top = (window_height - box_height) / 2;
          clip_left = (window_width - box_width) / 2;

          mask_width = (img_width - 600) / 2;
          mask_height = 400;
          mask_left = (window_width - img_width) / 2;
          mask_top = clip_top;
        } else { //竖图
          img_height = box_width / rate;
          img_width = box_width;
          img_left = 0;
          img_top = 0;
          clip_top = (window_height - box_height) / 2;
          clip_left = (window_width - box_width) / 2;

          mask_width = 600;
          mask_height = (img_height - 400) / 2;
          mask_left = clip_left;
          mask_top = (window_height - img_height) / 2;
        }

        that.setData({
          img_width: img_width,
          img_height: img_height,
          img_left: img_left,
          img_top: img_top,
          clip_top: clip_top,
          clip_left: clip_left,
          rate: rate,
          img: img,

          mask_width: mask_width,
          mask_height: mask_height,
          mask_top: mask_top,
          mask_left: mask_left
        })
      }
    })
  },

  start(e) {
    this.pageX = e.touches[0].pageX;
    this.pageY = e.touches[0].pageY;
  },
  move(e) {
    var pageX = e.touches[0].pageX;
    var pageY = e.touches[0].pageY;
    var moveX = (pageX - this.pageX) * rpx + tran_left; //tran_left先为图片初始偏移值，后为图片挪动偏移值
    var moveY = (pageY - this.pageY) * rpx + tran_top;

    var rate = this.data.rate;
    if (rate >= 1.5) {
      if (moveX > this.data.mask_width) { //超出，取最小值
        this.setData({
          img_left: this.data.mask_width
        })
        return;
      }
      if (moveX < -this.data.mask_width) { //超出，取最大值
        this.setData({
          img_left: -this.data.mask_width
        })
        return;
      }
      this.setData({
        img_left: moveX,
      })
    } else {
      if (moveY > this.data.mask_height) {
        this.setData({
          img_top: this.data.mask_height
        })
        return;
      }
      if (moveY < -this.data.mask_height) {
        this.setData({
          img_top: -this.data.mask_height
        })
        return;
      }
      this.setData({
        img_top: moveY
      })
    }
  },
  end(e) {
    tran_left = this.data.img_left; //偏移值重新赋值
    tran_top = this.data.img_top;
  },
  create() {
    var that = this;
    var ctx = wx.createCanvasContext('myCanvas');
    ctx.drawImage(that.data.img, 0, 0, that.data.img_width / rpx, that.data.img_height / rpx);
    ctx.draw(false, function () {
      var rate = that.data.rate;
      var x, y;
      if (rate >= 1.5) {
        x = (that.data.mask_width - that.data.img_left) / rpx; //x轴偏移的值
        y = 0;
      } else {
        x = 0;
        y = (that.data.mask_height - that.data.img_top) / rpx; //y轴偏移的值
      }
      /*wx.canvasToTempFilePath({
        canvasId: 'myCanvas',
        x: x,
        y: y,
        width: 600 / rpx,
        height: 600 / rpx,
        destWidth: 600 * 2 / rpx, //画布生成图片有点模糊，可以把像素密度*2或者截取框尺寸调大点
        destHeight: 600 * 2 / rpx,
        quality: 1,
        success(res) {
          console.log(res)
          that.setData({
            img: res.tempFilePath,
            show_canvas: true
          })
        },
        fail(res) {
          console.log(res);
        }
      })*/
    })
  },
  previewImg() {
    wx.previewImage({
      urls: [this.data.img],
    })
  }
})