import { SqliteCom } from "@/utils/db/sqlite";

/**
 * Created by supervisor on 2023/10/17  保持平台只有一个数据库链接
 */
class BaseSqlCom {
  constructor() {
    if (!BaseSqlCom.sqliteCom) {
      BaseSqlCom.sqliteCom = new SqliteCom(window.dbPath);
    }
  }

  static sqliteCom = null;

  static getSqliteCom() {
    if (!BaseSqlCom.sqliteCom) {
      BaseSqlCom.sqliteCom = new SqliteCom(window.dbPath);
    }
    return BaseSqlCom.sqliteCom;
  }
}
export { BaseSqlCom };
