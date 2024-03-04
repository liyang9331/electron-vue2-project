const fs = require('fs')
// const path = require('path')
// 文件操作
/* 文件是否存在*/
export function fileExist(fileName) {
  // const dirname = path.dirname(fileName) + '/' + fileName
  if (fs.existsSync(fileName)) {
    return true
  } else {
    return false
  }
}
/* 创建文件*/
export function createFile(fileName) {
  // const dirname = path.dirname(fileName) + '/' + fileName
  if (fs.existsSync(fileName)) {
    return true
  } else {
    fs.writeFile(fileName, '', function(error) {
      console.log(error)
    })
    return true
  }
}
/* 读取文件内容*/
export function readFile(fileName, callBack) {
  // const dirname = path.dirname(fileName) + '/' + fileName
  if (fs.existsSync(fileName)) {
    fs.readFile(fileName, 'utf8', (err, data) => {
      if (err) {
        console.log('文件读取失败')
        callBack(null)
      } else {
        console.log('文件读取成功')
        callBack(data)
      }
    })
  } else {
    callBack(null)
  }
}

/* 写文件*/
export function writeFile(fileName, arg, callBack) {
  // const dirname = path.dirname(fileName) + '/' + fileName
  fs.writeFile(fileName, arg, 'utf8', (err) => {
    if (err) {
      callBack(null)
    } else {
      callBack(true)
    }
  })
}

