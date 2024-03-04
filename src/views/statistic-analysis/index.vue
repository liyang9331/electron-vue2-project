<template>
  <div class="page-content">
    <el-row :gutter="12">
      <el-col :span="4">
        <div class="card-container left-box">
          <div class="title-wraper">
            <div>
              <p class="title-txt">区域</p>
              <img
                class="title-border"
                src="@/assets/images/title-border.png"
                alt=""
              />
            </div>
            <el-checkbox v-model="checkedAll" @change="regionCheckAll"
              >全选</el-checkbox
            >
          </div>
          <div class="region-content">
            <el-tree
              ref="regionTree"
              :data="data"
              show-checkbox
              node-key="id"
              :props="defaultProps"
              default-expand-all
              :check-strictly="false"
              @check="handleChecked"
              @check-change="handleNodeChange"
            ></el-tree>
          </div>
          <div
            style="
              display: flex;
              align-items: center;
              width: 100%;
              justify-content: center;
              margin-top: 20px;
            "
          >
            <el-button @click="reset">重置</el-button>
            <el-button type="primary" @click="regionQuery">查询</el-button>
          </div>
        </div>
      </el-col>
      <el-col :span="20">
        <div class="card-container right-top-box">
          <div class="">
            <el-select v-model="analysisBy">
              <el-option
                v-for="by in byArr"
                :key="by.value"
                :value="by.value"
                :label="by.label"
              ></el-option>
            </el-select>
            <span class="palce-total">
              共查询相关地名 <span class="total-txt">{{ total }}</span> 项</span
            >
          </div>
          <BarCharts
            v-if="types != null && types.values.length > 0"
            :types="types"
            @customHandler="customHandler"
            style="height: 300px"
          />
          <div class="tips" v-else style="height: 300px">
            <!-- 请在左侧选择查询区域 -->
            <div class="img">
              <span>{{
                types != null ? "没有查询到相关数据" : "请在左侧选择查询区域"
              }}</span>
            </div>
          </div>
        </div>
        <div class="card-container right-bottom-box">
          <StatisticsTable ref="table" @callback="callback"></StatisticsTable>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import Pagination from "@/components/Pagination/index.vue";
import BarCharts from "./components/barCharts.vue";
import { AreaApi } from "@/utils/db/AreaApi";
import StatisticsTable from "./components/table.vue";
import { StatisticsApi } from "@/utils/db/statisticsApi";
import { objectEmpty } from "@/utils/index";
import createTree from "@/components/el-select-tree/createTree";
export default {
  name: "",
  components: { Pagination, BarCharts, StatisticsTable },
  data: () => {
    return {
      checkedAll: false,
      searchForm: {},
      data: [],
      defaultProps: {
        children: "children",
        label: "label",
      },
      treeNodeKeys: [],
      byArr: [],
      analysisBy: 0,
      total: 0,
      types: null,
      typesList: [],
      reginList: [],
    };
  },
  watch: {
    analysisBy(val) {
      if (this.typesList.length > 0) {
        this.types = this.typesList[val];
      } else {
        this.getData(val);
      }
    },
  },
  created() {
    if (this.$store.state.app.isAdmin) {
      this.byArr = [
        { value: 0, label: "按地名类型分析" },
        { value: 1, label: "按数据密级分析" },
      ];
    } else {
      this.byArr = [{ value: 0, label: "按地名类型分析" }];
    }
    this.getAreaTree();
  },
  mounted() {},
  methods: {
    query() {
      // 修改tabel页码
      this.$refs["table"].resetPageNumber();
      this.$refs["table"].getData(this.searchForm);
    },
    // 区域树查询
    async regionQuery() {
      const api = new StatisticsApi();
      let nodes = this.$refs.regionTree.getCheckedNodes();
      let keys = this.$refs.regionTree.getCheckedKeys();
      // 修改tabel页码
      this.$refs["table"].resetPageNumber();
      // 清除表格中已有的数据密级、类型条件
      this.$refs["table"].clearSearch();
      // 区域名称集合
      // 提取一级区域和二级区域
      // console.log(nodes)
      let oneLevels = nodes
        .filter((item) => item.parentid == "/")
        .map((item) => item.name);
      let secondLevels = nodes
        .filter((item) => item.parentid != "/")
        .map((item) => item.name);
      const list = this.reginList.filter((item) =>
        nodes.find((a) => a.name == item.name)
      );
      this.$refs["table"].areaTreeData = createTree(list);
      // 手动为地名管理页面设置区域查询条件
      this.$refs["table"].sattisticRegionKeys = nodes.map((item) => item.name);
      const { types, levels, total } = await api.getRegionTotalStatistics({
        oneLevels: oneLevels,
        secondLevels: secondLevels,
      });
      // console.log(levels)
      this.total = total;
      console.log(total, types, levels);
      this.typesList[0] = { values: [], max: [], xAxisData: [] };
      this.typesList[1] = { values: [], max: [], xAxisData: [] };
      // 处理数据
      types.forEach((item) => {
        if (item.count > 0) {
          this.typesList[0].values.push({ value: item.count, data: item });
          this.typesList[0].max.push(
            Math.max.apply(
              Math,
              types.map((b) => b.count)
            )
          );
          this.typesList[0].xAxisData.push(item.name);
        }
      });
      levels.forEach((item) => {
        if (item.count > 0) {
          this.typesList[1].values.push({ value: item.count, data: item });
          this.typesList[1].max.push(
            Math.max.apply(
              Math,
              levels.map((b) => b.count)
            )
          );
          this.typesList[1].xAxisData.push(item.name);
        }
      });
      this.types = this.typesList[this.analysisBy];
      this.$refs["table"].getData();
    },
    reset() {
      this.checkedAll = false;
      this.$refs.regionTree.setCheckedNodes([]);
      this.$refs["table"].reset();
      this.total = 0;
      this.types = null;
    },
    callback(data) {
      // this.total = data.total;
    },
    handleNodeChange(data, isSelect, isChild) {},
    customHandler(data) {
      // console.log(data)
      this.searchForm = objectEmpty({ ...this.searchForm, ...data });
      if (!data.securityLevel) {
        this.searchForm.securityLevel = "";
      } else {
        this.searchForm.securityLevel = [this.searchForm.securityLevel];
        this.searchForm.type = "";
      }
      // console.log(this.searchForm);
      this.query();
    },
    async getData(val) {
      const api = new StatisticsApi();
      if (val == 0) {
        let res = await api.getDataForType();
        res = res.filter((item) => item.count > 0);
        // console.log(res);
        const maxValue = res.reduce(
          (max, item) => (item.count > max ? item.count : max),
          res[0].count
        );
        let values = [];
        let max = [];
        let xAxisData = [];
        // console.log(res);
        res.forEach((item) => {
          values.push({ value: item.count, data: item });
          max.push({ value: maxValue, data: item });
          // console.log(item.name)
          xAxisData.push(item.name);
        });
        this.types = { values, max, xAxisData };
      } else {
        const res = await api.getDataForSecurityLevel();
        // console.log(res);
        // return;
        const maxValue = res.reduce(
          (max, item) => (item.count > max ? item.count : max),
          res[0].count
        );
        let values = [];
        let max = [];
        let xAxisData = [];
        console.log(res);
        res.forEach((item) => {
          values.push({ value: item.count, data: item });
          max.push({ value: maxValue, data: item });
          xAxisData.push(item.name);
        });
        this.types = { values, max, values, xAxisData };
      }
    },
    /**
     * 获取区域树
     * @param {*} id
     */
    async getAreaTree() {
      const api = new AreaApi();
      // const res = await api.getTree();
      const list = await api.getPageQueryData({}, { pageSize: 99999999 });
      this.reginList = list;
      this.data = createTree(list);
    },
    handleChecked(data, val) {
      //   console.log(data);
      //   this.checkedAll =
      //     val.checkedKeys.length === this.treeNodeKeys.length &&
      //     val.checkedKeys.length > 0;
    },
    onDetail() {},
    pageChange() {},
    regionCheckAll(val) {
      this.data.forEach((item) => {
        this.treeNodeKeys.push(item.id);
      });
      if (val) {
        this.$refs.regionTree.setCheckedKeys(this.treeNodeKeys);
      } else {
        this.$refs.regionTree.setCheckedKeys([]);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
// ::v-deep .el-tree {
//   // background: #ce0000;
//   overflow: hidden;
//   .el-tree-node__label {
//     word-wrap: break-word;
//   }
// }
:deep(.el-tree-node) {
  white-space: normal;
  outline: 0;

  .el-tree-node__content {
    text-align: left;
    align-items: start;
    margin: 4px;
    height: 100%;
  }
}

.tips {
  display: flex;
  align-items: center;
  justify-content: center;
  // color: #fff;
  font-size: 18px;

  .img {
    width: 370px;
    height: 188px;
    background-image: url("../../assets/images/log-img.svg");
    background-size: cover;
    position: relative;

    span {
      //       width: 80px;
      // height: 8px;
      position: absolute;
      bottom: -10px;
      text-align: center;
      width: 100%;
      font-size: 12px;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      font-weight: 400;
      color: #8895b5;
      line-height: 0px;
      -webkit-background-clip: text;
      // -webkit-text-fill-color: transparent;
    }
  }
}

.card-container {
  border-radius: 6px;
  background-color: #fff;
  box-shadow: 0px 3px 8px 1px rgba(0, 46, 155, 0.12);
  height: 39.3vh;
}

.left-box {
  min-height: calc(100vh - 115px);

  .title-txt {
    font-weight: bold;
    color: #001a58;
    font-size: 18px;
    margin: 0;
  }

  .title-border {
    height: 4px;
    width: 58px;
  }

  .title-wraper {
    padding: 22px 18px 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.right-top-box {
  margin-bottom: 12px;
  padding: 24px 26px;

  .palce-total {
    display: inline-block;
    color: #53638b;
    font-size: 14px;
    margin-left: 20px;

    .total-txt {
      color: #0060ce;
      font-weight: bold;
    }
  }
}

.right-bottom-box {
  padding: 24px 26px;

  & > div {
    height: 100%;

    & ::v-deep .content {
      height: 100% !important;

      .comp-table-container {
        height: 80%;
      }
    }
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
}
</style>

<style lang="scss">
.region-content {
  max-height: 75%;
  overflow-y: auto;

  .el-tree-node__content {
    color: #001a58;
    height: 36px;
  }

  .el-tree-node__content:not(.el-tree-node__children .el-tree-node__content) {
    background-color: #f3f5fa;
    font-weight: bold;
  }

  .expanded.el-tree-node__expand-icon.el-icon-caret-right {
    color: #8895b5;
  }
}
</style>
