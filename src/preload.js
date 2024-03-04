
// 建表脚本，导出db对象供之后使用
const path = require('path')
const fs = require("fs")
const isBuild = process.env.NODE_ENV === 'production';
const dataFile = path.join(
    // eslint-disable-next-line
    isBuild ? '../../' : '../',
  );
const appPath = __dirname
const rootPath = path.join(appPath, dataFile)
const dbPath = path.join(rootPath, '/data/db.db')
const packageJSON = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"))
);
window.packageJSON = packageJSON;
process.once('loaded', () => {
    global.appPath = appPath
    global.rootPath = rootPath
    global.dbPath = dbPath
 })
