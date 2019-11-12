import ImageHandler from '../../common/imageHandler'
let md5 = require('../../libs/md5.min')
let Util = require('../../common/util.js')
const app = getApp()
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: ''
  },
  apiConnect:function(){
    var that=this
    wx.chooseImage({
      count:1,
      sizeType:['compressed'],
      sourceType:['album','camera'],
      success: function(res) {
        const filePath=res.tempFilePaths[0]
        that.handler.setImage(filePath)
          .then((res)=>{
            console.log('base64')
            that.api(res)
          })
      },
    })
  },
  encoding:function(path){
    var that=this
    wx.downloadFile({
      url: path,
      success(res) {
        wx.getFileSystemManager ().readFile({
          filePath: res.tempFilePath, //选择图片返回的相对路径
          encoding: 'base64', //编码格式
          success: resultBase => { //成功的回调
            that.api(resultBase.data)
            //console.log(hex_md5('55gs4sd56g4t86h3'))
          }
        })
      },
      fail: e => {
        console.error(e)
      }
    })
  },
  test: function () {
    var that=this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        const filePath = res.tempFilePaths[0]
        console.log(filePath)
        that.encoding(filePath)
      },
      fail: e => {
        console.error(e)
      }
    })
  },
  getReqSign:function(param,appKey){
    var t = Object.keys(param).sort()
    var str=''
    for(var i=0;i<t.length;i++){
      if(param[t[i]]!=''){
        str=str+t[i]+'='+this.URLEncode(param[t[i]])+'&'
        //str = str + t[i] + '=' + escape(param[t[i]]).toUpperCase() + '&'
      }
    }
    str=str+'app_key='+appKey
    //console.log(str)
    return md5(str).toUpperCase()
  },
  testOfEncode:function(){
    console.log(this.URLEncode('\\'))
  },
  URLEncode : function (clearString) {
    var output = '';
    var x = 0;
    clearString = clearString.toString();
    var regex = /(^[a-zA-Z0-9-_.]*)/;
    //var char=/(^[!()*]*)/;
    while (x < clearString.length) {
      var match = regex.exec(clearString.substr(x));
      if (match != null && match.length > 1 && match[1] != '') {
        output += match[1];
        x += match[1].length;
      } else {
        /*var match = char.exec(clearString.substr(x));
        if (match != null && match.length > 1 && match[1] != ''){
          output += '%'+clearString.substr(x, 1).charCodeAt().toString(16)
          x++;
        }
        else */if (clearString.substr(x, 1) == ' ') {
          //原文在此用 clearString[x] == ' ' 做判断, 但ie不支持把字符串当作数组来访问, 
          //修改后两种浏览器都可兼容 
          output += '+';
          x++;
        }
        else {
          var charCode = clearString.substr(x,1);
          if(charCode.charCodeAt().toString()<128){
            output += '%' + charCode.charCodeAt().toString(16);
            x++;
          }
          else{
            output += encodeURIComponent(charCode);
            x += charCode.length;
          }
          //var hexVal = charCode.toString(16);
          //output += '%' + (hexVal.length < 2 ? '0' : '') + hexVal.toUpperCase();
        }
      }
    }
    return output;
  },
  api:function(code){
    var param={
      app_id: '2123295603',
      image: code,
      nonce_str: Math.random().toString(36).substr(2),
      sign: '',
      time_stamp: Date.parse(new Date()) / 1000,
    }
    var appkey ='037tiooAugGfz4Rw'
    param['sign']=this.getReqSign(param,appkey)
    console.log(param)
    wx.request({
      url: 'https://api.ai.qq.com/fcgi-bin/image/image_tag',
      header:{
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      data:Util.json2Form(param),
      success(res) {
        console.log(res.data)
      }
    })
    },
  
  translate:function(){
    wx.request({
      url: 'http://fanyi.youdao.com/translate?smartresult=dict&smartresult=rule',
      data: Util.json2Form({
        'i': '中国',
        'doctype': 'json',
        'from': 'AUTO',
        'to': 'AUTO',
        'smartresult': 'dict',
        'client': 'fanyideskweb',
        'salt': '15679929720933',
        'sign': 'cda711ffa81377e041779c8c5c639ea8',
        'ts': '1567992972093',
        'bv': 'a4f4c82afd8bdba188e568d101be3f53',
        'version': '2.1',
        'keyfrom': 'fanyi.web',
        'action': 'FY_BY_REALTlME'
      }),
      method:'POST',
      success(res){
        console.log(res.data)
      }
    })
  },
  onLoad: function() {
    this.handler=new ImageHandler(this)
    if (!wx.cloud) {
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
    })
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
  doUpload: function () {
    // 选择图片
    var that=this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

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



  var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

  // public method for decoding

function encode(input) {

  var output = "";

  var chr1, chr2, chr3, enc1, enc2, enc3, enc4;

  var i = 0;

  input = _utf8_encode(input);

  while (i < input.length) {

    chr1 = input.charCodeAt(i++);

    chr2 = input.charCodeAt(i++);

    chr3 = input.charCodeAt(i++);

    enc1 = chr1 >> 2;

    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);

    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);

    enc4 = chr3 & 63;

    if (isNaN(chr2)) {

      enc3 = enc4 = 64;

    } else if (isNaN(chr3)) {

      enc4 = 64;

    }

    output = output +

      _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +

      _keyStr.charAt(enc3) + _keyStr.charAt(enc4);

  }

  return output;

}

function _utf8_encode(string) {

  string = string.replace(/\r\n/g, "\n");

  var utftext = "";

  for (var n = 0; n < string.length; n++) {

    var c = string.charCodeAt(n);

    if (c < 128) {

      utftext += String.fromCharCode(c);

    } else if ((c > 127) && (c < 2048)) {

      utftext += String.fromCharCode((c >> 6) | 192);

      utftext += String.fromCharCode((c & 63) | 128);

    } else {

      utftext += String.fromCharCode((c >> 12) | 224);

      utftext += String.fromCharCode(((c >> 6) & 63) | 128);

      utftext += String.fromCharCode((c & 63) | 128);

    }



  }

  return utftext;

}

  function decode(input) {

    var output = "";

    var chr1, chr2, chr3;

    var enc1, enc2, enc3, enc4;

    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {

      enc1 = _keyStr.indexOf(input.charAt(i++));

      enc2 = _keyStr.indexOf(input.charAt(i++));

      enc3 = _keyStr.indexOf(input.charAt(i++));

      enc4 = _keyStr.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);

      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);

      chr3 = ((enc3 & 3) << 6) | enc4;

      output = output + String.fromCharCode(chr1);

      if (enc3 != 64) {

        output = output + String.fromCharCode(chr2);

      }

      if (enc4 != 64) {

        output = output + String.fromCharCode(chr3);

      }

    }

    output = _utf8_decode(output);

    return output;

  }



  // private method for UTF-8 encoding



  // private method for UTF-8 decoding

  function _utf8_decode(utftext) {

    var string = "";

    var i = 0;

    var c=0;
    var c1=0;
    var c2=0;

    while (i < utftext.length) {

      c = utftext.charCodeAt(i);

      if (c < 128) {

        string += String.fromCharCode(c);

        i++;

      } else if ((c > 191) && (c < 224)) {

        c2 = utftext.charCodeAt(i + 1);

        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));

        i += 2;

      } else {

        c2 = utftext.charCodeAt(i + 1);

        var c3 = utftext.charCodeAt(i + 2);

        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));

        i += 3;

      }

    }

    return string;

  }


/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad = ""; /* base-64 pad character. "=" for strict RFC compliance   */
var chrsz = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_md5(s) { return binl2hex(core_md5(str2binl(s), s.length * chrsz)); }
function b64_md5(s) { return binl2b64(core_md5(str2binl(s), s.length * chrsz)); }
function str_md5(s) { return binl2str(core_md5(str2binl(s), s.length * chrsz)); }
function hex_hmac_md5(key, data) { return binl2hex(core_hmac_md5(key, data)); }
function b64_hmac_md5(key, data) { return binl2b64(core_hmac_md5(key, data)); }
function str_hmac_md5(key, data) { return binl2str(core_hmac_md5(key, data)); }

/*
 * Perform a simple self-test to see if the VM is working
 */
function md5_vm_test() {
  return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
}

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length
 */
function core_md5(x, len) {
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  var a = 1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d = 271733878;

  for (var i = 0; i < x.length; i += 16) {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
    d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

    a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

    a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
    d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

    a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
    d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);

}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t) {
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
}
function md5_ff(a, b, c, d, x, s, t) {
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t) {
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t) {
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t) {
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Calculate the HMAC-MD5, of a key and some data
 */
function core_hmac_md5(key, data) {
  var bkey = str2binl(key);
  if (bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);

  var ipad = Array(16), opad = Array(16);
  for (var i = 0; i < 16; i++) {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
  return core_md5(opad.concat(hash), 512 + 128);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y) {
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt) {
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Convert a string to an array of little-endian words
 * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
 */
function str2binl(str) {
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for (var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (i % 32);
  return bin;
}

/*
 * Convert an array of little-endian words to a string
 */
function binl2str(bin) {
  var str = "";
  var mask = (1 << chrsz) - 1;
  for (var i = 0; i < bin.length * 32; i += chrsz)
    str += String.fromCharCode((bin[i >> 5] >>> (i % 32)) & mask);
  return str;
}

/*
 * Convert an array of little-endian words to a hex string.
 */
function binl2hex(binarray) {
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for (var i = 0; i < binarray.length * 4; i++) {
    str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
      hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
  }
  return str;
}

/*
 * Convert an array of little-endian words to a base-64 string
 */
function binl2b64(binarray) {
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  for (var i = 0; i < binarray.length * 4; i += 3) {
    var triplet = (((binarray[i >> 2] >> 8 * (i % 4)) & 0xFF) << 16)
      | (((binarray[i + 1 >> 2] >> 8 * ((i + 1) % 4)) & 0xFF) << 8)
      | ((binarray[i + 2 >> 2] >> 8 * ((i + 2) % 4)) & 0xFF);
    for (var j = 0; j < 4; j++) {
      if (i * 8 + j * 6 > binarray.length * 32) str += b64pad;
      else str += tab.charAt((triplet >> 6 * (3 - j)) & 0x3F);
    }
  }
  return str;
}
