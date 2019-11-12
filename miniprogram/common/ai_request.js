let md5 = require('../libs/md5.min')
let Util=require('../common/util.js')

export default class ai_request {
  multilabel(filePath) {
    var that=this
    return new Promise((resolve, reject) => {
      if (filePath) {
        that.encoding(filePath)
          .then(function (code) {
            var param = {
              'app_id': 2123295603,
              'image': code,
              'nonce_str': Math.random().toString(36).substr(2),
              'sign': '',
              'time_stamp': Date.parse(new Date()) / 1000,
              //'topk':5,
              //'format':1
            }
            return that.signCalculate(param)
          })
          .then(function (data) {
            return that.request(data, 'https://api.ai.qq.com/fcgi-bin/image/image_tag')
          })
          .then(function(res){
            resolve(res)
          })
          .catch(function (error) {
            console.log('[rejected]' + error)
          })
      }
    })
  }

  object(filePath) {
    var that = this
    return new Promise((resolve, reject) => {
      if (filePath) {
        that.encoding(filePath)
          .then(function (code) {
            var param = {
              'app_id': 2123295603,
              'image': code,
              'nonce_str': Math.random().toString(36).substr(2),
              'sign': '',
              'time_stamp': Date.parse(new Date()) / 1000,
              'topk':5,
              'format':1
            }
            return that.signCalculate(param)
          })
          .then(function (data) {
            return that.request(data, 'https://api.ai.qq.com/fcgi-bin/vision/vision_objectr')
          })
          .then(function (res) {
            resolve(res)
          })
          .catch(function (error) {
            console.log('[rejected]' + error)
          })
      }
    })
  }

  encoding(filePath) {
    return new Promise((resolve, reject) => {
      wx.getFileSystemManager().readFile({
        filePath: filePath, //选择图片返回的相对路径
        encoding: 'base64', //编码格式
        success: resultBase => { //成功的回调
          resolve(resultBase.data)
        },
        fail: function () {
          reject('fail to read file')
        }
      })
    })
  }

  testOfSign(){
    var param={
      'app_id'     : '10000',
      'time_stamp' : '1493449657',
      'nonce_str'  : '20e3408a79',
      'key1'       : '腾讯AI开放平台',
      'key2'       : '示例仅供参考',
      'sign'       : '',
    }
    var appkey = 'a95eceb1ac8c24ee28b70f7dbba912bf'

    var t = Object.keys(param).sort()
    var str = ''
    for (var i = 0; i < t.length; i++) {
      if (param[t[i]] != '') {
        str = str + t[i] + '=' + encodeURIComponent(param[t[i]]) + '&'
      }
    }
    str = str + 'app_key=' + appkey
    //console.log(str)
    param['sign'] = md5(str).toUpperCase()
    console.log(param)
  }

  signCalculate(param) {
    return new Promise(resolve => {
      var appkey = '037tiooAugGfz4Rw'

      var t = Object.keys(param).sort()
      var str = ''
      for (var i=0;i<t.length;i++) {
        if (param[t[i]] != '') {
          str = str + t[i] + '=' + encodeURIComponent(param[t[i]]) + '&'
          //str = str + t[i] + '=' + this.urlEncode(param[t[i]]) + '&'
        }
      }
      str = str + 'app_key=' + appkey
      param['sign']=md5(str).toUpperCase()
      resolve(param)
    })
  }

  urlEncode(clearString) {
    var output = '';
    var x = 0;
    //debugger
    clearString = clearString.toString();
    var regex = /(^[a-zA-Z0-9-_.]*)/;
    while (x < clearString.length) {
      var match = regex.exec(clearString.substr(x));
      if (match != null && match.length > 1 && match[1] != '') {
        output += match[1];
        x += match[1].length;
      } else {
        if (clearString.substr(x, 1) == ' ') {
          output += '+';
          x++;
        }
        else {
          var charCode = clearString.substr(x, 1);
          if (charCode.charCodeAt().toString() < 128) {
            output += '%' + charCode.charCodeAt().toString(16).toUpperCase();
            x++;
          }
          else {
            output += encodeURIComponent(charCode);
            x += charCode.length;
          }
        }
      }
    }
    return output;
  }

  request(param,req_url){
    return new Promise((resolve,reject)=>{
      wx.request({
        url: req_url,
        //url: 'https://api.ai.qq.com/fcgi-bin/vision/vision_objectr',
        data: Util.json2Form(param),
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        dataType: 'json',
        responseType: 'text',
        success(res){
          resolve(res.data)
        },
        fail:function(){
          reject('post request error')
        },
        complete: function (res) {
          console.log(res)
        }
      })
    })
  }

  requestForTranslate(){
    var param = {
      'app_id': 2123295603,
      'text':'中国',
      'type':0,
      'nonce_str': Math.random().toString(36).substr(2),
      'sign': '',
      'time_stamp': Date.parse(new Date()) / 1000,
      'app_key':''
    }
    var appkey = '037tiooAugGfz4Rw'

    var t = Object.keys(param).sort()
    var str = ''
    for (var i = 0; i < t.length; i++) {
      if (param[t[i]] != '') {
        str = str + i + '=' + this.urlEncode(param[t[i]]) + '&'
      }
    }
    str = str + 'app_key=' + appkey
    param['sign'] = md5(str).toUpperCase()
    param['app_key']=appkey

    wx.request({
      url: 'https://api.ai.qq.com/fcgi-bin/nlp/nlp_texttrans',
      data: Util.json2Form(param),
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      complete: function (res) {
        console.log(res)
      }
    })
  }


  
}