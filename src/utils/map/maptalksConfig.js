import * as maptalks from "maptalks";
import * as turf from "@turf/turf";

//一个图层只能有一个 map ，如果用静态对象来定义的话 第一次添加之后map就初始化到图层中 ，再次添加的时候 conigObj已经是被使用的 导致基础底图无法加载
/**
 * maptalks 地图配置项
 * @returns
 */
function getMapConfig() {
  let baseMarkLayer = new maptalks.TileLayer("base", {
    urlTemplate: "http://127.0.0.1:9090/tianditu/marker/{z}/{x}/{y}.png",
    spatialReference: {
      projection: "EPSG:4326",
    },
    tileSystem: [1, -1, -180, 90],
  });
  const conigObj = {
    center: [90.1157, 40.8244],
    zoom: 7.83,
    minZoom: 7,
    maxZoom: 24,
    devicePixelRatio: 2,
    pitch: 0, // 将倾斜角度设置为 0
    bearing: 0, // 将旋转角度设置为 0
    //allow map to drag pitching, true by default 允许地图拖动俯仰，默认为真
    dragPitch: false,
    //allow map to drag rotating, true by default 允许地图拖动旋转，默认为真
    dragRotate: false,
    //enable map to drag pitching and rotating at the same time, false by default
    // 启用地图拖动俯仰和旋转在同一时间，默认为假
    dragRotatePitch: false,
    /**
     * GroupTileLayer用于同时添加一组TileLayer, 其性能比分别添加同样的TileLayer要更高,
     * 可以避免TileLayer过多时, 浏览器会因为webgl context数量过多,
     * 而显示警告:WARNING: Too many active WebGL contexts. Oldest context will be lost
     */
    baseLayer: new maptalks.GroupTileLayer("base", [
      // 天地图离线墨卡托
      new maptalks.TileLayer("tianditu-mercator", {
        urlTemplate: "http://127.0.0.1:9090/tianditu/mercator/{z}/{x}/{y}.png",
      }),
      // 天地图离线标注
      baseMarkLayer,
    ]),
  };

  // 过滤标注：罗布泊镇
  baseMarkLayer.getTileUrl = function (x, y, z) {
    // WGS84：90.8875584971775,40.47578215123077
    // 9-385-70
    // 10-770-140
    if ((x == 9 && y == 385 && z == 70) || (x == 10 && y == 770 && z == 140)) {
      return "http://127.0.0.1:9090/transparent.png"; //可以给一张其他的256*256的默认图片 ，比如平台公司的logog
    }
  };

  // baseMarkLayer.getTileUrl = function (x, y, z) {
  //   //只在级别大于6级的时候进行判断
  //   if (z > 6) {
  //     var bounds = this._getTileExtent(x, y, z);
  //     var min = bounds.getMin(),
  //       max = bounds.getMax();
  //     var minLon = (min.x / 20037508.34) * 180 - 180;
  //     var minLat = (min.y / 20037508.34) * 180;
  //     minLat += 90;
  //     var maxLon = (max.x / 20037508.34) * 180 - 180;
  //     var maxLat = (max.y / 20037508.34) * 180;
  //     maxLat += 90;
  //     //不显示区域的范围
  //     let hideMinLon = 88;
  //     let hideMinLat = 40;
  //     let hideMaxLon = 92;
  //     let hideMaxLat = 42;

  //     let tilePolygon = [
  //       [minLon, minLat],
  //       [maxLon, minLat],
  //       [maxLon, maxLat],
  //       [minLon, maxLat],
  //       [minLon, minLat],
  //     ];
  //     tilePolygon = turf.polygon([tilePolygon]);

  //     let hidePolygon = [
  //       [hideMinLon, hideMinLat],
  //       [hideMaxLon, hideMinLat],
  //       [hideMaxLon, hideMaxLat],
  //       [hideMinLon, hideMaxLat],
  //       [hideMinLon, hideMinLat],
  //     ];
  //     hidePolygon = turf.polygon([hidePolygon]);
  //     let isDisJoint = turf.booleanDisjoint(tilePolygon, hidePolygon);
  //     if (!isDisJoint) {
  //       //说明相交
  //       return "http://127.0.0.1:9090/transparent.png"; //可以给一张其他的256*256的默认图片 ，比如平台公司的logog
  //     }
  //     return (
  //       "http://127.0.0.1:9090/tianditu/marker/" +
  //       z +
  //       "/" +
  //       x +
  //       "/" +
  //       y +
  //       ".png"
  //     );
  //   }
  //   return (
  //     "http://127.0.0.1:9090/tianditu/marker/" +
  //     z +
  //     "/" +
  //     x +
  //     "/" +
  //     y +
  //     ".png"
  //   );
  // };

  baseMarkLayer._getTileExtent = function (x, y, z) {
    var map = this.getMap(),
      res = map._getResolution(z),
      tileConfig = this._getTileConfig(),
      tileExtent = tileConfig.getTilePrjExtent(x, y, res);
    return tileExtent;
  };

  return conigObj;
}

//判断是否相交
function booleanjoint(tilePolygon, hidePolygon) {
  if (!isJoint) {
    joinFeature.push(fItem.properties.data);
  }
  return isJoint;
}

const defaultLayerOptions = {
  style: {
    symbol: {
      lineColor: "#0077FF",
      polygonFill: "#0077FF", // 填充颜色，这里设置为红色
      polygonOpacity: 0.32, // 可选，填充颜色的透明度
    },
  },
};

export { getMapConfig, defaultLayerOptions };
