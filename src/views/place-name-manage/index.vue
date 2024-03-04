<template>
  <div class="page-content">
    <div class="content" v-show="!open">
      <el-form
        ref="searchForm"
        v-model="searchForm"
        class="search-form"
        label-suffix=":"
      >
        <el-row>
          <el-col :span="4">
            <el-form-item label="编码" label-width="60px">
              <el-input
                v-model="searchForm.code"
                clearable
                placeholder="请输入编码"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="名称" label-width="60px">
              <el-input
                v-model="searchForm.name"
                clearable
                placeholder="请输入名称"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="地名类型" label-width="80px">
              <el-select-tree
                v-model="searchForm.type"
                clearable
                placeholder="请选择"
                filterable
                :multiple="true"
                :isRadio="true"
                :checkStrictly="true"
                :data="legendData"
              />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="所属区域" label-width="80px">
              <el-select-tree
                v-model="searchForm.oneLevel"
                placeholder="请选择区域"
                filterable
                :multiple="true"
                :isRadio="true"
                :checkStrictly="true"
                :data="areaTreeData"
              />
            </el-form-item>
          </el-col>
          <el-col :span="5" v-if="$store.state.app.isAdmin">
            <el-form-item label="校验规则" label-width="80px">
              <el-select
                v-model="searchForm.rule"
                clearable
                placeholder="请选择校验规则"
              >
                <el-option
                  v-for="rule in ruleArr"
                  :key="rule.value"
                  :label="rule.label"
                  :value="rule.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="4" v-if="$store.state.app.isAdmin">
            <el-form-item label="数据密级" label-width="80px">
              <el-select
                v-model="searchForm.securityLevel"
                clearable
                placeholder="请选择数据密级"
              >
                <el-option
                  v-for="level in dataLevelArr"
                  :key="level.value"
                  :label="level.label"
                  :value="level.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="经度范围" label-width="80px">
              <el-input
                placeholder="十进制度"
                v-model="searchForm.lonStart"
                style="width: 45%"
                clearable
              ></el-input
              ><span> - </span>
              <el-input
                placeholder="十进制度"
                v-model="searchForm.lonEnd"
                style="width: 45%"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="纬度范围" label-width="80px">
              <el-input
                placeholder="十进制度"
                v-model="searchForm.latStart"
                style="width: 45%"
                clearable
              ></el-input
              ><span> - </span>
              <el-input
                placeholder="十进制度"
                v-model="searchForm.latEnd"
                style="width: 45%"
                clearable
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="创建日期" label-width="80px">
              <el-date-picker
                v-model="searchForm.CREATE_TIME"
                style="width: 100%"
                type="daterange"
                value-format="yyyy-MM-dd"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="1" style="height: 10px"></el-col>
          <el-col :span="3" style="textalign: right">
            <el-button class="reset-btn" @click="reset()">重置</el-button>
            <el-button
              type="primary"
              class="search-btn"
              @click="handlerSearch()"
              >搜索</el-button
            >
          </el-col>
        </el-row>
      </el-form>
      <div class="table-container">
        <div class="table-above-btn">
          <el-button
            v-if="$store.state.app.isAdmin ? true : false"
            class="action-btn"
            @click="config.isConfigStyle = true"
            >配置地名样式</el-button
          >
          <el-button
            v-if="$store.state.app.isAdmin ? true : false"
            class="action-btn"
            @click="addPlaceName"
            ><svg-icon icon-class="add" /> 添加地名</el-button
          >
          <el-button
            v-if="$store.state.app.isAdmin ? true : false"
            class="action-btn"
            @click="downloadExcelTemplate"
            ><i class="el-icon-download" /> 下载模板</el-button
          >
          <el-button
            v-if="$store.state.app.isAdmin ? true : false"
            class="action-btn"
            @click="openImportExcel"
            ><svg-icon icon-class="import" /> 导入地名</el-button
          >
          <el-button class="action-btn" @click="exportExcel(false)"
            ><svg-icon icon-class="export" /> 导出地名</el-button
          >
          <el-button
            v-if="$store.state.app.isAdmin ? true : false"
            class="delete-btn"
            @click="handlerDeleteBatch"
            ><svg-icon icon-class="del-batch" /> 批量删除</el-button
          >
        </div>
        <el-table
          height="100%"
          @selection-change="tableSelectionChange"
          :data="result"
          row-key="id"
          border
          default-expand-all
        >
          <el-table-column
            type="selection"
            fixed="left"
            width="55"
            align="center"
          ></el-table-column>
          <el-table-column
            type="index"
            align="center"
            label="序号"
            width="55"
          />
          <el-table-column
            prop="code"
            label="编码"
            min-width="80"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="name"
            label="名称"
            width="200"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="type"
            label="地名类型"
            align="center"
            min-width="60"
          >
            <template #default="scope">
              <span>{{ scope.row.type | filterType(allPlaceNameType) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="oneLevel"
            label="所属一级区域"
            width="120"
            align="center"
          >
            <template #default="scope">
              <span>{{ scope.row.oneLevel }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="secondLevel"
            label="所属二级区域"
            width="120"
            align="center"
          >
            <template #default="scope">
              <span>{{ scope.row.secondLevel }}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="$store.state.app.isAdmin"
            prop="securityLevel"
            label="数据密级"
            align="center"
            min-width="70"
          >
            <template #default="scope">
              <span
                :class="[
                  'level-tab',
                  scope.row.securityLevel == 1
                    ? 'trd-level'
                    : scope.row.securityLevel == 2
                    ? 'sed-level'
                    : 'fst-level',
                ]"
                >{{ levelObj[scope.row.securityLevel] }}</span
              >
            </template>
          </el-table-column>
          <el-table-column prop="lon" label="经度坐标" align="center">
            <template #default="scope">
              <span>{{ scope.row.lon | filterCoordinate(areaData) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="lat" label="纬度坐标" align="center">
            <template #default="scope">
              <span>{{ scope.row.lat | filterCoordinate(areaData) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="formerName"
            label="曾用名"
            min-width="60"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="CREATE_TIME"
            label="创建时间"
            sortable
            min-width="100"
            align="center"
          ></el-table-column>
          <el-table-column label="操作" width="160" align="center">
            <template #default="scope">
              <el-button
                class="table-btn-blue"
                type="text"
                @click="preveiw(scope.row)"
                >查看</el-button
              >
              <el-button
                v-if="$store.state.app.isAdmin"
                @click="editRegion(scope.row)"
                class="table-btn-orange"
                type="text"
                >编辑</el-button
              >
              <el-button
                v-if="$store.state.app.isAdmin"
                class="table-btn-red"
                type="text"
                @click="handlerDelete(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination" v-if="pagination.total > 0">
          <pagination
            :total="pagination.total"
            :page.sync="pagination.pageNumber"
            :limit.sync="pagination.pageSize"
            @pagination="pageChange"
            :pageSizes="pagination.pageSizes"
          />
        </div>
      </div>
    </div>
    <add
      v-if="open"
      :type="title == '新增' ? 'add' : 'edit'"
      :fromData="regionForm"
      @cancel="cancel"
      :legendData="legendData"
      :placeRules="placeRules"
      :areaTreeData="oneLevelTree"
      :allRegion="allRegion"
      :disabled="isPreview"
      @save="save"
    >
    </add>

    <el-dialog
      title="配置地名样式"
      :visible.sync="config.isConfigStyle"
      width="400px"
      append-to-body
    >
      <el-form
        ref="form"
        :model="regionForm"
        label-width="140px"
        label-suffix="："
      >
        <el-form-item label="地名名称颜色">
          <el-color-picker
            v-model="config.params.name_text_color"
            show-alpha
          ></el-color-picker>
        </el-form-item>
        <el-form-item label="地名名称字体大小">
          <el-input v-model="config.params.name_text_size"></el-input>
        </el-form-item>
        <el-form-item class="center-container">
          <el-button @click="config.isConfigStyle = false">取消</el-button>
          <el-button
            type="primary"
            v-if="!isPreview"
            @click="configPlaceNameStyle()"
            >保存</el-button
          >
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import TableOne from "@/components/Table/table.vue";
import Pagination from "@/components/Pagination/index.vue";

import dayjs from "dayjs";
import { ipcRenderer } from "electron";
import parseShapeFile from "@/utils/map/parseShapefile";
import { objectEmpty } from "@/utils/index";
import { exportExcelFile, importExcel } from "@/utils/files.js";
import * as maptalks from "maptalks";
import { deepCopy } from "@/utils/index";
import { PlaceNameApi } from "@/utils/db/PlaceNameApi";
import { AreaApi } from "@/utils/db/AreaApi";
import { PlaceTypeApi } from "@/utils/db/PlaceTypeApi";
import add from "./add.vue";
import ElSelectTree from "@/components/el-select-tree/index.vue";
import { Transform } from "@/utils/gis/transforms";
import { ConfigApi } from "@/utils/db/ConfigApi";
const remote = require("@electron/remote");
const path = require("path");
function initSearchForm() {
  return {
    name: "",
    CREATE_TIME: [],
    code: "",
    type: "",
    // 所属区域
    // 校验规则
    rule: "", //校验规则
    // 数据密级
    securityLevel: "",
    lonStart: "",
    lonEnd: "",
    latStart: "",
    latEnd: "",
    oneLevel: "",
    secondLevel: "",
  };
}
function initRegionForm() {
  return {
    name: "",
    remark: "",
    geojson: "",
    lon: "",
    lat: "",
    code: "",
    type: "",
    oneLevel: "",
    secondLevel: "",
    securityLevel: "",
    imageurl: "",
  };
}

let allData = []; //代码分页储存数据的数组
let searchParams = {}; //代码分页查询条件
export default {
  name: "placenameManage",
  components: { TableOne, Pagination, add, ElSelectTree },
  props: {},
  data() {
    return {
      config: {
        isConfigStyle: false,
        params: {
          name_text_color: "",
          name_text_size: "",
        },
      },
      allRegion: [],
      oneLevelTree: [],
      sattisticRegionKeys: [], //统计分析引入，可以查询区域id集合
      isPreview: false,
      areaData: [],
      allPlaceNameType: [],
      tableSlection: [], //表格选中项
      title: "编辑",
      areaTreeData: [],
      placeRules: {
        code: [{ required: true, message: "请输入编码", trigger: "blur" }],
        name: [{ required: true, message: "请输入名称", trigger: "blur" }],
        type: [
          { required: true, message: "请选择地名类型", trigger: "change" },
        ],
        oneLevel: [
          { required: true, message: "请选择一级区域", trigger: "change" },
        ],
        secondLevel: [
          { required: true, message: "请选择二级区域", trigger: "change" },
        ],
        lon: [{ required: true, message: "请输入经度", trigger: "change" }],
        lat: [{ required: true, message: "请输入纬度", trigger: "change" }],
      },
      legendData: [],
      open: false,
      searchForm: initSearchForm(),
      regionForm: initRegionForm(),
      pagination: {
        pageNumber: 1,
        pageSize: 10,
        total: 0,
        pageSizes: [5, 10, 20, 30, 50],
      },
      ruleArr: [
        { value: 1, label: "地名重复或为空" },
        { value: 2, label: "编码重复或为空" },
        { value: 3, label: "地名类型不规范" },
        { value: 4, label: "一级区域不规范" },
        { value: 5, label: "二级区域不规范" },
        { value: 6, label: "地名字符长度超限" },
      ],
      dataLevelArr: [
        { value: 1, label: "一级" },
        { value: 2, label: "二级" },
        { value: 3, label: "三级" },
      ],
      levelObj: { 1: "一级", 2: "二级", 3: "三级" },
      result: [],
    };
  },
  filters: {
    filterType(id, types) {
      return (types.find((item) => item.id == id) || { name: id }).name;
    },
    filterCoordinate(val, areaData) {
      const trs = new Transform();
      if (val != "") {
        return trs.DDDToDMS(Number(val));
      } else {
        return val;
      }
    },
  },
  watch: {},
  created() {
    this.getConfigInfo();
    // 管理员分页有500
    // console.log(this.$store.state)
    if (this.$store.state.app.isAdmin) {
      this.pagination.pageSizes = [5, 10, 20, 30, 50, 100, 500];
    }
    // 页面
    this.init();
  },
  mounted() {},
  methods: {
    async getConfigInfo() {
      const configApi = new ConfigApi();
      const configInfo = await configApi.getConfigData();
      this.config.params = configInfo[0];
    },
    async configPlaceNameStyle() {
      const configApi = new ConfigApi();
      const result = await configApi.updateFunc(
        this.config.params,
        this.config.params.id
      );
      if (result == 1) {
        this.$message.success("配置成功");
        this.config.isConfigStyle = false;
      } else {
        this.$message.success("配置失败，请重新尝试");
      }
    },
    // 下载地名excel模板
    downloadExcelTemplate() {
      const filePath = path.join(
        process.cwd(),
        "data",
        "excel",
        "地名导入模板.xlsx"
      );
      const win = remote.getCurrentWindow();
      win.webContents.downloadURL(filePath);
    },
    // 导入excel
    async openImportExcel() {
      console.log("打开文件选择窗口");
      const trs = new Transform();
      importExcel().then((data) => {
        const loading = this.$loading({
          lock: true,
          text: "正在处理数据",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)",
        });
        let list = [];
        for (let a = 0; a < data.length; a++) {
          if (data[a].length < 10) {
            break;
          }
          if (a > 0) {
            const lon =
              data[a][8] != ""
                ? Number(trs.DMSToDDD(data[a][8])).toFixed(6)
                : "";
            const lat =
              data[a][9] != ""
                ? Number(trs.DMSToDDD(data[a][9])).toFixed(6)
                : "";
            const geojson = {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [lon, lat],
              },
              properties: {},
            };

            const params = {
              code: data[a][1] || "", //编码 1
              name: data[a][2] || "", //地名名称 2
              formerName: data[a][3] || "", //曾用名 3
              //地名类型 4
              type: (
                this.allPlaceNameType.find(
                  (item) => item.name == data[a][4]
                ) || { name: data[a][4] }
              ).name,
              oneLevel: data[a][5] || "", //所属一级区域
              secondLevel: data[a][6] || "", //所属二级区域
              securityLevel: data[a][7] || "", //数据密级  用1/2/3标识
              center: `${lon},${lat}`, //经纬度 存储方式113.4,39.8  以逗号个号  经度   纬度
              imageurl: "",
              attached: data[a][10] || "", //附属信息
              remark: data[a][11] || "", //描述
              geojson: JSON.stringify(geojson),
            };
            // console.log(trs.DMSToDDD(data[a][8]))
            // 经纬度校验
            // console.log(params)
            if (params.center.indexOf("NaN") > -1) {
              // this.$message.warning("导入文件中含有异常经纬度");
              // break;
              params.center = `${data[a][8]},${data[a][9]}`;
            }
            list.push(params);
          }
        }
        const api = new PlaceNameApi();
        Promise.all(list.map((item) => api.addFunc(item)))
          .then((res) => {
            loading.close();
            this.$message.success("导入成功！");
            this.getData();
          })
          .catch((err) => {
            loading.close();
            this.$message.warning("导入失败！");
          });
      });
    },
    // 导出excel
    async exportExcel(isAll = false) {
      // console.log(this.tableSlection.length);
      if (isAll) {
        this.tableSlection = this.result;
      } else {
        if (this.tableSlection.length == 0) {
          this.$message.warning("请选择！");
        }
      }

      if (this.tableSlection.length > 0) {
        let data = [];
        const trs = new Transform();
        this.tableSlection.forEach((item, key) => {
          let secondLevel = [];
          if (item.secondLevel != "") {
            if (item.secondLevel.indexOf(",") > -1) {
              item.secondLevel.split(",").forEach((a) => {
                secondLevel.push(a);
              });
            } else {
              secondLevel.push(item.oneLevel);
            }
          }
          data.push({
            序号: key,
            编码: item.code || "", //编码 1
            名称: item.name || "", //地名名称 2
            曾用名: item.formerName || "", //曾用名 3
            地名类型: item.type, //地名类型 4
            所属一级区域: item.oneLevel, //所属一级区域
            所属二级区域: secondLevel.toString(), //所属二级区域
            数据密级: item.securityLevel || "", //数据密级  用1/2/3标识
            经度坐标: trs.DDDToDMS(item.center.split(",")[0]) || "", //经纬度 存储方式113.4,39.8  以逗号个号  经度   纬度
            纬度坐标: trs.DDDToDMS(item.center.split(",")[1]) || "",
            附属信息: item.attached || "", //附属信息
            备注: item.remark || "", //描述
          });
        });
        exportExcelFile("地名数据导出", data);
      }
    },
    async init() {
      await this.getAllArea();
      await this.getAllPlaceNameType();
      await this.getPlaceNameTypeTree();
      await this.getAreaTreeData();
      await this.getData();
    },
    // 预览
    preveiw(row) {
      this.title = "编辑";
      this.regionForm = Object.assign({}, this.regionForm, row);
      this.isPreview = true;
      this.open = true;
    },
    editRegion(row) {
      this.title = "编辑";
      this.regionForm = Object.assign({}, this.regionForm, row);
      // console.log()
      this.open = true;
    },
    // 保存
    async save(obj = null) {
      if (obj.geojson == "" || obj.geojson == null) {
        // 默认生成点类型的geojson
        const json = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: obj.center.split(","),
          },
          properties: {
            name: "point marker",
          },
        };
        obj.geojson = JSON.stringify(json);
      }
      // console.log(obj);
      // return;
      let params = obj || {};
      const api = new PlaceNameApi();
      let res = false;
      if (this.title == "编辑") {
        params["id"] = this.regionForm.id;
        res = await api.updateFunc(params);
      } else {
        res = await api.addFunc(params);
      }
      // console.log(res)
      if (res) {
        this.cancel();
        this.$message.success("操作成功");
        this.regionForm = initRegionForm();
      } else {
        this.$message.warning("操作失败，请重试");
      }
      this.getData();
    },
    // 获取所有区域
    async getAllArea() {
      const api = new AreaApi();
      const res = await api.getPageQueryData({}, { pageSize: 9999999 });
      // console.log(res);
      this.areaData = res;
    },
    // 获取区域树数据
    async getAreaTreeData() {
      const api = new AreaApi();
      const res = await api.getTree();
      const result = await api.getPageQueryData({}, { pageSize: 999999999999 });
      const baseTree = [{ value: "/", label: "/" }];
      const filterTree = result.filter((item) => item.parentid == "/");
      const list = filterTree.map((item) => {
        return { ...item, value: item.name, label: item.name };
      });
      // this.options = [...baseTree, ...list];
      this.allRegion = result.map((item) => {
        return { ...item, value: item.name, label: item.name };
      });
      this.areaTreeData = res;
      // 提取一级区域
      this.oneLevelTree = [...list];
    },
    //获取所有地名类型
    async getAllPlaceNameType() {
      const api = new PlaceTypeApi();
      const data = await api.getPageQueryData({}, { pageSize: 9999999 });
      this.allPlaceNameType = data;
    },
    // 获取地名类型树
    async getPlaceNameTypeTree() {
      const api = new PlaceTypeApi();
      const data = await api.getTree();
      this.legendData = data;
      console.log(data);
    },
    // 重置
    reset() {
      this.searchForm = initSearchForm();
      this.pagination.pageNumber = 1;
      this.searchForm.oneLevel = "";
      this.getData();
    },
    // 处理搜索按钮点击
    handlerSearch() {
      this.getData();
    },
    addPlaceName() {
      this.title = "新增";
      this.regionForm = initRegionForm();
      this.open = true;
    },
    cancel() {
      this.open = false;
      this.isPreview = false;
    },
    /**
     * 获取表格数据
     */
    async getData(obj = {}) {
      console.log("地名管理-获取表格数据");
      // 校验是否是模拟分页
      const loading = this.$loading({
        lock: true,
        text: "正在处理数据...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      let checkParams = false;
      Object.keys(searchParams).forEach((item) => {
        Object.keys(this.searchForm).forEach((a) => {
          if (item == a && searchParams[item] == this.searchForm[a]) {
            checkParams = true;
          } else {
            checkParams = false;
          }
        });
      });
      if (this.pagination.pageNumber > 1 && allData.length > 0 && checkParams) {
        const { pageData, totalPages, pageNumber } = this.getPageData(
          this.pagination.pageNumber,
          this.pagination.pageSize,
          allData
        );
        this.pagination.total = allData.length;
        this.result = pageData;
        console.log("------代码分页------");
        console.log(this.pagination);
        loading.close();
        return;
      }

      const api = new PlaceNameApi();
      let params = deepCopy({ ...this.searchForm, ...obj });
      const trs = new Transform();
      // 二级区域是否使用代码分页
      let secondLevelIsCodePaging = false;
      let secondLevel = "";
      if (params.oneLevel != "") {
        // 地名管理页面
        // 判断地名是一级还是二级

        if (
          this.oneLevelTree.find(
            (item) => item.name == params.oneLevel && item.parentid == "/"
          )
        ) {
          // 查询的是一级区域
          console.log("查询的是一级区域");
          params.secondLevel = "";
        } else {
          // 查询的是二级区域
          console.log("查询的是二级区域");
          // .indexOf(",")>-1?params.oneLevel.split(","):params.oneLevel
          params.secondLevel = params.oneLevel;
          secondLevel = params.oneLevel;
          secondLevelIsCodePaging = true;
          params.oneLevel = "";
        }
      }
      // secondLevel = secondLevel.indexOf(",")>-1?secondLevel.split(","):[secondLevel]

      // 默认使用数据库分页
      let isDatabasePagination = true;
      // console.log(this.searchForm)
      // this.searchForm.rule != 6 && this.searchForm.rule != 7
      if (
        this.searchForm.name == "" &&
        this.searchForm.lonStart == "" &&
        this.searchForm.latStart == "" &&
        params.secondLevel == ""
      ) {
        // 使用数据库分页
        isDatabasePagination = true;
      } else {
        // 使用代码分页
        searchParams = {
          name: this.searchForm.name,
          lonStart: this.searchForm.lonStart,
          latStart: this.searchForm.latStart,
          secondLevel: params.secondLevel,
          // rule: this.searchForm.rule
        };
        isDatabasePagination = false;
      }

      delete params.name;
      delete params.lon;
      delete params.latEnd;
      delete params.formerName;
      delete params.center;
      delete params.secondLevel;
      switch (params.rule) {
        // 地名重复或为空
        case 1:
          params.name = `IN (SELECT name FROM tb_place_name GROUP BY name HAVING count(*) > 1 ) OR name IN ('')`;
          break;
        // 编码重复或为空
        case 2:
          params.code = `IN (SELECT code FROM tb_place_name GROUP BY code HAVING count(*) > 1 ) OR code IN ('')`;
          break;
        // 地名类型不规范
        case 3:
          params.type = `NOT IN (SELECT name FROM tb_place_type) OR type IN ('')`;
          break;
        // 一级区域不规范
        case 4:
          params.oneLevel = `NOT IN (SELECT name FROM tb_area) OR oneLevel IN ('')`;
          break;
        // =二级区域不规范
        // case 5:
        //   params.secondLevel = `NOT IN (SELECT name FROM tb_area) OR secondLevel IN ('')`;
        //   break;
      }

      if (params.CREATE_TIME.length > 0) {
        params.CREATE_TIME.map((item) => {
          const time = dayjs(item).valueOf();
          return time;
        });
      } else if (params.CREATE_TIME.length == 0) {
        params.CREATE_TIME = "";
      }

      let total = await api.getCount(deepCopy(params));
      let data = [];
      let list = [];
      console.log(params);
      if (isDatabasePagination) {
        // 数据库分页
        console.log("使用数据库分页");
        data = await api.getPageQueryData(deepCopy(params), this.pagination);
      } else {
        // 代码分页
        console.log("使用代码分页");
        data = await api.getPageQueryData(deepCopy(params), {
          pageSize: 10000000,
        });
      }

      // 模拟名称模糊查询
      console.log(this.searchForm.name);
      if (this.searchForm.name != "") {
        if (data.length > 0) {
          // 从其他条件查询的数据中模拟模糊查询
          list = data.filter(
            (item) =>
              item.name.indexOf(this.searchForm.name) > -1 ||
              (item.formerName != "" &&
                item.formerName != null &&
                item.formerName.indexOf(this.searchForm.name) > -1)
          );
        } else {
          list = data.filter(
            (item) =>
              item.name.indexOf(this.searchForm.name) > -1 ||
              (item.formerName != "" &&
                item.formerName != null &&
                item.formerName.indexOf(this.searchForm.name) > -1)
          );
        }
        // console.log(list)
        if (list.length == 0) {
          (data = []), (total = 0);
        }
      }

      // 二级区域规范校验不使用数据库、使用代码过滤
      if (params.rule == 5) {
        console.log("校验规则：二级区域不规范");
        let arr = [];
        if (list.length > 0) {
          arr = list;
        } else {
          arr = data;
        }
        console.log(this.allRegion);
        list = arr.filter((item) => {
          let flag = false;
          if (item.secondLevel.indexOf(",") > -1) {
            item.secondLevel.split(",").forEach((b) => {
              const obj = this.allRegion.find((a) => a.name == b);
              if (obj) {
                flag = false;
              } else {
                flag = true;
              }
            });
            // console.log(flag,item.secondLevel,params.secondLevels)
          } else if (item.secondLevel == "") {
            flag = true;
          } else {
            const obj = this.allRegion.find((a) => a.name == item.secondLevel);
            if (obj) {
              flag = false;
            } else {
              flag = true;
            }
          }
          return flag;
        });

        if (list.length == 0) {
          data = [];
        }
      }

      // 地名地名字符长度超限-不规范校验
      if (params.rule == 6) {
        console.log("校验规则：地名地名字符长度超限");
        let arr = [];
        if (list.length > 0) {
          arr = list;
        } else {
          arr = data;
        }
        // console.log(this.allRegion);
        list = arr.filter((item) => {
          let flag = false;
          if (item.name.length > 20) {
            flag = true;
          } else {
            flag = false;
          }
          return flag;
        });

        if (list.length == 0) {
          data = [];
        }
      }

      // 二级区域查询
      if (secondLevelIsCodePaging) {
        if (data.length > 0) {
          // 从其他条件查询的数据中模拟模糊查询
          // data = [];
          list = data.filter((item) => {
            let flag = false;
            // console.log(this.searchForm);
            if (item.secondLevel.indexOf(",") > -1) {
              item.secondLevel.split(",").forEach((c) => {
                if (c == secondLevel) {
                  flag = true;
                }
              });
            } else {
              item.secondLevel == secondLevel ? (flag = true) : (flag = false);
            }
            return flag;
          });
        } else {
          // data = [];
          list = list.filter((item) => {
            let flag = false;
            if (item.secondLevel.indexOf(",") > -1) {
              item.secondLevel.split(",").forEach((c) => {
                if (c == secondLevel) {
                  flag = true;
                }
              });
            } else {
              item.secondLevel == secondLevel ? (flag = true) : (flag = false);
            }
            return flag;
          });
        }

        if (list.length == 0) {
          (data = []), (total = 0);
        }
        // console.log(list,data);
      }

      if (
        this.searchForm.lonStart != "" ||
        this.searchForm.lonEnd != "" ||
        this.searchForm.latStart != "" ||
        this.searchForm.latEnd != ""
      ) {
        console.log("经纬度范围查询");
        // 经度和纬度查询条件是AND关系，不是OR关系
        let arr = [];
        if (list.length > 0) {
          arr = list;
        } else {
          arr = data;
        }
        // 提取查询条件
        const lonStart = Number(this.searchForm.lonStart);
        const lonEnd = Number(this.searchForm.lonEnd);
        const latStart = Number(this.searchForm.latStart);
        const latEnd = Number(this.searchForm.latEnd);

        console.log([lonStart, lonEnd, latStart, latEnd]);
        list = arr.filter((item) => {
          let flag = false;
          // 提取地名中的十进制经纬度
          const lon = item.center != "" ? Number(item.center.split(",")[0]) : 0;
          const lat = item.center != "" ? Number(item.center.split(",")[1]) : 0;
          if (
            lon >= lonStart &&
            lon <= (lonEnd == 0 ? 180 : lonEnd) &&
            lat >= latStart &&
            lat <= (latEnd == 0 ? 85 : latEnd)
          ) {
            console.log(lon, lat);
            flag = true;
          } else {
            flag = false;
          }
          return flag;
        });

        // console.log(list);
        if (list.length == 0) {
          data = [];
        }
      }

      if (data.length > 0) {
        data = data.map((item) => {
          //   console.log(item);
          item.CREATE_TIME = dayjs(item.CREATE_TIME).format(
            "YYYY-MM-DD HH:mm:ss"
          );

          item.lon =
            item.center != ""
              ? item.center.indexOf("°") > -1
                ? item.center.split(",")[0]
                : Number(item.center.split(",")[0])
              : "";
          item.lat =
            item.center != ""
              ? item.center.indexOf("°") > -1
                ? item.center.split(",")[1]
                : Number(item.center.split(",")[1])
              : "";
          // // 使用度分秒格式展示
          // item.lat = item.lat != "" ? trs.DDDToDMS(item.lat) : ""
          // item.lon = item.lon != "" ? trs.DDDToDMS(item.lon) : ""
          return item;
        });
      } else {
        list = list.map((item) => {
          //   console.log(item);
          item.CREATE_TIME = dayjs(item.CREATE_TIME).format(
            "YYYY-MM-DD HH:mm:ss"
          );

          item.lon =
            item.center != ""
              ? item.center.indexOf("°") > -1
                ? item.center.split(",")[0]
                : Number(item.center.split(",")[0])
              : "";
          item.lat =
            item.center != ""
              ? item.center.indexOf("°") > -1
                ? item.center.split(",")[1]
                : Number(item.center.split(",")[1])
              : "";
          // // 使用度分秒格式展示
          // item.lat = item.lat != "" ? trs.DDDToDMS(item.lat) : ""
          // item.lon = item.lon != "" ? trs.DDDToDMS(item.lon) : ""
          return item;
        });
      }

      if (list.length > 0) {
        // 需要模拟数据库分页
        allData = list;
        if (allData.length > 0) {
          const { pageData, totalPages, pageNumber } = this.getPageData(
            this.pagination.pageNumber,
            this.pagination.pageSize,
            allData
          );
          this.pagination.total = allData.length;
          this.result = pageData;
          try {
            this.$emit("callback", { total: pageData.length });
          } catch (e) {
            console.log(e);
          }
        } else {
          this.pagination.total = 0;
          this.result = list;
          this.$emit("callback", { total: 0 });
        }

        console.log("------代码分页------");
        console.log(this.pagination);
      } else {
        this.$emit("callback", { total });
        // console.log(total);
        this.pagination.total = total;
        allData = [];
        this.result = data;
        console.log("------数据库分页------");
      }

      if (this.result.length == 0) {
        this.pagination.total = 0;
      }
      loading.close();
    },
    getPageData(pageNumber, pageSize, allData) {
      const totalItems = allData.length;
      const totalPages = Math.ceil(totalItems / pageSize);

      // 确保请求的页码在合理范围内
      if (pageNumber < 1 || pageNumber > totalPages) {
        return { error: "Invalid page number" };
      }

      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      // 使用 Array.slice 获取特定页的数据
      const pageData = allData.slice(startIndex, endIndex);

      return {
        pageData,
        totalPages,
        currentPage: pageNumber,
      };
    },
    onAdd() {
      //   this.$router.push("/placeNameAdd");
    },
    onEdit() {},
    onSetDetail(row) {
      console.log(row);
    },
    onDelete() {},
    pageChange(val) {
      // console.log(val);
      this.getData();
    },
    // 处理删除按钮点击
    handlerDelete(row) {
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.delete(row);
        })
        .catch(() => {});
    },
    // 处理批量删除按钮点击
    handlerDeleteBatch() {
      if (this.tableSlection.length > 0) {
        this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            this.deleteBatch(this.tableSlection);
          })
          .catch(() => {});
      }
    },
    // 删除
    async delete(row) {
      const api = new PlaceNameApi();
      const res = await api.getDeleteFunc(row.id);
      if (res) {
        this.cancel();
        this.$message.success("操作成功");
      } else {
        this.$message.warning("操作失败，请重试");
      }
      this.getData();
    },
    // 批量删除
    async deleteBatch(row) {
      const params = {
        id: row.map((item) => `"${item.id}"`),
      };
      //   console.log(params);
      const api = new PlaceNameApi();
      const res = await api.getDeleteBatchFunc(params);
      if (res) {
        this.cancel();
        this.$message.success("操作成功");
      } else {
        this.$message.warning("操作失败，请重试");
      }
      this.getData();
    },
    // 表格 当选择项发生变化时会触发该事件
    tableSelectionChange(e) {
      //   console.log(e);
      this.tableSlection = e;
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .el-select-dropdown__item {
  height: auto !important;
}

.content {
  border-radius: 6px;
  background-color: #fff;
  padding: 24px;
  height: calc(100% - 72px);
  max-width: 100%;
}

.search-form {
  border-bottom: 1px solid rgba(198, 205, 222, 0.49);

  ::v-deep .el-form-item {
    margin-bottom: 10px !important;

    .el-icon-date,
    .el-range-input {
      font-size: 14px !important;
      line-height: 14px;
    }

    .el-range-separator {
      font-size: 14px !important;
      line-height: 20px;
    }
  }

  ::v-deep .el-input__inner {
    height: 34px !important;
  }
}

.table-container {
  padding-top: 10px;
  height: 605px;
}

.comp-table-container {
  // padding-top: 10px;
  height: 40%;
}

.table-above-btn {
  text-align: right;
  padding-bottom: 14px;
}

.level-tab {
  width: 44px;
  height: 20px;
  font-size: 12px;
  border-radius: 13px;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
}

.trd-level {
  background: linear-gradient(104deg, #0060ce 0%, #3493ff 100%);
  border: 1px solid #87bfff;
}

.sed-level {
  background: linear-gradient(104deg, #ff8000 0%, #ffbb34 100%);
  border: 1px solid #ffd387;
}

.fst-level {
  background: linear-gradient(104deg, #ce0000 0%, #ff5656 100%);
  border: 1px solid #ff8797;
}
</style>
