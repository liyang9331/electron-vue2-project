// 直接根据宽度的比率进行缩放
export function triggerScale() {
  var targetX = 1920;
  var targetY = 1080;

  // 获取html的宽度和高度（不包含滚动条）
  var currentX =
    document.documentElement.clientWidth || document.body.clientWidth;
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/clientWidth
  var currentY =
    document.documentElement.clientHeight || document.body.clientHeight;

  // 1.缩放比例  3840 / 2160 => 2
  var ratio = currentX / targetX;

  var bodyEl = document.querySelector("body");
  // 2.需要修改缩放的原点 body { transform-origin: left top; }
  bodyEl.setAttribute("style", `transform:scale(${ratio})`);
}

// 动态计算网页宽高比
export function triggerScaleTrends() {
  console.log("屏幕自适应函数正在工作")
  var targetX = 1920;
  var targetY = 1080;
  var targetRatio = 16 / 9;
  var currentX =
    document.documentElement.clientWidth || document.body.clientWidth;
  var currentY =
    document.documentElement.clientHeight || document.body.clientHeight;

  // 1.缩放比例  3840 / 2160 => 2
  var ratio = currentX / targetX;
  var currentRatio = currentX / currentY;
  var transformStr = "";
  if (currentRatio > targetRatio) {
    ratio = currentY / targetY;
    transformStr = `transform:scale(${ratio}) translateX(-${
      targetX / 2
    }px); left:50%;`;
  } else {
    transformStr = `transform:scale(${ratio})`;
  }
  var bodyEl = document.querySelector("body");
  // 2.需要修改缩放的原点 body { transform-origin: left top; }
  bodyEl.setAttribute("style", transformStr);
}

// 大屏的适配
export function triggerLargeScale(option={}) {
  console.log("屏幕自适应函数正在工作")
  // 1.设计稿的尺寸
  let targetX = option.targetX || 1920;
  let targetY = option.targetY || 1080;
  let targetRatio = option.targetRatio || 16 / 9; // 宽高比率

  // 2.拿到当前设备(浏览器)的宽度
  let currentX =
    document.documentElement.clientWidth || document.body.clientWidth;
  let currentY =
    document.documentElement.clientHeight || document.body.clientHeight;

  // 3.计算缩放比例
  let scaleRatio = currentX / targetX; // 参照宽度进行缩放 ( 默认情况 )
  let currentRatio = currentX / currentY; // 宽高比率

  // 超宽屏
  if (currentRatio > targetRatio) {
    // 4.开始缩放网页
    scaleRatio = currentY / targetY; // 参照高度进行缩放
    document.body.style = `width:${targetX}px; height:${targetY}px;transform: scale(${scaleRatio}) translateX(-50%); left: 50%`;
  } else {
    // 4.开始缩放网页
    document.body.style = `width:${targetX}px; height:${targetY}px; transform: scale(${scaleRatio})`;
  }
}