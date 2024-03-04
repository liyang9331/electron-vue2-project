const archiver = require("archiver");
const fs = require("fs");
const { app } = require("@electron/remote");
const path = require("path");
/**
 * @param {array<{path: String, name: String}>} files
 * @returns {Promise<Buffer>}
 */
function zipFiles(files) {
  return new Promise((resolve, reject) => {
    const appPath = app.isPackaged
      ? path.dirname(app.getPath("exe"))
      : path.join(app.getAppPath(), "../");
    const directoryPath = path.join(appPath, "data", "uploads");
    if(!fs.existsSync()){
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    const zipPath = path.join(directoryPath, files[0].name + ".zip");
    // console.log(zipPath)
    // console.log(__dirname)
    // console.log(process.execPath)
    // console.log(app.getPath("exe"))
    // console.log(app.getAppPath())
    // resolve("")

    // 创建文件输出流
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    // 文件输出流结束
    output.on("close", function () {
      console.log(`总共 ${archive.pointer()} 字节`);
      console.log("archiver完成文件的归档，文件输出流描述符已关闭");
      resolve(zipPath);
    });

    // 数据源是否耗尽
    output.on("end", function () {
      console.log("数据源已耗尽");
    });

    // 存档警告
    archive.on("warning", function (err) {
      if (err.code === "ENOENT") {
        console.warn("stat故障和其他非阻塞错误");
      } else {
        throw err;
      }
    });

    // 存档出错
    archive.on("error", function (err) {
      throw err;
    });

    // 通过管道方法将输出流存档到文件
    archive.pipe(output);

    files.forEach((item) => {
      const stream = fs.createReadStream(item.path);
      // 从流中追加文件
      archive.append(stream, { name: item.name + "." + item.type });
    });

    // 完成压缩
    archive.finalize();
  });
}

export default zipFiles;
