<template>
  <div id="bar-charts" style="width: 100%"></div>
</template>

<script>
import * as echarts from "echarts";

export default {
  name: "BarCharts",
  props: {
    types: {
      type: Object,
      default: function () {
        return { xAxisData: [], max: [], values };
      },
    },
  },
  watch: {
    types(val) {
      this.initChart();
    },
  },
  data: function () {
    return {
      myChart: null,
    };
  },
  mounted() {
    if (this.types.max.length > 0) {
      this.initChart();
    }
  },
  beforeDestroy() {
    this.destroyChart();
  },
  methods: {
    destroyChart() {
      if (this.myChart) {
        this.myChart.dispose(); // 销毁 ECharts 实例
      }
    },
    initChart() {
      const handle = (params) => {
        console.log("Series A 被点击了", params);
        if (params.data.data.id) {
          this.$emit("customHandler", {
            type: params.data.data.name,
            securityLevel: "",
          });
        } else {
          this.$emit("customHandler", {
            securityLevel: params.data.data.value,
            type: "",
          });
        }
      };
      if (this.myChart != null) {
        this.myChart.dispose();
      }
      // console.log("初始化echarts");
      this.myChart = echarts.init(document.getElementById("bar-charts"));
      const offsetX = 15;
      const offsetY = 10;
      const isMaxShow = true;
      // 绘制左侧面
      const CubeLeft = echarts.graphic.extendShape({
        shape: {
          x: 0,
          y: 0,
        },
        buildPath: function (ctx, shape) {
          // 会canvas的应该都能看得懂，shape是从custom传入的
          const xAxisPoint = shape.xAxisPoint;
          // console.log(shape);
          const c0 = [shape.x, shape.y];
          const c1 = [shape.x - offsetX, shape.y - offsetY];
          const c2 = [xAxisPoint[0] - offsetX, xAxisPoint[1] - offsetY];
          const c3 = [xAxisPoint[0], xAxisPoint[1]];
          ctx
            .moveTo(c0[0], c0[1])
            .lineTo(c1[0], c1[1])
            .lineTo(c2[0], c2[1])
            .lineTo(c3[0], c3[1])
            .closePath();
        },
      });
      // 绘制右侧面
      const CubeRight = echarts.graphic.extendShape({
        shape: {
          x: 0,
          y: 0,
        },
        buildPath: function (ctx, shape) {
          const xAxisPoint = shape.xAxisPoint;
          const c1 = [shape.x, shape.y];
          const c2 = [xAxisPoint[0], xAxisPoint[1]];
          const c3 = [xAxisPoint[0] + offsetX, xAxisPoint[1] - offsetY];
          const c4 = [shape.x + offsetX, shape.y - offsetY];
          ctx
            .moveTo(c1[0], c1[1])
            .lineTo(c2[0], c2[1])
            .lineTo(c3[0], c3[1])
            .lineTo(c4[0], c4[1])
            .closePath();
        },
      });
      // 绘制顶面
      const CubeTop = echarts.graphic.extendShape({
        shape: {
          x: 0,
          y: 0,
        },
        buildPath: function (ctx, shape) {
          const c1 = [shape.x, shape.y];
          const c2 = [shape.x + offsetX, shape.y - offsetY]; //右点
          const c3 = [shape.x, shape.y - offsetX];
          const c4 = [shape.x - offsetX, shape.y - offsetY];
          ctx
            .moveTo(c1[0], c1[1])
            .lineTo(c2[0], c2[1])
            .lineTo(c3[0], c3[1])
            .lineTo(c4[0], c4[1])
            .closePath();
        },
      });
      // 注册三个面图形
      echarts.graphic.registerShape("CubeLeft", CubeLeft);
      echarts.graphic.registerShape("CubeRight", CubeRight);
      echarts.graphic.registerShape("CubeTop", CubeTop);
      const MAX = this.types.max;
      const VALUE = this.types.values;

      const option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
            shadowStyle: {
              color: "rgba(51, 133, 242, .1)",
            },
          },
          formatter: function (params, ticket, callback) {
            const item = params[1];
            return item.name + " : " + item.value;
          },
        },
        grid: {
          left: "1%",
          right: "0%",
          top: "15%",
          bottom: "0%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: this.types.xAxisData,
          axisLine: {
            show: true,
            lineStyle: {
              width: 2,
              color: "#E2E2E2",
            },
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            rotate: 45, //设置文字倾斜角度
            fontSize: 14,
            color: "#53638B",
            formatter: function (value) {
                // 设置每行显示的字符数
                var charsPerLine = 10;
                // 使用正则表达式在每5个字符后添加换行符
                var formattedValue = value.replace(new RegExp(".{" + charsPerLine + "}", "g"), "$&\n");
                return formattedValue;
            }
          },
        },
        yAxis: {
          type: "value",
          name: "单位：个",
          nameTextStyle: {
            fontSize: 14,
            color: "#53638B",
          },
          axisLine: {
            show: true,
            lineStyle: {
              width: 2,
              color: "#E2E2E2",
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: "dashed",
              color: "#E2E2E2",
            },
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            fontSize: 14,
            color: "#53638B",
          },
          // boundaryGap: ['20%', '20%'],
        },
        series: [
          isMaxShow
            ? {
                // 最大高度
                type: "custom",
                name: "series",
                renderItem: function (params, api) {
                  const location = api.coord([api.value(0), api.value(1)]);
                  return {
                    type: "group",
                    children: [
                      {
                        type: "CubeLeft",
                        shape: {
                          api,
                          x: location[0],
                          y: location[1],
                          xAxisPoint: api.coord([api.value(0), 0]),
                        },
                        style: {
                          fill: `rgb(112, 112, 112,.1)`,
                        },
                      },
                      {
                        type: "CubeRight",
                        shape: {
                          api,
                          x: location[0],
                          y: location[1],
                          xAxisPoint: api.coord([api.value(0), 0]),
                        },
                        style: {
                          fill: `rgb(112, 112, 112, .3)`,
                        },
                      },
                      {
                        type: "CubeTop",
                        shape: {
                          api,
                          x: location[0],
                          y: location[1],
                          xAxisPoint: api.coord([api.value(0), 0]),
                        },
                        style: {
                          fill: `rgb(112, 112, 112,.4)`,
                        },
                      },
                    ],
                  };
                },
                data: MAX,
              }
            : null,
          {
            // 实际高度
            type: "custom",
            name: "series",
            renderItem: (params, api) => {
              const location = api.coord([api.value(0), api.value(1)]);
              return {
                type: "group",
                children: [
                  {
                    type: "CubeLeft",
                    shape: {
                      api,
                      xValue: api.value(0),
                      yValue: api.value(1),
                      x: location[0],
                      y: location[1],
                      xAxisPoint: api.coord([api.value(0), 0]),
                    },
                    style: {
                      fill: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                          offset: 0,
                          color: `rgba(65, 137, 233, 1)`,
                        },
                        {
                          offset: 1,
                          color: `rgba(132, 185, 255, 1)`,
                        },
                      ]),
                    },
                  },
                  {
                    type: "CubeRight",
                    shape: {
                      api,
                      xValue: api.value(0),
                      yValue: api.value(1),
                      x: location[0],
                      y: location[1],
                      xAxisPoint: api.coord([api.value(0), 0]),
                    },
                    style: {
                      fill: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                          offset: 0,
                          color: `rgba(0, 77, 181, 1)`,
                        },
                        {
                          offset: 1,
                          color: `rgba(51, 133, 242, 1)`,
                        },
                      ]),
                    },
                  },
                  {
                    type: "CubeTop",
                    shape: {
                      api,
                      xValue: api.value(0),
                      yValue: api.value(1),
                      x: location[0],
                      y: location[1],
                      xAxisPoint: api.coord([api.value(0), 0]),
                    },
                    style: {
                      fill: "rgba(0, 64, 149, 1)",
                    },
                  },
                ],
              };
            },
            data: VALUE,
          },
        ],
        dataZoom: [
          {
            // 设置滚动条的隐藏与显示
            show: true,
            // 设置滚动条类型
            type: "slider",
            // 设置背景颜色
            backgroundColor: "rgb(19, 63, 100)",
            // 设置选中范围的填充颜色
            fillerColor: "rgb(16, 171, 198)",
            // 设置边框颜色
            borderColor: "rgb(19, 63, 100)",
            // 是否显示detail，即拖拽时候显示详细数值信息
            showDetail: false,
            // 数据窗口范围的起始数值
            startValue: 0,
            // 数据窗口范围的结束数值（一页显示多少条数据）
            endValue: 15,
            // empty：当前数据窗口外的数据，被设置为空。
            // 即不会影响其他轴的数据范围
            filterMode: "empty",
            // 设置滚动条宽度，相对于盒子宽度
            width: "50%",
            // 设置滚动条高度
            height: 8,
            // 设置滚动条显示位置
            left: "center",
            // 是否锁定选择区域（或叫做数据窗口）的大小
            zoomLoxk: true,
            // 控制手柄的尺寸
            handleSize: 0,
            // dataZoom-slider组件离容器下侧的距离
            bottom: 3,
          },
          {
            // 没有下面这块的话，只能拖动滚动条，
            // 鼠标滚轮在区域内不能控制外部滚动条
            type: "inside",
            // 滚轮是否触发缩放
            zoomOnMouseWheel: false,
            // 鼠标滚轮触发滚动
            moveOnMouseMove: true,
            moveOnMouseWheel: true,
          },
        ],
      };
      this.myChart.setOption(option);
      // 监听特定系列的点击事件
      this.myChart.on("click", "series", handle);
    },
  },
};
</script>

<style lang="scss" scoped></style>
