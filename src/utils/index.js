import proj4 from "proj4";
import * as turf from "@turf/turf";
import "./ProjData";
import { ElMessage } from "element-ui";

// 判断是否是utf-8
export function isUTF8(bytes) {
  var i = 0;
  while (i < bytes.length) {
    if (
      // ASCII
      bytes[i] == 0x09 ||
      bytes[i] == 0x0a ||
      bytes[i] == 0x0d ||
      (0x20 <= bytes[i] && bytes[i] <= 0x7e)
    ) {
      i += 1;
      continue;
    }

    if (
      // non-overlong 2-byte
      0xc2 <= bytes[i] &&
      bytes[i] <= 0xdf &&
      0x80 <= bytes[i + 1] &&
      bytes[i + 1] <= 0xbf
    ) {
      i += 2;
      continue;
    }

    if (
      // excluding overlongs
      (bytes[i] == 0xe0 &&
        0xa0 <= bytes[i + 1] &&
        bytes[i + 1] <= 0xbf &&
        0x80 <= bytes[i + 2] &&
        bytes[i + 2] <= 0xbf) || // straight 3-byte
      (((0xe1 <= bytes[i] && bytes[i] <= 0xec) ||
        bytes[i] == 0xee ||
        bytes[i] == 0xef) &&
        0x80 <= bytes[i + 1] &&
        bytes[i + 1] <= 0xbf &&
        0x80 <= bytes[i + 2] &&
        bytes[i + 2] <= 0xbf) || // excluding surrogates
      (bytes[i] == 0xed &&
        0x80 <= bytes[i + 1] &&
        bytes[i + 1] <= 0x9f &&
        0x80 <= bytes[i + 2] &&
        bytes[i + 2] <= 0xbf)
    ) {
      i += 3;
      continue;
    }

    if (
      // planes 1-3
      (bytes[i] == 0xf0 &&
        0x90 <= bytes[i + 1] &&
        bytes[i + 1] <= 0xbf &&
        0x80 <= bytes[i + 2] &&
        bytes[i + 2] <= 0xbf &&
        0x80 <= bytes[i + 3] &&
        bytes[i + 3] <= 0xbf) || // planes 4-15
      (0xf1 <= bytes[i] &&
        bytes[i] <= 0xf3 &&
        0x80 <= bytes[i + 1] &&
        bytes[i + 1] <= 0xbf &&
        0x80 <= bytes[i + 2] &&
        bytes[i + 2] <= 0xbf &&
        0x80 <= bytes[i + 3] &&
        bytes[i + 3] <= 0xbf) || // plane 16
      (bytes[i] == 0xf4 &&
        0x80 <= bytes[i + 1] &&
        bytes[i + 1] <= 0x8f &&
        0x80 <= bytes[i + 2] &&
        bytes[i + 2] <= 0xbf &&
        0x80 <= bytes[i + 3] &&
        bytes[i + 3] <= 0xbf)
    ) {
      i += 4;
      continue;
    }
    return false;
  }
  return true;
}

// 获取key对应Value的数据，例如：{ id: [1,2,3], name: ["lisa", "john", "james"]}
function _getKeyValueData(data) {
  let keyValueData = {};
  let keys = Object.keys(data[0]); // 获取所有key的名字

  for (let key of keys) {
    // 循环key的名字
    for (let item of data) {
      // 循环传入的数据
      if (keyValueData[key]) {
        // 如果有对应的key，则放入list中，否则创建list
        keyValueData[key].push(item[key]);
      } else {
        keyValueData[key] = [item[key]];
      }
    }
  }
  return keyValueData;
}

// 根据数据获取Excel表的宽度
function _getExcelWidth(dataList) {
  let maxLength = 0;
  for (let item of dataList) {
    item = item.toString();
    if (item.length > maxLength) maxLength = item.length;
  }

  maxLength += 2; // 宽度增加2，可以更美观
  if (maxLength < 10) maxLength = 10;
  if (maxLength > 40) maxLength = 40;
  return maxLength;
}

// 坐标转换
export function coordinateTransformation(longitude, latitude, firstEPSGid) {
  if (firstEPSGid == 4326) return;
  // var firstEPSGid = 4549
  var secondEPSGid = 4326;
  var firstProjection = new proj4.Proj(`EPSG:${firstEPSGid}`);
  var secondProjection = new proj4.Proj(`EPSG:${secondEPSGid}`);
  var result = proj4.transform(firstProjection, secondProjection, [
    Number(longitude),
    Number(latitude),
  ]);
  return result;
}

// 判断管线是否相交
export const booleanContains = (targetLineData, judgeData) => {
  let judge = null;
  let bol = null;
  let targetLine = turf.lineString(targetLineData);
  judge = turf.lineString(judgeData);
  bol = turf.booleanDisjoint(judge, targetLine);
  return bol;
};

// 选择两个点，画出两个点之间的线
export const pointSeekLine = (startPoint, endPoint, data) => {
  let satrt = startPoint;
  let end = endPoint;
  let arr = [];
  arr = data.filter((item) => {
    return item.markerData["起始节点标识码"] == satrt;
  });
  // if (arr[0].markerData['终止节点标识码'] == end) return
  return handPointSeekLine(data, arr, end);
};
// 递归
const handPointSeekLine = (data, target, end) => {
  if (target[target.length - 1].markerData["终止节点标识码"] == end)
    return target;
  let arr = [...target];
  let arr1 = data.filter((item) => {
    return (
      item.markerData["起始节点标识码"] ==
      arr[arr.length - 1].markerData["终止节点标识码"]
    );
  });
  if (arr1.length == 0) {
    ElMessage.error("该管线无法连接");
    return [];
  }
  arr = [...arr, ...arr1];
  return handPointSeekLine(data, arr, end);
};

// 生产uuid
export function guid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const getCurrentTime = () => {
  //获取当前时间并打印
  let yy = new Date().getFullYear();
  let mm =
    new Date().getMonth() + 1 < 10
      ? "0" + (new Date().getMonth() + 1)
      : new Date().getMonth() + 1;
  let dd =
    new Date().getDate() < 10
      ? "0" + new Date().getDate()
      : new Date().getDate();
  let hh = new Date().getHours();
  let mf =
    new Date().getMinutes() < 10
      ? "0" + new Date().getMinutes()
      : new Date().getMinutes();
  let ss =
    new Date().getSeconds() < 10
      ? "0" + new Date().getSeconds()
      : new Date().getSeconds();
  let str = yy + "" + mm + "" + dd;
  return str;
};

const rad = (d) => {
  return (d * Math.PI) / 180.0;
};
export const getDistance = (lat1, lng1, lat2, lng2) => {
  var radLat1 = rad(lat1);
  var radLat2 = rad(lat2);
  var a = radLat1 - radLat2;
  var b = rad(lng1) - rad(lng2);
  var s =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin(a / 2), 2) +
          Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
      )
    );
  s = s * 6378.137; // EARTH_RADIUS;
  s = Math.round(s * 10000) / 10000; //输出为公里

  // var distance = s;
  // var distance_str = "";

  // if (parseInt(distance) >= 1) {
  //     distance_str = distance.toFixed(1) + "km";
  // } else {
  //     distance_str = distance * 1000 + "m";
  // }
  return s * 1000;
};

// 校验是否为经纬度
export const checkLonLat = (type, value) => {
  if (type == "lon") {
    let reg = /^-?((0|[1-9]\d?|1[1-7]\d)(\.\d{1,7})?|180(\.0{1,7})?)?$/;
    return new RegExp(reg).test(value);
  } else {
    let reg = /^-?((0|[1-8]\d|)(\.\d{1,7})?|90(\.0{1,7})?)?$/;
    return new RegExp(reg).test(value);
  }
};

/**
 * 对象转FormData
 * @param {Object} obj
 * @returns {FormData}
 */
export function objectToFormData(obj) {
  const formData = new FormData();
  Object.keys(obj).forEach((key) => {
    if (obj[key] instanceof Array) {
      obj[key].forEach((item) => {
        formData.append(key, item);
      });
      return;
    }
    formData.append(key, obj[key]);
  });
  return formData;
}

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null;
  }
  const format = cFormat || "{y}-{m}-{d} {h}:{i}:{s}";
  let date;
  if (typeof time === "object") {
    date = time;
  } else {
    if (typeof time === "string") {
      if (/^[0-9]+$/.test(time)) {
        // support "1548221490638"
        time = parseInt(time);
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), "/");
      }
    }

    if (typeof time === "number" && time.toString().length === 10) {
      time = time * 1000;
    }
    date = new Date(time);
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  };
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key];
    // Note: getDay() returns 0 on Sunday
    if (key === "a") {
      return ["日", "一", "二", "三", "四", "五", "六"][value];
    }
    return value.toString().padStart(2, "0");
  });
  return time_str;
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  const curTime = time;
  if (String(time).length > 12) {
    // “2020-08-10 18:29:24”的字符长度是19，超过了，所以直接进入时间戳的处理里面
    // 判断时间戳是否为毫秒单位（不少于13位）或者字符串2020-08-10 18:29:24长度
    time = Date.parse(new Date(time));
  } else {
    // 时间戳单位是秒，所以需要*1000变成毫秒的单位
    time = parseInt(time) * 1000;
  }

  const d = new Date(time);
  const now = Date.now();

  const diff = (now - d) / 1000;

  if (diff < 30) {
    return "刚刚";
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + "分钟前";
  }
  if (option) {
    return parseTime(time, option);
  } else {
    return dayjs(curTime).format("MM-DD HH:mm:ss");
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = decodeURIComponent(url.split("?")[1]).replace(/\+/g, " ");
  if (!search) {
    return {};
  }
  const obj = {};
  const searchArr = search.split("&");
  searchArr.forEach((v) => {
    const index = v.indexOf("=");
    if (index !== -1) {
      const name = v.substring(0, index);
      const val = v.substring(index + 1, v.length);
      obj[name] = val;
    }
  });
  return obj;
}

/**
 * 删除对象属性值为空的属性
 * @param {Object} obj 传入的对象
 * @param {string|number} chart 自定义过滤值
 * @returns {Object}
 */
export function objectEmpty(obj, chart = "") {
  const cloneObj = deepCopy(obj)
  // 深度拷贝 obj
  Object.keys(cloneObj).forEach((item, key) => {
    if (
      cloneObj[item] === null ||
      cloneObj[item] === "" ||
      (typeof cloneObj[item] === "array" && cloneObj[item].length == 0) ||
      (typeof cloneObj[item] === "object" &&
        Object.keys(cloneObj[item]).length === 0) ||
      cloneObj[item] === chart
    ) {
      delete cloneObj[item];
    }
  });
  return cloneObj;
}

/**
 * 对JavaScript的引用类型进行内存复制
 * @param {*} obj
 * @returns
 */
export function deepCopy(obj) {
  if (Array.isArray(obj)) {
    const newArray = [];
    for (let i = 0; i < obj.length; i++) {
      newArray[i] = deepCopy(obj[i]);
    }
    return newArray;
  } else if (typeof obj === "object") {
    const newObj = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        newObj[key] = deepCopy(obj[key]);
      }
    }
    return newObj;
  } else {
    return obj;
  }
}

/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export function debounce(func, wait, immediate) {
  let timeout, args, context, timestamp, result;

  const later = function () {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp;

    // 上次被包装函数被调用时间间隔 last 小于设定时间间隔 wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function (...args) {
    context = this;
    timestamp = +new Date();
    const callNow = immediate && !timeout;
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
}

/**
 * underscore 节流函数，返回函数连续调用时，func 执行频率限定为 次 / wait
 *
 * @param  {function}   func      回调函数
 * @param  {number}     wait      表示时间窗口的间隔
 * @return {function}             返回客户调用函数
 */
export function throttle(fn, delay = 500) {
  let flag = true;
  return (...args) => {
    if (!flag) return;
    flag = false;
    setTimeout(() => {
      fn.apply(this, args);
      flag = true;
    }, delay);
  };
}

// 时间戳 =>  yyyy-mm-dd hh:mm:ss
export function dateTimeFormat(time) {
  if (!time) return "";
  const t = parseDate(time);
  if (!t) return;
  const month = (t.getMonth() + 1 + "").padStart(2, "0");
  const date = (t.getDate() + "").padStart(2, "0");
  const hour = (t.getHours() + "").padStart(2, "0");
  const minute = (t.getMinutes() + "").padStart(2, "0");
  const second = (t.getSeconds() + "").padStart(2, "0");
  return `${t.getFullYear()}-${month}-${date} ${hour}:${minute}:${second}`;
}
function parseDate(date) {
  if (!date && date !== 0) return;
  if (date instanceof Date) return new Date(date);
  if (typeof date === "string" && !/Z$/i.test(date)) {
    const d = date.match(REGEX_PARSE);
    if (d) {
      const m = d[2] - 1 || 0;
      const ms = (d[7] || "0").substring(0, 3);
      return new Date(d[1], m, d[3] || 1, d[4] || 0, d[5] || 0, d[6] || 0, ms);
    }
  }
  const t = new Date(date);

  if (isNaN(t)) return;

  return t; // everything else
}

// 获取刻度
export function timeSlot(step) {
  //  step = 间隔的分钟
  var date = new Date();
  date.setHours(0); // 时分秒设置从零点开始
  date.setSeconds(0);
  date.setUTCMinutes(0);
  // console.log(date.getHours())
  // console.log(date.getSeconds())
  // console.log(new Date(date.getTime()))

  var arr = [];
  var timeArr = [];
  var slotNum = (24 * 60) / step; // 算出多少个间隔
  for (var f = 0; f < slotNum; f++) {
    //  stepM * f = 24H*60M
    // arr.push(new Date(Number(date.getTime()) + Number(step*60*1000*f)))   //  标准时间数组
    var time = new Date(Number(date.getTime()) + Number(step * 60 * 1000 * f)); // 获取：零点的时间 + 每次递增的时间
    var hour = "";
    var sec = "";
    time.getHours() < 10
      ? (hour = "0" + time.getHours())
      : (hour = time.getHours()); // 获取小时
    time.getMinutes() < 10
      ? (sec = "0" + time.getMinutes())
      : (sec = time.getMinutes()); // 获取分钟
    timeArr.push(hour + ":" + sec);
  }
  timeArr.push("24:00");
  return timeArr;
}
