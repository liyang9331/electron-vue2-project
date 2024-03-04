import CryptoJS from "crypto-js";
export default {
  /**
   * 获取key
   * @returns 
   */
  getKey() {
    // 长度需要为16位数   该数据所生成的随机值
    return "2jd2BqobJGLxoB21";
  },

  /**
   * 数据加密秘钥
   * @returns 
   */
  getDataKeyData() {
    return "kMWSwOsbpLLdl50x"; //针对数据进行加密
  },

  /**
   * 随机生成指定数量的16进制key
   * @param {*} num 
   * @returns 
   */
  generatekey(num) {
    const library =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let key = "";
    for (var i = 0; i < num; i++) {
      const randomPoz = Math.floor(Math.random() * library.length);
      key += library.substring(randomPoz, randomPoz + 1);
    }
    return key;
  },

  /**
   * 对称加密
   * @param {*} word 
   * @param {*} keyStr 
   * @returns 
   */
  encrypt(word, keyStr = this.getKey()) {
    var key = CryptoJS.enc.Utf8.parse(keyStr);
    var srcs = CryptoJS.enc.Utf8.parse(word);
    var encrypted = CryptoJS.AES.encrypt(srcs, key, {
      // ECB模式不需要iv,明文强制对齐，默认隐藏明文长度、块加密模式
      // CBC模式需要iv,明文强制对齐，默认隐藏明文长度、块加密模式
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
  },
  /**
   * 对称解密
   * @param {*} word 
   * @param {*} keyStr 
   * @returns 
   */
  decrypt(word, keyStr = this.getKey()) {
    var key = CryptoJS.enc.Utf8.parse(keyStr);
    var decrypt = CryptoJS.AES.decrypt(word, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
  },

  /**
   * DES ECB模式加密
   * @param {*} word 
   * @param {*} key 
   * @returns 
   */
  encryptByDESModeEBC(word, key) {
    var keyHex = CryptoJS.enc.Utf8.parse(key);
    var encrypted = CryptoJS.DES.encrypt(word, keyHex, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.ciphertext.toString();
  },

  /**
   * DES ECB模式解密
   * @param {*} word 
   * @param {*} key 
   * @returns 
   */
  decryptByDESModeEBC(word, key) {
    var keyHex = CryptoJS.enc.Utf8.parse(key);
    var decrypted = CryptoJS.DES.decrypt(
      {
        ciphertext: CryptoJS.enc.Hex.parse(word),
      },
      keyHex,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  },
};
