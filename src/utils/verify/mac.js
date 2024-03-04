
// 获取电脑设备硬件信息  先注释 后面用的时候再放开
// const address = require('address')
// const { machineId, machineIdSync } = require('node-machine-id')
// // 文件操作
// /* 文件是否存在*/
// export function getMAC(callBack) {
//   address.mac(function(err, addr) {
//     if (err) {
//       console.log(err)
//     }
//     if (addr) {
//       const macCode = addr.toUpperCase()
//       callBack(macCode)
//     } else {
//       callBack(null)
//     }
//   })
// }
//
// export function getEqCode(callBack) {
//   if (!callBack) {
//     return machineIdSync()
//   }
//   machineId().then(data => {
//     console.log(data)
//     callBack(data)
//   })
// }

