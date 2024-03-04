import { defaultLayerOptions } from "@/utils/map/maptalksConfig";
/**
 * maptalks 绘制工具
 */
class drawTool {
  constructor(map, vectorLayer, maptalks, callback) {
    //  map 地图
    this.map = map;
    //   model 点线面 【Point, LineString, Polygon】
    this.model = "Point";
    this.layer = vectorLayer;
    this.drawTool = new maptalks.DrawTool({
      // 画布  默认绘制点
      mode: "Point",
      symbol: defaultLayerOptions.style.symbol,
    })
      .addTo(this.map)
      .disable();

    this.drawTool.on("drawend", (param) => {
      callback && callback(param);
      this.layer.addGeometry(param.geometry);
      this.drawTool.disable();
    });
  }
  // 绘制点
  drawToolPoint() {
    this.drawTool.setMode("Point").enable();
  }
  // 绘制线
  drawToolLine() {
    this.drawTool.setMode("LineString").enable();
  }
  // 绘制面
  drawToolPolygon() {
    this.drawTool.setMode("Polygon").enable();
  }

  //    自定义绘制类型
  setDrawTool(model) {
    //   model 点线面 【Point, LineString, 'Polygon', 'Circle', 'Ellipse', 'Rectangle', 'FreeHandLineString', 'FreeHandPolygon'】
    this.drawTool.setMode(model).enable();
  }
  // 结束绘制
  stopDraw() {
    this.drawTool.disable();
  }
  //  清空画布
  clear() {
    this.layer.clear();
  }
}
export default drawTool;
