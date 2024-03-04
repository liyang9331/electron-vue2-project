import AES from "@/utils/verify/AES";


class EncryptData {
  constructor() {}
  /**
   * 加密数组对象
   * @param {*} decryptColoum 需要加密的字段集合
   * @param {*} list 数组对象
   */
  encryptDataList(decryptColoum, list) {
    let endList = [];
    for (let item of list) {
      let encryptDataItem = this.encryptData(decryptColoum, item);
      endList.push(encryptDataItem);
    }
    return endList;
  }

  /**
   * 加密对象
   * @param {*} decryptColoum 需要解密的字段集合
   * @param {*} obj 数组对象
   */
  encryptData(decryptColoum, obj) {
    Object.keys(obj).forEach((key) => {
      if (decryptColoum.indexOf(key) > -1) {
        let enddata = obj[key];
        if (enddata && typeof enddata === "string") {
          // 属性值是字符串
          enddata = AES.encrypt(obj[key], AES.getDataKeyData());
        }else if(obj[key] && Array.isArray(obj[key])){
          // 属性值是数组
          enddata = enddata.map(item=>{
            return AES.encrypt(item, AES.getDataKeyData())
          })
        }else {
          enddata = AES.encrypt(obj[key], AES.getDataKeyData());
        }
        obj[key] = enddata;
      }
    });
    // console.log(obj);
    return obj;
  }

  /**
   * 加密值
   * @param {*} value 需要加密的字符串
   */
  encryptItem(value) {
    let enddata = AES.encrypt(value, AES.getDataKeyData());
    return enddata;
  }

  /**
   * 解密值
   * @param {*} value 需要解密的字符串
   */
  decryptItem(value) {
    let enddata = AES.decrypt(value, AES.getDataKeyData());
    return enddata;
  }

  /**
   * 解密数组对象
   * @param {*} decryptColoum 需要解密的字段集合
   * @param {*} list 数组对象
   */
  decryptDataList(decryptColoum, list) {
    let endList = [];
    for (let item of list) {
      let encryptDataItem = this.decryptData(decryptColoum, item);
      endList.push(encryptDataItem);
    }
    return endList;
  }

  /**
   * 解密对象
   * @param {*} decryptColoum 需要解密的字段集合
   * @param {*} obj 数组对象
   */
  decryptData(decryptColoum, obj) {
    Object.keys(obj).forEach((key) => {
      if (decryptColoum.indexOf(key) > -1) {
        let enddata = obj[key];
        if (enddata) {
          if (Array.isArray(enddata)) {
            let endDataArr = [];
            for (let dataItem of enddata) {
              let tempData = AES.decrypt(dataItem, AES.getDataKeyData());
              endDataArr.push(tempData);
            }
            enddata = endDataArr;
          } else if (typeof enddata === "string") {
            // console.log(enddata)
            enddata = AES.decrypt(obj[key], AES.getDataKeyData());
          } else {
            enddata = AES.decrypt(obj[key], AES.getDataKeyData());
          }
        }
        obj[key] = enddata;
      }
    });
    // console.log(obj);
    return obj;
  }
}
export { EncryptData };
