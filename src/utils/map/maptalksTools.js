import proj4 from "proj4";
import { geojson2geometry } from "./parseGeoJson";
import * as maptalks from "maptalks";

/**
 * 初始化测面工具
 * @param {*} map
 */
export function initAreaTool(map) {
  // 创建AreaTool工具
  const areaTool = new maptalks.AreaTool({
    symbol: {
      lineColor: "#1bbc9b",
      lineWidth: 2,
      polygonFill: "#fff",
      polygonOpacity: 0.3,
    },
    vertexSymbol: {
      markerType: "ellipse",
      markerFill: "#34495e",
      markerLineColor: "#1bbc9b",
      markerLineWidth: 3,
      markerWidth: 10,
      markerHeight: 10,
    },
    labelOptions: {
      textSymbol: {
        textFaceName: "monospace",
        textFill: "#fff",
        textLineSpacing: 1,
        textHorizontalAlignment: "right",
        textDx: 15,
      },
      boxStyle: {
        padding: [6, 2],
        symbol: {
          markerType: "square",
          markerFill: "#000",
          markerFillOpacity: 0.9,
          markerLineColor: "#b4b3b3",
        },
      },
    },
    clearButtonSymbol: [
      {
        markerType: "square",
        markerFill: "#000",
        markerLineColor: "#b4b3b3",
        markerLineWidth: 2,
        markerWidth: 15,
        markerHeight: 15,
        markerDx: 22,
      },
      {
        markerType: "x",
        markerWidth: 10,
        markerHeight: 10,
        markerLineColor: "#fff",
        markerDx: 22,
      },
    ],
    language: "zh-CN",
    blockGeometryEvents:false,//是否在绘图时禁用几何事件
  }).addTo(map);
  return areaTool;
}
/**
 * 初始化测距工具
 * @param {*} map
 */
export function initDistanceTool(map) {
  const distanceTool = new maptalks.DistanceTool({
    symbol: {
      lineColor: "#34495e",
      lineWidth: 2,
    },
    vertexSymbol: {
      markerType: "ellipse",
      markerFill: "#1bbc9b",
      markerLineColor: "#000",
      markerLineWidth: 3,
      markerWidth: 10,
      markerHeight: 10,
    },

    labelOptions: {
      textSymbol: {
        textFaceName: "monospace",
        textFill: "#fff",
        textLineSpacing: 1,
        textHorizontalAlignment: "right",
        textDx: 15,
        markerLineColor: "#b4b3b3",
        markerFill: "#000",
      },
      boxStyle: {
        padding: [6, 2],
        symbol: {
          markerType: "square",
          markerFill: "#000",
          markerFillOpacity: 0.9,
          markerLineColor: "#b4b3b3",
        },
      },
    },
    clearButtonSymbol: [
      {
        markerType: "square",
        markerFill: "#000",
        markerLineColor: "#b4b3b3",
        markerLineWidth: 2,
        markerWidth: 15,
        markerHeight: 15,
        markerDx: 20,
      },
      {
        markerType: "x",
        markerWidth: 10,
        markerHeight: 10,
        markerLineColor: "#fff",
        markerDx: 20,
      },
    ],
    language: "zh-CN",
    blockGeometryEvents:false,//是否在绘图时禁用几何事件
  }).addTo(map);
  return distanceTool;
}
/**
 * 定义计算矩形四个角坐标的函数
 * @param {*} topLeft
 * @param {*} bottomRight
 * @returns
 */
export function calculateRectangleCorners(topLeft, bottomRight) {
  // 计算矩形的宽度和高度
  const width = bottomRight[0] - topLeft[0];
  const height = topLeft[1] - bottomRight[1];

  // 计算左下角和右上角坐标
  const bottomLeft = [topLeft[0], bottomRight[1]];
  const topRight = [bottomRight[0], topLeft[1]];
  // maptalks 逆时针绘制
  const point = [topLeft, bottomLeft, bottomRight, topRight];
  // 返回四个角的坐标
  return point;
}
/**
 * 经纬度-->平面坐标
 * @param {*} longitude
 * @param {*} latitude
 * @returns
 */
export function convertGeoToCartesian(longitude, latitude) {
  // 定义源坐标系（经纬度坐标）
  const sourceCoordinates = [longitude, latitude];

  // 定义目标坐标系（平面坐标，使用合适的投影参数）
  const targetProjection =
    "+proj=utm +zone=33 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";

  // 进行坐标转换
  const result = proj4(targetProjection, sourceCoordinates);

  // 返回平面直角坐标对象
  return { x: result[0], y: result[1] };
}

/**
 * 检测geojson中的矢量图形是否包含在矩形框内
 * @param {*} polygonExtent 通过maptalks marker.getExtent()函数获取的几何图形地理范围
 * @param {*} geojson
 */
export function isGeosJsonInRectangle(polygonExtent, geojson) {
  const geometry = geojson2geometry(geojson);
  const extent = geometry.getExtent();
  // console.log(polygonExtent)
  // console.log(extent)
  if (
    polygonExtent.xmax > extent.xmax &&
    polygonExtent.xmin < extent.xmin &&
    polygonExtent.ymax > extent.ymax &&
    polygonExtent.ymin < extent.ymin
  ) {
    return true;
  } else {
    return false;
  }
}
