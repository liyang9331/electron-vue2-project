import { deepCopy } from "@/utils/index";
import * as maptalks from "maptalks";

/**
 * geojson --> maptalks Geometry
 * @param {*} geojson
 */
function geojson2geometry(geojson) {
  /**
   * GeoJSON使用唯一地理坐标参考系统WGS1984和十进制度单位，类型可以是 Geometry,Feature 或者 FeatureCollection.
   * Geometry 【几何】 :表示地理空间数据
   * Feature 【特征】 :表示地理要素及其相关属性信息,包含Geometry【几何】、Properties【属性】
   * FeatureCollection【特征集合】 : 用于组织多个GeoJSON特征的容器格式
   */

  //   maptalks支持的geojson为Feature
  console.log(geojson)
  let geo =
    typeof geojson === "string"
      ? JSON.parse(deepCopy(geojson))
      : deepCopy(geojson);

  if (geo.type == "FeatureCollection") {
    geo = geo.features[0]
  }
  let geometry = maptalks.GeoJSON.toGeometry(geo);

  console.log(geo)
  if (geo.type == "Feature" && geo.properties.symbol) {
    // 设置样式
    geometry.setSymbol(geo.properties.symbol);
  }
  return geometry;
}

/**
 * maptalks Geometry --> geojson
 * @param {*} geometry
 * @returns
 */
function geometry2geojson(geometry) {
  return JSON.stringify(geometry.toGeoJSON());
  //   return geometry.toGeoJSON();
}

export { geojson2geometry, geometry2geojson };
