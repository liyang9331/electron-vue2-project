const XLSX = require("xlsx");
import fs from "fs";
import { ipcRenderer } from "electron";
/**
 * 多sheet页导出
 * @param {*} fileName
 * @param {*} data
 */
export function exportMoreExcelFile(fileName, data) {
  var worksheet = XLSX.utils.json_to_sheet(data);
  // 调整宽度
  let wscols = [];
  // 新建空workbook，然后加入到worksheet
  var workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "result");
  // 生成xlsx文件
  let name = `${fileName}.xlsx`;
  XLSX.writeFile(workbook, name);
}

/**
 * 导出excel
 * @param {*} fileName
 * @param {*} data
 */
export function exportExcelFile(fileName, data) {
  /* generate worksheet from state */
  var ws = XLSX.utils.json_to_sheet(data);
  /* create workbook and append worksheet */
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "result");
  /* export to XLSX */
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

/**
 * 导入excel
 * @param {Function} callback
 */
export function importExcel() {
  return new Promise((resolve, reject) => {
    function toArrayBuffer(buf) {
      var ab = new ArrayBuffer(buf.length);
      var view = new Uint8Array(ab);
      for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
      }
      return ab;
    }
    const customEventHandler = (event, files) => {
      let filePaths = files.filePaths;
      //   console.log(event);
      if (files.eventType == "importExcel") {
          fs.readFile(filePaths[0], function (err, data) {
            if (err) {
              return console.error(err);
            }
            var fileData = toArrayBuffer(data);
            const workbook = XLSX.read(fileData);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const raw_data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            ipcRenderer.removeListener("uploadFileWatch", customEventHandler);
            resolve(raw_data);
          });
      }
    };
    ipcRenderer.on("uploadFileWatch", customEventHandler);
    ipcRenderer.send("uploadExcel", { eventType: "importExcel" });
  });
}
