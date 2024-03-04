
/**
 * Created by supervisor on 2023/10/19  区域管理
 */
import AES from '@/utils/verify/AES.js'
import path from 'path'
import { remote } from 'electron'
import { readFile, writeFile } from '@/utils/verify/file'

class Verify {
  constructor() {
    //验证文件存储位置
    this.vaFile = path.join(remote.app.getPath('userData'), 'encryption.config');
    this.keyStr="";
  }

  /**
   * 基于服务端传输的数据进行解析 解析出相关的 组织机构名称 和授权日期，如果超过授权日期 则进行 每次登录的时候查询授权
   * @param {*}
   * @returns
   */
  verifyToken() {
    //返回的是一个数值
    const vm = this
    this.keyStr = AES.getKey()
    readFile(vm.vaFile, function(data) {
      if (data != null) {
        const dataObj = JSON.parse(AES.decrypt(data, vm.keyStr))
        // if (dataObj.deviceCode === vm.machineId) {
        //用户名
        localStorage.set('DEPT_NAME', dataObj.deptName);//部门名称
        localStorage.set('END_TIME', dataObj.endTime);//截止时间  用户界面展示
        localStorage.set('LEVEL_DATA', dataObj.level);//截止时间  用户界面展示 数据密级  用逗号隔开 1,2,3  在数据查询的时候使用
        localStorage.set('NOMAL_USER', dataObj.userType);//用户类型 是普通用户 还是admin     类型分为nomal 以及admin  admin 菜单权限以及操作权限   nomal 只有查看权限

        //如果授权时间 不存在或者是到期
        if(!dataObj.endTime ){
          // '授权过期'
          return false;
        }
        // dataObj.endTime  需要格式为 2022-01-01 00:00:00
        var endTime =new Date(dataObj.endTime)
        var currentDate=new Date();
        if(endTime.getTime()<currentDate.getTime()){
          // '授权过期'
          return false;
        }
        // '验证成功!'
        return true;
        // } else {
        //   vm.$message.error('验证失败!')
        // }
      } else {
        // '验证失败!'
        return false;
      }
    })
  }


  /**
   * 第一次没有文件时需要写入文件  前后端加密字符串要一致
   * encryptStr 由后台java 端生成，主要是对一个JSON进行 AES加密， 主要信息为{"deptName":"部门1"，“endTime”:"2022-01-01 00:00:00"}
   * @param {*}
   * @returns
   */
  verifyFile(encryptStr) {
    //返回的是一个数值
    const vm = this
    writeFile(vm.vaFile, encryptStr, function (value) {
      console.log('写入文件成功')
    })
    //写入成功之后进入系统
  }



  /**
   *  第一次填写数据写入文件之前需要 验证一下授权是否是真的
   * encryptStr 由后台java 端生成，主要是对一个JSON进行 AES加密， 主要信息为{"deptName":"部门1"，“endTime”:"2022-01-01 00:00:00"}
   * @param {*}
   * @returns
   */
  verifyEncrypt(encryptStr) {
    //返回的是一个数值
    const vm = this
    this.keyStr = AES.getKey()
    const dataObj = JSON.parse(AES.decrypt(encryptStr, vm.keyStr));
    if(!dataObj){
      if(dataObj.deptName&&dataObj.endTime&& dataObj.level&&dataObj.userType){
        //说明数据是对的,把加密秘钥存储到文件中
        this.verifyFile(encryptStr)
        return true;
      }
      return false;
    }
    return false;
  }


}
export { Verify };
