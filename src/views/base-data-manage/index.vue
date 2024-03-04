<template>
  <div class="page-content" :style="{ padding: isSattistic ? 0 : '' }">
    <div
      class="content"
      :style="{ padding: isSattistic ? 0 : '' }"
      v-show="!open"
    >
      <el-form
        ref="searchForm"
        v-model="searchForm"
        class="search-form"
        label-suffix=":"
      >
        <!-- 作为组件被统计分析调用 -->
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
          <el-col :span="5">
            <el-form-item label="类型" label-width="80px">
              <el-select
                v-model="searchForm.type"
                clearable
                placeholder="请选择"
              >
                <el-option
                  v-for="item in allBaseDataType"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="7">
            <el-form-item label="创建日期" label-width="80px">
              <el-date-picker
                v-model="searchForm.CREATE_TIME"
                clearable
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
          <el-col :span="3" style="margin-left: 20px">
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
        <div class="table-above-btn" v-if="!isSattistic">
          <el-button class="action-btn" @click="addPlaceName"
            ><svg-icon icon-class="add" /> 添加数据</el-button
          >
          <el-button class="action-btn" @click="isImport = true"
            ><svg-icon icon-class="import" /> 导入数据</el-button
          >
          <el-button class="action-btn" @click="exportData"
            ><svg-icon icon-class="export" /> 导出数据</el-button
          >
          <el-button class="delete-btn" @click="handlerDeleteBatch"
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
            width="80"
            align="center"
          ></el-table-column>
          <el-table-column
            type="index"
            align="center"
            label="序号"
            width="80"
          />
          <el-table-column
            prop="name"
            label="名称"
            min-width="120"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="type"
            label="类型"
            min-width="100"
            align="center"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.type | filterType(allBaseDataType) }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column
            prop="lon"
            label="经度坐标"
            min-width="100"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="lat"
            label="纬度坐标"
            min-width="100"
            align="center"
          ></el-table-column> -->
          <el-table-column
            prop="CREATE_TIME"
            label="创建时间"
            sortable
            :width="isSattistic ? 150 : 160"
            align="center"
          ></el-table-column>
          <el-table-column
            label="操作"
            :width="isSattistic ? 60 : 160"
            align="center"
          >
            <template #default="scope">
              <el-button
                class="table-btn-blue"
                type="text"
                @click="preveiw(scope.row)"
                >查看</el-button
              >
              <el-button
                v-if="!isSattistic"
                @click="editRegion(scope.row)"
                class="table-btn-orange"
                type="text"
                >编辑</el-button
              >
              <el-button
                v-if="!isSattistic"
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
      :fromData="regionForm"
      @cancel="cancel"
      :legendData="allBaseDataType"
      :placeRules="placeRules"
      :areaTreeData="areaTreeData"
      :disabled="isPreview"
      @save="save"
    ></add>
    <importShp
      v-if="isImport"
      :isShow="isImport"
      @save="importSave"
      @cancel="isImport = false"
    ></importShp>
  </div>
</template>
<script>
import TableOne from "@/components/Table/table.vue";
import Pagination from "@/components/Pagination/index.vue";
import dayjs from "dayjs";
import { exportExcelFile, importExcel } from "@/utils/files.js";
import { deepCopy } from "@/utils/index";
import { BaseDataApi } from "@/utils/db/BaseDataApi";
import add from "./add.vue";
import ElSelectTree from "@/components/el-select-tree/index.vue";
import { Transform } from "@/utils/gis/transforms";
import importShp from "./importShp.vue";
function initSearchForm() {
  return {
    name: "",
    CREATE_TIME: [],
    type: "",
    geojson: "",
  };
}
function initRegionForm() {
  return {
    name: "",
    geojson: "",
    type: "",
    lon: "",
    lat: "",
  };
}
export default {
  name: "placenameManage",
  components: { TableOne, Pagination, add, ElSelectTree, importShp },
  props: {
    // 是否作为组件被通缉分析
    isSattistic: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isImport: false,
      isPreview: false,
      areaData: [],
      allBaseDataType: [],
      tableSlection: [], //表格选中项
      title: "编辑",
      areaTreeData: [],
      placeRules: {
        name: [{ required: true, message: "请输入名称", trigger: "blur" }],
        type: [{ required: true, message: "请选择类型", trigger: "change" }],
        geojson: [
          {
            required: true,
            message: "请上传shp文件或者绘制图形",
            trigger: "change",
          },
        ],
        // lon: [{ required: true, message: "请输入经度", trigger: "change" }],
        // lat: [{ required: true, message: "请输入纬度", trigger: "change" }],
      },
      open: false,
      searchForm: initSearchForm(),
      regionForm: initRegionForm(),
      pagination: {
        pageNumber: 1,
        pageSize: 10,
        total: 0,
        pageSizes: [10, 20, 30],
      },
      result: [],
    };
  },
  filters: {
    filterAreaName(id, areaData) {
      if (id.indexOf(",")) {
        const str = id
          .split(",")
          .map((item) => areaData.find((a) => a.id == item).name)
          .toString();
        return str;
      } else {
        const obj = areaData.find((item) => item.id == id);
        return obj ? obj.name : "";
      }
    },
    filterType(id, types) {
      const obj = types.find((item) => item.value == id);
      return obj ? obj.name : "";
    },
  },
  watch: {},
  created() {
    if (this.isSattistic) {
      // 组件
      this.pagination = {
        pageNumber: 1,
        pageSize: 4,
        total: 0,
        pageSizes: [4],
      };
      this.init();
    } else {
      // 页面
      this.init();
    }
  },
  mounted() {},
  methods: {
    // 导入保存
    async importSave(geojson) {
      // console.log(geojson)
      this.isImport = false;
      const api = new BaseDataApi();
      const res = await api.saveShpData(geojson);
      if (res) {
        this.$message.success("导入成功");
      } else {
        this.$message.warning("导入失败");
      }
      this.getData();
    },
    // 导出excel
    async exportData() {
      if (this.tableSlection.length == 0) {
        this.$message.warning("请选择！");
      } else {
        let data = [];
        let index = 1;
        const trs = new Transform();
        this.tableSlection.forEach((item, key) => {
          data.push({
            序号: index,
            名称: item.name || "", //地名名称 2
            类型: item.type || "",
            经度坐标: trs.DDDToDMS(item.center.split(",")[0]) || "", //经纬度 存储方式113.4,39.8  以逗号个号  经度   纬度
            纬度坐标: trs.DDDToDMS(item.center.split(",")[1]) || "",
            附属信息: item.attached || "", //附属信息
            备注: item.remark || "", //描述
          });
          index += 1;
        });
        exportExcelFile("特殊数据导出", data);
      }
    },
    async init() {
      await this.getType();
      await this.getData();
    },
    addPlaceName() {
      this.title = "新增";
      this.regionForm = initRegionForm();
      this.open = true;
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
      this.open = true;
    },
    // 保存
    async save(obj = null) {
      let params = obj || {};
      const api = new BaseDataApi();
      let res = false;
      if (this.title == "编辑") {
        params["id"] = this.regionForm.id;
        res = await api.updateFunc(params);
      } else {
        res = await api.addFunc(params);
      }
      if (res) {
        this.cancel();
        this.$message.success("操作成功");
        this.regionForm = initRegionForm();
      } else {
        this.$message.warning("操作失败，请重试");
      }
      this.getData();
    },
    //获取类型
    getType() {
      this.allBaseDataType = [
        { name: "路网", value: "路网", label: "路网" },
        { name: "边界", value: "边界", label: "边界" },
      ];
    },
    // 重置
    reset() {
      this.searchForm = initSearchForm();
      this.pagination.pageNumber = 1;
      this.getData();
    },
    // 处理搜索按钮点击
    handlerSearch() {
      this.getData();
    },
    cancel() {
      this.open = false;
      this.isPreview = false;
    },
    /**
     * 获取表格数据
     */
    async getData(obj = {}) {
      const api = new BaseDataApi();
      let params = deepCopy({ ...this.searchForm, ...obj });
      delete params.name;
      if (params.CREATE_TIME.length > 0) {
        params.CREATE_TIME.map((item) => {
          const time = dayjs(item).valueOf();
          // console.log(time);
          return time;
        });
      } else if (params.CREATE_TIME.length == 0) {
        params.CREATE_TIME = "";
      }
      const total = await api.getCount(params);
      const data = await api.getPageQueryData(params, this.pagination);
      this.pagination.total = total;

      // 模拟名称模糊查询
      let list = [];
      if (this.searchForm.name != "") {
        if (data.length > 0) {
          // 从其他条件查询的数据中模拟模糊查询
          list = data.filter(
            (item) => item.name.indexOf(this.searchForm.name) > -1
          );
        } else {
          // 从所有数据中模拟模糊查询
          list = (await api.getPageQueryData({}, this.pagination)).filter(
            (item) => item.name.indexOf(this.searchForm.name) > -1
          );
        }
      } else {
        list = data;
      }

      list = list.map((item) => {
        //   console.log(item);
        item.CREATE_TIME = dayjs(item.CREATE_TIME).format(
          "YYYY-MM-DD HH:mm:ss"
        );
        item.lon = Number(item.center.split(",")[0]).toFixed(2);
        item.lat = Number(item.center.split(",")[1]).toFixed(2);
        return item;
      });
      // if (
      //   this.searchForm.lonStart != "" ||
      //   this.searchForm.lonEnd != "" ||
      //   this.searchForm.latStart != "" ||
      //   this.searchForm.latEnd != ""
      // ) {
      //   if (list.length > 0) {
      //     console.log(list);
      //     if (this.searchForm.lonStart != "" && this.searchForm.lonEnd != "") {
      //       list = list.filter(
      //         (item) =>
      //           item.center != "" &&
      //           Number(item.center.split(",")[0]) >=
      //             Number(this.searchForm.lonStart) &&
      //           Number(item.center.split(",")[0]) <=
      //             Number(this.searchForm.lonEnd)
      //       );
      //     } else if (
      //       this.searchForm.latStart != "" &&
      //       this.searchForm.latEnd != ""
      //     ) {
      //       list = list.filter(
      //         (item) =>
      //           item.center != "" &&
      //           Number(item.center.split(",")[1]) >=
      //             Number(this.searchForm.latStart) &&
      //           Number(item.center.split(",")[1]) <=
      //             Number(this.searchForm.latEnd)
      //       );
      //     }
      //   } else if (data.length > 0) {
      //     if (this.searchForm.lonStart != "" && this.searchForm.lonEnd != "") {
      //       list = data.filter(
      //         (item) =>
      //           item.center != "" &&
      //           Number(item.center.split(",")[0]) >
      //             Number(this.searchForm.lonStart.split[0]) &&
      //           Number(item.center.split(",")[0]) <
      //             Number(this.searchForm.lonEnd.split[1])
      //       );
      //     } else if (
      //       this.searchForm.latStart != "" &&
      //       this.searchForm.latEnd != ""
      //     ) {
      //       list = data.filter(
      //         (item) =>
      //           item.center != "" &&
      //           Number(item.center.split(",")[1]) >
      //             Number(this.searchForm.latStart.split[0]) &&
      //           Number(item.center.split(",")[1]) <
      //             Number(this.searchForm.latEnd.split[1])
      //       );
      //     }
      //   } else {
      //   }
      // }
      this.result = list;
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
      const api = new BaseDataApi();
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
      const api = new BaseDataApi();
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

.content {
  border-radius: 6px;
  background-color: #fff;
  padding: 24px;
  height: calc(100% - 72px);
  max-width: 100%;
}

.search-form {
  border-bottom: 1px solid rgba(198, 205, 222, 0.49);
}

.table-container {
  padding-top: 24px;
  height: 650px;
}

.table-above-btn {
  text-align: right;
  padding-bottom: 14px;
}

.level-tab {
  width: 62px;
  height: 26px;
  border-radius: 13px;
  color: #fff;
  display: inline-block;
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
