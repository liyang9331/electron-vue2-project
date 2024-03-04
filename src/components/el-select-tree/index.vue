<template>
  <el-select
    :title="multiple ? optionData.name : ''"
    ref="select"
    :value="value"
    :placeholder="placeholder"
    size="mini"
    clearable
    :disabled="disabled"
    :filterable="filterable"
    :filter-method="filterMethod"
    style="width: 100%"
    @clear="clear"
    @visible-change="visibleChange"
  >
    <el-option
      ref="option"
      class="tree-select__option"
      :value="optionData.id"
      :label="optionData.name"
    >
      <el-tree
        ref="tree"
        class="tree-select__tree"
        :class="`tree-select__tree--${multiple ? 'checked' : 'radio'}`"
        :node-key="nodeKey"
        :data="data"
        :props="treeProps"
        :default-expanded-keys="keys"
        :show-checkbox="multiple"
        :highlight-current="!multiple"
        :expand-on-click-node="multiple"
        :check-strictly="checkStrictly"
        :filter-node-method="filterNode"
        @node-click="handleNodeClick"
        @check-change="handleCheckChange"
        @check="treeCheck"
      ></el-tree>
      <div style="text-align: right; padding-right: 10px">
        <el-button
          v-if="isRadio === false && isShowConfirm"
          size="small"
          type="primary"
          >确认</el-button
        >
      </div>
    </el-option>
  </el-select>
</template>

<script>
import emitter from "element-ui/src/mixins/emitter"; // 分发事件的el-form处理方法
export default {
  name: "ElSelectTree",
  model: {
    prop: "value",
    event: "custom",
  },
  mixins: [emitter],
  props: {
    disabled: { type: Boolean, default: false },
    // v-model绑定
    value: [String, Number],
    isRadio: {
      type: Boolean,
      default: false, //是否单选
    },
    placeholder: {
      type: String,
      default: "请选择",
    },
    // 是否启用checkbox
    multiple: {
      type: Boolean,
      default: false,
    },
    // 树形的数据
    data: {
      type: Array,
      default: function () {
        return [];
      },
    },
    // 每个树节点用来作为唯一标识的属性
    nodeKey: {
      type: [String, Number],
      default: "name",
    },
    filterable: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    // 是否取消父子联动
    checkStrictly: {
      type: Boolean,
      default: false,
    },
    // 多选情况下是否显示确认按钮
    isShowConfirm: {
      type: Boolean,
      default: true,
    },
    // tree的props配置
    treeProps: {
      type: Object,
      default: function () {
        return {
          label: "label",
          value: "value",
          children: "children",
        };
      },
    },
  },
  data() {
    return {
      keys:[],
      optionData: {
        id: "",
        name: "",
      },
      filterFlag: false,
      currentCheckData: {}, // 当前选中的值
    };
  },
  watch: {
    value: {
      handler(val) {
        // console.log(val)
        this.keys = val.indexOf(",")>-1?val.split(","):[val]
        if(this.$refs.tree){
          this.$refs.tree.setCheckedKeys(this.keys)
        }
        
        if (!this.isEmpty(this.data)) {
          this.init(val);
        }
      },
      immediate: true,
    },
    data: function (val) {
      if (!this.isEmpty(val)) {
        this.init( this.val);
      }
    },
  },
  created() {
    this.keys = this.value.indexOf(",")>-1?this.value.split(","):[this.value]
  },
  methods: {
    // 是否为空
    isEmpty(val) {
      for (let key in val) {
        return false;
      }
      return true;
    },
    treeCheck(data) {
      // 如果记录的值和当前选中的值的value一致则进行对应的置空处理
      if (!this.isRadio) {
        return;
      }
      if (this.currentCheckData.value === data.value) {
        this.currentCheckData = {};
        this.$refs.tree.setCheckedKeys([]);
      } else {
        // 否则，覆盖原先的值
        this.currentCheckData = data;
        this.$refs.tree.setCheckedKeys([data.value]);
      }
      this.$emit("custom", data.value);
      this.dispatch("ElFormItem", "el.form.change", [data[this.nodeKey]]);
      if (this.isRadio || !this.isShowConfirm) {
        this.$refs.select.visible = false;
      }
    },
    handleNodeClick(data) {
      if (this.multiple) {
        return;
      }
      this.$emit("custom", data[this.nodeKey]);
      this.dispatch("ElFormItem", "el.form.change", [data[this.nodeKey]]);
      if (this.isRadio || !this.isShowConfirm) {
        this.$refs.select.visible = false;
      }
    },
    handleCheckChange() {
      // console.log(1111)
      if (this.isRadio) {
        return;
      }
      const nodes = this.$refs.tree.getCheckedNodes();
      const value = nodes.map((item) => item[this.nodeKey]).join(",");
      //console.log(value);
      this.$emit("custom", value);
      this.dispatch("ElFormItem", "el.form.blur", [value]);
      if (this.isRadio || !this.isShowConfirm) {
        this.$refs.select.visible = false;
      }
    },
    init(val) {
      // 多选
      if (this.multiple) {
        // this.$nextTick(() => {
        //   this.$refs.tree.setCheckedKeys(arr);
        //   const nodes = this.$refs.tree.getCheckedNodes();
        //   this.optionData.id = val;
        //   this.optionData.name = nodes
        //     .map((item) => item[this.treeProps.label])
        //     .join(",");
        // });
      }
      // 单选
      else {
        val = val === "" ? null : val;
        this.$nextTick(() => {
          this.$refs.tree.setCurrentKey(val);
          if (val === null) {
            return;
          }
          const node = this.$refs.tree.getNode(val);
          this.optionData.id = val;
          this.optionData.name = node.label;
        });
      }
    },
    visibleChange(e) {
      if (e) {
        const tree = this.$refs.tree;
        this.filterFlag && tree.filter("");
        this.filterFlag = false;
        let selectDom = null;
        if (this.multiple) {
          selectDom = tree.$el.querySelector(".el-tree-node.is-checked");
        } else {
          selectDom = tree.$el.querySelector(".is-current");
        }
        setTimeout(() => {
          this.$refs.select.scrollToOption({ $el: selectDom });
        }, 0);
      }
    },
    clear() {
      this.$emit("custom", "");
    },
    filterMethod(val) {
      this.filterFlag = true;
      this.$refs.tree.filter(val);
    },
    filterNode(value, data) {
      if (!value) return true;
      const label = this.props.label || "name";
      return data[label].indexOf(value) !== -1;
    },
  },
};
</script>

<style lang="scss">
.tree-select__option {
  &.el-select-dropdown__item {
    height: auto;
    line-height: 1;
    padding: 0;
    background-color: #fff;
  }
}

.tree-select__tree {
  padding: 4px 20px;
  font-weight: 400;

  &.tree-select__tree--radio {
    .el-tree-node.is-current > .el-tree-node__content {
      color: #fff;
      font-weight: 700;
    }
  }
}

.el-tree-node__content {
  .el-checkbox,
  .el-tree-node__label {
    font-size: 13px !important;
  }
}
</style>
