<template>
  <div class="mapBox map-page-content" ref="mapBox">
    <!-- 地图容器 -->
    <div :id="mapDiv" class="mapClass" ref="map"></div>
    <!-- 地名信息窗 -->
    <div
      class="place-name-point-info-window"
      ref="placename_infowindow"
      v-show="isPlaceNameInfoWindow"
      :style="{ minWidth: placeNameDetail.imageurl != '' ? '378px' : '290px' }"
    >
      <div
        class="img"
        v-if="placeNameDetail.imageurl != ''"
        :style="{
          backgroundImage: `url(${getImageURL(placeNameDetail.imageurl)})`,
        }"
      >
        <!-- 预览按钮 -->
        <imagePreview :url="placeNameDetail.imageurl"></imagePreview>
      </div>
      <div
        class="item"
        :style="{
          width: placeNameDetail.imageurl == '' ? '100%' : 'calc(100% - 100px)',
        }"
      >
        <div class="title">
          {{ placeNameDetail.name }}
        </div>
        <div class="top">
          <!-- 数据密级 -->
          <span class="level" v-if="$store.state.app.isAdmin ? true : false">{{
            placeNameDetail.securityLevel | filterSecurityLevel
          }}</span>
          <div @click="privePlaceNameDetail(placeNameDetail)">
            <img
              src="@/assets/images/icons/home/details.png"
              alt=""
              srcset=""
            />
            <!-- <span>详情</span> -->
          </div>
        </div>
        <p>
          <span>曾用名：{{ placeNameDetail.formerName }}</span>
        </p>
        <p>
          <span>经度：{{ placeNameDetail.lon }}</span>
        </p>
        <p>
          <span>纬度：{{ placeNameDetail.lat }}</span>
        </p>
        <!-- <el-divider></el-divider> -->
        <!-- <div class="bottom">
          <div @click="privePlaceNameDetail(placeNameDetail)">
            <img
              src="@/assets/images/icons/home/details.png"
              alt=""
              srcset=""
            />
            <span>详情</span>
          </div>
        </div> -->
      </div>
    </div>

    <!-- 搜索框 -->
    <div
      class="search"
      :class="legendShow === false ? 'search-legend-fold' : ''"
      v-if="!isAddPlaceName"
    >
      <div>
        <el-input
          placeholder="地名名称、十进制经纬度、编码"
          clearable
          suffix-icon="el-icon-search"
          v-model="placeName"
          @input="handlePlaceNameInput"
        >
        </el-input>
        <!-- 下拉框 -->
        <div class="place-name-list" v-show="placeNameSearchList.length > 0">
          <p>
            共查询相关地名<span>{{ placeNameSearchList.length }}</span
            >项
          </p>
          <div
            class="item"
            v-for="(item, key) in placeNameSearchList"
            :key="key"
          >
            <div class="title">
              {{ item.name }}
            </div>
            <div class="top">
              <span
                class="level"
                v-if="$store.state.app.isAdmin ? true : false"
                >{{ item.securityLevel | filterSecurityLevel }}</span
              >
              <div @click="placeNameLocation(item)">
                <img
                  src="@/assets/images/icons/home/location.png"
                  alt=""
                  srcset=""
                />
                <!-- <span>定位</span> -->
              </div>
              <div @click="privePlaceNameDetail(item)">
                <img
                  src="@/assets/images/icons/home/details.png"
                  alt=""
                  srcset=""
                />
                <!-- <span>详情</span> -->
              </div>
            </div>
            <p>
              <span>曾用名：{{ item.formerName }}</span>
            </p>
            <p>
              <span>经度：{{ item.lon }}</span>
            </p>
            <p>
              <span>纬度：{{ item.lat }}</span>
            </p>
            <!-- <el-divider></el-divider> -->
            <!-- <div class="bottom">
              <div @click="placeNameLocation(item)">
                <img src="@/assets/images/icons/home/location.png" alt="" srcset="" />
                <span>定位</span>
              </div>
              <div @click="privePlaceNameDetail(item)">
                <img src="@/assets/images/icons/home/details.png" alt="" srcset="" />
                <span>详情</span>
              </div>
            </div> -->
          </div>
        </div>
      </div>
    </div>

    <!-- 区域树 -->
    <div
      :class="legendShow === false ? 'tree-legend-fold' : ''"
      class="area-tree"
      v-if="!disabled && module.find((name) => name == 'region')"
      :style="{ left: isAddPlaceName ? '20px' : '' }"
    >
      <el-select-tree
        v-model="areaTreeSelect"
        placeholder="请选择区域"
        filterable
        :isRadio="isAddPlaceName ? true : false"
        :checkStrictly="true"
        :multiple="true"
        :isShowConfirm="false"
        :data="areaTreeData"
      />
    </div>

    <!-- 类型树 -->
    <div
      class="legend"
      :class="legendShow === false ? 'legend-fold' : ''"
      v-if="!isAddPlaceName && !disabled"
    >
      <div class="title">
        <div class="left">地名类型</div>
        <div class="right">
          <el-checkbox v-model="checkedAll" @change="regionCheckAll"
            >全选</el-checkbox
          >
        </div>
      </div>

      <!-- 收起按钮 -->
      <div class="fold" @click="legendShow = !legendShow">
        <span>地名类型</span>
        <span>
          <i
            class="el-icon-caret-left"
            style="font-size: 20px"
            v-if="legendShow"
          ></i>
          <i class="el-icon-caret-right" style="font-size: 20px" v-else></i>
        </span>
      </div>

      <div class="tree">
        <el-tree
          ref="tree"
          :data="legendData"
          show-checkbox
          node-key="id"
          :check-strictly="true"
          :default-expand-all="true"
          :expand-on-click-node="false"
          :default-checked-keys="defaultCheckedkeys"
          @check="getCheckData"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <!-- <span class="icon"> </span> -->
              <span class="text">{{ node.label }}</span>
            </span>
          </template>
        </el-tree>
      </div>
    </div>

    <!-- 编辑地名模式-顶部工具栏 -->
    <div class="tools" v-if="isAddPlaceName && !disabled">
      <div
        class="tools-item"
        v-if="module.find((name) => name == 'Point')"
        :style="{
          background: tools.editPlaceName.point.isOpen
            ? 'rgb(126, 186, 255,0.31)'
            : '',
        }"
        @click="editPlaceNameDraw('point')"
      >
        <img src="@/assets/images/icons/location.svg" alt="" srcset="" />
      </div>

      <div
        v-if="module.find((name) => name == 'LineString')"
        class="tools-item"
        :style="{
          background: tools.editPlaceName.line.isOpen
            ? 'rgb(126, 186, 255,0.31)'
            : '',
        }"
        @click="editPlaceNameDraw('line')"
      >
        <img src="@/assets/images/icons/line.svg" alt="" srcset="" />
      </div>

      <div
        class="tools-item"
        v-if="module.find((name) => name == 'Polygon')"
        :style="{
          background: tools.editPlaceName.rectangle.isOpen
            ? 'rgb(126, 186, 255,0.31)'
            : '',
        }"
        @click="editPlaceNameDraw('rectangle')"
      >
        <a class="box"></a>
      </div>

      <div
        v-if="module.find((name) => name == 'Polygon')"
        class="tools-item"
        :style="{
          background: tools.editPlaceName.polygon.isOpen
            ? 'rgb(126, 186, 255,0.31)'
            : '',
        }"
        @click="editPlaceNameDraw('polygon')"
      >
        <img src="@/assets/images/icons/polygon.svg" alt="" srcset="" />
      </div>

      <div class="tools-item" @click="toolsClear()">
        <img src="@/assets/images/icons/clear.svg" alt="" srcset="" />
      </div>

      <div class="divider"></div>
      <!-- 测面 area -->
      <div
        class="tools-item"
        :style="{
          background: tools.area.isOpen ? 'rgb(126, 186, 255,0.31)' : '',
        }"
        @click="openArea()"
      >
        <img src="@/assets/images/icons/area.svg" alt="" srcset="" />
      </div>
      <!-- 测距 ranging -->
      <div
        class="tools-item"
        :style="{
          background: tools.ranging.isOpen ? 'rgb(126, 186, 255,0.31)' : '',
        }"
        @click="openRanging()"
      >
        <img src="@/assets/images/icons/ranging.svg" alt="" srcset="" />
      </div>
    </div>

    <!-- 正常模式-顶部工具栏 -->
    <div class="tools" v-if="!isAddPlaceName">
      <!-- 测面 area -->
      <el-tooltip
        class="item"
        popper-class="atooltip"
        effect="dark"
        content="测面积"
        placement="bottom"
      >
        <div
          class="tools-item"
          :style="{
            background: tools.area.isOpen ? 'rgb(126, 186, 255,0.31)' : '',
          }"
          @click="openArea()"
        >
          <img src="@/assets/images/icons/area.svg" alt="" srcset="" />
        </div>
      </el-tooltip>

      <!-- 测距 ranging -->
      <el-tooltip
        class="item"
        popper-class="atooltip"
        effect="dark"
        content="测距离"
        placement="bottom"
      >
        <div
          class="tools-item"
          :style="{
            background: tools.ranging.isOpen ? 'rgb(126, 186, 255,0.31)' : '',
          }"
          @click="openRanging()"
        >
          <img src="@/assets/images/icons/rule.svg" alt="" srcset="" />
        </div>
      </el-tooltip>

      <div class="divider"></div>

      <!-- 标注 dimension-->
      <el-tooltip
        class="item"
        popper-class="atooltip"
        effect="dark"
        content="标注"
        placement="bottom"
      >
        <div
          class="tools-item"
          :style="{
            background: tools.dimension.isOpen ? 'rgb(126, 186, 255,0.31)' : '',
          }"
          @click="openDimension()"
        >
          <img
            :src="
              tools.dimension.isOpen
                ? require('@/assets/images/icons/edit-active.svg')
                : require('@/assets/images/icons/edit.svg')
            "
            alt=""
            srcset=""
          />
        </div>
      </el-tooltip>

      <!-- 导入excel -->
      <el-tooltip
        class="item"
        popper-class="atooltip"
        effect="dark"
        content="导入标注文件"
        placement="bottom"
      >
        <div class="tools-item" @click="openImportExcel()">
          <img src="@/assets/images/icons/import.svg" alt="" srcset="" />
        </div>
      </el-tooltip>

      <!-- 导出excel -->
      <el-tooltip
        class="item"
        popper-class="atooltip"
        effect="dark"
        content="导出标注文件"
        placement="bottom"
      >
        <div class="tools-item" @click="exportExcel()">
          <img src="@/assets/images/icons/export.svg" alt="" srcset="" />
        </div>
      </el-tooltip>

      <div class="divider"></div>

      <!-- 随机框选 -->
      <el-tooltip
        class="item"
        popper-class="atooltip"
        effect="dark"
        content="框选查询地名"
        placement="bottom"
      >
        <div
          class="tools-item"
          :style="{
            background: tools.randomBoxSelection.isOpen
              ? 'rgb(126, 186, 255,0.31)'
              : '',
          }"
          @click="openRandomBoxSelection()"
        >
          <!-- <a class="box" title="随机框选"></a> -->
          <img src="@/assets/images/icons/random.svg" alt="" srcset="" />
        </div>
      </el-tooltip>

      <el-tooltip
        class="item"
        effect="dark"
        popper-class="atooltip"
        content="十进制度"
        placement="bottom"
      >
        <div>
          <span>左上：</span>
          <el-input
            class="el-input"
            @input="handleInputCoordinate()"
            v-model="tools.randomBoxSelection.leftTopPonit"
            placeholder="经度,纬度"
          ></el-input>
        </div>
      </el-tooltip>

      <el-tooltip
        class="item"
        effect="dark"
        popper-class="atooltip"
        content="十进制度"
        placement="bottom"
      >
        <div>
          <span>右下：</span>
          <el-input
            class="el-input"
            @input="handleInputCoordinate()"
            v-model="tools.randomBoxSelection.rightBottomPonit"
            placeholder="经度,纬度"
          ></el-input>
        </div>
      </el-tooltip>

      <div class="tools-item" @click="toolsClear()">
        <img src="@/assets/images/icons/clear.svg" alt="" srcset="" />
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="options">
      <el-tooltip
        class="item"
        effect="dark"
        content="放大地图"
        placement="left"
      >
        <div @click="mapZoom('zoomIn')">
          <i class="el-icon-zoom-in"></i>
        </div>
      </el-tooltip>

      <el-tooltip
        class="item"
        effect="dark"
        content="缩小地图"
        placement="left"
      >
        <div @click="mapZoom('zoomOut')">
          <i class="el-icon-zoom-out"></i>
        </div>
      </el-tooltip>

      <el-tooltip
        class="item"
        effect="dark"
        content="进入全屏/退出全屏"
        placement="left"
      >
        <div @click="fullScreenFun()">
          <i class="el-icon-rank"></i>
        </div>
      </el-tooltip>

      <el-tooltip
        class="item"
        effect="dark"
        content="坐标转换"
        placement="left"
      >
        <div @click="openCoordinateTransformation('open')">
          <!-- <i class="el-icon-rank" @click="fullScreenFun()"></i> -->
          <img
            src="@/assets/images/icons/coordinate-transformation.svg"
            style="width: 28px"
            alt=""
            srcset=""
          />
        </div>
      </el-tooltip>
    </div>

    <!-- 状态栏 -->
    <div class="status-bar">
      <div>
        <div>
          经度：{{ this.mapStatus.DMS[0] }} ，纬度：{{ this.mapStatus.DMS[1] }}
        </div>
        <div>
          经度：{{ mapStatus.point[0].toFixed(4) }} ，纬度：{{
            mapStatus.point[1].toFixed(4)
          }}
        </div>
        <!-- + mapStatus.coordinateSystem -->
        <div>CGCS2000</div>
        <div
          v-if="!isAddPlaceName"
          class="coordinate2"
          :class="
            mapClickPoint.isActive
              ? 'active-transformation'
              : 'no-transformation'
          "
          @click="openTransformation(null, true)"
        >
          坐标转换
        </div>
        <div class="proportion">
          <span>{{ mapStatus.scale }}公里</span>
          <div></div>
        </div>
      </div>
    </div>
    <!-- 基础数据管理 -->
    <div class="base-data" v-if="!isAddPlaceName">
      <el-checkbox v-model="baseData.isRoad" @change="baseDataCheck('路网')"
        >路网</el-checkbox
      >
      <el-checkbox
        v-model="baseData.isPenaltyArea"
        @change="baseDataCheck('边界')"
        >边界</el-checkbox
      >
    </div>

    <preview ref="preview"></preview>

    <!-- 坐标转换展示窗口 -->
    <el-dialog
      title="坐标转换"
      :visible.sync="mapClickPoint.isTransformation"
      :destroy-on-close="true"
      width="30%"
      :modal="false"
      @closed="openTransformation"
    >
      <div class="transform">
        <p>地名名称：{{ mapClickPoint.name }}</p>
        <div>
          <p>
            <span>经度：</span>
            <span>{{ mapClickPoint.lon }}</span>
          </p>
          <p>
            <span>Y: </span>
            <span>{{ mapClickPoint.x }}</span>
          </p>
        </div>
        <div>
          <p>
            <span>纬度：</span>
            <span>{{ mapClickPoint.lat }}</span>
          </p>
          <p>
            <span>X: </span>
            <span>{{ mapClickPoint.y }}</span>
          </p>
        </div>
      </div>
    </el-dialog>

    <!-- 坐标转换弹窗 -->
    <el-dialog
      title="坐标转换"
      v-if="isoOpenCoordinateTransformation"
      @close="openCoordinateTransformation('close')"
      :visible="true"
      width="30%"
      append-to-body
    >
      <div class="Coordinate-Transformation">
        <el-row>
          <el-col :span="11">
            <el-input readonly v-model="coordinateTransformation.from" />
          </el-col>
          <el-col :span="2" style="text-align: center; cursor: pointer">
            <img
              @click="openCoordinateTransformation('switch')"
              src="@/assets/images/icons/exchange.svg"
              style="width: 28px"
            />
          </el-col>
          <el-col readonly :span="11">
            <el-input v-model="coordinateTransformation.to" />
          </el-col>
          <el-col :span="24" style="margin-top: 20px">
            <el-input
              v-model="coordinateTransformation.value"
              :placeholder="
                coordinateTransformation.mode == 0
                  ? '经度,纬度（英文状态,）'
                  : 'x,y（英文状态,）'
              "
            />
          </el-col>
        </el-row>
        <el-row
          style="margin-top: 20px"
          v-if="coordinateTransformation.mode == 1"
        >
          <el-col :span="8">
            <el-select
              v-model="coordinateTransformation.zoning"
              @change="switchZoning"
              placeholder="请选择几度分带"
            >
              <el-option
                v-for="item in coordinateTransformation.zonings"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="1" style="height: 1px"></el-col>
          <el-col :span="12">
            <el-select
              v-model="coordinateTransformation.epsg"
              placeholder="请选择分带EPSG"
              @change="epsgChange"
            >
              <el-option
                v-for="item in coordinateTransformation.epsgs"
                :key="item.value"
                :label="item.value + '--' + item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-col>
        </el-row>
        <p style="line-height: 20px; font-size: 14px">
          {{
            coordinateTransformation.mode == 0
              ? " 提示：为保证转换结果正确，请按提示正确填写坐标顺序，经度在前，纬度在后。示例：92.8,40.5"
              : " 提示：为确保转换结果正确，请按提示正确填写坐标顺序，x在前(对应转换后纬度)，y在后(对应转换后经度)。示例：3692148.1264，262039.4436。"
          }}
        </p>
        <div style="margin-top: 10px" v-if="coordinateTransformation.lon != ''">
          <el-row :gutter="20" type="flex">
            <el-col :span="3" style="text-align: right; padding: 0"
              >经度：</el-col
            >
            <el-col :span="8">{{ coordinateTransformation.lon }}</el-col>
            <el-col :span="3" style="text-align: right; padding: 0"
              >纬度：</el-col
            >
            <el-col :span="8">{{ coordinateTransformation.lat }}</el-col>
          </el-row>
          <el-row
            :gutter="20"
            type="flex"
            style="margin-top: 10px"
            v-if="coordinateTransformation.mode == 0"
          >
            <el-col :span="3" style="text-align: right; padding: 0">Y：</el-col>
            <el-col :span="8">{{ coordinateTransformation.x }}</el-col>
            <el-col :span="3" style="text-align: right; padding: 0">X：</el-col>
            <el-col :span="8">{{ coordinateTransformation.y }}</el-col>
          </el-row>
          <el-row :gutter="20" type="flex" style="margin-top: 10px" v-else>
            <el-col :span="3" style="text-align: right; padding: 0"
              >经度：</el-col
            >
            <el-col :span="8">{{ coordinateTransformation.x }}</el-col>
            <el-col :span="3" style="text-align: right; padding: 0"
              >纬度：</el-col
            >
            <el-col :span="8">{{ coordinateTransformation.y }}</el-col>
          </el-row>
        </div>
        <div style="text-align: center; margin-top: 20px">
          <el-button @click="openCoordinateTransformation('close')"
            >关闭</el-button
          >
          <el-button
            type="primary"
            @click="openCoordinateTransformation('convert')"
            >转换</el-button
          >
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getMapConfig } from "@/utils/map/maptalksConfig";
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import "@/utils/ProjData";
import drawTool from "@/utils/map/drawTool";
import { guid } from "@/utils/index";
import ElSelectTree from "@/components/el-select-tree/index.vue";
import { AreaApi } from "@/utils/db/AreaApi";
import parseShapeFile from "@/utils/map/parseShapefile";
import { exportExcelFile, importExcel } from "@/utils/files.js";
import { PlaceNameApi } from "@/utils/db/PlaceNameApi";
import { PlaceTypeApi } from "@/utils/db/PlaceTypeApi";

import { geojson2geometry, geometry2geojson } from "@/utils/map/parseGeoJson";
import { defaultLayerOptions } from "@/utils/map/maptalksConfig";
import preview from "./preview.vue";
import { BaseDataApi } from "@/utils/db/BaseDataApi";
import { Transform } from "@/utils/gis/transforms";
import imagePreview from "@/components/image-preview/index.vue";
import LatLon from "geodesy/latlon-spherical.js";
import { deepCopy } from "@/utils/index";
import { ConfigApi } from "@/utils/db/ConfigApi";
import { epsgs, zonings } from "@/utils/gis/espgList";
import {
  initDistanceTool,
  initAreaTool,
  isGeosJsonInRectangle,
  calculateRectangleCorners,
} from "@/utils/map/maptalksTools";
const { ipcRenderer } = require("electron");
function initEditPlaceName() {
  return {
    isOpen: false,
    type: "", //类型
    layer: null, //图层
    mapTool: null, //绘制工具
    isMapToolDraw: false, //绘图工具是否在进行绘制
    geojson: "", //地图绘制生成的geo文件
    // 点
    point: {
      isOpen: false,
    },
    // 线
    line: {
      isOpen: false,
    },
    // 矩形
    rectangle: {
      isOpen: false,
    },
    // 多边形
    polygon: {
      isOpen: false,
    },
  };
}
let areaTool = null;
let distanceTool = null;
function initCoordinateTransformation() {
  return {
    value: "",
    lon: "",
    lat: "",
    x: "",
    y: "",
    zoning: "",
    epsg: "",
    mode: 0,
    from: "CGCS2000地理坐标",
    to: "CGCS2000高斯投影坐标",
    zonings: [],
    epsgs: [],
    modes: [
      {
        from: "CGCS2000地理坐标", // 当前输入的坐标值对应的坐标系
        to: "CGCS2000高斯投影坐标", // 需要转换至什么坐标系
      },
      {
        from: "CGCS2000高斯投影坐标", // 当前输入的坐标值对应的坐标系
        to: "CGCS2000地理坐标", // 需要转换至什么坐标系
      },
    ],
    zone: 0,
  };
}
export default {
  name: "myMap",
  components: {
    ElSelectTree,
    preview,
    imagePreview,
  },
  props: {
    source: {
      type: String,
      default() {
        return "upload";
      },
    },
    // 是否正在添加编辑地名
    isAddPlaceName: {
      type: Boolean,
      default: false,
    },
    geojson: {
      type: [String, Object],
      default: "",
    },
    // 是否禁用编辑功能
    disabled: {
      type: Boolean,
      default: false,
    },
    // 外部调用时，开启的功能项
    module: {
      type: Array,
      default: function () {
        return ["Point", "Polygon", "LineString", "region"];
      },
    },
  },
  computed: {},
  watch: {},
  data() {
    return {
      isoOpenCoordinateTransformation: false, //是否打开坐标转换工具
      coordinateTransformation: initCoordinateTransformation(),
      icons: [], //自定义图标集合
      mapClickPoint: {
        name: "",
        center: "",
        lat: "",
        lon: "",
        x: "",
        y: "",
        isActive: false, //是否激活
        isTransformation: false, //是否激活坐标转换
      },
      input: null,
      checkedAll: false,
      mapDiv: "map" + new Date().getTime(),
      map: null,
      vectorLayer: null, //默认maptalks矢量图层
      areaTool: null, //测面工具
      distanceTool: null, //测距工具
      isPlaceNameInfoWindow: false, //地名标点信息窗是否显示
      placeName: "",
      placeNameDetail: {}, //地名标点信息窗数据源
      placeNameSearchList: [], //地名搜索列表
      allPlaceNameList: [], //所有地名
      allPlaceTypeList: [], //所有地名类型
      currentNodekey: [], //地名类型树选择的节点
      defaultCheckedkeys: [], //地名类型树默认选择的节点
      groupTypeName: [], //地名类型分组
      layerList: [], //图层集合
      markerLabelLayer: null, //地名标注图层
      areaLayerList: [], //区域图层集合
      treeNodeKeys: [],
      isClickVector: false, //是否点击了图形
      // 地图工具
      tools: {
        // 测距
        ranging: {
          isOpen: false, //是否打开
          point: [], //点集合
          markers: [], //矢量对象
          vectorLayer: null,
        },
        // 测面
        area: {
          isOpen: false, //是否打开
          point: [], //点集合
          markers: [], //矢量对象
          vectorLayer: null,
        },
        // 标注
        dimension: {
          isOpen: false, //是否打开
          point: [], //点集合
          markers: [], //矢量对象
          vectorLayer: null,
        },
        // 随机框选
        randomBoxSelection: {
          isOpen: false, //是否打开
          point: [], //点集合
          markers: [], //矢量对象
          vectorLayer: null,
          leftTopPonit: "", //左上角点坐标
          rightBottomPonit: "", //右下角点坐标
        },
        // 编辑地名
        editPlaceName: initEditPlaceName(),
      },
      //基础数据管理
      baseData: {
        isRoad: "",
        isPenaltyArea: "",
        roadLayer: null, //路网图层
        penaltyAreaLayer: null, //边界图层
        markers: [],
      },
      // 地图状态
      mapStatus: {
        point: [0, 0],
        coordinateSystem: "",
        scale: 0,
        DMS: [0, 0],
      },
      locationLayer: null, //地名定位图层
      markers: [], // 点集合
      areaTreeData: [], //区域树数据
      areaTreeSelect: "", //区域树选中项 多个id组成的字符串
      legendData: [], //类型树数据
      legendShow: true, //类型树是否显示
      transformObj: {},
      change2000: false,
      config: {
        name_text_color: "#FF0000", //
        name_text_size: 14,
      },
    };
  },
  filters: {
    filterSecurityLevel(val) {
      return val == 1 ? "一级" : val == 2 ? "二级" : "三级";
    },
  },
  watch: {
    // 监听区域树绑定值更改
    areaTreeSelect(val) {
      // console.log(val)
      if (this.isAddPlaceName) {
        // 添加编辑地名中，需要地图定位到区域
        // this.getDataAndRender(val);
      } else {
        this.getPageQueryData(val);
      }
    },
  },
  mounted() {
    this.initCoordinateTransformation();
    ipcRenderer.invoke("getIcons").then((result) => {
      this.icons = result;
    });
    this.transformObj = new Transform();
    this.initTalksMap();
    if (!this.isAddPlaceName) {
      this.getAllPlaceName();
      this.drawAreaList();
      this.getPlaceNameTypeTree();
    }
    this.getAreaTreeData();

    // 地名编辑-加载地名的geojson
    if (this.geojson != "") {
      this.createEditPlaceNameLayer();
      const geo = JSON.parse(this.geojson);
      this.tools.editPlaceName.geojson = this.geojson;
      if (geo.type == "FeatureCollection") {
        geo.features.forEach((item) => {
          this.drawGeoJSON(
            this.tools.editPlaceName.layer,
            JSON.stringify(item)
          );
        });
      } else {
        this.drawGeoJSON(this.tools.editPlaceName.layer, this.geojson);
      }
      this.mapScale(this.tools.editPlaceName.layer);
    }
    this.mapStatus.scale = Number(this.map.getScale() / 1000).toFixed(2);
    // 默认显示边界
    setTimeout(() => {
      this.baseData.isPenaltyArea = true;
      this.baseDataCheck("边界");
    }, 1000);
  },
  methods: {
    epsgChange(val) {
      console.log(val);
      this.coordinateTransformation.epsgs.forEach((item) => {
        if (item.value == val) {
          this.coordinateTransformation.zone = item.zone;
          console.log(item);
        }
      });
    },
    initCoordinateTransformation() {
      this.coordinateTransformation.zonings = zonings;
      // this.coordinateTransformation.epsgs =
    },
    // 打开坐标转换弹窗
    openCoordinateTransformation(type) {
      if (type == "open") {
        this.isoOpenCoordinateTransformation = true;
        this.initCoordinateTransformation();
      } else if (type == "switch") {
        // console.log(type);
        // 切换转换模式
        this.coordinateTransformation.x = "";
        this.coordinateTransformation.y = "";
        this.coordinateTransformation.lon = "";
        this.coordinateTransformation.lat = "";
        this.coordinateTransformation.value = "";
        switch (this.coordinateTransformation.mode) {
          case 0:
            this.coordinateTransformation.mode = 1;
            this.coordinateTransformation.from =
              this.coordinateTransformation.modes[1].from;
            this.coordinateTransformation.to =
              this.coordinateTransformation.modes[1].to;
            break;
          case 1:
            this.initCoordinateTransformation();
            this.coordinateTransformation.mode = 0;
            this.coordinateTransformation.from =
              this.coordinateTransformation.modes[0].from;
            this.coordinateTransformation.to =
              this.coordinateTransformation.modes[0].to;
            break;
        }
      } else if (type == "convert") {
        const trs = new Transform();
        let lon = "";
        let lat = "";
        if (this.coordinateTransformation.mode == 0) {
          // 经纬度转投影
          if (this.coordinateTransformation.value != "") {
            if (this.coordinateTransformation.value.indexOf("°") > -1) {
              const lonlat = this.coordinateTransformation.value.split(",");
              lon = Number(trs.DMSToDDD(lonlat[0])).toFixed(6);
              lat = Number(trs.DMSToDDD(lonlat[1])).toFixed(6);
              this.coordinateTransformation.lon = lon;
              this.coordinateTransformation.lat = lat;
              const data = trs.coordinateTransformation(lon, lat);
              this.coordinateTransformation.x = data.endLonlat.x;
              this.coordinateTransformation.y = data.endLonlat.y;
            } else {
              const lonlat = this.coordinateTransformation.value.split(",");
              const data = trs.coordinateTransformation(lonlat[0], lonlat[1]);
              console.log(lonlat);
              lon = trs.DDDToDMS(lonlat[0]);
              lat = trs.DDDToDMS(lonlat[1]);
              // console.log(data)
              this.coordinateTransformation.x = data.endLonlat.x;
              this.coordinateTransformation.y = data.endLonlat.y;
            }
          }
        } else {
          // 投影转经纬度
          if (this.coordinateTransformation.value != "") {
            const lonlat = this.coordinateTransformation.value.split(",");
            const data = trs.planeToGeodetic(
              lonlat[1],
              lonlat[0],
              this.coordinateTransformation.epsg,
              this.coordinateTransformation.zone
            );
            lon = Number(data[0]).toFixed(6);
            lat = Number(data[1]).toFixed(6);
            this.coordinateTransformation.x = trs.DDDToDMS(lon);
            this.coordinateTransformation.y = trs.DDDToDMS(lat);
          }
        }
        console.log(lon, lat);
        this.coordinateTransformation.lon = lon;
        this.coordinateTransformation.lat = lat;
      } else if (type == "close") {
        this.isoOpenCoordinateTransformation = false;
        this.coordinateTransformation = initCoordinateTransformation();
      }
    },
    switchZoning(val) {
      console.log(val);
      this.coordinateTransformation.epsgs = epsgs.find(
        (item) => item.value == val
      ).epsgs;
    },
    /**
     * 初始化地图
     */
    initTalksMap() {
      let configObj = getMapConfig();
      this.map = new maptalks.Map(this.mapDiv, configObj);
      areaTool = initAreaTool(this.map);
      distanceTool = initDistanceTool(this.map);
      distanceTool.disable();
      areaTool.disable();
      this.vectorLayer = new maptalks.VectorLayer("vector", {
        ...defaultLayerOptions,
      }).addTo(this.map);
      this.markerLabelLayer = new maptalks.VectorLayer("markerLabelLayer", {
        collision: true,
        collisionDelay: 250,
        forceRenderOnMoving: false,
        forceRenderOnZooming: true,
        forceRenderOnRotating: false,
      }).addTo(this.map);
      this.map.on("click", (e) => {
        this.mapClick(e, this.vectorLayer);
      });
      this.map.on("zoomend", (e) => {
        this.mapZoomend(e);
      });
      this.map.on("mousemove", (e) => {
        this.mapMouseMovement(e);
      });
    },
    /**
     * 文件上传
     */
    uploadFile() {
      const customEventHandler = (event, files) => {
        if (files.eventType == "uploadShp") {
          parseShapeFile(files.filePaths).then((geojson) => {
            this.clearEditPlaceName();
            // 序列化geojson
            this.tools.editPlaceName.geojson = JSON.stringify(geojson);
            this.createEditPlaceNameLayer();
            let marker = geojson2geometry(geojson);
            this.tools.editPlaceName.layer.addGeometry(marker);
            let coordinate = [];
            if (Array.isArray(marker)) {
              coordinate = marker[0].getCenter();
              marker = marker[0];
            } else {
              coordinate = marker.getCenter();
            }
            this.$emit(
              "callback-geojson",
              this.tools.editPlaceName.geojson,
              coordinate
            );
            if (this.isAddPlaceName) {
              // 获取地名的几何地理范围
              const extent = marker.getExtent();
              const p1 = new LatLon(extent.ymax, extent.xmax);
              const p2 = new LatLon(extent.ymin, extent.xmin);
              const d = p1.distanceTo(p2); // 404.3×10³ m

              // console.log(marker)
              if (d > 20000) {
                this.mapScale(marker);
              } else {
                // 地名几何范围间距小于20公里，按照20公里矩形缩放
                let center = marker.getCenter();
                center = Array.isArray(center) ? center[0] : center;
                const trs = new Transform();
                // 中心点经纬度的平面坐标
                const xy = trs.coordinateTransformation(center.x, center.y);
                const px = xy.endLonlat.x;
                const py = xy.endLonlat.y;

                let L = 10000;
                if (marker.type == "Point") {
                  // 点类型按照500米
                  L = 5000;
                }
                // console.log(trs.planeToGeodetic(px-20000,py+20000,xy.epsg))
                const p1 = trs.planeToGeodetic(px - L, py + L, xy.epsg);
                const p2 = trs.planeToGeodetic(px + L, py + L, xy.epsg);
                const p3 = trs.planeToGeodetic(px + L, py - L, xy.epsg);
                const p4 = trs.planeToGeodetic(px - L, py - L, xy.epsg);
                const geojson = {
                  type: "Feature",
                  geometry: {
                    type: "Polygon",
                    coordinates: [[p1, p2, p3, p4, p1]],
                  },
                  properties: {},
                };
                const geometry = geojson2geometry(geojson);
                this.mapScale(geometry);
              }
            }
            // 移除监听器
            ipcRenderer.removeListener("uploadFileWatch", customEventHandler);
          });
        }
      };
      ipcRenderer.on("uploadFileWatch", customEventHandler);
      ipcRenderer.send("uploadShp", { eventType: "uploadShp" });
    },

    /**
     * 路网点击
     */
    async baseDataCheck(id) {
      if (id == "路网") {
        if (this.baseData.roadLayer == null) {
          this.baseData.roadLayer = await new maptalks.VectorLayer(
            "roadLayer"
          ).addTo(this.map);
          if (this.baseData.isRoad) {
            const api = new BaseDataApi();
            const list = await api.getPageQueryData(
              { type: id },
              { pageSize: 1000000000 }
            );
            // console.log(list);
            list.forEach((point) => {
              // 地名类型为：点、线、面
              if (
                point.geojson != "" &&
                point.geojson != null &&
                point.geojson != "null"
              ) {
                const geo = JSON.parse(point.geojson);
                if (geo.type == "FeatureCollection") {
                  geo.features.forEach((item) => {
                    this.drawGeoJSONForLW(this.baseData.roadLayer, item, {
                      type: "placeName",
                      data: point,
                    });
                  });
                } else {
                  this.drawGeoJSONForLW(
                    this.baseData.roadLayer,
                    point.geojson,
                    {
                      type: "placeName",
                      data: point,
                    }
                  );
                }
              }
            });
          }
        } else {
          // 隐藏显示路网
          this.baseData.isRoad
            ? this.baseData.roadLayer.show()
            : this.baseData.roadLayer.hide();
        }
      } else if (id == "边界") {
        if (this.baseData.penaltyAreaLayer == null) {
          this.baseData.penaltyAreaLayer = new maptalks.VectorLayer(
            "penaltyArea"
          ).addTo(this.map);
          if (this.baseData.isPenaltyArea) {
            const api = new BaseDataApi();
            const list = await api.getPageQueryData(
              { type: id },
              { pageSize: 1000000000 }
            );
            // console.log(list);
            list.forEach((point) => {
              // 地名类型为：点、线、面
              if (
                point.geojson != "" &&
                point.geojson != null &&
                point.geojson != "null"
              ) {
                const geo = JSON.parse(point.geojson);
                if (geo.type == "FeatureCollection") {
                  geo.features.forEach((item) => {
                    this.drawGeoJSONForLW(
                      this.baseData.penaltyAreaLayer,
                      item,
                      {
                        type: "placeName",
                        data: point,
                      }
                    );
                  });
                } else {
                  this.drawGeoJSONForLW(
                    this.baseData.penaltyAreaLayer,
                    point.geojson,
                    {
                      type: "placeName",
                      data: point,
                    }
                  );
                }
              }
            });
          }
        } else {
          // 隐藏显示边界
          this.baseData.isPenaltyArea
            ? this.baseData.penaltyAreaLayer.show()
            : this.baseData.penaltyAreaLayer.hide();
        }
      }
    },
    /**
     * 类型树全选
     * @param {*} val
     */
    regionCheckAll(val) {
      this.legendData.forEach((item) => {
        // console.log(item)
        this.treeNodeKeys.push(item.id);
        if (item.children && item.children.length > 0) {
          item.children.forEach((a) => {
            this.treeNodeKeys.push(a.id);
          });
        }
      });

      if (val) {
        this.$refs.tree.setCheckedKeys(this.treeNodeKeys);
      } else {
        this.$refs.tree.setCheckedKeys([]);
      }
      // 调用节点点击函数
      const selectNodes = this.$refs.tree.getCheckedNodes();
      if (selectNodes.length > 0) {
        const labels = this.markerLabelLayer.getGeometries();
        // 此处图层控制需要匹配地名的几何范围、地图缩放级别
        this.layerList.forEach((layer) => {
          // console.log(layer)
          if (selectNodes.find((a) => a.id == layer._id)) {
            let geometrys = layer.getGeometries();
            layer.show();
            geometrys.forEach((a, key) => {
              // console.log(a)
              if (a.properties.type != "label" && "distance" in a.properties) {
                // 查找lable
                let lable = labels.find(
                  (item) =>
                    item.properties.type == "label" &&
                    item.properties.id == a.properties.id
                );
                // console.log(a.properties.distance,this.mapStatus.scale);
                if (a.properties.distance >= this.mapStatus.scale) {
                  if (lable) {
                    lable.show();
                  }
                }
              }
            });
          }
        });
      } else {
        const labels = this.markerLabelLayer.getGeometries();
        // 此处图层控制需要匹配地名的几何范围、地图缩放级别
        this.layerList.forEach((layer) => {
          // console.log(layer)
          let geometrys = layer.getGeometries();
          layer.hide();
          geometrys.forEach((a, key) => {
            labels.forEach((item) => {
              if (item.properties.layerId == layer._id) {
                item.hide();
              }
            });
          });
        });
      }
    },
    /**
     * 选中的树形结构
     * @param {*} data
     * @param {*} param1
     */
    getCheckData(data, { checkedKeys }) {
      const selectChildren = (data, checked) => {
        data &&
          data.children &&
          data.children.map((item) => {
            this.$refs.tree.setChecked(item.id, checked);
            if (data.children) {
              selectChildren(item, checked);
            }
          });
      };
      // 父级递归
      const parentNodesChange = (node) => {
        // console.log(node);
        if (node.parent) {
          for (let key in node) {
            if (key == "id") {
              // console.log(node[key]);
              this.$refs.tree.setChecked(node, true);
            }
          }
          if (node.parent && node.id !== 0) {
            parentNodesChange(node.parent);
          }
        }
      };

      if (checkedKeys.includes(data.id)) {
        // 选中
        let node = this.$refs.tree.getNode(data.id); // getNode(node-key)
        selectChildren(data, true); // 选中子节点
        parentNodesChange(node); // 选中父节点
      } else {
        selectChildren(data, false); // 取消子节点
      }

      // 选中的节点
      const nodes = this.$refs.tree.getCheckedNodes();
      const labels = this.markerLabelLayer.getGeometries();
      // 此处图层控制需要匹配地名的几何范围、地图缩放级别
      this.layerList.forEach((layer) => {
        // console.log(layer)
        if (nodes.find((a) => a.id == layer._id)) {
          let geometrys = layer.getGeometries();
          layer.show();
          geometrys.forEach((a, key) => {
            // console.log(a)
            if (a.properties.type != "label" && "distance" in a.properties) {
              // 查找lable
              let lable = labels.find(
                (item) =>
                  item.properties.type == "label" &&
                  item.properties.id == a.properties.id
              );
              // console.log(a.properties.distance,this.mapStatus.scale);
              if (a.properties.distance >= this.mapStatus.scale) {
                if (lable) {
                  lable.show();
                }
              }
            }
          });
        } else {
          layer.hide();
          labels.forEach((item) => {
            if (item.properties.layerId == layer._id) {
              item.hide();
            }
          });
        }
      });
    },
    /**
     * 地图缩放
     */
    mapScale(layer) {
      // -------地图缩放--------
      // 1.获取图层范围
      const extent = layer.getExtent();
      // 2.设置地图中心为图层中心
      this.map.setCenter(extent.getCenter());
      // 2.获取合适的地图缩放级别
      let zoom = this.map.getFitZoom(extent);
      this.map.setZoom(zoom);
    },
    getImageURL(val) {
      // console.log(val);
      if (val == "" || val == null) {
        return "";
      } else {
        return JSON.parse(val)[0];
      }
    },
    /**
     * 创建编辑模式图层:地名一个图层、区域一个图层
     */
    createEditPlaceNameLayer() {
      // 判断图层是否存在
      let layer = this.map.getLayer("edit");
      if (!layer) {
        this.tools.editPlaceName.layer = new maptalks.VectorLayer("edit", {
          ...defaultLayerOptions,
        }).addTo(this.map);
      }
      this.tools.editPlaceName.mapTool = new drawTool(
        this.map,
        this.tools.editPlaceName.layer,
        maptalks,
        this.drawEditPlaceNameMarker
      );
    },
    /**
     * 地图缩放事件处理函数
     * @param {*} e
     */
    mapZoomend(e) {
      // 获取当前地图的缩放级别
      const currentZoomLevel = this.map.getZoom();
      const scale = Number(this.map.getScale()).toFixed(0) / 1000;
      console.info(
        "当前地图缩放级别：" + currentZoomLevel + "--" + "1:" + scale + "公里"
      );
      this.mapStatus.scale = scale;
      // 遍历地名类型图层
      let labels = this.markerLabelLayer.getGeometries();
      this.layerList.forEach((item, key) => {
        if (item.isVisible()) {
          let geometrys = item.getGeometries();
          // console.log(geometrys)
          geometrys.forEach((a, key) => {
            if (a.properties.type != "label" && "distance" in a.properties) {
              // 查找lable
              let lable = labels.find(
                (item) =>
                  item.properties.type == "label" &&
                  item.properties.id == a.properties.id
              );
              // console.log(lable)
              if (a.properties.distance >= this.mapStatus.scale) {
                if (!a.isVisible()) {
                  a.show();
                  if (lable) {
                    lable.show();
                  }
                }
              } else {
                a.hide();
                if (lable) {
                  lable.hide();
                }
              }
            }
          });
        }
      });
      // 遍历区域图层
      this.areaLayerList.forEach((item, key) => {
        /**
         * 比例尺 <= 8公里时隐藏一级区域的label
         * 比例尺 <= 8公里时显示二级区域边界
         */
        if (item.isVisible()) {
          let geometrys = item.getGeometries();
          geometrys.forEach((a, key) => {
            if (a.properties.type == "label" && a.properties.areaType == 1) {
              // 一级区域label
              if (this.mapStatus.scale <= 8) {
                a.hide();
              } else {
                a.show();
              }
            }
            // console.log(a)
            if (a.properties.type == "marker" && a.properties.areaType == 2) {
              // 二级区域
              if (this.mapStatus.scale <= 8) {
                a.show();
              } else {
                a.hide();
              }
            }

            if (a.properties.type == "label" && a.properties.areaType == 2) {
              // 二级区域label
              if (this.mapStatus.scale <= 4 && this.mapStatus.scale >= 1.6) {
                a.show();
              } else {
                a.hide();
              }
            }
            // if (a.properties.type == "label" && a.properties.areaType == 2) {
            //   if (this.mapStatus.scale >= 6) {
            //     a.show();
            //   } else {
            //     a.hide();
            //   }
            // }
          });
        }
      });
    },
    /**
     * 地名编辑-绘制点线面
     */
    editPlaceNameDraw(type) {
      this.tools.editPlaceName.type = type;
      this.tools.editPlaceName.isOpen = true;
      this.tools.editPlaceName.isMapToolDraw = false;
      console.log(this.tools.editPlaceName);
      Object.keys(this.tools.editPlaceName).forEach((key) => {
        // console.log(this.tools.editPlaceName[key]);
        if (
          this.tools.editPlaceName[key] &&
          typeof this.tools.editPlaceName[key] == "object"
        ) {
          // console.log(key);
          if ("isOpen" in this.tools.editPlaceName[key]) {
            // console.log(typeof data);
            if (key == type) {
              this.tools.editPlaceName[key].isOpen =
                !this.tools.editPlaceName[key].isOpen;
            } else {
              // console.log(this.tools.editPlaceName[key]);
              this.tools.editPlaceName[key].isOpen = false;
            }
          }
        }
      });
      if (this.tools.editPlaceName.layer == null) {
        this.createEditPlaceNameLayer();
      } else {
        this.tools.editPlaceName.layer.clear();
      }
      switch (this.tools.editPlaceName.type) {
        case "line":
          this.tools.editPlaceName.mapTool.drawToolLine();
          this.tools.editPlaceName.isMapToolDraw = true;
          break;
        case "polygon":
          this.tools.editPlaceName.mapTool.setDrawTool("Polygon");
          this.tools.editPlaceName.isMapToolDraw = true;
          break;
        case "rectangle":
          this.tools.editPlaceName.mapTool.setDrawTool("Rectangle");
          this.tools.editPlaceName.isMapToolDraw = true;
          break;
      }
    },
    // 编辑地名模式-绘制地名
    drawEditPlaceNameMarker(params = null, coordinate) {
      if (params) {
        params.geometry.setProperties({ type: "placeName" });
        this.tools.editPlaceName.geojson = geometry2geojson(params.geometry);
        this.$emit(
          "callback-geojson",
          this.tools.editPlaceName.geojson,
          params.geometry.getCenter()
        );
      } else if (!this.tools.editPlaceName.isMapToolDraw) {
        if (this.tools.editPlaceName.layer) {
          this.tools.editPlaceName.layer.clear();
        }
        let marker = null;
        switch (this.tools.editPlaceName.type) {
          case "point":
            marker = this.drawPoint(
              this.tools.editPlaceName.layer,
              coordinate,
              {
                eventType: "editPoint",
              }
            );
            // console.log(marker);
            this.tools.editPlaceName.geojson = geometry2geojson(marker);
            this.$emit("callback-geojson", this.tools.editPlaceName.geojson, [
              coordinate,
            ]);
            break;
        }
      }
    },
    // 清除地名编辑
    clearEditPlaceName() {
      if (this.tools.editPlaceName.layer != null) {
        this.tools.editPlaceName.layer.clear();
        this.map.removeLayer(this.tools.editPlaceName.layer);
      }
      this.tools.editPlaceName = initEditPlaceName();
    },

    async getPageQueryData(value) {
      // console.log(value);
      const trs = new Transform();
      const api = new PlaceNameApi();
      if (value == "") {
        this.placeNameSearchList = [];
        return;
      }

      // 二级区域通过代码过滤
      // secondLevel: value != "" ? value.split(",") : "",
      let values =
        value != "" ? (value.indexOf(",") ? value.split(",") : [value]) : [""];
      let oneLevel = [];
      let secondLevel = [];
      values.forEach((item) => {
        let obj = this.areaTreeData.find((a) => a.name == item);
        if (obj) {
          // 一级区域
          oneLevel.push(item);
        } else {
          // 二级区域
          secondLevel.push(item);
        }
      });
      // console.log(oneLevel, secondLevel);
      let params = {};
      if (oneLevel.length > 0) {
        params = { oneLevel };
      }
      // console.log(params);
      let result = await api.getDataForArea(params);
      console.log(result);
      if (secondLevel.length > 0) {
        result = result.filter((item) => {
          let flag = false;
          if (item.secondLevel.indexOf(",") > -1) {
            secondLevel.forEach((b) => {
              item.secondLevel.split(",").forEach((c) => {
                if (c == b) {
                  flag = true;
                }
              });
            });
          } else {
            flag = secondLevel.find((a) => a == item.secondLevel)
              ? true
              : false;
          }
          return flag;
        });
      }

      if (result.length == 0) {
        this.placeNameSearchList = [];
        return;
      }
      this.placeNameSearchList = result.map((item) => {
        // console.log(item.center);
        return {
          ...item,
          lon:
            item.center != "" && item.center.indexOf("NaN") <= 1
              ? Number(item.center.split(",")[0])
              : "",
          lat:
            item.center != "" && item.center.indexOf("NaN") <= 1
              ? Number(item.center.split(",")[1])
              : "",
        };
      });
    },

    // 根据区域查询渲染地名
    async getDataAndRender(value) {
      const trs = new Transform();
      let layer = this.map.getLayer("regionEdit");
      if (!layer) {
        // 创建图层
        layer = new maptalks.VectorLayer("regionEdit", {
          ...defaultLayerOptions,
        }).addTo(this.map);
      }

      if (value == "") {
        console.log(value);
        this.map.removeLayer("regionEdit");
      }

      // 添加编辑地名中，需要地图定位到区域
      if (this.isAddPlaceName) {
        // 绘制区域
        const api = new AreaApi();
        const result = await api.getPageQueryData(
          { id: value },
          { pageSize: 1 }
        );
        // console.log(result);
        if (
          result &&
          result[0].geojson != "" &&
          result[0].geojson != null &&
          result[0].geojson != "null"
        ) {
          // console.log(layer);
          const marker = this.drawGeoJSONForLW(layer, result[0].geojson);
          this.mapScale(layer);
        }
      }

      if (layer && !this.isAddPlaceName) {
        layer.clear();
      }

      if (value != "" && !this.isAddPlaceName) {
        const api = new PlaceNameApi();
        // let typeList = await typeApi.getPageQueryData({}, { pageSize: 9999999 });
        const result = await api.getPageQueryData(
          { oneLevel: value.split(","), secondLevel: value.split(",") },
          { pageSize: 9999999 }
        );
        // console.log(result);
        const list = result.map((item) => {
          // console.log(typeof item.center);
          return {
            ...item,
            lon:
              item.center != ""
                ? Number(item.center.split(",")[0]).toFixed(2)
                : "",
            lat:
              item.center != ""
                ? Number(item.center.split(",")[1]).toFixed(2)
                : "",
          };
        });
        this.layerList.push(layer);
        list.forEach((point) => {
          // 地名类型为：点、线、面
          if (
            point.geojson != "" &&
            point.geojson != null &&
            point.geojson != "null"
          ) {
            const marker = this.drawGeoJSON(layer, point.geojson, {
              type: "placeName",
              data: point,
            });
            // marker.on("click", (e) => {
            //   this.isClickVector = true;
            //   this.mapClick(e, layer);
            //   return false;
            // });
          }
        });
      }
    },

    // 获取所有的地名
    async getAllPlaceName() {
      const api = new PlaceNameApi();
      const typeApi = new PlaceTypeApi();
      const configApi = new ConfigApi();
      const configInfo = await configApi.getConfigData();
      this.config = configInfo[0];
      let typeList = await typeApi.getPageQueryData({}, { pageSize: 9999999 });
      let nameList = await api.getPageQueryData({}, { pageSize: 9999999 });
      // console.log(typeList);
      this.allPlaceTypeList = typeList;
      this.allPlaceNameList = nameList;
      // 根据类型对地名分组
      let group = typeList.map((typeItem, key) => {
        let children = [];
        // console.log(typeItem)
        this.defaultCheckedkeys.push(typeItem.id);
        nameList.forEach((nameItem) => {
          if (nameItem.type == typeItem.id || nameItem.type == typeItem.name) {
            const coordinate =
              nameItem.center != null ? nameItem.center.split(",") : [0, 0];
            children.push({
              ...nameItem,
              lon: coordinate[0],
              lat: coordinate[1],
            });
          }
        });
        return { ...typeItem, children };
      });
      this.$refs.tree.setCheckedKeys(this.defaultCheckedkeys);
      this.groupTypeName = group;
      group.forEach((item) => {
        // console.log(item)
        // 创建图层
        const layer = new maptalks.VectorLayer(item.id, {
          collision: true,
          collisionDelay: 250,
          forceRenderOnMoving: false,
          forceRenderOnZooming: true,
          forceRenderOnRotating: false,
          style: {
            symbol: {
              lineColor: item.border_style,
              polygonFill: item.fill_style, // 填充颜色，这里设置为红色
              polygonOpacity: 0.32, // 可选，填充颜色的透明度
            },
          },
        }).addTo(this.map);
        this.layerList.push(layer);
        if (item.children.length > 0) {
          item.children.forEach((point) => {
            // 地名类型为：点、线、面
            if (
              point.geojson != "" &&
              point.geojson != null &&
              point.geojson != "null"
            ) {
              // console.log(point.geojson);
              const marker = this.drawGeoJSON(layer, point.geojson, {
                type: "placeName",
                name: point.name,
                data: point,
              });
              marker.on("click", (e) => {
                this.isClickVector = true;
                this.mapClick(e, layer);
                return false;
              });
            }
          });
        }
      });
    },

    // 获取地名类型
    async getPlaceNameTypeTree() {
      const api = new PlaceTypeApi();
      const data = await api.getTree();
      let treeData = data;
      treeData.sort((a, b) => {
        return Number(a.index) - Number(b.index);
      });
      treeData = treeData.map((item) => {
        if (item.parentid == "/" && item.children.length > 0) {
          item.children.sort((a, b) => {
            return Number(a.index) - Number(b.index);
          });
        }
        return item;
      });
      this.legendData = treeData;
      this.$refs.preview.init(treeData, null);
    },
    // 获取区域树数据
    async getAreaTreeData() {
      const api = new AreaApi();
      const res = await api.getTree();
      this.areaTreeData = res;
      this.$refs.preview.init(null, res);
    },

    // 请求区域数据，并绘制到图层
    async drawAreaList() {
      const api = new AreaApi();
      const res = await api.getPageQueryData({}, { pageSize: 999999 });
      // console.log(res);
      let layer = null;
      // 一级区域图层
      const oneAreaLayer = new maptalks.VectorLayer("oneArea", {
        ...defaultLayerOptions,
      }).addTo(this.map);
      // 二级区域图层
      const secondAreaLayer = new maptalks.VectorLayer("secondArea", {
        ...defaultLayerOptions,
      }).addTo(this.map);

      // 一级区域图层置底
      secondAreaLayer.bringToBack();
      oneAreaLayer.bringToBack();
      this.areaLayerList.push(oneAreaLayer);
      this.areaLayerList.push(secondAreaLayer);
      // 重排序
      const list = res.sort((a, b) => Number(a.index) - Number(b.index));
      list.forEach((item) => {
        if (
          item.geojson != "" &&
          item.geojson != null &&
          item.geojson != "null"
        ) {
          // console.log(item);
          const areaType = item.parentid == "/" ? 1 : 2;
          if (areaType == 1) {
            layer = oneAreaLayer;
          } else {
            layer = secondAreaLayer;
          }
          this.drawGeoJSONForRegion(layer, item.geojson, {
            name: item.name,
            areaType,
          });
        }
      });
    },
    // 地名定位
    placeNameLocation(e) {
      // 点击图层地名、点击搜索列表
      let data = null;
      if (e.target) {
        data = e.target.properties.data;
      } else {
        data = e;
      }
      // 获取地名所在图层
      // const id = this.allPlaceTypeList.find((item) => item.id == data.type).id;
      this.locationLayer =
        this.locationLayer ||
        new maptalks.VectorLayer("locationLayer", {
          ...defaultLayerOptions,
        }).addTo(this.map);
      console.log(typeof data.geojson);
      let geojson = data.geojson;
      if (geojson == "" || geojson == null) {
        console.log("地名没有geojson");
        // 默认生成点类型的geojson
      } else {
        // 地名存在两种状态，图层中存在、不存在
        // console.log(data)
        this.placeNameDetail = data;
        let marker = geojson2geometry(geojson);
        if (Array.isArray(marker)) {
          marker = marker[0];
        }
        this.isPlaceNameInfoWindow = true;
        this.locationLayer.addGeometry(marker);
        marker.setInfoWindow({
          content: this.$refs["placename_infowindow"],
          dx: 0,
          dy: -28, // 负值表示向上偏移
        });
        marker.openInfoWindow();
        // 获取地名的几何地理范围
        const extent = marker.getExtent();
        const p1 = new LatLon(extent.ymax, extent.xmax);
        const p2 = new LatLon(extent.ymin, extent.xmin);
        const d = p1.distanceTo(p2); // 404.3×10³ m

        // console.log(marker)
        if (d > 20000) {
          this.mapScale(marker);
        } else {
          // 地名几何范围间距小于20公里，按照20公里矩形缩放
          let center = marker.getCenter();
          center = Array.isArray(center) ? center[0] : center;
          const trs = new Transform();
          // 中心点经纬度的平面坐标
          const xy = trs.coordinateTransformation(center.x, center.y);
          const px = xy.endLonlat.x;
          const py = xy.endLonlat.y;

          let L = 10000;
          if (marker.type == "Point") {
            // 点类型按照500米
            L = 5000;
          }
          // console.log(trs.planeToGeodetic(px-20000,py+20000,xy.epsg))
          const p1 = trs.planeToGeodetic(px - L, py + L, xy.epsg);
          const p2 = trs.planeToGeodetic(px + L, py + L, xy.epsg);
          const p3 = trs.planeToGeodetic(px + L, py - L, xy.epsg);
          const p4 = trs.planeToGeodetic(px - L, py - L, xy.epsg);
          const geojson = {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [[p1, p2, p3, p4, p1]],
            },
            properties: {},
          };
          const geometry = geojson2geometry(geojson);
          this.mapScale(geometry);
        }
      }
    },
    // 查看地名详情
    privePlaceNameDetail(data) {
      console.log(data);
      this.$refs.preview.setRegionForm(data);
      this.$refs.preview.visible = true;
    },
    // 导入excel
    openImportExcel() {
      console.log("打开文件选择窗口");
      const that = this;
      importExcel().then((data) => {
        that.openDimension();
        const trs = new Transform();
        data.forEach((item, key) => {
          if (key > 0) {
            const lon = trs.DMSToDDD(item[2]);
            const lat = trs.DMMToDDD(item[1]);
            that.drawDimension(
              that.tools.dimension.vectorLayer,
              [lon, lat],
              item[item.length - 1]
            );
          }
        });
      });
    },

    // 导出excel
    async exportExcel() {
      let data = [];
      let index = 1;
      const trs = new Transform();
      this.tools.dimension.markers.forEach((item, key) => {
        // console
        if (item.properties && item.properties.type == "marker") {
          // 经纬度需要转换成时分秒
          // 平面直角需要使用经纬度进行转换
          // console.log(item._coordinates.x,item._coordinates.y)
          // const newCoordinates = [Number(item._coordinates.x).toFixed(8),Number(item._coordinates.y).toFixed(8)]
          // console.log(newCoordinates)
          const pm = trs.coordinateTransformation(
            item._coordinates.x,
            item._coordinates.y
          );
          const lon = trs.DDDToDMS(item._coordinates.x);
          const lat = trs.DDDToDMS(item._coordinates.y);

          data.push({
            序号: index,
            "大地纬度（B）": lat,
            "大地经度（L）": lon,
            "平面直角x（N）": pm.endLonlat.x,
            "平面直角Y（E）": pm.endLonlat.y,
            标注内容: item.name,
          });
          index += 1;
        }
      });

      console.log(this.tools.dimension.markers);
      exportExcelFile("标注数据excel", data);
    },

    /**
     * 解析绘制地名 geojson
     * @param {*} data json字符串
     */
    drawGeoJSON(vectorLayer, geojson, properties = {}) {
      // 地名是点线面
      let marker = geojson2geometry(geojson);
      if (Array.isArray(marker)) {
        marker = marker[0];
      }
      // 给地名添加像素大小、平面坐标、几何范围
      const pxsize = marker.getSize();
      const extent = marker.getExtent();
      const p1 = new LatLon(extent.ymax, extent.xmax);
      const p2 = new LatLon(extent.ymin, extent.xmin);
      const d = p1.distanceTo(p2); // 404.3×10³ m
      let distance = 0;
      if (d <= 20000) {
        if (marker.type == "Point") {
          // 点 5公里
          distance = 1.5;
        } else {
          // 线、面 20公里
          distance = 20;
        }
      } else {
        distance = d / 1000;
      }
      const id = guid();
      properties = {
        ...properties,
        id: id,
        pxsize: pxsize,
        extent: extent,
        distance: distance,
        // type: marker.type,
      };
      if (marker.type == "Point") {
        marker = this.drawPoint(vectorLayer, marker._coordinates, properties);
      } else {
        marker.setProperties(properties);
        vectorLayer.addGeometry(marker);
      }
      if (Array.isArray(marker)) {
        marker = marker[0];
      }
      // 创建一个 Label
      let options = {};
      if (distance == 5) {
        options = {
          textSymbol: {
            textVerticalAlignment: "bottom",
            textFill: this.config.name_text_color, // 设置文本颜色，使用十六进制颜色值
            // textFaceName: "sans-serif",
            textSize: this.config.name_text_size, // 设置字体大小
            // textDy: -100, // 调整文本的垂直偏移，使其出现在 Marker 下方
            textHorizontalAlignment: "center", // 文本水平对齐方式，可以根据需要调整
          },
        };
      } else {
        options = {
          textSymbol: {
            textVerticalAlignment: "bottom",
            textFill: this.config.name_text_color, // 设置文本颜色，使用十六进制颜色值
            textFaceName: "sans-serif",
            textSize: this.config.name_text_size, // 设置字体大小
            // textDy: 20, // 调整文本的垂直偏移，使其出现在 Marker 上方
            textHorizontalAlignment: "center", // 文本水平对齐方式，可以根据需要调整
          },
        };
      }
      // markerLabelLayer
      // 将地名label存放至 markerLabelLayer 图层
      // vectorLayer.addGeometry(label);
      const label = new maptalks.Label(
        properties.name,
        marker.getCenter(),
        options
      );
      this.markerLabelLayer.addGeometry(label);
      label.setProperties({ type: "label", id: id, layerId: vectorLayer._id });
      if (distance >= Number(this.mapStatus.scale)) {
        marker.show();
        label.show();
      } else {
        marker.hide();
        label.hide();
      }
      return marker;
    },
    /**
     * 解析绘制路网边界 geojson
     * @param {*} data json字符串
     */
    drawGeoJSONForLW(vectorLayer, geojson, properties = {}) {
      let marker = geojson2geometry(geojson);
      let point = null;
      if (marker.type == "Point") {
        point = this.drawPoint(vectorLayer, marker._coordinates, properties);
        return point;
      } else {
        vectorLayer.addGeometry(marker);
        return marker;
      }
    },
    /**
    绘制区域geoJson
     * @param {*} data json字符串
     */
    drawGeoJSONForRegion(vectorLayer, geojson, properties = {}) {
      // 区域是面
      let Geometry = geojson2geometry(geojson);

      console.log(Geometry);

      if (Array.isArray(Geometry)) {
        Geometry = Geometry[0];
      }
      vectorLayer.addGeometry(Geometry);
      Geometry.setProperties({
        type: "marker",
        ...properties,
      });
      const id = guid();
      // console.log("---------------------------");
      // console.log(Geometry.getExtent());
      // console.log(Geometry);
      // console.log(Geometry.getCenter());
      // 计算中心点的经度和纬度
      const extent = Geometry.getExtent();
      const centerLongitude = (extent.xmax + extent.xmin) / 2;
      const centerLatitude = (extent.ymax + extent.ymin) / 2;
      const center = [centerLongitude, centerLatitude];
      // console.log(center);
      // console.log("---------------------------");
      // 创建一个 Label
      const label = new maptalks.Label(properties.name, center, {
        // position: Geometry.getCenter(),
        offset: [0, 0], // 调整偏移量以使 label 展示在 Geometry 中间
        textSymbol: {
          textFill: " #000000", // 设置文本颜色，使用十六进制颜色值
          textFaceName: "sans-serif",
          textSize: this.config.name_text_size,
          // textDy: 20, // 调整文本的垂直偏移，使其出现在 Geometry 上方
          textHorizontalAlignment: "center", // 文本水平对齐方式，可以根据需要调整
        },
        properties: {
          type: "label",
          id: id,
          ...properties,
        },
      }).addTo(vectorLayer);
      if (properties.areaType == 2) {
        label.hide();
        Geometry.hide();
      }
      return Geometry;
    },

    /**
     * 清除tools
     */
    toolsClear() {
      // // 清除测面积工具
      this.clearArea();
      // // 清除测距工具
      this.clearRanging();
      // // 清除标注工具
      this.clearDimension();
      // // 清除导入
      // // 清除导出
      // // 清除随机框选
      this.clearRandomBoxSelection();
      // // 清除地名编辑
      this.clearEditPlaceName();
      // // 清除定位
      this.clearLocation();
      // // 清除默认图层
      this.vectorLayer.clear();
      if (this.areaTreeSelect == "") {
        this.placeNameSearchList = [];
      }
    },
    /**
     * 清除定位
     */
    clearLocation() {
      this.isPlaceNameInfoWindow = false;
      const layer = this.map.getLayer("locationLayer");
      if (layer) {
        layer.clear();
      }
    },
    /**
     * 打开随机框选
     */
    openRandomBoxSelection() {
      this.closeTool();
      this.tools.randomBoxSelection.isOpen =
        !this.tools.randomBoxSelection.isOpen;
      if (
        this.tools.randomBoxSelection.leftTopPonit != "" &&
        this.tools.randomBoxSelection.rightBottomPonit != ""
      ) {
        // this.handleInputCoordinate();
      } else if (!this.tools.randomBoxSelection.isOpen) {
        this.clearRandomBoxSelection();
      } else if (this.tools.randomBoxSelection.isOpen) {
        if (this.tools.randomBoxSelection.point.length == 0) {
          // 创建矢量图层
          this.tools.randomBoxSelection.vectorLayer = new maptalks.VectorLayer(
            "randomBoxSelection-vectorLayer",
            {
              ...defaultLayerOptions,
            }
          ).addTo(this.map);
          this.tools.randomBoxSelection.vectorLayer.bringToFront();
        }
        if (this.tools.randomBoxSelection.point.length == 0) {
          const that = this;
          function callback(e) {
            that.mapScale(e.geometry);
            let topLeft = that.tools.randomBoxSelection.point[0];
            let bottomRight = that.tools.randomBoxSelection.point[1];
            // that.filterRandom([topLeft, bottomRight]);
            that.filterRandom(e.geometry);
          }
          const draw = new drawTool(
            that.map,
            that.tools.randomBoxSelection.vectorLayer,
            maptalks,
            callback
          );
          draw.setDrawTool("Rectangle");
        }
      }
    },
    /**
     * 处理随机框选坐标输入
     */
    async handleInputCoordinate() {
      this.closeTool();
      if (
        this.tools.randomBoxSelection.leftTopPonit != "" &&
        this.tools.randomBoxSelection.leftTopPonit != ""
      ) {
        // 创建矢量图层
        if (this.tools.randomBoxSelection.vectorLayer == null) {
          this.tools.randomBoxSelection.vectorLayer = new maptalks.VectorLayer(
            "randomBoxSelection-vectorLayer",
            {
              ...defaultLayerOptions,
            }
          ).addTo(this.map);
        }
        let coord = this.tools.randomBoxSelection;
        if (
          coord.leftTopPonit != "" &&
          coord.rightBottomPonit != "" &&
          coord.leftTopPonit.includes(",") &&
          coord.rightBottomPonit.includes(",")
        ) {
          // 清空图层
          this.tools.randomBoxSelection.vectorLayer.clear();

          let diagonalPoint1 = coord.leftTopPonit.trim().split(",");
          let diagonalPoint2 = coord.rightBottomPonit.trim().split(",");
          diagonalPoint1 = diagonalPoint1.map((item) => Number(item));
          diagonalPoint2 = diagonalPoint2.map((item) => Number(item));
          const coordinate = calculateRectangleCorners(
            diagonalPoint1,
            diagonalPoint2
          );
          const Polygon = this.drawPolygon(
            this.tools.randomBoxSelection.vectorLayer,
            maptalks,
            coordinate
          ).addTo(this.tools.randomBoxSelection.vectorLayer);

          this.mapScale(Polygon);
          this.filterRandom(Polygon);
        }
      }
    },
    /**
     * 根据随机框选的矩形范围，搜索地名
     * @param {*} geometry
     */
    async filterRandom(geometry) {
      console.log("随机框选返回坐标");
      // console.log(geometry)
      // 搜索地名
      const api = new PlaceNameApi();
      const result = await api.getPageQueryData({}, { pageSize: 10000000 });
      // 过滤空间数据被绘制的矩形包含的地名
      const list = result.filter((item) => {
        if (item.geojson != "") {
          return isGeosJsonInRectangle(geometry.getExtent(), item.geojson);
        } else {
          return false;
        }
      });
      this.placeNameSearchList = list.map((item) => {
        item.lon = item.center.split(",")[0];
        item.lat = item.center.split(",")[1];
        return item;
      });
    },
    /**
     * 清除随机框选
     */
    clearRandomBoxSelection() {
      this.map.removeLayer(this.tools.randomBoxSelection.vectorLayer);
      this.tools.randomBoxSelection.point = [];
      this.tools.randomBoxSelection.vectorLayer = null;
      this.tools.randomBoxSelection.isOpen = false;
      // 重置地图缩放级别
      // this.map.setZoom(getMapConfig().zoom);
    },
    // 开始测距
    openRanging() {
      console.log("开始测距");

      this.closeTool();
      this.tools.ranging.isOpen = !this.tools.ranging.isOpen;
      if (this.tools.ranging.isOpen) {
        distanceTool.enable();
      } else {
        this.clearRanging();
      }
    },
    // 清除测距
    clearRanging() {
      this.tools.ranging.isOpen = false;
      distanceTool.disable();
      distanceTool.clear();
    },
    // 开始测面积
    openArea() {
      this.closeTool();
      this.tools.area.isOpen = !this.tools.area.isOpen;
      if (this.tools.area.isOpen) {
        areaTool.enable();
      } else {
        this.clearArea();
      }
    },
    // 清除测面积
    clearArea() {
      this.tools.area.isOpen = false;
      areaTool.disable();
      areaTool.clear();
    },
    /**
     * 关闭工具
     */
    closeTool() {
      // 关闭标注
      this.tools.dimension.isOpen = false;
      // 关闭测面积
      this.tools.area.isOpen = false;
      distanceTool.disable();
      // 关闭测距
      this.tools.ranging.isOpen = false;
      areaTool.disable();
      // 关闭随机框选
      this.tools.randomBoxSelection.isOpen = false;
    },

    mapZoom(type) {
      if (type == "zoomIn") {
        // 逐步放大地图
        this.map.zoomIn();
      } else {
        // 逐步缩小地图
        this.map.zoomOut();
      }
    },

    /**
     * 模糊搜索
     * @param {*} value
     */
    async handlePlaceNameInput(value) {
      // 名称、曾用名 精确搜索、模糊搜索
      // 编码、坐标 精确搜索
      const api = new PlaceNameApi();
      if (value != "") {
        const result = await api.getPageQueryData({}, { pageSize: 10000000 });
        // console.log(result)
        // 名称模糊、精确查询,曾用名模糊、精确查询
        let list = result.filter(
          (item) =>
            item.name.indexOf(value) > -1 || item.formerName.indexOf(value) > -1
        );
        if (list.length == 0) {
          // 编码精确查询
          list = result.filter((item) => item.code == value);
        }
        if (list.length == 0 && value.indexOf(",") > -1) {
          // 坐标精确查询
          const coordinate =
            value.indexOf("°") > -1
              ? this.transformObj.DMSToDDD(value.split(",")[0]) +
                "," +
                this.transformObj.DMSToDDD(value.split(",")[1])
              : value;
          // console.log(coordinate)
          list = result.filter((item) => item.center == coordinate);
        }
        this.placeNameSearchList = list.map((item) => {
          return {
            ...item,
            lon: item.center != null ? item.center.split(",")[0] : "",
            lat: item.center != null ? item.center.split(",")[1] : "",
          };
        });
      } else {
        this.placeNameSearchList = [];
      }
    },

    // 地图进入全屏
    fullScreenFun() {
      // return false;
      // 检测浏览器是否支持进入全屏模式
      var fullscreenEnabled =
        document.fullscreenEnabled ||
        document.mozFullScreenEnabled ||
        document.webkitFullscreenEnabled ||
        document.msFullscreenEnabled;
      if (fullscreenEnabled) {
        // 获取当前处于全屏模式的元素
        const fullscreenElement =
          document.fullscreenElement ||
          document.mozFullScreenElement ||
          document.webkitFullscreenElement;
        // 检测这个元素是否处于全屏模式
        if (fullscreenElement) {
          console.log("该元素处于全屏模式。");
          // 退出全屏模式
          try {
            if (fullscreenElement.exitFullscreen) {
              fullscreenElement.exitFullscreen();
            } else if (fullscreenElement.mozCancelFullScreen) {
              fullscreenElement.mozCancelFullScreen();
            } else if (fullscreenElement.webkitExitFullscreen) {
              fullscreenElement.webkitExitFullscreen();
            }
          } catch (err) {
            console.log(err);
          }
        } else {
          console.log("该元素不处于全屏模式。");
          let de = this.$refs.mapBox;
          //打开全屏
          if (de.requestFullscreen) {
            de.requestFullscreen();
          } else if (de.mozRequestFullScreen) {
            de.mozRequestFullScreen();
          } else if (de.webkitRequestFullScreen) {
            de.webkitRequestFullScreen();
          }
        }
      }
    },
    /**
     * 绘制多边形
     * @param {*} layer
     * @param {*} maptalks
     * @param {*} coordinate
     */
    drawPolygon(layer, maptalks, coordinate) {
      console.log(coordinate);
      const polygon = new maptalks.Polygon([[...coordinate]], {
        // 设置多边形的样式和属性
        symbol: {
          lineColor: "#0077FF", // 边框颜色
          lineWidth: 2, // 边框宽度
          polygonFill: "#0077FF", // 填充颜色
          polygonOpacity: 0.32, // 填充透明度
        },
      }).addTo(layer);
      return polygon;
    },
    // 打开标注
    openDimension() {
      console.log("开启标注");
      if (this.tools.dimension.isOpen === false) {
        this.closeTool();
        // 显示标注输入框
        this.tools.dimension.markers.forEach((item) => {
          console.log(item);
          if (item.options && item.options.windowId) {
            // console.log(item.options)
            document.getElementById(item.options.windowId).style.visibility =
              "visible";
            // item.show()
            // item.isVisible(true)
            // const id = item.options.inputId
            // document.getElementById(id).value =
          }
          // if (item.properties && item.properties.inputId) {
          //   let inputElement = document.getElementById(item.properties.inputId);
          //   if (inputElement) {
          //     inputElement.disabled = false;
          //   }
          // }
        });

        if (this.tools.dimension.vectorLayer == null) {
          this.tools.dimension.vectorLayer = new maptalks.VectorLayer(
            "dimension-vectorLayer",
            {
              ...defaultLayerOptions,
            }
          ).addTo(this.map);
          // this.tools.dimension.vectorLayer.bringToFront();
        }
      } else {
        // 隐藏标注输入框
        this.tools.dimension.markers.forEach((item) => {
          if (item.options && item.options.windowId) {
            // console.log(item.options.windowId)
            // item.hide()
            // item.isVisible(false)
            document.getElementById(item.options.windowId).style.visibility =
              "hidden";
          }
        });
      }
      this.tools.dimension.isOpen = !this.tools.dimension.isOpen;
    },
    // 清除标注
    clearDimension() {
      if (this.tools.dimension.isOpen === true) {
        this.tools.dimension.isOpen = false;
      }
      const clear = () => {
        this.tools.randomBoxSelection.leftTopPonit = "";
        this.tools.randomBoxSelection.rightBottomPonit = "";
        this.tools.dimension.markers.forEach((item) => item.remove());
        this.map.removeLayer(this.tools.dimension.vectorLayer);
        this.tools.dimension.vectorLayer = null;
        this.tools.dimension.markers = [];
      };
      if (this.tools.dimension.markers.length > 0) {
        // this.$message.warning("清除会一并清除当前标注点位，建议先导出标注!");
        this.$confirm("清除会一并清除当前标注点位，建议先导出标注", "提示", {
          confirmButtonText: "取消",
          cancelButtonText: "确认清除",
          type: "warning",
        })
          .then(() => {})
          .catch(() => {
            clear();
          });
      } else {
        clear();
      }
    },
    /**
     * 绘制标注点
     * @param {*} vectorLayer
     * @param {*} coordinate
     * @param {*} value
     */
    drawDimension(vectorLayer, coordinate, value = "") {
      // 创建点标记
      let id = guid();
      // 创建编辑工具
      const inputId = guid();
      const deleteIconId = guid();
      const windowId = guid();

      let marker = this.drawPointForDimension(vectorLayer, coordinate, {
        uid: id,
        name: "",
        inputId: inputId,
        deleteIconId: deleteIconId,
        windowId: windowId,
        iconUrl: `http://127.0.0.1:9090/point-icon/blue.png`,
        type: "marker",
      });
      let icons = "";
      const that = this;
      let images = [];
      this.icons.forEach((item) => {
        // const handle = (url=item)=>{
        //   marker.setSymbol({markerFile:url})
        // }
        const id = guid();
        icons += `<img id='${id}' src='${item}'/>`;
        images.push({
          url: item,
          id: id,
        });
      });
      const openId = guid();
      const iconsId = guid();
      const lonid = guid();
      const latid = guid();
      const buttonid = guid();
      // 标注窗口
      var options = {
        //'autoOpenOn' : 'click',  //set to null if not to open window when clicking on map
        single: false,
        width: 183,
        height: 105,
        custom: true,
        dx: -3,
        dy: -30,
        windowId: windowId,
        inputId: inputId,
        deleteIconId: deleteIconId,
        content: `
          <div class='dimension-view' id="${windowId}">
            <div class='all-icon' id="${iconsId}">${icons}</div>
            <div class='title'>添加标注</div>
            <div class="divider"></div>
            <div class="lonlat">
              <input placeholder="经度:十进制度/度分秒" id="${lonid}">
              <input placeholder="纬度:十进制度/度分秒" id="${latid}">
            </div>
            <div class='content'>
              <input placeholder="标注名称" value="${value}" id='${inputId}'></input>
            </div>
            <div class='button'>
                <i id="${deleteIconId}" class="el-icon-delete"></i>
                <span id="${openId}">更改图标</span>
                <span id="${buttonid}">重新定位</span>
            </div>
          </div>`,
      };
      let label = new maptalks.Label(value, marker.getCenter(), {
        textSymbol: {
          textFill: this.config.name_text_color, // 设置文本颜色，使用十六进制颜色值
          // textFaceName: "sans-serif",
          textSize: this.config.name_text_size, // 设置字体大小
          textDy: 20, // 调整文本的垂直偏移，使其出现在 Marker 上方
          textHorizontalAlignment: "center", // 文本水平对齐方式，可以根据需要调整
        },
        properties: {
          deleteIconId: deleteIconId,
          windowId: windowId,
          uid: id,
          type: "label",
        },
      });
      vectorLayer.addGeometry(label);
      // 标注点点击事件
      marker.on("click", (e) => {
        this.isClickVector = true;
        this.mapClick(e, vectorLayer);
        return false;
      });
      var infoWindow = new maptalks.ui.InfoWindow(options);
      infoWindow.addTo(vectorLayer).show(coordinate);
      const addEventHandle = () => {
        // 打开图标切换
        document.getElementById(openId).addEventListener("click", (e) => {
          document.getElementById(iconsId).style.visibility = "visible";
        });
        // 给图标添加样式
        images.forEach((item) => {
          document.getElementById(item.id).addEventListener("click", (e) => {
            marker.setSymbol({
              markerFile: item.url,
              markerWidth: 28,
              markerHeight: 28,
            });
            document.getElementById(iconsId).style.visibility = "hidden";
          });
        });
        // 标注名称输入框input事件
        document.getElementById(inputId).addEventListener("input", (e) => {
          let value = e.target.value;
          // console.log(e.target.value, id);
          if (value != "") {
            this.tools.dimension.markers = this.tools.dimension.markers.map(
              (item) => {
                // console.log(item)
                if (item.properties && item.properties.uid == id) {
                  item.name = e.target.value;
                  // console.log(item.name)
                }
                if (item.options && item.options.windowId) {
                  item.options.name = e.target.value;
                }
                if (
                  item.properties &&
                  item.properties.type == "label" &&
                  item.properties.uid == id
                ) {
                  // console.log(item)
                  item.setContent(e.target.value);
                }
                return item;
              }
            );
          }
        });
        // 删除按钮点击事件
        document.getElementById(deleteIconId).addEventListener("click", (e) => {
          let list = [];
          this.tools.dimension.markers.forEach((item, key) => {
            if (
              item.type &&
              item.type == "Point" &&
              item.properties.deleteIconId == e.target.id
            ) {
              list.push(item);
              item.remove();
            } else if (item.options.deleteIconId == e.target.id) {
              list.push(item);
              item.remove();
            }
          });

          list.forEach((item) => {
            // 清除this.tools.dimension.markers中的数据
            this.tools.dimension.markers.splice(item, 1);
          });
          list = null;
          // console.log(this.tools.dimension.markers);
        });
        // 经度输入框input事件
        // 纬度输入框input事件
        // 经纬度确认按钮点击事件
        document.getElementById(buttonid).addEventListener("click", (e) => {
          let lon = document.getElementById(lonid).value;
          let lat = document.getElementById(latid).value;
          const trs = new Transform();
          if (lon != "" && lat != "") {
            if (lon.indexOf("°") > -1) {
              // 度分秒格式
              lon = trs.DMSToDDD(lon);
              lat = trs.DMSToDDD(lat);
            } else {
              // 十进制度格式
            }
            console.log(lon, lat);
            // 标注点设置新的几何中心
            marker.setCoordinates([lon, lat]);
            // 窗口设置新的几何中心
            infoWindow.show([lon, lat]);
            // label设置新的几何中心
            label.setCoordinates([lon, lat]);
            addEventHandle();
          }
        });
      };
      addEventHandle();
      this.tools.dimension.markers.push(label);
      this.tools.dimension.markers.push(infoWindow);
      this.tools.dimension.markers.push(marker);
      this.tools.dimension.point.push([coordinate.x, coordinate.y]);
    },

    /**
     * 绘制标注线
     * @param {*} vectorLayer
     * @param {*} coordinate
     * @param {*} value
     */
    mapClick(e, vectorLayer) {
      const { coordinate, target } = e;
      // console.log(target);

      if (
        target.properties &&
        target.properties.type &&
        target.properties.type == "placeName"
      ) {
        console.log("点击了地名");
        this.mapClickPoint.name = target.properties.name;

        // 此处不应使用点击点的坐标，而应该使用地名的坐标
        // console.log(target.properties)
        // console.log(target.properties.data.center.split(","))
        this.openTransformation(
          { x: target.properties.data.lon, y: target.properties.data.lat },
          false,
          true
        );
        // 获取自定义属性
        const properties = target.getProperties();
        // console.log(properties);
        this.placeNameLocation(e);
        setTimeout(() => {
          this.isClickVector = false;
        }, 2000);
      } else if (!this.isClickVector) {
        console.log("点击了地图");
        // 开启了标注
        if (this.tools.dimension.isOpen) {
          console.log("标注模式");
          // 标注
          this.drawDimension(this.tools.dimension.vectorLayer, coordinate);
        } else if (this.tools.randomBoxSelection.isOpen) {
          console.log("随机框选");
          if (this.tools.randomBoxSelection.point.length < 2) {
            this.tools.randomBoxSelection.point.push([
              coordinate.x,
              coordinate.y,
            ]);
          }
        } else if (this.tools.editPlaceName.isOpen) {
          console.log("编辑地名");
          this.drawEditPlaceNameMarker(null, coordinate);
        } else {
          // 绘制标点
          // this.vectorLayer.clear();
          // this.drawPoint(this.vectorLayer, coordinate);
        }
      }
    },

    /**
     * 打开坐标转换
     * @param {*} coordinate
     * @param {*} isShow
     * @param {*} isActive
     */
    openTransformation(coordinate = null, isShow = false, isActive = false) {
      console.log(coordinate);
      if (coordinate == null && this.mapClickPoint.x != "" && isShow === true) {
        console.log("显示经纬度转换投影结果");
        this.mapClickPoint.isTransformation = true;
      } else if (isActive == true) {
        console.log("激活转换按钮、进行转换");
        this.mapClickPoint.isActive = true;
        let transformationData = this.transformObj.coordinateTransformation(
          coordinate.x,
          coordinate.y
        );
        this.mapClickPoint.lat = Number(coordinate.y).toFixed(6);
        this.mapClickPoint.lon = Number(coordinate.x).toFixed(6);
        this.mapClickPoint.x = Number(transformationData.endLonlat.x).toFixed(
          6
        );
        this.mapClickPoint.y = Number(transformationData.endLonlat.y).toFixed(
          6
        );
        // console.log(this.mapClickPoint);
      } else {
        console.log("关闭转换、重置");
        this.mapClickPoint.isTransformation = false;
        this.mapClickPoint.x = "";
        this.mapClickPoint.y = "";
        this.mapClickPoint.lat = "";
        this.mapClickPoint.lon = "";
        this.mapClickPoint.isActive = false;
      }
    },

    /**
     * 地图画点
     * @param {*} vectorLayer
     * @param {*} coordinate
     * @param {*} params
     */
    drawPoint(vectorLayer, coordinate, params) {
      // 创建一个点并添加到地图上
      let point = new maptalks.Marker(coordinate, {
        symbol: {
          markerFile: require("@/assets/images/icons/point.svg"),
          markerWidth: 28,
          markerHeight: 28,
          markerDx: 0,
          markerDy: 0,
          markerOpacity: 1,
        },
        // 自定义属性
        properties: params,
      }).addTo(vectorLayer);
      return point;
    },

    /**
     * 地图画点-标注模式
     * @param {*} vectorLayer
     * @param {*} coordinate
     * @param {*} params
     */
    drawPointForDimension(vectorLayer, coordinate, params) {
      // 创建一个点并添加到地图上
      let point = new maptalks.Marker(coordinate, {
        symbol: {
          markerFile: params.iconUrl,
          markerWidth: 28,
          markerHeight: 28,
          markerDx: 0,
          markerDy: 0,
          markerOpacity: 1,
        },
        // 自定义属性
        properties: params,
      }).addTo(vectorLayer);
      return point;
    },

    /**
     * 鼠标移动
     * @param
     */
    mapMouseMovement(e) {
      const { coordinate } = e;
      if (this.tools.ranging.isOpen || this.tools.area.isOpen) {
        return;
      }
      this.mapStatus.point = [coordinate.x, coordinate.y];
      if (this.change2000) {
        let transformationData = this.transformObj.coordinateTransformation(
          coordinate.x,
          coordinate.y
        );
        this.mapStatus.point = [
          transformationData.endLonlat.x,
          transformationData.endLonlat.y,
        ];
        // this.projectionName=transformationData.epsg
        // this.mapStatus.coordinateSystem = transformationData.epsg;
      } else {
        // this.mapStatus.coordinateSystem = "EPSG:4326";
        // this.projectionName="EPSG:4326";
      }

      this.mapStatus.DMS = [];
      this.mapStatus.DMS.push(this.transformObj.DDDToDMS(coordinate.x));
      this.mapStatus.DMS.push(this.transformObj.DDDToDMS(coordinate.y));
    },

    /**
     * 数据分类
     * @param {*} arrList
     * @param {*} typeStr
     */
    getDataClassification(arrList, typeStr) {
      return arrList.reduce((prev, cur) => {
        let type =
          cur.isAbnormal && cur.isAbnormal == 1
            ? cur[typeStr] + "abnormal"
            : cur[typeStr];
        if (Object.keys(prev).includes(type)) {
          prev[type].push(cur);
        } else {
          prev[type] = [];
          prev[type].push(cur);
        }
        return prev;
      }, {});
    },

    /**
     * 处理默认选中的数据
     * @param {*} list
     */
    getDefaultData(list) {
      let arr = [];
      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        if (item.includes("abnormal")) {
          arr.push(item.replace("abnormal", ""));
        } else {
          arr.push(item);
        }
      }
      return [...new Set(arr)];
    },

    /**
     * 隐藏弹框
     */
    closeTipBox() {
      this.tipBox.closeInfoWindow();
    },
  },
};
</script>

<style lang="scss">
.maptalks-msgBox {
  background: #ffffff;
  border-radius: 4px 4px 4px 4px;
  opacity: 1;
  border: 1px solid #c6cdde;
}
.transform {
  // display: flex;

  & > div {
    width: 100%;
    display: flex;

    & > p {
      width: 50%;
    }
  }
}

.tip-content {
  width: 288px;
  background: #ffffff;
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  border-radius: 4px;
  padding: 10px 0;
  position: relative;

  .tip-title {
    font-size: 14px;
    font-weight: 600;
    color: #1f263e;
    line-height: 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f1f1f1;
    padding: 0 15px 6px 15px;

    .close {
      cursor: pointer;
      font-size: 12px;
      color: #1f263e;
    }
  }

  .tip-content-box {
    padding: 10px 15px;
    max-height: 200px;
    overflow: auto;

    .tip-content-box-item {
      font-size: 12px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.65);

      line-height: 22px;
      display: flex;

      div {
        flex: 1;
      }

      span {
        font-weight: 400;
        color: rgba(0, 0, 0, 0.85);
        line-height: 22px;
      }
    }
  }

  .tip-arrow {
    position: absolute;
    display: inline-block;
    height: 0;
    width: 0;
    border-top: 8px solid #fff;
    border-bottom: 8px solid transparent;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    bottom: -16px;
    left: 50%;
    transform: translate(-50%);
  }
}

.dimension-view {
  display: flex;
  // align-items: center;
  flex-direction: column;
  box-shadow: 0px 3px 6px 1px rgba(0, 0, 0, 0.16);
  border-radius: 4px 4px 4px 4px;
  width: 300px;
  // height: 141px;
  padding-bottom: 6px;
  background: #ffffff;
  opacity: 1;

  .lonlat {
    display: flex;
    flex-direction: column;
    padding: 0px 7px;
    & input {
      margin-bottom: 5px;
      /* border-color: #C6CDDE; */
      border: 1px solid #c6cdde;
      border-radius: 4px;
      height: 22px;
    }
  }

  .all-icon {
    visibility: hidden;
    position: absolute;
    display: flex;
    flex-wrap: wrap;
    right: -54%;
    top: 0%;
    height: 93%;
    min-width: 50%;
    background: #fff;
    border-radius: 3px;
    padding: 4px;
    img {
      width: 28px;
      height: 28px;
      margin: 4px;
    }
  }
  .title {
    margin: 6px 13px;
    font-size: 14px;
    font-family: Source Han Sans CN, Source Han Sans CN;
    font-weight: 500;
    color: #001a58;
  }
  .divider {
    width: 100%;
    height: 1px;
    opacity: 1;
    background-color: #e3e6ef;
    margin-bottom: 12px;
  }
  .content {
    display: flex;
    align-items: center;
    justify-content: space-around;
    input {
      width: 280px;
      height: 28px;
      background: #ffffff;
      border-radius: 4px 4px 4px 4px;
      opacity: 1;
      border: 1px solid #c6cdde;
    }
  }

  .button {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    i {
      font-size: 14px;
      color: red;
      margin-right: 10px;
    }
    span {
      font-size: 14px;
      font-family: Source Han Sans CN, Source Han Sans CN;
      font-weight: 400;
      color: #0060ce;
      line-height: 0px;
      margin-right: 10px;
    }
  }
}
</style>

<style lang="scss" scoped>
.Coordinate-Transformation {
  & > p {
    color: #e7a23d;
    font-size: 12px;
  }
}
.tree-legend-fold {
  left: 340px !important;
}

.base-data {
  position: absolute;
  top: calc(50% - 60px);
  right: 10px;
  width: 60px;
  height: 60px;
  padding: 3px;
  background: #fff;
  /* padding: 10px; */
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0px 0px 6px 1px rgba(0, 0, 0, 0.16);
  border-radius: 0px 0px 0px 0px;

  // align-items: center;
  /* font-size: 12px; */
  ::v-deep .el-checkbox__label {
    font-size: 14px !important;
  }

  ::v-deep .el-checkbox {
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

::v-deep .el-autocomplete-suggestion {
  max-height: 200px;
}

.mapBox {
  position: relative;
  cursor: pointer;

  .mapClass {
    width: 100%;
    height: 100%;
    background-color: #fdf9f2;
  }

  // 地名地图标记点信息窗
  .place-name-point-info-window {
    display: flex;
    flex-direction: row;
    // align-items: center;
    padding-top: 14px;
    background-color: #fff;
    border-radius: 4px 4px 4px 4px;

    & > .img {
      width: 120px;
      height: 120px;
      border-radius: 4px 4px 4px 4px;
      border: 1px solid #c6cdde;
      overflow: hidden;
      // background-position: center;
      background-size: cover;
      background-repeat: no-repeat;

      img {
        width: 100%;
        // height: 100%;
      }
    }

    .item {
      // min-width: calc(100% - 100px);
      // width: auto;
      & > p {
        width: 100%;
        text-indent: 1rem;
        font-size: 14px;
        color: #53638b;
        margin: 9px 0;

        & > span:nth-child(2) {
          margin-left: 24px;
        }
      }

      & > .title {
        white-space: normal;
        color: #001a58;
        overflow-wrap: anywhere;
        font-size: 16px;
        width: 90%;
        padding-left: 16px;
        margin-bottom: 8px;

        & > span:nth-child(1) {
          width: 70%;
          display: block;
        }

        & > span:nth-child(2) {
          margin-left: 10px;
          font-size: 12px;
          // line-height: 22px;
          text-indent: 0;
          width: 44px;
          height: 20px;
          line-height: 20px;
          color: #fff;
          text-align: center;
          display: inline-block;
          background: linear-gradient(104deg, #ce0000 0%, #ff5656 100%);
          border-radius: 13px;
          opacity: 1;
          // border: 1px solid #ff8797;
        }
      }

      .top {
        display: flex;
        justify-content: flex-end;
        img {
          width: 18px;
          height: 18px;
        }
        .level {
          margin-right: 15px;
          font-size: 12px;
          text-indent: 0;
          width: 44px;
          height: 20px;
          line-height: 20px;
          color: #fff;
          text-align: center;
          display: inline-block;
          background: linear-gradient(
            104deg,
            #ce0000 0%,
            #ff5656 100%
          ) !important;
          border-radius: 13px;
          opacity: 1;
        }
      }

      & ::v-deep .el-divider {
        margin: 6px 0;
      }

      .bottom {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: right;

        & > div {
          cursor: pointer;
          display: flex;
          flex-direction: row;
          display: flex;
          justify-content: right;
          width: 50%;
          margin-bottom: 5px;

          // cursor: pointer;
          img {
            width: 18px;
            margin-right: 5px;
          }

          span {
            font-size: 16px;
            color: #0060ce;
          }
        }
      }
    }
  }

  .search-legend-fold {
    left: 30px !important;
  }

  // 搜索
  .search {
    position: absolute;
    top: 20px;
    left: 260px;
    border-radius: 4px;
    width: 300px;

    ::v-deep .el-input--small .el-input__inner {
      height: 38px;
      line-height: 38px;
    }

    ::v-deep .el-input--small .el-input__icon {
      line-height: 38px;
    }

    & > div {
      display: flex;
      white-space: nowrap;
      font-size: 16px;
      align-items: center;
      flex-direction: column;

      ::v-deep .el-input {
        box-shadow: 0px 2px 6px 0px rgb(0 0 0 / 10%);
      }

      .place-name-list {
        width: calc(100% - 22px);
        max-height: 77vh;
        overflow-y: scroll;
        overflow-x: hidden;
        background-color: #fff;
        margin-top: 6px;
        padding: 0px 8px 14px 14px;
        border-radius: 4px 4px 4px 4px;
        opacity: 1;
        border: 1px solid #c6cdde;
        & > p {
          font-size: 14px;
          font-family: "Source Han Sans CN-Regular";
          font-weight: 400;
          color: #53638b;
          // line-height: 0px;
          text-align: left;
          width: 100%;

          & > span {
            color: #0060ce;
            font-size: 16px;
            font-family: "Source Han Sans CN-Bold";
          }
        }

        .item {
          margin-top: 8px;
          padding-top: 14px;
          background: linear-gradient(
            180deg,
            #ddeaf8 0%,
            #e8f1fa 20%,
            #f5f9fd 53%,
            #ffffff 100%
          );
          border-radius: 4px 4px 4px 4px;
          opacity: 1;
          border: 1px solid #c6cdde;
          // width: 100%;

          & > p {
            width: 100%;
            text-indent: 1rem;
            font-size: 14px;
            color: #53638b;
            margin: 8px 0;

            & > span:nth-child(2) {
              // margin-left: 24px;
            }
          }

          .title {
            white-space: normal;
            color: #001a58;
            overflow-wrap: anywhere;
            font-size: 16px;
            width: 90%;
            padding-left: 16px;
            margin-bottom: 8px;
          }

          .top {
            display: flex;
            justify-content: flex-end;

            & > div {
              display: flex;
              flex-direction: row;
              display: flex;
              justify-content: center;
              // width: 50%;
              margin: 0 8px;
              // margin-bottom: 5px;
              cursor: pointer;

              img {
                width: 18px;
                height: 18px;
                // margin-right: 5px;
              }

              span {
                font-size: 16px;
                color: #0060ce;
              }
            }
          }

          .level {
            margin-right: 15px;
            font-size: 12px;
            text-indent: 0;
            width: 44px;
            height: 20px;
            line-height: 20px;
            color: #fff;
            text-align: center;
            display: inline-block;
            background: linear-gradient(
              104deg,
              #ce0000 0%,
              #ff5656 100%
            ) !important;
            border-radius: 13px;
            opacity: 1;
          }

          & ::v-deep .el-divider {
            margin: 6px 0;
          }
        }
      }

      .label {
        padding-right: 6px;
        font-size: 12px;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.85);
        line-height: 22px;
      }

      .icon-quanping1 {
        font-size: 18px;
        color: #099dfd;
        margin-left: 10px;
      }
    }
  }

  // 区域树
  .area-tree {
    background-color: #fff;
    height: 38px;
    position: absolute;
    display: flex;
    top: 20px;
    left: 570px;
    width: 300px;
    // border: 1px solid #eee;
    box-shadow: 0px 2px 6px 0px rgb(0 0 0 / 10%);
    border-radius: 4px;

    & .el-select {
      height: 100%;

      ::v-deep .el-input {
        // height: 38px !important;
        height: 100% !important;

        & .el-input--mini,
        .el-input__inner {
          height: 38px !important;
        }
      }
    }
  }

  // 图例
  .legend {
    width: 218px;
    height: calc(100% - 28px);
    z-index: 9;
    // overflow: hidden;
    background-color: #fff;
    position: absolute;
    top: 0px;
    left: 0px;
    padding: 14px 16px;
    box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.1);

    // border-radius: 4px;
    & > .fold {
      position: absolute;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      right: -27px;
      width: 20px;
      // height: 60px;
      background: #fff;
      padding: 8px 3px;
      top: 50%;
      font-size: 12px;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      // font-weight: 400;
      color: #0060ce;
      // line-height: 9px;
      background: #ffffff;
      box-shadow: 0px 2px 3px 1px rgba(0, 0, 0, 0.16);
      border-radius: 0px 5px 5px 0px;
      opacity: 1;

      & > span {
        width: 12px;
        display: flex;
        justify-content: center;
      }
    }

    ::v-deep .el-tree {
      .el-tree-node__expand-icon {
        // display: none;
      }
    }

    .tree {
      height: calc(100% - 100px);
      overflow: auto;
    }

    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .left {
        font-weight: 600;
        color: #000a12;
        line-height: 20px;
      }

      .right {
        font-size: 11px;
        font-weight: 300;
        color: #0190e3;
        line-height: 16px;
        cursor: pointer;

        .iconfont {
          font-size: 11px;
        }
      }
    }

    .custom-tree-node {
      display: flex;
      justify-content: center;
      align-items: center;

      .icon {
        margin-right: 6px;

        .line {
          width: 10px;
          display: inline-block;
          font-weight: bold;
        }

        img {
          width: 12px;
          height: 12px;
        }
      }

      .text {
        font-weight: 400;
        color: rgba(31, 38, 62, 0.5);
        line-height: 17px;
        font-size: 13px;
      }
    }
  }

  .legend-fold {
    left: calc(-218px + -32px);
  }

  // 工具栏
  .tools {
    background-color: #fff;
    position: absolute;
    top: 20px;
    right: 10px;
    height: 50px;
    border: 1px solid #eee;
    box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    display: flex;
    align-items: center;

    ::v-deep .el-input__inner {
      width: 130px;
      height: 24px;
      font-size: 13px;
    }

    & > div {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin: 0 5px;

      & > span {
        font-size: 16px;
        line-height: 16px;
        display: inline-block;
        min-width: 48px;
      }
    }

    & .tools-item {
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      img {
        width: 24px;
      }

      & > .box {
        display: inline-block;
        width: 20px;
        height: 13px;
        border-color: #53638b;
        border-radius: 2px 2px 2px 2px;
        opacity: 1;
        border: 2px solid #53638b;
      }
    }

    .divider {
      width: 2px;
      height: 20px;
      // margin: 0 5px;
      background-color: #ccc;
    }

    .label {
      padding-right: 6px;
      font-size: 12px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.85);
      line-height: 22px;
    }

    .icon-quanping1 {
      font-size: 18px;
      color: #099dfd;
      margin-left: 10px;
    }
  }

  // 操作栏
  .options {
    // background-color: #fff;
    position: absolute;
    bottom: 43px;
    right: 10px;
    // left: 300px;
    // border: 1px solid #eee;
    // box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.1);
    border-radius: 4px;

    & > div {
      background-color: #fff;
      padding: 10px;
      display: flex;
      flex-direction: column;
      white-space: nowrap;
      font-size: 20px;
      align-items: center;
      margin-bottom: 5px;

      & i {
        margin-bottom: 5px;
      }

      .label {
        padding-right: 6px;
        font-size: 12px;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.85);
        line-height: 22px;
      }

      .icon-quanping1 {
        font-size: 18px;
        color: #099dfd;
        margin-left: 10px;
      }
    }
  }

  // 状态栏
  .status-bar {
    position: absolute;
    right: 0px;
    bottom: 0px;
    height: 34px;
    width: 100%;
    justify-content: right;
    color: #fff;
    background: rgba(0, 0, 0, 0.44);
    border-radius: 0px 0px 0px 0px;

    & > div {
      position: absolute;
      right: 50px;
      height: 100%;
      display: flex;
      align-items: center;

      & > div {
        margin: 0 7px;
        font-size: 14px;
        // position: relative;
      }

      .coordinate2 {
        cursor: pointer;
        height: 14px;
        // line-height: 12px;
        font-size: 12px;
        font-family: Source Han Sans CN-Regular, Source Han Sans CN;
        font-weight: 400;
      }

      .active-transformation {
        color: #54e8ff;
        border-bottom: 1px solid #54e8ff;
      }

      .no-transformation {
        color: #ccc;
        border-bottom: 1px solid #ccc;
      }

      .proportion {
        position: relative;

        span {
          font-size: 14px;
          color: #ffffff;
          font-weight: 400;
          // margin-bottom: -5px;
          display: block;
          line-height: 28px;
        }

        div {
          width: 100%;
          height: 8px;
          border: 1px solid #fff;
          border-top: none;
          position: absolute;
          bottom: 4px;
        }
      }

      & span {
        margin: 0 5px;
      }
    }
  }
}
</style>
