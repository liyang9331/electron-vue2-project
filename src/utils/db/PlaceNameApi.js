import { guid } from "@/utils";
import { BaseSqlCom } from "./BaseSqlCom";
import { EncryptData } from "@/utils/verify/EncryptData";
import { deepCopy, objectEmpty } from "@/utils/index";
import db from "@/utils/db/db";
/**
 * Created by supervisor on 2023/10/19 地名管理
 */

class PlaceNameApi {
  constructor() {
    //赋予数据库链接
    this.sqliteCom = BaseSqlCom.getSqliteCom();
    this.tbName = "tb_place_name";
    this.id = null; //唯一标识 uuid
    this.name = null; //地名名称
    this.code = null; //编码
    this.formerName = null; //曾用名
    this.type = null; //地名类型
    this.oneLevel = null; //所属一级区域
    this.secondLevel = null; //所属二级区域
    this.securityLevel = null; //数据密级  用1/2/3标识
    this.attached = null; //附属信息
    this.remark = null; //描述
    this.geojson = null; //空间信息 后续需要加密存储
    this.center = null; //经纬度 存储方式113.4,39.8  以逗号个号  经度   纬度
    this.imageurl = null; //图片地址，["./path/a.png","./path/a.png","./path/a.png",]
    // 'type'不加密，因为type存储的是地名类型表中的id
    this.decryptColoum = [
      "name",
      "code",
      "type",
      "formerName",
      "attached",
      "remark",
      "geojson",
      "center",
      "imageurl",
      "oneLevel",
      "secondLevel",
    ]; //加密的字段数据  ID不能加密
    this.encryptData = new EncryptData();
    this.valuesToQuery = [
      { name: "1级", securityLevel: 1, value: 1 },
      { name: "2级", securityLevel: 2, value: 2 },
      { name: "3级", securityLevel: 3, value: 3 },
    ];
  }

  isSQLString(input) {
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
        if (time1 == time2) {
          time2 = time2 + 24 * 60 * 60 * 1000 - 1000;
        }
        str += `${key} BETWEEN ${time1} AND ${time2} AND `;
      } else {
        if (typeof newObj[key] === "string") {
          // 属性值是字符串
          const array = newObj[key].split("");
          // console.log(array)
          if (array[0] == "%" && array[array.length - 1] == "%") {
            // 属性值开始结尾处是%，模糊查询
            str += `${key} LIKE '${newObj[key]}' AND `;
          } else {
            if (this.isSQLString(newObj[key])) {
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
          str += `${key} IN (${result}) AND `;
        } else {
          // 属性值是其他数据类型
          str += `${key} = '${newObj[key]}' AND `;
        }
      }
    }
    return str.slice(0, str.length - 4);
  }

  /**
   * 获取总数量
   * @param {*} params
   * @returns
   */
  getCount(params) {
    //返回的是一个数值
    let level = localStorage.getItem("LEVEL_DATA"); //截止时间  用户界面展示 数据密级  用逗号隔开 1,2,3  在数据查询的时候使用
    let userType = localStorage.getItem("NOMAL_USER"); //用户类型 是普通用户 还是admin     类型分为nomal 以及admin  admin 菜单权限以及操作权限   nomal 只有查看权限
    let levels = [];
    // params.securityLevel
    if (userType != "admin") {
      levels = level.indexOf(",") > -1 ? level.split(",") : [level];
    } else {
      levels = [1, 2, 3];
    }
    if (params.securityLevel != "") {
      params.securityLevel = levels.filter(
        (item) => item == params.securityLevel
      );
    } else {
      params.securityLevel = levels;
    }

    if (Object.keys(params).length > 0) {
      //直接依据数据条件查询
      let keys = [
        "code",
        "formerName",
        "attached",
        "type",
        "remark",
        "geojson",
        "imageurl",
        "secondLevel",
        "oneLevel",
      ];
      keys = keys.filter(
        (key) => params[key] && !this.isSQLString(params[key])
      );
      params = this.encryptData.encryptData(keys, params);
    }
    // console.log(levels,params.securityLevel);
    params.securityLevel = ` IN (${params.securityLevel.join(",")}) `;
    console.log("查询总条数");
    // console.log(params)
    return this.sqliteCom.getCount(this.tbName, params);
  }

  /**
   * 分页获取数据
   * @param {*} params
   * @param {*} page
   * @returns
   */
  async getPageQueryData(params = {}, page = null) {
    // console.log(params)
    let level = localStorage.getItem("LEVEL_DATA"); // 用户界面展示 数据密级  用逗号隔开 1,2,3  在数据查询的时候使用
    let userType = localStorage.getItem("NOMAL_USER"); //用户类型 是普通用户 还是admin     类型分为nomal 以及admin  admin 菜单权限以及操作权限   nomal 只有查看权限
    let restData = [];
    // console.log(level, userType)
    /**
     * 管理员可查询所有数据密级的地名
     * 普通用户只能查询授权的数据密集的地名
     */
    let levels = [];
    if (userType != "admin") {
      levels = level.indexOf(",") > -1 ? level.split(",") : [level];
    } else {
      levels = [1, 2, 3];
    }
    if (params.securityLevel && params.securityLevel != "") {
      params.securityLevel = levels.filter(
        (item) => item == params.securityLevel
      );
    } else {
      params.securityLevel = levels;
    }

    if (Object.keys(params).length > 0) {
      //直接依据数据条件查询
      let keys = [
        "code",
        "formerName",
        "attached",
        "type",
        "remark",
        "geojson",
        "imageurl",
        "secondLevel",
        "oneLevel",
      ];
      keys = keys.filter(
        (key) => params[key] && !this.isSQLString(params[key])
      );
      params = this.encryptData.encryptData(keys, params);
    }
    // console.log(params)
    params.securityLevel = ` IN (${params.securityLevel.join(",")}) `;
    restData = await this.sqliteCom.getPageQueryData(this.tbName, params, page);
    restData = this.encryptData.decryptDataList(this.decryptColoum, restData);
    console.log(restData);
    return restData;
  }

  /**
   * 主页根据区域查询地名
   * @param {*} params
   * @param {*} page
   * @returns
   */
  async getDataForArea(params = {}) {
    // console.log(params)
    let level = localStorage.getItem("LEVEL_DATA"); // 用户界面展示 数据密级  用逗号隔开 1,2,3  在数据查询的时候使用
    let userType = localStorage.getItem("NOMAL_USER"); //用户类型 是普通用户 还是admin     类型分为nomal 以及admin  admin 菜单权限以及操作权限   nomal 只有查看权限
    let restData = [];
    if (!params.securityLevel) {
      params.securityLevel = "";
    }
    /**
     * 管理员可查询所有数据密级的地名
     * 普通用户只能查询授权的数据密集的地名
     */
    let levels = [];
    if (userType != "admin") {
      levels = level.indexOf(",") > -1 ? level.split(",") : [level];
    } else {
      levels = [1, 2, 3];
    }
    if (params.securityLevel != "") {
      params.securityLevel = levels.filter(
        (item) => item == params.securityLevel
      );
    } else {
      params.securityLevel = levels;
    }
    if (Object.keys(params).length > 0) {
      //直接依据数据条件查询
      let keys = [
        "code",
        "formerName",
        "attached",
        "type",
        "remark",
        "geojson",
        "imageurl",
        "secondLevel",
        "oneLevel",
      ];
      keys = keys.filter(
        (key) => params[key] && !this.isSQLString(params[key])
      );
      params = this.encryptData.encryptData(keys, params);
    }
    let areaSQL = "";
    if(params.oneLevel){
      areaSQL = await this._handParams(this.tbName, {
        oneLevel: params.oneLevel,
        // secondLevel: params.secondLevel,
      });
      areaSQL = areaSQL.replace("oneLevel","")
      params.oneLevel = areaSQL
      // console.log(areaSQL)
    }
    // delete params.oneLevel
    params.securityLevel = ` IN (${params.securityLevel.join(",")}) `;

    // console.log(params)
    restData = await this.sqliteCom.getPageQueryData(this.tbName, params, {
      pageSize: 999999999,
    });
    restData = this.encryptData.decryptDataList(this.decryptColoum, restData);
    // console.log(restData);
    return restData;
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
   * 统计分析-获取总数量
   * @param {*} params
   * @returns
   */
  async getCountForStatistics(params) {
    console.log("统计分析-查询总条数");
    //返回的是一个数值
    let level = localStorage.getItem("LEVEL_DATA"); //截止时间  用户界面展示 数据密级  用逗号隔开 1,2,3  在数据查询的时候使用
    let userType = localStorage.getItem("NOMAL_USER"); //用户类型 是普通用户 还是admin     类型分为nomal 以及admin  admin 菜单权限以及操作权限   nomal 只有查看权限
    if (userType != "admin") {
      params.securityLevel =
        level.indexOf(",") > -1 ? level.split(",") : [level];
    } else {
      params.securityLevel = [1, 2, 3];
    }
    if (Object.keys(params).length > 0) {
      //直接依据数据条件查询
      let keys = [
        "code",
        "formerName",
        "attached",
        "type",
        "remark",
        "geojson",
        "imageurl",
        "secondLevel",
        "oneLevel",
      ];
      keys = keys.filter(
        (key) => params[key] && !this.isSQLString(params[key])
      );
      params = this.encryptData.encryptData(keys, params);
    }

    // const securityLevelSQL = `securityLevel IN (${params.securityLevel.join(
    //   ","
    // )}) `;
    // 查询条件包含type
    // oneLevel = 't6UFGgjBkwCP8Z2bSzc9cw' OR secondLevel IN ('9ZNGiMHr7FLHQiZpGKDOY5Wu+sGs8uXmNuvQzb8s/qU=', 'sK+3UP46cWMGNQKV3/kskw==', 'TgYvJOGG7szQRywpEzFqKQ==')
    let aearSQL = await this._handParams(this.tbName, {
      oneLevel: params.oneLevel,
      // secondLevel: params.secondLevel,
    });
    let newParams = deepCopy(params);
    delete newParams.oneLevel;
    delete newParams.secondLevel;
    const selectSQL = await this._handParams(this.tbName, newParams);
    let sql = "";
    if (aearSQL == "") {
      sql = `SELECT * FROM tb_place_name
          WHERE ${selectSQL}
ORDER BY CREATE_TIME DESC;
          `;
    } else {
      sql = `SELECT *
        FROM (
          SELECT *
          FROM tb_place_name
          WHERE (${aearSQL})
          ) AS subquery
          WHERE ${selectSQL}
ORDER BY CREATE_TIME DESC;
          `;
    }

    let restData = await this.sqliteCom.executeCustomSQL(sql);
    // console.log(restData)
    if (params.secondLevel.length > 0) {
      restData = restData.filter((item) => {
        let flag = false;
        if (item.secondLevel.indexOf(",") > -1) {
          params.secondLevel.forEach((b) => {
            flag = item.secondLevel.split(",").find((c) => c == b)
              ? true
              : false;
          });
        } else {
          flag = params.secondLevel.find((a) => a == item.secondLevel)
            ? true
            : false;
        }
        return flag;
      });
    }
    return restData.length;
    // return 0
  }
  /**
   * 统计分析-分页获取数据
   * @param {*} params
   * @param {*} page
   * @returns
   */
  async getPageQueryDataForStatistics(params = {}, page = null) {
    console.log("统计分析-获取表格数据");
    let level = localStorage.getItem("LEVEL_DATA"); //截止时间  用户界面展示 数据密级  用逗号隔开 1,2,3  在数据查询的时候使用
    let userType = localStorage.getItem("NOMAL_USER"); //用户类型 是普通用户 还是admin     类型分为nomal 以及admin  admin 菜单权限以及操作权限   nomal 只有查看权限
    let restData = [];

    let securityLevel = "";
    let levels = [];
    if (userType != "admin") {
      levels = level.indexOf(",") > -1 ? level.split(",") : [level];
    } else {
      levels = [1, 2, 3];
    }

    if (params.securityLevel != "") {
      params.securityLevel = levels.filter(
        (item) => item == params.securityLevel
      );
    } else {
      params.securityLevel = levels;
    }

    if (Object.keys(params).length > 0) {
      //直接依据数据条件查询
      let keys = [
        "code",
        "formerName",
        "attached",
        "type",
        "remark",
        "geojson",
        "imageurl",
        "secondLevel",
        "oneLevel",
      ];
      keys = keys.filter(
        (key) => params[key] && !this.isSQLString(params[key])
      );
      params = this.encryptData.encryptData(keys, params);
    }

    params.securityLevel = ` IN (${params.securityLevel.join(",")}) `;
    const areaSQL = await this._handParams(this.tbName, {
      oneLevel: params.oneLevel,
      // secondLevel: params.secondLevel,
      // securityLevel:params.securityLevel
    });
    // const oneLevelSQL =
    // params.oneLevels.length > 0 ? `AND oneLevel IN (${oneLevels})` : "";
    let secondLevel = params.secondLevel;
    delete params.oneLevel;
    delete params.secondLevel;
    const selectSQL = await this._handParams(this.tbName, params);
    if (page == null) {
      page = {};
    }
    let pageSize = page.pageSize ? page.pageSize : 4; //默认一页10个
    let pageNumber = page.pageNumber ? page.pageNumber : 1;
    let sql = "";

    if (areaSQL == "") {
      //  Offset ${
      // (pageNumber - 1) * pageSize
      // ${
      //   (pageNumber - 1) * pageSize
      //     };
      // Limit ${pageSize} Offset 0
      sql = `SELECT *
        FROM tb_place_name
        WHERE ${selectSQL}
  ORDER BY CREATE_TIME DESC
        `;
    } else {
      sql = `SELECT *
      FROM (
        SELECT *
        FROM tb_place_name
        WHERE (${areaSQL})
        ) AS subquery
        WHERE ${selectSQL}
  ORDER BY CREATE_TIME DESC
        `;
    }
    console.log(sql);
    restData = await this.sqliteCom.executeCustomSQL(sql);
    // restData = await this.sqliteCom.getPageQueryData(this.tbName, params, page);
    restData = this.encryptData.decryptDataList(this.decryptColoum, restData);
    // console.log(restData);
    return restData;
  }

  /**
   * 添加地名时校验地名名称是否重复
   * @param {*} params
  //  * @param {*} page
   * @returns
   */
  async getNameRepeat(params = {}) {
    // console.log(params)
    let level = localStorage.getItem("LEVEL_DATA"); //截止时间  用户界面展示 数据密级  用逗号隔开 1,2,3  在数据查询的时候使用
    let userType = localStorage.getItem("NOMAL_USER"); //用户类型 是普通用户 还是admin     类型分为nomal 以及admin  admin 菜单权限以及操作权限   nomal 只有查看权限
    let restData = [];
    // console.log(level, userType)
    if (userType != "admin") {
      let levelArr = level.split(",");
      let decryLevelArr = [];
      if (params.securityLevel) {
        if (levelArr.indexOf(params.securityLevel.toString()) > -1) {
          //如果在授权级别里面  只有一个的话 直接用等于  数据加密 以及参数 是通过数据类型来判断 如果数据是单个则是等于 如果数据是arr 则用in
          decryLevelArr = params.securityLevel.toString();
        } else {
          //如果不在
          decryLevelArr = "555555"; // 赋予一个没有的级别 不让查询数据
        }
      } else {
        for (let levelItem of levelArr) {
          decryLevelArr.push(this.encryptData.decryptItem(levelItem));
        }
      }
      params.securityLevel = decryLevelArr; //参数是数据数组的话
    }
    //直接依据数据条件查询
    params = this.encryptData.encryptData(
      [
        "name",
        "code",
        "formerName",
        "attached",
        "remark",
        "geojson",
        "imageurl",
      ],
      params
    );
    restData = await this.sqliteCom.getPageQueryData(this.tbName, params, {
      pageSize: 1,
    });
    restData = this.encryptData.decryptDataList(this.decryptColoum, restData);
    return restData;
  }

  /**
   * 增加
   * @param {*} params
   * @returns
   */
  addFunc(params) {
    params.id = guid(); //生成uuid
    params.CREATE_BY = "管理员"; //默认都是管理员
    params.CREATE_TIME = new Date().getTime();
    // this.UPDATED_BY=null;//保留字段先不用
    params = this.encryptData.encryptData(this.decryptColoum, params);
    // console.log(params)
    return this.sqliteCom.getInsertData(this.tbName, params);
  }
  /**
   * 修改
   * @param {*} params
   * @param {*} id
   * @returns
   */
  updateFunc(params, id) {
    params.UPDATED_TIME = new Date().getTime();
    if (!params.id) {
      console.log("修改方法 id不能为空");
      return false;
    }
    const whereParams = { id: params.id };
    if (params.id) {
      delete params.id; //删除属性值中的id
    }
    if (params.CREATE_TIME) {
      delete params.CREATE_TIME; //不允许修改创建时间
    }
    // console.log(params);
    params = this.encryptData.encryptData(this.decryptColoum, params);
    return this.sqliteCom.getUpdateData(this.tbName, params, whereParams);
  }

  /**
   * 删除
   * @param {*} id
   */
  getDeleteFunc(id) {
    return this.sqliteCom.getDeleteData(this.tbName, { id: id });
  }
  /**
   * 批量删除
   * @param {*} params
   */
  getDeleteBatchFunc(params) {
    return this.sqliteCom.getDeleteBatchData(this.tbName, params);
  }

  //基于填写的参数 做范围查询 后续补充
}
export { PlaceNameApi };
