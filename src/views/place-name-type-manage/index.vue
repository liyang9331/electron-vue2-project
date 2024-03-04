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
            <el-form-item label="类型名称">
              <el-input
                v-model="searchForm.name"
                clearable
                placeholder="请输入类型名称"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="18" style="text-align: right">
            <el-button class="action-btn" @click="addType"
              ><svg-icon icon-class="add" /> 添加类型</el-button
            >
            <el-button class="action-btn" @click="editType"
              ><svg-icon icon-class="edit-new" /> 修改类型</el-button
            >
            <el-button class="delete-btn" @click="deleteType"
              ><svg-icon icon-class="del-batch" /> 删除类型</el-button
            >
          </el-col>
        </el-row>
      </el-form>
      <div class="type-tree">
        <el-tree
          ref="typeTree"
          :data="data"
          :props="defaultProps"
          :default-expand-all="true"
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
          @node-click="nodeClick"
        ></el-tree>
      </div>
    </div>
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="600px"
      append-to-body
      @close="cancel"
    >
      <el-form
        ref="typeForm"
        :model="typeForm"
        :rules="typeRules"
        label-width="100px"
        label-suffix="："
      >
        <el-form-item label="上级类型" prop="upType">
          <el-cascader
            v-model="typeForm.upType"
            :options="options"
            :props="{ checkStrictly: true }"
            style="width: 100%"
            clearable
            placeholder="请选择上级类型"
          />
        </el-form-item>
        <el-form-item label="类型名称" prop="name">
          <el-input
            v-model="typeForm.name"
            placeholder="请输入类型名称"
            maxlength="30"
          />
        </el-form-item>
        <el-form-item label="描述信息" prop="remark">
          <el-input
            v-model="typeForm.remark"
            type="textarea"
            placeholder="请输入描述信息"
          />
        </el-form-item>
        <el-form-item label="展示方式" required>
          <el-row>
            <el-col :span="8">
              <el-form-item label="填充" prop="fill_style" label-width="80px">
                <el-color-picker
                  v-model="typeForm.fill_style"
                  show-alpha
                ></el-color-picker>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="边界" prop="border_style" label-width="80px">
                <el-color-picker
                  v-model="typeForm.border_style"
                  show-alpha
                ></el-color-picker>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="显示顺序" prop="sort">
          <el-input-number v-model="typeForm.sort" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="typeConfirm('typeForm')"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { PlaceTypeApi } from "@/utils/db/PlaceTypeApi";
import { deepCopy } from "@/utils/index";
function initTypeForm() {
  return {
    upType: "",
    name: "",
    remark: "",
    fill_style: "rgba(2, 167, 240, 1)",
    border_style: "rgba(0, 96, 206, 1)",
    sort: "",
  };
}
export default {
  name: "PlaceNameType",
  data: () => {
    return {
      open: false,
      title: "",
      searchForm: {
        name: "",
      },
      typeForm: initTypeForm(),
      typeRules: {
        upType: [
          { required: true, message: "请选择上级类型", trigger: "change" },
        ],
        name: [{ required: true, message: "请输入类型名称", trigger: "blur" }],
        sort: [
          {
            required: true,
            message: "请输入显示顺序",
            trigger: "change, blur",
          },
        ],
      },
      options: [
        {
          value: "/",
          label: "/",
        },
      ],
      data: [],
      defaultProps: {
        children: "children",
        label: "label",
      },
    };
  },
  created() {
    this.getData();
    // AES测试
    // console.log("--------AES测试--------")
    // const str = "123456ekgjhkjfshgjkdfhgfhdkjghfdjk";
    // const a = AES.encrypt(str);
    // console.log("加密前："+str)
    // console.log("加密后："+a)
    // console.log("解密后："+AES.decrypt(a))
  },
  watch: {
    "searchForm.name": {
      handler(val) {
        this.$refs.typeTree.filter(val);
      },
    },
    "typeForm.upType": {
      handler(val) {
        if (this.title == "添加类型" && Array.isArray(val)) {
          this.handlerUptype(val);
        }
      },
    },
  },
  mounted() {},
  methods: {
    nodeClick(data, node, cmp) {
      // console.log(node)
      this.typeForm.upType = [node.data.id];
      this.handlerUptype(this.typeForm.upType);
      // console.log(this.typeForm.upType)
    },
    handlerUptype(val) {
      // console.log(val);
      const id = val[0];
      if (id == "/") {
        // 添加一级
        if (this.data.length > 0) {
          // console.log(this.data)
          this.typeForm.sort =
            Number(this.data[this.data.length - 1].index) + 1;
        }
      } else {
        // 添加二级
        const data = this.data.find((item) => item.id == id);
        // console.log(data)
        if (data.children && data.children.length > 0) {
          const index = data.children[data.children.length - 1].index;
          console.log(index);
          this.typeForm.sort = Number(index) + 1;
        }
      }
    },
    createTree(arr) {
      const map = new Map();
      let result = [];

      // 将一维数组转化为以id为键的Map
      arr.forEach((item) => {
        map.set(item.id, {
          label: item.name,
          value: item.id,
          children: [],
          ...item,
        });
      });
      console.log(arr);
      // 遍历数组，将子节点添加到父节点的children属性中
      map.forEach((item) => {
        const parent = map.get(item.parentid);
        let obj = item;
        if (parent) {
          console.log(parent);
          parent.children.push(obj);
        } else {
          result.push(obj); // 如果没有父节点，将其视为根节点
        }
        if (item.children.length == 0) {
          // delete obj.children
        }
      });

      return result;
    },
    cancel() {
      this.open = false;
      this.typeForm = initTypeForm();
    },
    async getData() {
      const api = new PlaceTypeApi();
      let params = deepCopy(this.searchForm);
      if (params.name != "") {
        params.name = `%${params.name}%`;
      } else {
        delete params.name;
      }

      const data = await api.getPageQueryData(params, { pageSize: 999999 });
      let treeData = this.createTree(data);
      // console.log(treeData)
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
      // console.log(data);
      // this.options = this.options.concat(this.data)
      this.data = treeData;
      this.options = [
        {
          value: "/",
          label: "/",
        },
        ...this.data,
      ];
    },
    // 删除
    async delete(row, isend = false) {
      const api = new PlaceTypeApi();
      console.log(row.id, "id");
      const res = await api.getDeleteFunc(row.id);
      console.log(res, "res---delete");
      if (res) {
        this.open = false;
        if (isend) {
          this.$message.success("操作成功");
        }
      } else {
        if (isend) {
          this.$message.warning("操作失败，请重试");
        }
      }
      this.getData();
    },
    handleSearch() {
      this.getData();
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    handleNodeClick() {},
    handlePreview() {},
    handleRemove() {},
    addType() {
      this.title = "添加类型";
      this.open = true;
    },

    deleteType() {
      // console.log(this.typeForm.upType)
      if (this.$refs.typeTree.getCurrentNode() !== null) {
        this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            const data = this.$refs.typeTree.getCurrentNode();
            let ids = [];
            if (data.children && data.children.length > 0) {
              ids.push(data);
              data.children.forEach((item) => ids.push(item));
            } else {
              ids = data;
            }
            // console.log(ids);
            ids.forEach((item,key) => {
              if(key == ids.length-1){
                this.delete(item,true);
              }else{
                this.delete(item);
              }
              
            });
          })
          .catch(() => {});
      } else {
        this.$message.warning("请选择要删除的类型！");
      }
    },
    editType() {
      if (this.$refs.typeTree.getCurrentNode() !== null) {
        const { name, id, fill_style, border_style, parentid, remark, index } =
          this.$refs.typeTree.getCurrentNode();
        this.typeForm = {
          id,
          name,
          fill_style,
          border_style,
          remark,
          sort: index,
          upType: parentid === "0" ? [id] : [parentid, id],
        };
        this.title = "修改类型";
        this.open = true;
      } else {
        this.$message.warning("请选择要修改的类型！");
      }
    },
    async save(obj = null) {
      let params = obj || {
        name: this.typeForm.name,
        remark: this.typeForm.remark,
        fill_style: this.typeForm.fill_style,
        border_style: this.typeForm.border_style,
        "`index`": this.typeForm.sort,
        parentid:
          (this.typeForm.upType.length === 1
            ? this.typeForm.upType[0]
            : this.typeForm.upType[this.typeForm.upType.length - 2]) || 0,
      };
      const api = new PlaceTypeApi();
      let res = false;
      console.log(params);
      // return
      if (this.title == "修改类型") {
        params["id"] = this.typeForm.id;
        res = await api.updateFunc(params);
      } else {
        res = await api.addFunc(params);
      }
      if (res) {
        this.open = false;
        this.$message.success("操作成功");
      } else {
        this.$message.warning("操作失败，请重试");
      }
      this.getData();
      this.typeForm = initTypeForm();
    },
    typeConfirm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.save();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
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

.type-tree {
  // padding-top: 24px;
  // overflow-y: auto;
  height: calc(100% - 100px);
  display: block;
  overflow-y: scroll;
}
</style>

<style lang="scss">
.type-tree {
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

  .el-tree .is-current > .el-tree-node__content {
    background-color: rgba(0, 96, 206, 0.34);
  }

  .el-tree-node__content:hover,
  .el-upload-list__item:hover {
    background-color: #fff;
  }
}
</style>
