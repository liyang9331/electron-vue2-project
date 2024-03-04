import { guid } from "@/utils/index";
import { BaseSqlCom } from "./BaseSqlCom";
import createTree from "@/components/el-select-tree/createTree.js";
import { EncryptData } from "@/utils/verify/EncryptData";


/**
 * Created by supervisor on 2023/10/19  区域管理
 */
class AreaApi {
  constructor() {
    //赋予数据库链接
    this.sqliteCom = BaseSqlCom.getSqliteCom();
    this.tbName = "tb_area";
    this.id = null; //唯一标识 uuid
    this.name = null; //区域名称
    this.parentid = null; //上级类区域
    this.remark = null; //描述
    this.index = null; //显示顺序
    this.geojson = null; //空间数据
    this.code = null; //编码
    this.decryptColoum = ['name', 'remark', 'index', 'geojson', 'code']//加密的字段数据  ID不能加密
    this.encryptData = new EncryptData()
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

  /**
   * 分页获取数据
   * @param {*} params
   * @param {*} page
   * @returns
   */
  async getPageQueryData(params = {}, page = null) {
    let restData = await this.sqliteCom.getPageQueryData(this.tbName,this.encryptData.encryptData(this.decryptColoum,params), page);
    restData = this.encryptData.decryptDataList(this.decryptColoum, restData)
    return restData;
  }

  /**
   * 根据ID获取 下级区域
   * @param {*} pId
   * @returns
   */
  async getDataByParentId(pId) {
    let page = {};
    page.pageSize = 10000; //给个最大值获取所有数据
    page.pageNumber = 1; //默认从第一页开始
    let params = {};
    params.parentid = pId;
    let restData = await this.sqliteCom.getPageQueryData(
        this.tbName,
        params,
        page
    );
    restData = this.encryptData.decryptDataList(this.decryptColoum, restData)
    return restData;
  }

  /**
   * 获取树形结构数据
   */
  async getTree() {
    let page = {};
    page.pageSize = 10000; //给个最大值获取所有数据
    page.pageNumber = 1; //默认从第一页开始
    let restData = await this.sqliteCom.getPageQueryData(this.tbName, {}, page);
    restData = this.encryptData.decryptDataList(this.decryptColoum, restData)
    return createTree(restData);
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
  async addFunc(params) {
    params.id = guid(); //生成uuid
    params.CREATE_BY = "管理员"; //默认都是管理员
    params.CREATE_TIME = new Date().getTime();
    // this.UPDATED_BY=null;//保留字段先不用
    params = this.encryptData.encryptData(this.decryptColoum, params)
    const result =  this.sqliteCom.getInsertData(this.tbName, params);
    if(result){
      return params.id
    }else{
      return result
    }
  }

  /**
   * 批量增加
   * @param {*} params
   * @returns
   */
    async addListFunc(dataList) {
      console.log(dataList)
      let endList = [];
      for (let item of dataList) {
        item.id = guid(); //生成uuid
        item.CREATE_BY = "管理员"; //默认都是管理员
        item.CREATE_TIME = new Date().getTime();
        endList.push(item);
      }
  
      endList = this.encryptData.encryptDataList(this.decryptColoum, endList);
      const result = this.sqliteCom.getInsertDatas(this.tbName, endList);
      if(result){
        return endList.map(item=>item.id)
      }else{
        return false
      }
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
    params = this.encryptData.encryptData(this.decryptColoum, params)
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





}
export { AreaApi };
