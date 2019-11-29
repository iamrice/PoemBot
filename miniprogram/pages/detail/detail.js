// pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var content = JSON.parse(options.detail).content;
    var comment = JSON.parse(options.detail).comment;

    var contentList = []
    var if_has_comment = []
    var splitList = []
    console.log(Object.keys(comment).length)
    if (Object.keys(comment).length) {
      for (var i = 0; i < Object.keys(comment).length; i++) {
        var k = content.indexOf(Object.keys(comment)[i], nowIndex)
        var l = Object.keys(comment)[i].length
        console.log('k' + i + ':' + k + ',' + l)
        splitList.push(k)
        splitList.push(k + l)
      }

      function sequence(a, b) {
        if (a > b) {
          return 1;
        } else if (a < b) {
          return -1
        } else {
          return 0;
        }
      }
      splitList = splitList.sort(sequence)
      console.log(splitList)

      var nowIndex = 0;
      for (var i = 0; i < splitList.length; i += 2) {
        if (splitList[i] > nowIndex) {
          var temp = content.substr(nowIndex, splitList[i] - nowIndex)
          temp = temp.split(/[;]/)
          for (var item in temp) {
            contentList.push(temp[item])
            if_has_comment.push(0)
            contentList.push(';')
            if_has_comment.push(0)
            console.log(temp)
          }
          contentList.pop()
          if_has_comment.pop()
        }
        if (splitList[i] < nowIndex) {
          continue
        }
        contentList.push(content.substr(splitList[i], splitList[i + 1] - splitList[i]))
        if_has_comment.push(1)
        nowIndex = splitList[i + 1]
      }
      var temp = content.substr(nowIndex, content.length)
      temp = temp.split(/[;。]/)
      for (var item in temp) {
        contentList.push(temp[item])
        if_has_comment.push(0)
        contentList.push(';')
        if_has_comment.push(0)
        console.log(temp)
      }
      contentList.pop()
      if_has_comment.pop()
    } else {
      contentList = content.split(';')
    }

    this.setData({
      contentList,
      if_has_comment,
      comment,
      author: JSON.parse(options.detail).author,
      dynasty: JSON.parse(options.detail).dynasty,
      title: JSON.parse(options.detail).title
    })
  },

  clickKey: function(event) {
    var id = event.currentTarget.id;
    console.log(id);
    var currentComment = this.data.comment[id]
    console.log(currentComment);
    this.setData({
      currentKeyword: id
    })
  },


})