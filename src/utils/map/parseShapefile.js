import shp from "shpjs";
import * as fs from "fs";
import zipFiles from "../file/zipFiles";
const { app } = require("@electron/remote");
/**
 * 解析shp文件-->标准geojson
 * @param {*} filePaths shapefile所有文件的路径集合
 * @param {*} fileType
 * @returns
 */
function parse(files, fileType) {
  /**
   * GeoJSON使用唯一地理坐标参考系统WGS1984和十进制度单位，类型可以是 Geometry,Feature 或者 FeatureCollection.
   * Geometry 【几何】 :表示地理空间数据
   * Feature 【特征】 :表示地理要素及其相关属性信息,包含Geometry【几何】、Properties【属性】
   * FeatureCollection【特征集合】 : 用于组织多个GeoJSON特征的容器格式
   *
   * shpjs 默认对输入的数据进行了坐标转换，根据prj描述，转换为wgs84，
   * 当原始坐标系为其他椭球坐标系（非WGS84椭球）时
   * 比如2000经纬度或者平面坐标系，转换就会报错，读取失败
   */
  return new Promise((resolve, reject) => {
    if (files.length <= 0) {
      return;
    }
    function deleteFile(path) {
      try {
        // 删除本地文件
        fs.unlink(path, (err) => {
          console.error(err);
        });
      } catch (err) {
        console.error(err);
      }
    }
    zipFiles(files).then((zipPath) => {
      const buffer = fs.readFileSync(zipPath);
      shp(buffer)
        .then(function (geojson) {
          // deleteFile(zipPath);
          resolve(typeof geojson === "string" ? JSON.parse(geojson) : geojson);
        })
        .catch((err) => {
          // deleteFile(zipPath);
          reject(err);
        });
    });
  });
}

export default parse;
