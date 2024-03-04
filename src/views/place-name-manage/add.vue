<template>
  <div class="place-name-add-container">
    <!-- 返回按钮 -->
    <div class="navigation" v-if="!isStatistics">
      <div @click="cancel">
        地名管理
      </div>
      <div>
        {{ disabled ? '查看地名' : type == 'add' ? '添加地名' : "修改地名" }}

      </div>
    </div>
    <div class="content">
      <el-form ref="form" :model="regionForm" :rules="placeRules" label-width="110px" class="search-form"
        label-suffix=":">
        <el-row>
          <el-col :span="6" class="place-name">
            <el-form-item label="编码" prop="code">
              <el-input v-model="regionForm.code" clearable placeholder="请输入" :disabled="disabled"></el-input>
              <span v-if="codeRepeat">编码重复</span>
            </el-form-item>
          </el-col>
          <el-col :span="6" class="place-name">
            <el-form-item label="名称" prop="name">
              <el-input v-model="regionForm.name" clearable placeholder="请输入" :disabled="disabled"></el-input>
              <span v-if="nameRepeat">名称重复</span>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="曾用名" prop="formerName">
              <el-input v-model="regionForm.formerName" clearable :disabled="disabled" placeholder="多名称之间用“，”隔开"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="地名类型" prop="type">
              <el-select-tree v-model="regionForm.type" clearable placeholder="请选择" filterable :multiple="true" :isRadio="true"
                :checkStrictly="true" :data="legendData" :disabled="disabled" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item label="所属一级区域" prop="oneLevel">
              <el-select-tree v-model="regionForm.oneLevel" clearable placeholder="请选择区域" filterable :multiple="true"
                :isRadio="true" :checkStrictly="true" :disabled="disabled" :data="areaTreeData"
                @change="oneLevelChange()" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="所属二级区域" prop="secondLevel">
              <el-select-tree v-model="regionForm.secondLevel" clearable placeholder="请选择区域" filterable :multiple="true"
                :isRadio="false" :disabled="disabled" :checkStrictly="true" :data="secondLevelAreaTreeData" />
            </el-form-item>
          </el-col>
          <el-col :span="6" v-if="$store.state.app.isAdmin">
            <el-form-item label="密级" prop="securityLevel">
              <el-select v-model="regionForm.securityLevel" clearable placeholder="请选择" :disabled="disabled">
                <el-option v-for="level in dataLevelArr" :key="level.value" :label="level.label"
                  :value="level.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item label="对应区域" prop="geojson">
            <el-row v-if="!disabled">
              <el-col :span="8">
                <el-button @click="uploadFile()" size="small" class="upload-btn" style="margin-bottom: 10px"
                  type="primary"><svg-icon icon-class="upload-new" /> 上传shp</el-button>
              </el-col>
            </el-row>
            <MyMap ref="mymap" 
            :module='["Point", "Polygon", "LineString"]'
            :key="uid" style="height: 450px" source="history" :geojson="regionForm.geojson"
              :isAddPlaceName="true" :disabled="disabled" @callback-geojson="editPlaceNameGeomCallback"></MyMap>
          </el-form-item>
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
              <el-form-item label="经度坐标" prop="lon" label-width="100px">
                <el-input :disabled="disabled || coordinateDisabled" v-model="regionForm.lon"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="纬度坐标" prop="lat" label-width="100px">
                <el-input :disabled="disabled || coordinateDisabled" v-model="regionForm.lat"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="图片">
          <div style="display: flex" :class="fileList.length >= 3 ? 'el-uploadfile' : ''">
            <ul class="el-upload-list el-upload-list--picture-card">
              <li class="el-upload-list__item is-success" v-for="fit in fileList" :key="fit.name">
                <!-- <img style="width: 100%; height: 100%" :src="fit.url" /> -->
                <div class="img" style="display: flex;width: 100%; height: 100%"
                  :style="{ backgroundImage: `url(${fit.url})` }">
                  <!-- 预览按钮 -->
                  <imagePreview style="margin-right: 30px;" :url="fit.url"></imagePreview>
                  <!-- 删除按钮 -->
                  <i v-if="!disabled" class="el-icon-delete" @click="deleteImage(fit)"></i>
                </div>
              </li>
            </ul>

            <el-upload list-type="picture-card" action="" :limit="3" :show-file-list="false" :file-list="fileList"
              :before-upload="beforeAvatarUpload" v-if="!disabled">
              <!-- :on-change="loadJsonFromFile" -->
              <svg-icon icon-class="upload-img" style="width: 32px; height: 27px" />
              <p class="upload-txt-btn">点击上传</p>
            </el-upload>
          </div>
          <p class="upload-tips">
            支持多图上传，图片格式支持jpg、jpeg、png格式，最多不超过三张
          </p>
          <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="" />
          </el-dialog>
        </el-form-item>
        <el-form-item class="center-container">
          <el-button v-if="!isStatistics" @click="cancel">取消</el-button>
          <el-button v-if="!disabled" type="primary" @click="onSubmit">保存</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import MyMap from "@/components/map/index.vue";
import ElSelectTree from "@/components/el-select-tree/index.vue";
import { guid } from "@/utils/index";
import { ipcRenderer } from "electron";
import { deepCopy } from "@/utils/index";
import { PlaceNameApi } from "@/utils/db/PlaceNameApi";
import imagePreview from "@/components/image-preview/index.vue"
export default {
  name: "PlaceNameType",
  components: { MyMap, ElSelectTree, imagePreview },
  props: {
    isStatistics:{
      type:Boolean,
      default:false
    },
    type: {
      type: String,
      default: "add",
    },
    fromData: {
      type: Object,
      default: {},
    },
    legendData: {
      type: Array,
      default: [],
    },
    placeRules: {
      type: Object,
      default: {},
    },
    areaTreeData: {
      type: Array,
      default: [],
    },
    allRegion: {
      type: Array,
      default: [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data: () => {
    return {
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
      secondLevelAreaTreeData: [],
      api: null,
      nameRepeat: false,
      codeRepeat:false,
      coordinateDisabled: false,//中心点坐标是否禁止修改
    };
  },
  watch: {
    "regionForm.oneLevel"(val) {
      // console.log(val)
      if (val != "") {
        // console.log(this.allRegion)
        const node = this.allRegion.find((item) => item.name == val)
        if (node) {
          // 生成二级区域树
          this.secondLevelAreaTreeData = this.allRegion.filter(a => a.parentid == node.id);
          // console.log(this.secondLevelAreaTreeData)
          if (this.secondLevelAreaTreeData.length == 0) {
            this.$message.warning("当前一级区域没有子区域");
          }
        }
      }
    },
    async "regionForm.name"(val) {
      // 检测地名名称是否符合规范
      console.log(typeof val);
      // const api = new PlaceNameApi();
      let flag = false;
      if (val != "" && val != null && this.type == "add") {
        const result = await this.api.getNameRepeat(
          { name: val }
        );
        if (result.length > 0) {
          flag = true;
        }
      } else {
        flag = false;
      }
      this.nameRepeat = flag;
      // return flag;
    },
    async "regionForm.code"(val) {
      // 检测地名名称是否符合规范
      // console.log(typeof val);
      // const api = new PlaceNameApi();
      let flag = false;
      if (val != "" && val != null && this.type == "add") {
        const result = await this.api.getNameRepeat(
          { code: val }
        );
        if (result.length > 0) {
          flag = true;
        }
      } else {
        flag = false;
      }
      this.codeRepeat = flag;
      // return flag;
    },
  },
  created() {
    this.secondLevelAreaTreeData = this.areaTreeData;
    this.uid = guid();
    this.regionForm = deepCopy(this.fromData);
    this.api = new PlaceNameApi();
    if (!this.disabled && this.regionForm.geojson != "") {
      this.coordinateDisabled = true
    }
    if (this.regionForm.imageurl != "") {
      JSON.parse(this.regionForm.imageurl).forEach((item) => {
        // console.log(item)
        if (item != "") {
          this.fileList.push({
            name: new Date(),
            url: item,
          });
        }
      });
    }
  },
  mounted() { },
  methods: {
    deleteImage(obj) {
      // console.log(obj,this.regionForm.imageurl)
      
      let list = JSON.parse(this.regionForm.imageurl)
      list = list.filter(item => item != obj.url) || []
      // console.log(list)
      // return
      this.fileList = list.map(item=>{
        const obj = {name:new Date(),url:item}
        return obj;
      })
      this.regionForm.imageurl = JSON.stringify(list)
      // console.log(this.regionForm.imageurl)
    },
    beforeAvatarUpload(file) {
      const isLt2M = file.size / 1024 / 1024 < 10;

      if (file.type !== "image/jpeg" || file.type !== "image/png" || file.type !== "image/jpg") {
        // this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        // this.$message.error("上传头像图片大小不能超过 10MB!");
      }
      const customEventHandler = (event, imagePath, name) => {
        const url = "http://127.0.0.1:9090/" + "uploads/" + name
        this.fileList.push({
          name: name,
          status: "success",
          // url: "file://" + imagePath,
          url: url
        });

        let imageUrl = this.regionForm.imageurl == "" ? "" : JSON.parse(this.regionForm.imageurl)
        if (Array.isArray(imageUrl)) {
          imageUrl.push(url)
          this.regionForm.imageurl = JSON.stringify(imageUrl)
        } else {
          const list = [url]
          this.regionForm.imageurl = JSON.stringify(list)
        }

        ipcRenderer.removeListener("image-path", customEventHandler);
      };
      ipcRenderer.on("image-path", customEventHandler);
      ipcRenderer.send("uploadImage", file.path, file.name);
    },
    uploadFile() {
      this.$refs["mymap"].uploadFile();
    },
    /**
     * 编辑地名geom回调
     * @param {*} data
     */
    editPlaceNameGeomCallback(geojson, coordinate) {
      coordinate = Array.isArray(coordinate) ? coordinate[0] : coordinate
      this.regionForm.geojson = geojson;
      this.regionForm.lon = Number(coordinate.x).toFixed(6)
      this.regionForm.lat = Number(coordinate.y).toFixed(6)
      this.coordinateDisabled = true
    },
    cancel() {
      this.$emit("cancel");
    },
    handlePreview() { },
    handleRemove() { },
    handlePictureCardPreview() { },
    onSubmit() {
      // console.log(this.regionForm);
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let params = deepCopy(this.regionForm)
          params["center"] = this.regionForm.lon + "," + this.regionForm.lat;
          delete params.lon
          delete params.lat
          // console.log(params)
          this.$emit("save", params);
        } else {
          console.log("error submit!!");
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .tree-select__option.el-select-dropdown__item {
  height: auto !important;
}

.navigation {
  font-size: 12px;
  display: flex;
  color: #fff;
  margin-bottom: 10px;

  &>div {
    display: flex;
    align-items: center;
    justify-content: center;
    background-size: cover;
    width: 100px;
    height: 28px;
  }

  &>div:nth-child(1) {
    cursor: pointer;
    background-image: url("../../assets/images/icons/add-placename.svg");
  }

  &>div:nth-child(2) {
    background-image: url("../../assets/images/icons/add-placename-no.svg");
  }
}

.place-name {
  position: relative;

  span {
    display: block;
    position: absolute;
    top: 25px;
    font-size: 12px;
    color: red;
  }
}

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
    padding: 24px;
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
    position: relative;

    &>i {
      color: red;
      cursor: pointer;
      position: absolute;
      right: 0;
    }
  }
}

.upload-tips {
  color: #8e95a4;
  margin: 0;
}
</style>
