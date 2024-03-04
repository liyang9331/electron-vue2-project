import { guid } from "@/utils";
import { BaseSqlCom } from "./BaseSqlCom";
import { EncryptData } from "@/utils/verify/EncryptData";

function isSQLString(input) {
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

/**
 * Created by supervisor on 2023/10/19 地名管理
 */
class BaseDataApi {
  constructor() {
    //赋予数据库链接
    this.sqliteCom = BaseSqlCom.getSqliteCom();
    this.tbName = "tb_base_data";
    this.id = ""; //唯一标识 uuid
    this.name = ""; //基础数据名称
    this.type = ""; //基础数据类型
    this.geojson = ""; //空间信息 后续需要加密存储1
    this.center = ""; //经纬度 ,分割
    this.decryptColoum = ["name", "type", "geojson", "center"]; //加密的字段数据  ID不能加密
    this.encryptData = new EncryptData();
  }

  //目前的图层类型
  getType() {
    return ["道路", "边界"];
  }
  //道路和边界的样式
  getStyle() {}

  //基于导入的shp 插入数据  读取shp 后的数据 然后批量新增
  async saveShpData(geojson) {
    //获取
    let featureList = [];
    if (geojson.type) {
      //多行数据
      if (geojson.type == "FeatureCollection") {
        featureList = geojson.features;
      } else if (geojson.type == "Feature") {
        //单行
        featureList.push(geojson);
      }
    }
    let saveDataList = [];
    for (let featureItem of featureList) {
      let dataItem = {};
      // console.log(typeof featureItem.properties.name)
      dataItem.type = featureItem.properties.type;
      dataItem.name = featureItem.properties.name;
      // dataItem.name = "";
      dataItem.geojson = JSON.stringify(featureItem);
      dataItem.center = "";

      saveDataList.push(dataItem);
    }

    const result = await this.addListFunc(saveDataList);
    return result;
  }

  /**
   * 批量增加
   * @param {*} params
   * @returns
   */
  addListFunc(dataList) {
    console.log(dataList);
    let endList = [];
    for (let item of dataList) {
      item.id = guid(); //生成uuid
      item.CREATE_BY = "管理员"; //默认都是管理员
      item.CREATE_TIME = new Date().getTime();
      endList.push(item);
    }

    endList = this.encryptData.encryptDataList(this.decryptColoum, endList);
    return this.sqliteCom.getInsertDatas(this.tbName, endList);
  }

  /**
   * 获取总数量
   * @param {*} params
   * @returns
   */
  getCount(params) {
    if (Object.keys(params).length > 0) {
      //直接依据数据条件查询
      let keys = ["type", "geojson", "center"];
      keys = keys.filter((key) => params[key] && !isSQLString(params[key]));
      params = this.encryptData.encryptData(keys, params);
    }
    console.log("查询总条数");
    //返回的是一个数值
    return this.sqliteCom.getCount(this.tbName, params);
  }

  /**
   * 分页获取数据
   * @param {*} params
   * @param {*} page
   * @returns
   */
  async getPageQueryData(params = {}, page = null) {
    if (Object.keys(params).length > 0) {
      //直接依据数据条件查询
      let keys = ["type", "geojson", "center"];
      keys = keys.filter((key) => params[key] && !isSQLString(params[key]));
      params = this.encryptData.encryptData(keys, params);
    }
    let restData = await this.sqliteCom.getPageQueryData(
      this.tbName,
      params,
      page
    );
    restData = this.encryptData.decryptDataList(this.decryptColoum, restData);
    // console.log(restData);
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
export { BaseDataApi };
