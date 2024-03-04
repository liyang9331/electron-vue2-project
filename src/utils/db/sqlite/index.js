import db from "@/utils/db/db";
import { deepCopy, objectEmpty } from "@/utils/index";
import dayjs from "dayjs";
class SqliteCom {
  constructor(dbPath) {
    this.init(dbPath);
  }
  init(dbPath) {
    db.init(dbPath);
  }
  _isSQLString(input) {
    // 检查是否包含SQL关键字
    const sqlKeywords = [
      "SELECT",
      "FROM",
      "WHERE",
      "INSERT",
      "INTO",
      "UPDATE",
      "DELETE",
      "CREATE",
      "ALTER",
      "DROP",
      "INDEX",
      "JOIN",
      "GROUP",
      "BY",
      "HAVING",
      "DISTINCT",
      "IN",
      "ONT",
      "AND",
      "OR"
    ];
    for (const keyword of sqlKeywords) {
      if (input.includes(keyword)) {
        return true;
      }
    }

    // 检查是否包含特殊字符
    const specialCharacters = [";", "'", '"'];
    for (const char of specialCharacters) {
      if (input.includes(char)) {
        return true;
      }
    }

    return false;
  }
  _splicingParamsBatch(list) {
    let sumList = [];
    var fields = "";
    var fieldsZWF = "";
    // ;
    list.forEach((item) => {
      fields = "";
      fieldsZWF = "";
      var insertData = [];
      for (var key in item) {
        insertData.push(item[key]);
        fields += `,${key}`;
        fieldsZWF += `,?`;
      }
      if (insertData.length > 0) {
        fields = fields.slice(1);
        fieldsZWF = fieldsZWF.slice(1);
      }
      sumList.push(insertData);
    });
    return {
      sumList,
      fields,
      fieldsZWF,
    };
  }
  // 处理参数
  async _handParams(tableName, obj) {
    let str = "";
    // 去除空值属性、null、[]、{}、""、''、undefined
    let newObj = objectEmpty(obj);
    // let newObj = deepCopy(obj);
    // 去除非数据库表中字段
    const list = await this.getAllTableColumn(tableName);
    newObj = Object.keys(newObj)
      .filter((key) => (list.find((index) => index == key) ? true : false))
      .reduce((obj, key) => {
        obj[key] = newObj[key];
        return obj;
      }, {});
    for (let key in newObj) {
      // 属性值是时间
      if (
        key == "CREATE_TIME" ||
        (key == "create_time" &&
          Array.isArray(newObj[key]) &&
          newObj[key].length == 2)
      ) {
        // 列名 BETWEEN 值1 AND 值2
        let time1 = dayjs(newObj[key][0]).valueOf();
        let time2 = dayjs(newObj[key][1]).valueOf();
        // 处理时间相同的情况
        if(time1==time2){
          time2 = (time2+24*60*60*1000)-1000
        }
        str += `${key} BETWEEN ${time1} AND ${time2} AND `;
      } else {
        if (typeof newObj[key] === "string") {
          // 属性值是字符串
          const array = newObj[key].split("");
          if (array[0] == "%" && array[array.length - 1] == "%") {
            // 属性值开始结尾处是%，模糊查询
            str += `${key} LIKE '${newObj[key]}' AND `;
          } else {
            if (this._isSQLString(newObj[key])) {
              // 属性值是一段SQL语句片段
              str += `${key} ${newObj[key]} AND `;
            } else {
              // 属性值是普通字符串
              str += `${key} = '${newObj[key]}' AND `;
            }
          }
        } else if (Array.isArray(newObj[key])) {
          // 属性值是数组
          const result = obj[key].map((value) => `'${value}'`).join(", ");
          str += `${key} IN (${result}) OR `;
        } else {
          // 属性值是其他数据类型
          str += `${key} = '${newObj[key]}' AND `;
        }
      }
    }
    return str.slice(0, str.length - 4);
  }
  //处理批量删除参数
  _handDeleteParams(obj) {
    let str = "";
    for (let key in obj) {
      str += `${key} IN (${obj[key].toString()})`;
    }
    return str;
  }
  // 处理参数
  _handUpdateParams(obj) {
    let str = "";
    for (let key in obj) {
      str += `${key} = '${obj[key]}' , `;
    }
    return str.slice(0, str.length - 2);
  }

  // 处理异常数据
  _awaitWraper(promise) {
    return promise.then((res) => [null, res]).catch((err) => [err, null]);
  }
  // 拼接参数
  _splicingParams(obj) {
    var insertData = [];
    var fields = "";
    var fieldsZWF = "";
    for (var key in obj) {
      insertData.push(obj[key]);
      fields += `,${key}`;
      fieldsZWF += `,?`;
    }
    if (insertData.length > 0) {
      fields = fields.slice(1);
      fieldsZWF = fieldsZWF.slice(1);
    }
    return {
      insertData,
      fields,
      fieldsZWF,
    };
  }
  /**
   * 查询所有数据库表的字段名
   * @param {*} tableName
   */
  async getAllTableColumn(tableName) {
    const sql = `PRAGMA table_info([${tableName}])`;
    let result = await db.select(sql);
    let list = [];
    result.forEach((item) => {
      list.push(item["name"]);
    });
    return list;
  }
  /**
   * 查询
   * @param {String} tableName 数据库表名
   * @param {Object} params 查询的参数
   */
  async getQueryData(tableName, params = {}, type = "") {
    let sql = "";
    if (type == "") {
      let str = await this._handParams(tableName, params);
      let where = str ? `WHERE ${str}` : "";
      sql = `SELECT * FROM ${tableName} ${where} ORDER BY CREATE_TIME DESC;`;
    } else if (type == "new") {
      sql = `SELECT CODE  FROM ${tableName} WHERE CREATE_TIME >= datetime( 'now', 'start of day', '+0 day' ) 
            AND CREATE_TIME < datetime( 'now', 'start of day', '+1 day' ) 
           ORDER BY CREATE_TIME DESC LIMIT 1`;
    }
    console.log(sql);
    return db.select(sql);
  }

  /**
   * 分页查询
   * @param {String} tableName 数据库表名
   * @param {Object} params 查询的参数
   * @param {Object} pageObj 分页数据
   */
  async getPageQueryData(tableName, params = {}, pageObj) {
    let sql = "";
    if (pageObj == null) {
      pageObj = {};
    }
    let pageSize = pageObj.pageSize ? pageObj.pageSize : 10; //默认一页10个
    let pageNumber = pageObj.pageNumber ? pageObj.pageNumber : 1;
    let str = await this._handParams(tableName, params);
    let where = str ? `WHERE ${str}` : "";
    sql = `SELECT * FROM ${tableName} ${where} ORDER BY CREATE_TIME DESC Limit  ${pageSize}  Offset ${
      (pageNumber - 1) * pageSize
    };`;
    console.log(sql);
    return db.select(sql);
  }
  /**
   * 封装执行自定义 SQL 语句的函数
   * @param {*} sql
   * @param {*} params
   * @returns
   */
  async executeCustomSQL(sql) {
    console.log(sql)
    return db.select(sql);
  }

  /**
   * 获取数据总数
   * @param {*} tableName
   * @param {*} params
   * @returns
   */
  async getCount(tableName, params = {}) {
    let sql = "";
    let str = await this._handParams(tableName, params);
    let where = str ? `WHERE ${str}` : "";
    sql = `SELECT count(*)  as total FROM ${tableName} ${where} ORDER BY CREATE_TIME DESC;`;
    console.log(sql);
    const result = await db.select(sql);
    return result[0].total;
  }

  /**
   * 添加
   * @param {String} tableName 数据库表名
   * @param {Object} params 查询的参数
   */
  async getInsertData(tableName, params) {
    let { insertData, fields, fieldsZWF } = this._splicingParams(params);
    let sql = `INSERT INTO ${tableName} (${fields}) VALUES (${fieldsZWF})`;
    console.log(sql);
    const result = db.insertData(sql, insertData);
    return result
  }

  /**
   * 批量添加
   * @param {*} tableName
   * @param {*} list
   * @returns
   */
  async getInsertDatas(tableName, list) {
    let { sumList, fields, fieldsZWF } = this._splicingParamsBatch(list);
    let sql = `INSERT INTO ${tableName} (${fields}) VALUES (${fieldsZWF})`;
    console.log(sql);
    return db.insertWork(sql, sumList);
  }
  /**
   * 删除
   * @param {*} tableName
   * @param {*} params
   * @returns
   */
  async getDeleteData(tableName, params = {}) {
    let str = await this._handParams(tableName, params);
    let where = str ? `WHERE ${str}` : "";
    let sql = `DELETE FROM ${tableName} ${where}`;
    console.log(sql);
    return db.deleteData(sql);
  }

  /**
   * 批量删除
   * @param {*} tableName
   * @param {*} params
   * @returns
   */
  async getDeleteBatchData(tableName, params = {}) {
    let str = await this._handDeleteParams(params);
    let where = str ? `WHERE ${str}` : "";
    let sql = `DELETE FROM ${tableName} ${where}`;
    console.log(sql);
    return db.deleteData(sql);
    // return true;
  }

  /**
   * 修改
   * @param {*} tableName
   * @param {*} data
   * @param {*} params
   * @returns
   */
  async getUpdateData(tableName, data, params) {
    let str = this._handUpdateParams(data);
    let whereStr = await this._handParams(tableName, params);
    let where = `WHERE ${whereStr}`;
    // console.log(params);
    let sql = `UPDATE ${tableName} SET ${str} ${where}`;
    console.log(sql);
    return db.update(sql);
  }
}

export { SqliteCom };
