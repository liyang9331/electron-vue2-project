import { guid } from "@/utils";
import { BaseSqlCom } from "./BaseSqlCom";
import { EncryptData } from "@/utils/verify/EncryptData";
/**
 * Created by supervisor on 2023/10/19 地名管理
 */
class StatisticsApi {
  constructor() {
    //赋予数据库链接
    this.sqliteCom = BaseSqlCom.getSqliteCom();
    this.decryptColoum = ["securityLevel", "name"]; //加密的字段数据  ID不能加密
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
          str += `${key} IN (${result}) OR `;
        } else {
          // 属性值是其他数据类型
          str += `${key} = '${newObj[key]}' AND `;
        }
      }
    }
    return str.slice(0, str.length - 4);
  }

  /**
   * 查询类型统计数据
   * @param {*} params
   * @returns
   */
  async getDataForType() {
    const SQL = `
    SELECT tb_place_type.*, COUNT(tb_place_name.id) AS count
    FROM tb_place_type
    LEFT JOIN tb_place_name ON tb_place_type.id = tb_place_name.type
    GROUP BY tb_place_type.id
    `;
    // console.log(SQL)
    let restData = await this.sqliteCom.executeCustomSQL(SQL);
    restData = this.encryptData.decryptDataList(this.decryptColoum, restData);
    return restData;
  }

  /**
   * 查询数据密级统计数据
   * @param {*} level
   * @returns
   */
  async getDataForSecurityLevel() {
    const that = this;
    const queryDatabase = async (item) => {
      // 由于地名表中的securityLevel 被加密了所以需要加密处理一下
      item = this.encryptData.encryptData(["securityLevel", "value"], item);
      console.log(item);
      return new Promise((resolve, reject) => {
        const query = `SELECT COUNT(*) AS count FROM tb_place_name WHERE tb_place_name.securityLevel = '${item.securityLevel}'`;
        console.log(query);
        that.sqliteCom
          .executeCustomSQL(query)
          .then((res) => {
            resolve({ ...item, ...res[0] });
          })
          .catch((err) => {
            reject(err);
          });
      });
    };

    const main = async () => {
      const results = await Promise.all(
        this.valuesToQuery.map((item) => queryDatabase(item))
      );
      return results;
    };
    let data = await main();
    // console.log(data)
    return data;
  }

  /**
   * 获取指定区域内的地名统计数据：按照类型和数据密级进行分类统计总数
   * @param {*} params 区域id集合
   * @returns
   */
  async getRegionTotalStatistics(params) {
    let oneLevels = params.oneLevels
      .map((value) => `'${this.encryptData.encryptItem(value)}'`)
      .join(", ");
    let secondLevels = params.secondLevels
      .map((value) => `'${this.encryptData.encryptItem(value)}'`)
      .join(", ");

    let level = localStorage.getItem("LEVEL_DATA"); //截止时间  用户界面展示 数据密级  用逗号隔开 1,2,3  在数据查询的时候使用
    let userType = localStorage.getItem("NOMAL_USER"); //用户类型 是普通用户 还是admin     类型分为nomal 以及admin  admin 菜单权限以及操作权限   nomal 只有查看权限
    let restData = [];
    let securityLevel = "";
    // console.log(level, userType)
    if (userType != "admin") {
      securityLevel = level.indexOf(",") > -1 ? level.split(",") : [level];
    } else {
      securityLevel = [1, 2, 3];
    }

    // 二级区域不通过数据库查询，通过代码过滤
    const securityLevelSQL = `securityLevel IN (${securityLevel.join(",")}) `;
    const oneLevelSQL =
      params.oneLevels.length > 0 ? `AND oneLevel IN (${oneLevels})` : "";
    // const secondLevelSQL =
    //   params.secondLevels.length > 0
    //     ? `AND secondLevel IN (${secondLevels})`
    //     : "";
    //     ${secondLevelSQL}
    const sql = `
      SELECT id,type,securityLevel,secondLevel
      FROM tb_place_name
      WHERE ${securityLevelSQL} ${oneLevelSQL}
  `;
    // console.log(sql);
    //符合条件的所有地名
    let result = await this.sqliteCom.executeCustomSQL(sql);
    result = this.encryptData.decryptDataList(["secondLevel"], result);

    // console.log(result.length)
    if (params.secondLevels.length > 0) {
      result = result.filter((item) => {
        // console.log(params.secondLevels)
        let flag = false;
        // console.log(item.secondLevel,params.secondLevels)
        if (item.secondLevel.indexOf(",") > -1) {
          params.secondLevels.forEach((b) => {
            item.secondLevel.split(",").forEach((c) =>{
              if(c==b){
                flag = true
              }
            })
          });
          // console.log(flag,item.secondLevel,params.secondLevels)
        } else {
          flag = params.secondLevels.find((a) => a == item.secondLevel)
            ? true
            : false;
          // console.log(flag,item.secondLevel,params.secondLevels)
        }
        return flag;
      });
    }

    // console.log(result.length)
    // 所有类型
    let types = await this.sqliteCom.executeCustomSQL(
      `SELECT id,name FROM tb_place_type`
    );
    // 所有级别
    let levels = this.valuesToQuery;
    types = types.map((item) => {
      item.count = result.filter((a) => a.type == item.name).length;
      item.name = this.encryptData.decryptData(["name"], {
        name: item.name,
      }).name;
      return item;
    });
    // console.log(result);
    // console.log(types);
    levels = levels.map((item) => {
      item.count = result.filter((a) => a.securityLevel == item.value).length;
      return item;
    });
    return { types, levels,total:result.length};
  }
}
export { StatisticsApi };
