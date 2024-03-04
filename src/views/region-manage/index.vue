<template>
  <div class="page-content">
    <div class="content">
      <el-form
        ref="searchForm"
        :model="searchForm"
        label-width="80px"
        class="search-form"
      >
        <el-row>
          <el-col :span="6">
            <el-form-item label="区域名称">
              <el-input v-model="searchForm.name" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="创建日期">
              <el-date-picker
                v-model="searchForm.CREATE_TIME"
                type="daterange"
                value-format="yyyy-MM-dd"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :offset="4" :span="6" style="textalign: right">
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
          <el-button class="action-btn" @click="addRegion"
            ><svg-icon icon-class="add" /> 添加区域</el-button
          >
          <el-button class="action-btn" @click="downloadExcelTemplate"
            ><i class="el-icon-download" /> 下载模板</el-button
          >
          <el-button class="action-btn" @click="openImportExcel()"
            ><svg-icon icon-class="import" /> 导入区域</el-button
          >
          <el-button class="delete-btn" @click="handlerDeleteBatch()"
            ><svg-icon icon-class="del-batch" /> 批量删除</el-button
          >
        </div>
        <!-- <TableOne :tableData="result" :tableConfig="tableConfigResult" :selected="true" :xuhaoShow="true"></TableOne> -->
        <el-table
          height="100%"
          :data="result"
          row-key="id"
          border
          default-expand-all
          @selection-change="tableSelectionChange"
        >
          <el-table-column
            type="selection"
            fixed="left"
            min-width="55"
            align="center"
          ></el-table-column>
          <el-table-column
            type="index"
            align="center"
            label="序号"
            min-width="55"
          >
            <template #default="scope">
              {{ scope.row.parentid == 0 ? scope.$index + 1 : "" }}
            </template>
          </el-table-column>
          <el-table-column
            prop="name"
            label="区域名称"
            width="180"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="remark"
            label="描述信息"
            align="center"
          ></el-table-column>
          <!-- <el-table-column
            prop="index"
            label="显示顺序"
            width="80"
            align="center"
          ></el-table-column> -->
          <el-table-column
            prop="CREATE_TIME"
            label="创建时间"
            sortable
            width="180"
            align="center"
          ></el-table-column>
          <el-table-column label="操作" width="220" align="center">
            <template #default="scope">
              <el-button
                @click="preveiw(scope.row)"
                class="table-btn-blue"
                type="text"
                >查看</el-button
              >
              <el-button
                v-if="scope.row.parentid && scope.row.parentid == '/'"
                class="table-btn-blue"
                type="text"
                @click="addChildRegion(scope.row)"
                >添加二级区域</el-button
              >
              <el-button
                class="table-btn-orange"
                type="text"
                @click="editRegion(scope.row)"
                >编辑</el-button
              >
              <el-button
                class="table-btn-red"
                type="text"
                @click="handlerDelete(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <!-- <div class="pagination" v-if="pagination.total != 0">
          <pagination
            v-show="pagination.total > 0"
            :total="pagination.total"
            :page.sync="pagination.pageNumber"
            :limit.sync="pagination.pageSize"
            @pagination="pageChange"
          />
        </div> -->
      </div>
    </div>
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form
        ref="form"
        :model="regionForm"
        :rules="regionRules"
        label-width="100px"
        label-suffix="："
      >
        <el-form-item label="上级区域" prop="parentid">
          <!-- <el-select-tree
            v-model="regionForm.parentid"
            placeholder="请选择上级区域"
            filterable
            clearable
            :multiple="true"
            :isRadio="true"
            :checkStrictly="true"
            :data="options"
            :disabled="isPreview || selectDisabled"
          /> -->
          <el-cascader
            v-model="regionForm.parentid"
            :options="options"
            :props="{ checkStrictly: true }"
            style="width: 100%"
            clearable
            :disabled="isPreview || selectDisabled"
            placeholder="请选择上级区域"
          />
        </el-form-item>
        <el-form-item label="区域名称" prop="name">
          <el-input
            v-model="regionForm.name"
            placeholder="请输入区域名称"
            maxlength="30"
            :disabled="isPreview"
          />
        </el-form-item>
        <el-form-item label="描述信息" prop="remark">
          <el-input
            v-model="regionForm.remark"
            type="textarea"
            placeholder="请输入描述信息"
            :disabled="isPreview"
          />
        </el-form-item>
        <el-form-item label="shp文件" prop="geojson" v-if="!isPreview">
          <el-button @click="uploadFile" size="small" type="primary"
            >点击上传</el-button
          >
          <div class="el-upload__tip">请上传shp文件</div>
          <div
            v-if="regionForm.fileName"
            class="el-upload__tip"
            style="color: black; font-size: 16px"
          >
            {{ regionForm.fileName }}
          </div>
        </el-form-item>
        <el-form-item label="展示方式" required>
          <el-row>
            <el-col :span="6">
              <el-form-item label="填充" label-width="100px">
                <el-color-picker
                  v-model="regionForm.symbol.polygonFill"
                  show-alpha
                ></el-color-picker>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="线条" label-width="100px">
                <el-color-picker
                  v-model="regionForm.symbol.lineColor"
                  show-alpha
                ></el-color-picker>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="线宽" label-width="80px">
                <el-input
                  v-model="regionForm.symbol.lineWidth"
                  placeholder="请输入"
                  :disabled="disabled"
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <!-- <el-form-item label="显示顺序" prop="index">
          <el-input-number v-model="regionForm.index" :disabled="isPreview" />
        </el-form-item> -->
        <el-form-item class="center-container">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" v-if="!isPreview" @click="onSubmit()"
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
import { AreaApi } from "@/utils/db/AreaApi";
import createTree from "@/components/el-select-tree/createTree.js";
import dayjs, { Ls } from "dayjs";
import { ipcRenderer } from "electron";
import parseShapeFile from "@/utils/map/parseShapefile";
import { objectEmpty } from "@/utils/index";
import { exportExcelFile, importExcel } from "@/utils/files.js";
import * as maptalks from "maptalks";
import { deepCopy } from "@/utils/index";
import ElSelectTree from "@/components/el-select-tree/index.vue";
import { Transform } from "@/utils/gis/transforms";
const remote = require("@electron/remote");
const path = require("path");
function initSearchForm() {
  return {
    name: "",
    CREATE_TIME: "",
  };
}
function initRegionForm() {
  return {
    parentid: "",
    name: "",
    remark: "",
    fileName: null,
    index: 1,
    id: "",
    geojson: null,
    symbol: {
      polygonFill: "",
      lineColor: "",
      lineWidth: "",
    },
  };
}
export default {
  name: "RegionManage",
  components: { TableOne, Pagination, ElSelectTree },
  data: () => {
    return {
      searchForm: initSearchForm(),
      isPreview: false, //是否预览
      selectDisabled: false, //区域下拉选择是否禁用
      title: "新增区域",
      open: false,
      pagination: { pageNumber: 1, pageSize: 99999, total: 0 },
      regionForm: initRegionForm(),
      regionRules: {
        parentid: [
          { required: true, message: "请选择上级区域", trigger: "change" },
        ],
        name: [{ required: true, message: "请输入区域名称", trigger: "blur" }],
        geojson: [
          { required: true, message: "请上传shp文件", trigger: "change" },
        ],
        // index: [
        //   { required: true, message: "请输入排序", trigger: "blur, change" },
        // ],
      },
      options: [],
      result: [],
      tableSlection: [], //表格选中项
    };
  },
  created() {
    this.getData();
    this.getAreaTree();
  },
  mounted() {},
  methods: {
    // 下载地面excel模板
    downloadExcelTemplate() {
      const filePath = path.join(
        process.cwd(),
        "data",
        "excel",
        "区域导入模板.xlsx"
      );
      const win = remote.getCurrentWindow();
      win.webContents.downloadURL(filePath);
    },
    addChildRegion(row) {
      this.regionForm.parentid = row.id;
      //console.log(this.regionForm.parentid)
      this.selectDisabled = true;
      this.title = "新增区域";
      this.open = true;
      //console.log(this.regionForm.parentid)
      // this.addRegion(false);
    },
    // 重置
    reset() {
      this.searchForm = initSearchForm();
      this.getData();
    },
    // 处理搜索按钮点击
    handlerSearch() {
      this.getData();
    },
    // 表格 当选择项发生变化时会触发该事件
    tableSelectionChange(e) {
      //   //console.log(e);
      this.tableSlection = e;
    },

    // 上传文件
    uploadFile() {
      const customEventHandler = (event, files) => {
        if (files.eventType == "uploadShp") {
          parseShapeFile(files.filePaths).then((geojson) => {
            this.regionForm.fileName = files.fileName;
            // 序列化geojson
            console.log(geojson)
            this.regionForm.geojson = JSON.stringify(geojson);
            ipcRenderer.removeListener("uploadFileWatch", customEventHandler);
          });
        }
      };
      ipcRenderer.on("uploadFileWatch", customEventHandler);
      ipcRenderer.send("uploadShp", { eventType: "uploadShp" });
    },
    // 预览
    preveiw(row) {
      this.title = "查看区域";
      this.isPreview = true;
      this.open = true;
      this.regionForm = Object.assign({}, this.regionForm, row);
      this.getAreaTree(row.id);
    },
    addRegion(isReset = true) {
      this.title = "新增区域";
      this.open = true;
      if (isReset) {
        this.regionForm = initRegionForm();
      }
      this.getAreaTree();
    },
    editRegion(row) {
      this.title = "编辑区域";
      this.open = true;
      this.regionForm = Object.assign({}, this.regionForm, row);
      const geo =
        this.regionForm.geojson != ""
          ? JSON.parse(this.regionForm.geojson)
          : "";
      if (geo != "") {
        if (
          geo.type == "FeatureCollection" &&
          geo.features[0].properties.symbol
        ) {
          this.regionForm.symbol = geo.features[0].properties.symbol;
        } else if (geo.type == "Feature" && geo.properties.symbol) {
          this.regionForm.symbol = geo.properties.symbol;
        }
      }
      this.getAreaTree(row.id);
    },
    pageChange() {
      this.getData();
    },
    cancel() {
      this.open = false;
      this.isPreview = false;
      this.selectDisabled = false;
      this.isPreview = false;
      this.regionForm = initRegionForm();
    },
    /**
     * 获取表格数据
     */
    async getData() {
      const api = new AreaApi();
      //   模糊搜索
      let params = deepCopy(this.searchForm);
      // params.name = params.name ? `%${params.name}%` : "";
      delete params.name;
      if (params.CREATE_TIME.length > 0) {
        params.CREATE_TIME.map((item) => {
          const time = dayjs(item).valueOf();
          //console.log(time);
          return time;
        });
      } else if (params.CREATE_TIME.length == 0) {
        params.CREATE_TIME = "";
      }
      // //console.log(params);
      const total = await api.getCount(params);
      const data = await api.getPageQueryData(params, this.pagination);
      this.pagination.total = total;
      // 模拟名称模糊查询
      let list = [];
      //console.log(data);
      if (this.searchForm.name != "") {
        if (data.length > 0) {
          // 从其他条件查询的数据中模拟模糊查询
          list = data.filter(
            (item) =>
              item.name != null && item.name.indexOf(this.searchForm.name) > -1
          );
        } else {
          // 从所有数据中模拟模糊查询
          list = (await api.getPageQueryData({}, this.pagination)).filter(
            (item) =>
              item.name != null && item.name.indexOf(this.searchForm.name) > -1
          );
        }
      } else {
        // //console.log("分页", this.pagination.total, data);
        if (data.length > 0) {
          list = data.map((item) => {
            //   //console.log(item);
            item.CREATE_TIME = dayjs(item.CREATE_TIME).format(
              "YYYY-MM-DD HH:mm:ss"
            );
            // item.lon =
            //   item.center != ""
            //     ? Number(item.center.split(",")[0]).toFixed(2)
            //     : "";
            // item.lat =
            //   item.center != ""
            //     ? Number(item.center.split(",")[1]).toFixed(2)
            //     : "";
            return item;
          });
        }
      }
      // //console.log(list);
      this.result = createTree(list);
    },
    /**
     * 获取区域树
     * @param {*} id
     */
    async getAreaTree(id = "") {
      const api = new AreaApi();
      // const res = await api.getTree();
      const result = await api.getPageQueryData({}, { pageSize: 999999999999 });
      // //console.log(result)
      const baseTree = [{ value: "/", label: "/" }];
      const filterTree = result.filter(
        (item) => item.id != id && item.parentid == "/"
      );
      const list = filterTree.map((item) => {
        return { ...item, value: item.id, label: item.name };
      });
      this.options = [...baseTree, ...list];
    },
    onSubmit() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.regionForm.parentid = Array.isArray(this.regionForm.parentid)
            ? this.regionForm.parentid[0]
            : this.regionForm.parentid;
          // //console.log(this.regionForm);
          // 处理geojson，添加样式到属性中
          let geo = JSON.parse(this.regionForm.geojson);
          if (geo.type == "FeatureCollection") {
            geo.features.forEach((item, key) => {
              geo.features[key].properties.symbol = this.regionForm.symbol;
            });
          } else if (geo.type == "Feature") {
            geo.properties.symbol = this.regionForm.symbol;
          }
          this.regionForm.geojson = JSON.stringify(geo);
          delete this.regionForm.symbol;
          // console.log(this.regionForm)
          this.save();
        } else {
          //console.log("error submit!!");
          return false;
        }
      });
    },

    async save(obj = null) {
      let params = obj || {
        name: this.regionForm.name,
        "`index`": this.regionForm.index,
        parentid: this.regionForm.parentid,
        remark: this.regionForm.remark,
        geojson: this.regionForm.geojson,
      };
      const api = new AreaApi();
      let res = false;
      if (this.title == "编辑区域") {
        params["id"] = this.regionForm.id;
        //console.log(params, "params---区域");
        res = await api.updateFunc(params);
      } else {
        // 使用批量添加
        res = await api.addListFunc(Array.isArray(params) ? params : [params]);
      }
      if (res) {
        this.$message.success("操作成功");
      } else {
        this.$message.warning("操作失败，请重试");
      }
      this.getData();
      this.getAreaTree();
      this.cancel();
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
      const api = new AreaApi();
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
      //   //console.log(params);
      const api = new AreaApi();
      const res = await api.getDeleteBatchFunc(params);
      if (res) {
        this.cancel();
        this.$message.success("操作成功");
      } else {
        this.$message.warning("操作失败，请重试");
      }
      this.getData();
    },
    // 导入excel
    openImportExcel() {
      //console.log("打开文件选择窗口");
      const that = this;
      importExcel().then(async (data) => {
        //console.log("导入区域");
        let list = [];
        function track(str) {
          if (str.indexOf(",") > -1) {
            return str.split(",");
          } else if (str.indexOf("，") > -1) {
            return str.split("，");
          }
        }
        const api = new AreaApi();
        const result = await api.getPageQueryData(
          {},
          { pageSize: 9999999999999 }
        );
        const trs = new Transform();
        for (let a = 1; a < data.length; a++) {
          if (data[a].length < 5) {
            break;
          }
          // 导入的地名数据均有可能是错误的，忽略错误添加到数据库中
          let point1 = null;
          let point2 = null;
          let geojson = "";
          let parentid = "";
          let name = "";
          if (data[a][3] != null && data[a][3] != "") {
            // 提取对角线坐标
            point1 = [
              trs.DMSToDDD(track(data[a][3])[1]),
              trs.DMSToDDD(track(data[a][3])[0]),
            ];
          }
          if (data[a][4] != null && data[a][4] != "") {
            point2 = [
              trs.DMSToDDD(track(data[a][4])[1]),
              trs.DMSToDDD(track(data[a][4])[0]),
            ];
          }
          //console.log(point1, point2);
          if (point1 != null && point2 != null) {
            point1 = new maptalks.Point(point1); // 第一个点的坐标
            point2 = new maptalks.Point(point2); // 第二个点的坐标
            geojson = {
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    point1.toArray(),
                    new maptalks.Coordinate(point2.x, point1.y).toArray(),
                    point2.toArray(),
                    new maptalks.Coordinate(point1.x, point2.y).toArray(),
                    point1.toArray(), // 闭合多边形
                  ],
                ],
              },
              properties: {},
            };
            // //console.log(geojson)
          }
          // 导入说明：一级区域单元格有内容，二级单元格没有，说明当前导入的区域是一级
          // 一级单元格有内容、二级单元格也有内容，则是二级区域
          if (data[a][2] == "" || data[a][2] == null) {
            parentid = "/";
          } else {
            parentid = data[a][1];
            // if(data.find(item=>item[])){}
            // parentid = (
            //   result.find((item) => item.name == data[a][1]) || {
            //     id: data[a][2],
            //   }
            // ).id;
          }
          if (data[a][2] == "" || data[a][2] == null) {
            name = data[a][1];
          } else {
            name = data[a][2];
          }
          if (
            point1 == null ||
            point2 == null ||
            // parentid == "" ||
            name == ""
          ) {
            this.$message.warning("导入数据有错误信息");
            break;
          }
          let params = {
            parentid,
            name,
            remark: data[a][5] || "",
            geojson: JSON.stringify(geojson),
          };
          // //console.log(params)
          list.push(params);
        }
        this.title = "增加区域";

        // list 转树形结构
        let addIds = [];
        const groupList = this.addGroup(list);
        const task = (item) => {
          return new Promise(async (resolve, reject) => {
            let flag = false;
            let data = deepCopy(item);
            // //console.log(data);
            if (data.parentid == "/") {
              // 检测一级区域是否存在
              const res = await api.getPageQueryData(
                { name: data.name },
                { pageSize: 1 }
              );
              //console.log(res);
              if (res.length > 0) {
                //console.log("一级区域存在");
                // 添加子区域
                const list = item.children.map((item) => {
                  delete item.label;
                  delete item.value;
                  delete item.children;
                  item.parentid = res[0].id;
                  return item;
                });
                //console.log(list);
                const result = await api.addListFunc(list);
                if (result) {
                  addIds = [...addIds, ...result];
                  flag = true;
                }
              } else {
                //console.log("一级区域不存在");
                let params = deepCopy(item.children);
                delete data.label;
                delete data.value;
                delete data.children;
                const id = await api.addFunc(data);
                // //console.log(id)
                addIds.push(id);
                const list = params.map((item) => {
                  delete item.label;
                  delete item.value;
                  delete item.children;
                  item.parentid = id;
                  return item;
                });
                // //console.log(list);
                const res = await api.addListFunc(list);
                if (res) {
                  addIds = [...addIds, ...res];
                  flag = true;
                }
              }
            } else {
              // 二级区域
              delete data.label;
              delete data.value;
              delete data.children;
              data.parentid = result.find(
                (item) => item.name == data.parentid
              ).id;
              // //console.log(data);
              const res = await api.addFunc(data);
              if (res) {
                addIds = [...addIds, ...res];
                flag = true;
              }
            }
            if (flag) {
              resolve(true);
            } else {
              reject(false);
            }
          });
        };

        const results = await Promise.all(
          groupList.map(async (item) => task(item))
        );
        if (results.find((item) => item === false)) {
          this.$message.warning("导入错误，请重试");
        } else {
          this.$message.success("导入成功！");
          this.getData();
        }
        //console.log();
        // this.save(list);
        // //console.log(list);
      });
    },
    addGroup(arr) {
      const map = new Map();
      let result = [];

      // 将一维数组转化为以id为键的Map
      arr.forEach((item) => {
        map.set(item.name, {
          label: item.name,
          value: item.id,
          children: [],
          ...item,
        });
      });
      // //console.log(map);
      // 遍历数组，将子节点添加到父节点的children属性中
      map.forEach((item) => {
        const parent = map.get(item.parentid);
        let obj = item;
        if (parent) {
          parent.children.push(obj);
        } else {
          result.push(obj); // 如果没有父节点，将其视为根节点
        }
        // if (item.children.length == 0) {
        //   delete obj.children;
        // }
      });

      return result;
    },
  },
};
</script>

<style lang="scss" scoped>
.center-container {
  display: flex;
  justify-content: center;
  /* 水平居中 */
  align-items: center;

  /* 垂直居中 */
  /* 可以添加其他样式，如背景颜色等 */
  ::v-deep .el-form-item__content {
    margin: 0 !important;
  }
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
}

.table-container {
  padding-top: 24px;
  height: 605px;
}

.table-above-btn {
  text-align: right;
  padding-bottom: 14px;
}
</style>
