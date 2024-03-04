<template>
  <div>
    <el-table :data="tableData" row-key="id" default-expand-all @selection-change="handleSelectionChange">
      <el-table-column v-if="selected" type="selection" width="55" align="center"></el-table-column>
      <el-table-column v-if="xuHaoShow" prop="applyName" align="center" label="序号">
        <template #default="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column v-for="item in tableConfig" :type="item.type" :key="item.prop" :prop="item.prop"
        :label="item.label" :align="item.align" :min-width="item.minWidth" :fixed="item.fixed"
        :show-overflow-tooltip="item.tooltip">
        <template #default="scope">
          <div v-if="item.type == 'text'" :style="{ textAlign: item.align }">
            <template v-if="item.prop == 'configParams'">
              <span class="link">{{ scope.row[item.prop] }}</span>
            </template>
            <template v-else-if="item.prop == 'configParams1'">
              <span @click="item.cb(scope.row)" class="link">{{
                scope.row["configParams"]
              }}</span>
            </template>
            <template v-else-if="item.prop == 'configParam'">
              <span class="link">{{
                getConfigParamNum(scope.row["CONTENT"])
              }}</span>
            </template>
            <template v-else-if="item.prop == 'testResult'">
              <span v-if="handIsShowResultData(scope.row) == 0">暂无异常数据</span>
              <el-icon v-else style="vertical-align: middle; cursor: pointer" color="#409eff" size="20px"
                @click="item.cb(scope.row)">
                <!-- <Document/> -->
              </el-icon>
            </template>
            <template v-else-if="item.prop == 'abnormalDataNum'">
              <span>{{ handIsShowResultData(scope.row) }}</span>
            </template>
            <template v-else-if="item.prop == 'TYPE'">
              <span v-if="item.label == '字典值类型'">
                {{ contentType[scope.row[item.prop]] }}</span>
              <span v-else>{{ scope.row[item.prop] }}</span>
            </template>
            <template v-else-if="item.prop == 'dicValue'">
              <span>{{
                scope.row["HTMLVALUE"]
                ? scope.row["HTMLVALUE"]
                : scope.row["VALUE"]
              }}</span>
            </template>
            <template v-else>
              <span>{{ scope.row[item.prop] }}</span>
            </template>
          </div>
          <div v-else-if="item.type == 'textBtn'" class="btnList" :style="{ textAlign: item.align }">
            <div class="text-btn" v-for="(item1, index1) in item.operations" :key="index1">
              <span :class="[
                item1.type,
                'btnStyle',
              ]" @click="item1.cb(scope.row, scope.$index)" v-if="item1.title == '空间长度检验' &&
  scope.row['configParams'] != ''
  ">
                {{ item1.name }}</span>
              <span v-else-if="item.label == '检测结果'">
                <span v-if="handIsShowResultData(scope.row) == 0">暂无异常数据</span>
                <span v-else :class="[
                  item1.type,
                  'btnStyle',
                ]" @click="item1.cb(scope.row, scope.$index)">
                  {{ item1.name }}
                </span>
              </span>
              <span v-else :class="[
                item1.type,
                'btnStyle',
              ]" @click="item1.cb(scope.row, scope.$index)">
                {{ item1.name }}
              </span>
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "tableOne",
  components: {
  },
  props: {
    tableData: {
      type: Array,
      required: true,
    },
    tableConfig: {
      type: Array,
      required: true,
    },
    selected: {
      type: Boolean,
      default () {
        return false;
      },
    },
    xuHaoShow: {
      type: Boolean,
      default () {
        return false;
      },
    },
    resultData: {
      type: Object,
      default () {
        return {};
      },
    },
  },
  data () {
    return {
      contentType: {
        1: "纯文本",
        2: "富文本",
      },
    };
  },
  methods: {
    // 多选事件
    handleSelectionChange (list) {
      this.$emit("handleSelectionChange", list);
    },
    // 获取配置参数个数
    getConfigParamNum (str) {
      let obj = JSON.parse(str);
      return Object.getOwnPropertyNames(obj).length;
    },
    // 判断有没有计算数据
    handIsShowResultData (row) {
      if (row.computationalData == undefined) return;
      let arrData = this.resultData[row.computationalData];
      return arrData.length;
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-table {
    border: 1px solid #dfe6ec;

    tr {
      .cell div {
        overflow: hidden;
        white-space: nowrap !important;
        text-overflow: ellipsis;
        word-break: break-all;
      }
    }
  }
}

.btnList {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.link {
  cursor: pointer;
  color: $color_theme;
}

.btnStyle {
  border-radius: 2px;
  padding: 2px 4px;
  cursor: pointer;
}

.primary {
  font-size: 12px;
  color: $color_primary;
  line-height: 20px;
  // border: 1px solid rgba(1, 144, 227, 0.5);
}

.warning {
  font-size: 12px;
  color: $color_warning;
  line-height: 20px;
  // border: 1px solid rgba(235, 100, 100, 0.5);
}
.danger{
  font-size: 12px;
  color: $color_danger;
  line-height: 20px;
}
</style>