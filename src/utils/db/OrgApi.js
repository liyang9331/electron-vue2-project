import { guid } from "@/utils";
import { BaseSqlCom } from "./BaseSqlCom";
import createTree from "@/components/el-select-tree/createTree.js";
import {EncryptData} from "@/utils/verify/EncryptData";
/**
 * Created by supervisor on 2023/10/17
 */
class OrgApi {
  constructor() {
    //赋予数据库链接
    this.sqliteCom = BaseSqlCom.getSqliteCom();
    this.tbName = "tb_org";
    this.id = null; //唯一标识 uuid
    this.name = null; //单位名称
    this.remark = null; //描述
    this.level = null; //等级  1 1级 2二级 3级别， 多选以逗号隔开  如1,2
    this.exekey = null; //秘钥key值
    this.localmessage = null; //当前组织 硬件信息 用于后续的校验


    this.decryptColoum=['name','remark','level','exekey','localmessage']//加密的字段数据  ID不能加密
    this.encryptData =new EncryptData()
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
   * 查询
   * @param {*} params
   * @param {*} page
   * @returns
   */
  async searchPage(params = {}, page = null) {
    //  pageObj.pageSize  每页多少条
    // pageObj.pageNumber  第几页 从1开始
    params =this.encryptData.encryptData(this.decryptColoum,params)
    let  restData =  await this.sqliteCom.getPageQueryData(this.tbName, params, page);
    restData =this.encryptData.decryptDataList(this.decryptColoum,restData)
    return  restData
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

    params =this.encryptData.encryptData(this.decryptColoum,params)
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
    if (!id) {
      console.log("修改方法 id不能为空");
      return null;
    }
    if (params.id) {
      delete params.id; //删除属性值中的id
    }
    if (params.CREATE_TIME) {
      delete params.CREATE_TIME; //不允许修改创建时间
    }

    params =this.encryptData.encryptData(this.decryptColoum,params)
    return this.sqliteCom.getUpdateData(this.tbName, params, id);
  }

  /**
   * 删除
   * @param {*} id
   */
  getDeleteFunc(id) {
    this.sqliteCom.getDeleteData(this.tbName, { id: id });
  }

  /**
   * 测试方法
   * @returns
   */
  async testFunc() {
    let total = await this.getCount({});
    let res = await this.searchPage({}, null);
    console.log(total);
    console.log(res);

    let tempDta = {};
    tempDta.name = "1111"; //单位名称
    tempDta.remark = "4444"; //描述
    tempDta.level = "1,2,3"; //等级  1 1级 2二级 3级别， 多选以逗号隔开  如1,2
    tempDta.exekey = "11111"; //秘钥key值
    tempDta.localmessage = "DDDDD"; //当前组织 硬件信息 用于后续的校验
    // let boo = await this.addFunc(tempDta,null);
    // console.log(boo);
    res = await this.searchPage({}, null);
    // console.log(res);
    return res;
  }

  /**
   *
   * @param {Object} params 查询的参数
   * @param {Object} page 分页数据
   */
  async getTree() {
    let page = {};
    page.pageSize = 10000; //给个最大值获取所有数据
    page.pageNumber = 1; //默认从第一页开始
    let restData = await this.sqliteCom.getPageQueryData(this.tbName, {}, page);
    restData =this.encryptData.decryptDataList(this.decryptColoum,restData)
    return createTree(restData);
  }
}
export { OrgApi };
