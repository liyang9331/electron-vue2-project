import { guid } from "@/utils";
import { BaseSqlCom } from "./BaseSqlCom";
import { EncryptData } from "@/utils/verify/EncryptData";
/**
 * Created by supervisor on 2023/10/19 地名管理
 */
class ConfigApi {
  constructor() {
    //赋予数据库链接
    this.sqliteCom = BaseSqlCom.getSqliteCom();
    this.tbName = "tb_config";
    this.id = null; //唯一标识 uuid
    this.name_text_color = null; //地名名称颜色
    this.name_text_size = null; //地名名称字体大小
    this.encryptData = new EncryptData();
  }

  /**
   * 获取配置文件
   * @returns
   */
  async getConfigData() {
    const sql = "SELECT * FROM tb_config";
    const result = await this.sqliteCom.executeCustomSQL(sql);
    return result;
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
    return this.sqliteCom.getUpdateData(this.tbName, params, whereParams);
  }
}
export { ConfigApi };
