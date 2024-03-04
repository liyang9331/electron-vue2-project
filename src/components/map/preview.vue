<template>
  <el-dialog title="地名详情" v-if="visible" @close="cancel" :visible="true" width="60%" append-to-body>
    <div class="place-name-add-container">
      <div class="content">
        <el-form ref="form" :model="regionForm" label-width="120px" class="search-form" label-suffix=":">
          <el-row>
            <el-col :span="6">
              <el-form-item label="编码" prop="code">
                <el-input v-model="regionForm.code" placeholder="请输入" :disabled="disabled"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="名称" prop="name">
                <el-input v-model="regionForm.name" :disabled="disabled" :placeholder="disabled ? '' : '请输入'"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="曾用名" prop="formerName">
                <el-input v-model="regionForm.formerName" :disabled="disabled"
                  :placeholder="disabled ? '' : '多名称之间用“，”隔开'"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="地名类型" prop="type">
                <el-select-tree v-model="regionForm.type" placeholder="请选择" filterable :multiple="true" :isRadio="true"
                  :checkStrictly="true" :data="types" :disabled="disabled" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="6">
              <el-form-item label="所属一级区域" prop="oneLevel">
                <el-select-tree v-model="regionForm.oneLevel" placeholder="请选择区域" filterable :multiple="true"
                  :isRadio="true" :checkStrictly="true" :disabled="disabled" :data="areaTreeData" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="所属二级区域" prop="secondLevel">
                <el-select-tree v-model="regionForm.secondLevel" placeholder="请选择区域" filterable :multiple="true"
                  :isRadio="true" :disabled="disabled" :checkStrictly="true" :data="areaTreeData" />
              </el-form-item>
            </el-col>
            <el-col :span="6" v-if="$store.state.app.isAdmin ? true : false">
              <el-form-item label="密级" prop="securityLevel">
                <el-select v-model="regionForm.securityLevel" placeholder="请选择" :disabled="disabled">
                  <el-option v-for="level in dataLevelArr" :key="level.value" :label="level.label"
                    :value="level.value"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="附属信息" prop="attached">
            <el-input :disabled="disabled" v-model="regionForm.attached" type="textarea"></el-input>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input :disabled="disabled" v-model="regionForm.remark" type="textarea"></el-input>
          </el-form-item>
          <el-form-item label="点位置/中心点坐标" label-width="160px" required>
            <el-row>
              <el-col :span="6">
                <el-form-item label="经度坐标" prop="lon" label-width="80px">
                  <el-input :disabled="disabled" v-model="regionForm.lon"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="纬度坐标" prop="lat" label-width="80px">
                  <el-input :disabled="disabled" v-model="regionForm.lat"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="图片">
            <div style="display: flex" :class="fileList.length >= 3 ? 'el-uploadfile' : ''">
              <ul class="el-upload-list el-upload-list--picture-card">
                <li class="el-upload-list__item is-success" v-for="fit in fileList" :key="fit.name">
                  <!-- <div></div> -->
                  <div class="img" style="width: 100%; height: 100%" :style="{ backgroundImage: `url(${fit.url})` }">
                    <!-- 预览按钮 -->
                    <imagePreview :url="fit.url"></imagePreview>
                  </div>
                </li>
              </ul>
            </div>
            <el-dialog :visible.sync="dialogVisible">
              <img width="100%" :src="dialogImageUrl" alt="" />
            </el-dialog>
          </el-form-item>
          <el-form-item class="center-container">
            <el-button @click="cancel">关闭</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </el-dialog>
</template>
<script>
import MyMap from "@/components/map/index.vue";
import ElSelectTree from "@/components/el-select-tree/index.vue";
import { guid } from "@/utils/index";
import { ipcRenderer } from "electron";
import { deepCopy } from "@/utils/index";
import imagePreview from "@/components/image-preview/index.vue"
export default {
  name: "PlaceNameType",
  components: { MyMap, ElSelectTree, imagePreview },
  props: {
    disabled: {
      type: Boolean,
      default: true,
    },
  },
  data: () => {
    return {
      visible: false,
      uid: "",
      detailInfor: {},
      files: {},
      regionForm: {},
      dataLevelArr: [
        { value: 1, label: "一级" },
        { value: 2, label: "二级" },
        { value: 3, label: "三级" },
      ],
      defaultProps: {
        children: "children",
        label: "label",
      },
      dialogVisible: false,
      dialogImageUrl: "",
      fileList: [],
      types: [],
      areaTreeData: [],
    };
  },
  watch: {},
  created() {
    this.uid = guid();
  },
  mounted() { },
  methods: {
    init(types = null, areaTreeData = null) {
      this.types = types ? deepCopy(types) : this.types;
      this.areaTreeData = areaTreeData
        ? deepCopy(areaTreeData)
        : this.areaTreeData;
    },
    setRegionForm(data) {
      // console.log(data);
      this.regionForm = data
      this.type = this.regionForm.type;
      // console.log(this.regionForm.imageurl)
      if (this.regionForm.imageurl != "") {
        JSON.parse(this.regionForm.imageurl).forEach((item) => {
          if (item != "") {
            this.fileList.push({
              name: new Date(),
              // url: "file://" + item,
              url: item,
            });
          }
        });
      }
    },
    cancel() {
      this.fileList = [];
      this.visible = false;
    },
  },
};
</script>
<style lang="scss" scoped>
.el-uploadfile {
  ::v-deep .el-upload--picture-card {
    display: none;
  }
}

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

.place-name-add-container {

  // padding: 12px 24px;
  .content {
    border-radius: 6px;
    background-color: #fff;
    // padding: 24px;
  }
}
</style>

<style lang="scss">
.el-upload--picture-card {
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 1;
  padding-top: 25px;
  color: #0060ce;

  .upload-txt-btn {
    margin-top: 10px;
    font-size: 12px;
    font-weight: 500;
  }
}

.el-upload-list--picture-card .el-upload-list__item {
  width: 100px;
  height: 100px;

  & .img {
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }
}

.upload-tips {
  color: #8e95a4;
  margin: 0;
}
</style>
