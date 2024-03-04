import { guid } from "@/utils";
import { BaseSqlCom } from "./BaseSqlCom";
// import createTree from "@/components/el-select-tree/createTree.js";
import { EncryptData } from "@/utils/verify/EncryptData";
/**
 * Created by supervisor on 2023/10/19 点位类型管理
 */
class PlaceTypeApi {
  constructor() {
    //赋予数据库链接
    this.sqliteCom = BaseSqlCom.getSqliteCom();
    this.tbName = "tb_place_type";
    this.id = null; //唯一标识 uuid
    this.name = null; //类型名称
    this.parentid = null; //上级类型  顶级类型的parentid为0 或者是空
    this.remark = null; //描述
    this.index = null; //显示顺序
    this.border_style = null; //边界颜色
    this.fill_style = null; //填充颜色
    // 样式以json方式进行存储 如{fillcolor:'#ff0000',lineColor:'#ff0000',opacity:0.7},fillcolor 面颜色 lineColor 线颜色  fillopacity 面透明度  flineopacity 线透明度，
    //如果是点则默认使用 点样式

    this.decryptColoum = [
      "name",
      "remark",
      "border_style",
      "fill_style",
    ]; //加密的字段数据  ID不能加密
    this.encryptData = new EncryptData();
  }

  /**
   * 获取总数量
   * @param {*} params
   * @returns
   */
  getCount(params) {
    //返回的是一个数值
    return this.sqliteCom.getCount(this.tbName, params);
  }
  createTree(arr) {
    const map = new Map();
    let result = [];

    // 将一维数组转化为以id为键的Map
    arr.forEach((item) => {
      map.set(item.id, {
        label: item.name,
        value: item.name,
        children: [],
        ...item,
      });
    });
    // console.log(arr);
    // 遍历数组，将子节点添加到父节点的children属性中
    map.forEach((item) => {
      const parent = map.get(item.parentid);
      let obj = item;
      if (parent) {
        console.log(parent);
        parent.children.push(obj);
      } else {
        result.push(obj); // 如果没有父节点，将其视为根节点
      }
      if (item.children.length == 0) {
        // delete obj.children
      }
    });

    return result;
  }
  /**
   * 获取树形结构数据
   */
  async getTree() {
    let page = {};
    page.pageSize = 10000; //给个最大值获取所有数据
    page.pageNumber = 1; //默认从第一页开始
    let restData = await this.sqliteCom.getPageQueryData(this.tbName, {}, page);
    restData = this.encryptData.decryptDataList(this.decryptColoum, restData);
    return this.createTree(restData);
  }

  /**
   * 查询
   * @param {} params
   * @param {*} page
   * @returns
   */
  async getPageQueryData(params = {}, page) {
    params = this.encryptData.encryptData(this.decryptColoum, params);
    let restData = await this.sqliteCom.getPageQueryData(
      this.tbName,
      params,
      page
    );
    // console.log(restData)
    restData = this.encryptData.decryptDataList(this.decryptColoum, restData);
    console.log(restData);
    return restData;
  }

  /**
   * 获取子节点
   * @param {*} childList
   * @param {*} pidMap
   * @returns
   */
  getChild(childList, pidMap) {
    //迭代生成树
    for (let item of childList) {
      //说明有子节点
      if (pidMap[item.id]) {
        item.child = pidMap[item.id];
        item.child = this.getChild(item.child, pidMap);
      }
    }
    return childList;
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
  updateFunc(params) {
    params.UPDATED_TIME = new Date().getTime();
    if (!params.id) {
      console.log("修改方法 id不能为空");
      return null;
    }
    const whereParams = { id: params.id };
    if (params.id) {
      delete params.id; //删除属性值中的id
    }
    if (params.CREATE_TIME) {
      delete params.CREATE_TIME; //不允许修改创建时间
    }
    params = this.encryptData.encryptData(this.decryptColoum, params);
    // console.log(params)
    return this.sqliteCom.getUpdateData(this.tbName, params, whereParams);
  }

  /**
   * 删除
   * @param {*} id
   */
  getDeleteFunc(id) {
    return this.sqliteCom.getDeleteData(this.tbName, { id: id });
  }
}
export { PlaceTypeApi };
