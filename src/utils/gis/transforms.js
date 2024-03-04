/**
 * Created by supervisor on 2023/10/19  空间数据转换
 */

import * as turf from "@turf/turf";
import "@/utils/ProjData";
import proj4 from "proj4";
import WKT from "terraformer-wkt-parser";
class Transform {
  constructor() { }

  /**
   *  第一次填写数据写入文件之前需要 验证一下授权是否是真的
   * encryptStr 由后台java 端生成，主要是对一个JSON进行 AES加密， 主要信息为{"deptName":"部门1"，“endTime”:"2022-01-01 00:00:00"}
   * @param {*}
   * @returns
   */
  verifyEncrypt(encryptStr) {
    //返回的是一个数值
    const vm = this;
    this.keyStr = AES.getKey();
    const dataObj = JSON.parse(AES.decrypt(encryptStr, vm.keyStr));
    if (!dataObj) {
      if (dataObj.deptName && dataObj.endTime) {
        //说明数据是对的,把加密秘钥存储到文件中
        this.verifyFile(encryptStr);
        return true;
      }
      return false;
    }
    return false;
  }

  //DDD转DDD
  DDDToDDD(_data) {
    let value = parseFloat(_data);
    return value.toFixed(7);
  }
  //DDD转DMS °、′、″ 这里为用 '代替了′ " 代替 ″ 8°14'2.8428"
  /**
   * 将度数（Decimal Degrees）转换为度分秒（Degrees, Minutes, Seconds）格式的字符串
   * @param {number} _data - 输入的度数
   * @returns {string} - 表示度分秒格式的字符串
   */
  DDDToDMS(_data) {
    // 将输入值转换为浮点数
    let value = parseFloat(_data);

    // 提取度数部分
    let _d = Math.floor(value); // 度

    // 计算分钟和秒数
    let _temp = (value - _d) * 60;
    let _m = Math.floor(_temp); // 分
    let _s = ((_temp - _m) * 60).toFixed(3); // 秒，保留小数点后两位

    // 处理秒数达到60时的进位情况
    if (_s === "60.00") {
      _s = "00.00";
      _m += 1;
    }

    // 处理分钟数达到60时的进位情况
    if (_m === 60) {
      _m = 0;
      _d += 1;
    }

    // 返回度分秒格式的字符串
    return _d + "°" + _m + "'" + _s + '"';
  }
  
  //DDD转DMM
  DDDToDMM(_data) {
    let value = parseFloat(_data);
    let _d = Math.floor(value); //度
    // let _m =parseFloat((value - _d) * 60);//分
    let _m = parseFloat((value - _d) * 60).toFixed(4); //分 精确小数点后面4位
    return _d + "°" + _m + "'";
  }
  //DMS转DDD 度分秒转十进制经纬度
  DMSToDDD(_data) {
    console.log("度分秒转十进制经纬度");
    // console.log(_data);
    _data = _data
      .replace("(", "")
      .replace(")", "")
      .replace("（", "")
      .replace("）", "")
      .replace("N", "")
      .replace("E", "")
      .replace("W", "")
      .replace("S", "");
    let du = _data.split("°")[0];
    // console.log(du)
    let fen = _data.split("°")[1].split("'")[0];
    // console.log(fen)
    let miao =
      _data.indexOf("”") > -1
        ? _data.split("°")[1].split("'")[1].split("”")[0]
        : _data.split("°")[1].split("'")[1].split('"')[0];
    // console.log(du,fen,miao)
    let res = Math.abs(du) + (Math.abs(fen) / 60 + Math.abs(miao) / 3600);
    res = parseFloat(res).toFixed(8);
    return res;
  }
  /**
   * DMM转DDD
   * @param {*} _data 
   * @returns 
   */
  DMMToDDD(_data) {
    let du = _data.split("°")[0];
    let fen = _data.split("°")[1].split("'")[0];
    let res = Math.abs(du) + Math.abs(fen) / 60;
    res = parseFloat(res).toFixed(7);
    return res;
  }



  //判断数是点、线、面
  getDataType(geomStr) {
    const dataArr = geomStr.split(",");
    if (dataArr.length <= 2) {
      //说明是点
    }
  }
  //转换点数据 E
  changePointData(lonlatData) {
    //去掉 东西半球的标记
    lonlatData = lonlatData.replace(/e/g, "");
    lonlatData = lonlatData.replace(/n/g, "");
    lonlatData = lonlatData.replace(/E/g, "");
    lonlatData = lonlatData.replace(/N/g, "");
    let lonaltArr = lonlatData.split(",");
    if (lonaltArr.length <= 1) {
      lonaltArr = lonlatData.split("，");
    }
    if (lonaltArr.length != 2) {
      return {};
    }
    let lon = this.DMSToDDD(lonaltArr[0]);
    let lat = this.DMSToDDD(lonaltArr[1]);
    return {
      lon: lon,
      lat: lat,
    };
  }

  //基于excel导入的WKT 线面数据
  importExcel(wktString) {
    if (wktString.indexOf("(") > -1) {
      //说明是wkt 目前excel导入 线的时候 都是wkt的
      const geometry = WKT.parse(wktString);
      let geoJson = {
        type: "Feature",
        geometry,
        properties: {},
      };
      return JSON.stringify(geoJson);
    } else if (
      wktString.toLowerCase().indexOf("e") > -1 &&
      wktString.toLowerCase().indexOf("n") > -1
    ) {
      //判断是点
      let lonlat = this.changePointData(wktString);
      let pointWkt = "POINT(" + lonlat.lon + " " + lonlat.lat + ")";

      const geometry = WKT.parse(pointWkt);
      let geoJson = {
        type: "Feature",
        geometry,
        properties: {},
      };
      return JSON.stringify(geoJson);
    }
    return wktString;
  }

  //以下两个方法可以用一个 ，但是需要判断下是否试点
  //WKT转换线数据 获取geojson
  changeLineData(wktString) {
    if (wktString.indexOf("(") > -1) {
      //说明是wkt 目前excel导入 线的时候 都是wkt的
      const geometry = WKT.parse(wktString);
      let geoJson = {
        type: "Feature",
        geometry,
        properties: {},
      };
      return JSON.stringify(geoJson);
    }
    return wktString;
  }

  //WKT转换面数据
  changePolygonData(wktString) {
    if (wktString.indexOf("(") > -1) {
      //说明是wkt 目前excel导入 线的时候 都是wkt的
      const geometry = WKT.parse(wktString);
      let geoJson = {
        type: "Feature",
        geometry,
        properties: {},
      };
      return JSON.stringify(geoJson);
    }
    return wktString;
  }

  /**
   * CGCS2000经纬度坐标 转 CGCS2000高斯-克吕格平面坐标 6度分带
   * @param {*} longitude 
   * @param {*} latitude 
   * @returns 
   */
  coordinateTransformation(longitude, latitude) {
    // 将输入的经度和纬度转换为数字类型
    longitude = Number(longitude);
    latitude = Number(latitude);

    // 默认使用 EPSG:4502，即中国2000国家大地坐标系
    let epsgNum = 4502;

    // 根据经度判断是否需要使用不同的投影带
    if (longitude > 78) {
      // 计算经度差距，每6度为一个投影带
      let distLon = longitude - 78;
      let distEpsg = Math.ceil(distLon / 6);

      // 更新 EPSG 号
      epsgNum = epsgNum + distEpsg;
    }

    // 对 EPSG 号进行上限限制
    if (epsgNum > 4512) {
      epsgNum = 4512;
    }

    // 构建 EPSG 字符串
    epsgNum = "EPSG:" + epsgNum;

    // 定义两个投影，分别为 WGS84 和目标 EPSG
    const firstProjection = new proj4.Proj(`EPSG:4326`); // 4326 是 WGS84 的 EPSG 号
    const secondProjection = new proj4.Proj(epsgNum);

    // 使用 proj4 进行坐标转换
    const result = proj4.transform(firstProjection, secondProjection, [
      Number(longitude),
      Number(latitude),
    ]);

    // 构建输出数据
    let endData = {};
    endData.epsg = epsgNum; // 目标 EPSG 号
    endData.endLonlat = result; // 转换后的坐标
    return endData;
  }

  /**
   * CGCS2000高斯-克吕格平面坐标 转 CGCS2000经纬度坐标
   * @param {*} x 
   * @param {*} y 
   * @param {*} sourceEPSG 
   * @returns 
   */
  planeToGeodetic(x, y, sourceEPSG,zone) {
    // 将 x 和 y 转换为数字
    if(zone !== undefined){
      x = Number(zone+""+x);
    }else{
      x = Number(x);
    }
    
    y = Number(y);

    console.log(`x:${x}, y:${y},sourceEPSG:${sourceEPSG},zone:${zone}`);
    // 设置源投影
    const sourceProjection = new proj4.Proj(sourceEPSG);
    // 设置目标投影为 EPSG:4326，即 WGS84 坐标系统
    const targetProjection = new proj4.Proj("EPSG:4326");

    console.log(sourceProjection,targetProjection)
    // 使用 proj4 进行坐标转换
    const result = proj4.transform(sourceProjection, targetProjection, [x, y]);
    // 返回经纬度坐标
    return [result.x, result.y];
  }

  //判断相交
  booleanDisjoint(layerList, drawPoints) {
    let drawPolygons = [
      drawPoints[0],
      [drawPoints[0][0], drawPoints[1][1]],
      drawPoints[1],
      [drawPoints[1][0], drawPoints[0][1]],
      drawPoints[0],
    ];
    drawPolygons = turf.polygon([drawPolygons]);
    let joinFeature = [];
    for (let layerItem of layerList) {
      let features = layerItem.getGeometries();
      if (features && features.length > 0) {
        for (let fItem of features) {
          let turfFeature = {};
          let _coordinates = fItem._coordinates;
          let points = [];
          if (fItem.type == "Polygon") {
            //多边形
            for (let pointItem of _coordinates) {
              points.push([pointItem.x, pointItem.y]);
            }
            points.push(points[0]);
            turfFeature = turf.polygon([points]);
          } else if (fItem.type == "MultiPolygon") {
            //多多边形
            let fraturs = fItem._geometries;
            //多边形
            for (let polygonItem of fraturs) {
              let tempCoordinates = polygonItem._coordinates;
              let tempPoints = [];
              for (let pointItem of tempCoordinates) {
                tempPoints.push([pointItem.x, pointItem.y]);
              }
              tempPoints.push(tempPoints[0]);
              points.push(tempPoints);
            }
            turfFeature = turf.multiPolygon([points]);
          } else if (fItem.type == "LineString") {
            //线
            for (let pointItem of _coordinates) {
              points.push([pointItem.x, pointItem.y]);
            }
            turfFeature = turf.lineString(points);
          } else if (fItem.type == "MultiLineString") {
            //多多边形
            let fraturs = fItem._geometries;
            //多边形
            for (let polygonItem of fraturs) {
              let tempCoordinates = polygonItem._coordinates;
              let tempPoints = [];
              for (let pointItem of tempCoordinates) {
                tempPoints.push([pointItem.x, pointItem.y]);
              }
              points.push(tempPoints);
            }
            turfFeature = turf.multiLineString(points);
          } else if (fItem.type == "Point") {
            //多边形
            let coordinates = fItem.getCoordinates();
            const point = turf.point([coordinates.x, coordinates.y]);
            turfFeature = point;
          } else if (fItem.type == "MultiPoint") {
            //多点
            let coordinates = fItem.getCoordinates();
            for (let pointItem of coordinates) {
              points.push([pointItem.x, pointItem.y]);
            }
            turfFeature = turf.multiPoint(points);
          }
          let isJoint = turf.booleanDisjoint(turfFeature, drawPolygons);
          if (!isJoint) {
            //地名数据
            joinFeature.push(fItem.properties.data);
          }
        }
      }
    }

    return joinFeature;
  }
}
export { Transform };