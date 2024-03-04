<template>
  <div class="page-content" :style="{ padding: 0 }">
    <div class="content" :style="{ padding: 0 }" v-show="!open">
      <el-form
        ref="searchForm"
        v-model="searchForm"
        class="search-form"
        label-suffix=":"
      >
        <el-row type="flex">
          <el-col :span="5">
            <el-form-item label="名称" label-width="60px">
              <el-input
                v-model="searchForm.name"
                clearable
                placeholder="请输入名称"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="3" style="margin-left: 20px">
            <el-button
              type="primary"
              class="search-btn"
              @click="handlerSearch()"
              >搜索</el-button
            >
          </el-col>
          <!-- 统计分析中导出地名 -->
          <el-col :span="11" style="text-align: right">
            <el-button class="action-btn" @click="exportExcel(true)"
              ><svg-icon icon-class="import" /> 导出地名</el-button
            >
          </el-col>
        </el-row>
      </el-form>
      <div :class="'comp-table-container'">
        <el-table
          height="100%"
          @selection-change="tableSelectionChange"
          :data="result"
          row-key="id"
          border
          default-expand-all
        >
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
          <el-table-column label="操作" :width="60" align="center">
            <template #default="scope">
              <el-button
                class="table-btn-blue"
                type="text"
                @click="preveiw(scope.row)"
                >查看</el-button
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
    <el-dialog
      title="地名详情"
      v-if="open"
      :visible="true"
      width="60%"
      :before-close="handleClose"
    >
      <add
        :type="title == '新增' ? 'add' : 'edit'"
        :fromData="regionForm"
        @cancel="cancel"
        :legendData="legendData"
        :placeRules="placeRules"
        :areaTreeData="oneLevelTree"
        :allRegion="allRegion"
        :disabled="isPreview"
        :isStatistics="true"
      >
      </add>

      <span slot="footer" class="dialog-footer">
        <el-button @click="open = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from "@/components/Pagination/index.vue";
import dayjs from "dayjs";
import { exportExcelFile } from "@/utils/files.js";
import { deepCopy } from "@/utils/index";
import { PlaceNameApi } from "@/utils/db/PlaceNameApi";
import { AreaApi } from "@/utils/db/AreaApi";
import { PlaceTypeApi } from "@/utils/db/PlaceTypeApi";
import { Transform } from "@/utils/gis/transforms";
const remote = require("@electron/remote");
const path = require("path");
import add from "../../place-name-manage/add.vue";
function initSearchForm() {
  return {
    name: "",
    CREATE_TIME: [],
    type: "", //地名类型
    securityLevel: "", //数据密级
    oneLevel: [], //一级区域
    secondLevel: [], //二级区域
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
export default {
  name: "StatisticsTable",
  components: { Pagination, add },
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
      legendData: [],
      open: false,
      searchForm: initSearchForm(),
      regionForm: initRegionForm(),
      pagination: {
        pageNumber: 1,
        pageSize: 10,
        total: 0,
        pageSizes: [10, 20, 30, 50],
      },
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
    this.pagination = {
      pageNumber: 1,
      pageSize: 4,
      total: 0,
      pageSizes: [4],
    };
    this.init();
  },
  mounted() {},
  methods: {
    resetPageNumber(){
      this.pagination.pageNumber = 1
    },
    clearSearch(){
      this.searchForm.securityLevel = ""
      this.searchForm.type = ""
    },
    handleClose(done) {
      // done()
      this.open = false;
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
    },
    // 预览
    preveiw(row) {
      this.title = "编辑";
      this.regionForm = Object.assign({}, this.regionForm, row);
      this.isPreview = true;
      this.open = true;
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
      this.searchForm.name = "";
      this.pagination.total = 0;
      this.pagination.pageNumber = 1;
      this.result = [];
      // this.getData();
    },
    // 处理搜索按钮点击
    handlerSearch() {
      this.getData();
    },
    /**
     * 统计分析获取表格数据
     */
    async getData(obj = {}) {
      // console.log("统计分析-获取表格数据");
      this.searchForm = { ...this.searchForm, ...obj };
      // console.log(this.searchForm);
      // 校验是否是模拟分页
      const loading = this.$loading({
        lock: true,
        text: "正在处理数据...",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });

      let params = deepCopy(this.searchForm);
      // 提取一级、二级区域
      const oneLevels = [];
      const secondLevels = [];
      this.sattisticRegionKeys.forEach((name) => {
        if (
          this.oneLevelTree.find(
            (item) => item.name == name && item.parentid == "/"
          )
        ) {
          oneLevels.push(name);
        } else {
          secondLevels.push(name);
        }
      });
      params.oneLevel = oneLevels.length == 0 ? "" : oneLevels;
      params.secondLevel = secondLevels.length == 0 ? "" : secondLevels;

      let checkParams = false;

      if (this.searchForm.name != "" || params.secondLevel != "") {
        checkParams = true;
      }
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
      const trs = new Transform();
      // console.log(this.sattisticRegionKeys);

      // 默认使用数据库分页
      let isDatabasePagination = true;
      // 二级区域是否使用代码分页
      let secondLevelIsCodePaging = false;
      // console.log(this.searchForm)
      // this.searchForm.rule != 6 && this.searchForm.rule != 7
      if (this.searchForm.name == "" && params.secondLevel == "") {
        // 使用数据库分页
        isDatabasePagination = true;
      } else {
        // 使用代码分页
        isDatabasePagination = false;
      }
      let secondLevel = params.secondLevel;
      let newParams = deepCopy(params);
      delete params.secondLevel;
      delete params.name;
      if (params.CREATE_TIME.length > 0) {
        params.CREATE_TIME.map((item) => {
          const time = dayjs(item).valueOf();
          return time;
        });
      } else if (params.CREATE_TIME.length == 0) {
        params.CREATE_TIME = "";
      }

      // console.log(params)
      const total = await api.getCountForStatistics(deepCopy(newParams));
      console.log(total);
      let data = [];
      let list = [];
      if (isDatabasePagination) {
        // 数据库分页
        console.log("使用数据库分页");
        data = await api.getPageQueryDataForStatistics(
          deepCopy(params),
          this.pagination
        );
      } else {
        // 代码分页
        console.log("使用代码分页");
        list = await api.getPageQueryDataForStatistics(deepCopy(params), {
          pageSize: 10000000,
        });
      }
      // 模拟名称模糊查询
      console.log(this.searchForm.name);
      if (this.searchForm.name != "") {
        if (data.length > 0) {
          // 从其他条件查询的数据中模拟模糊查询
          data = data.filter(
            (item) =>
              item.name.indexOf(this.searchForm.name) > -1 ||
              (item.formerName != "" &&
                item.formerName != null &&
                item.formerName.indexOf(this.searchForm.name) > -1)
          );
        } else {
          // 从所有数据中模拟模糊查询
          list = list.filter(
            (item) =>
              item.name.indexOf(this.searchForm.name) > -1 ||
              (item.formerName != "" &&
                item.formerName != null &&
                item.formerName.indexOf(this.searchForm.name) > -1)
          );
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

      if (secondLevel != "") {
        console.log(secondLevel);
        if (data.length > 0) {
          // 从其他条件查询的数据中模拟模糊查询
          list = data.filter((item) => {
            let flag = false;
            // console.log(item.secondLevel,params.secondLevels)
            if (item.secondLevel.indexOf(",") > -1) {
              secondLevel.forEach((b) => {
                item.secondLevel.split(",").forEach((c) => {
                  if (c == b) {
                    flag = true;
                  }
                });
              });
              // console.log(flag,item.secondLevel,params.secondLevels)
            } else {
              flag = secondLevel.find((a) => a == item.secondLevel)
                ? true
                : false;
              // console.log(flag,item.secondLevel,params.secondLevels)
            }
            return flag;
          });
        } else {
          list = list.filter((item) => {
            let flag = false;
            // console.log(item.secondLevel,params.secondLevels)
            if (item.secondLevel.indexOf(",") > -1) {
              secondLevel.forEach((b) => {
                item.secondLevel.split(",").forEach((c) => {
                  if (c == b) {
                    flag = true;
                  }
                });
              });
              // console.log(flag,item.secondLevel,params.secondLevels)
            } else {
              flag = secondLevel.find((a) => a == item.secondLevel)
                ? true
                : false;
              // console.log(flag,item.secondLevel,params.secondLevels)
            }
            return flag;
          });
        }
      }

      // console.log(list);
      if (list.length > 0) {
        // 需要模拟数据库分页
        allData = list;
        const { pageData, totalPages, pageNumber } = this.getPageData(
          this.pagination.pageNumber,
          this.pagination.pageSize,
          allData
        );
        this.pagination.total = allData.length;
        this.result = pageData;
        this.$emit("callback", { total: pageData.length });

        console.log("------代码分页------");
        // console.log(this.pagination);
      } else {
        this.$emit("callback", { total });
        console.log(total);
        this.pagination.total = total;
        allData = [];
        this.result = data;
        console.log("------数据库分页------");
      }
      console.log(this.result);
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
    pageChange(val) {
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
::v-deep .el-dialog__body {
  overflow-y: auto;
  height: 65vh;
  padding-left: 0;
  padding-right: 0;
  padding-top: 0;
}

::v-deep .el-dialog__footer{
  display: flex;
  align-content: center;
  justify-content: center;
}

.dialog-footer {
  overflow: auto;
}

.page-content {
  // overflow-y: auto;
}

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
  height: 600px;
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
