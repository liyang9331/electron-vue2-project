<template>
  <div class="place-name-add-container">
    <div class="content">
      <el-form ref="form" :model="regionForm" :rules="placeRules" label-width="120px" class="search-form"
        label-suffix=":">
        <el-row>
          <el-col :span="6">
            <el-form-item label="名称" prop="name">
              <el-input v-model="regionForm.name" placeholder="请输入" :disabled="disabled"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="类型" prop="type">
              <el-select v-model="regionForm.type" :disabled="disabled" placeholder="请选择">
                <el-option v-for="item in types" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item label="对应区域" prop="geojson">
            <el-row v-if="!disabled" style="margin-bottom: 20px">
              <el-col :span="8">
                <el-button @click="uploadFile()" size="small" class="upload-btn" type="primary"><svg-icon
                    icon-class="upload-new" /> 上传shp</el-button>
              </el-col>
            </el-row>
            <MyMap ref="mymap" class="mymap" :key="uid" source="history" :geojson="regionForm.geojson"
              :isAddPlaceName="true" :disabled="disabled" :module="['Polygon', 'LineString']"
              @callback-geojson="editPlaceNameGeomCallback"></MyMap>
          </el-form-item>
        </el-row>
        <el-form-item label="中心点坐标" label-width="160px">
          <el-row>
            <el-col :span="10">
              <el-form-item label="经度坐标" prop="lon" label-width="100px">
                <el-input :disabled="disabled" v-model="regionForm.lon"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="纬度坐标" prop="lat" label-width="100px">
                <el-input :disabled="disabled" v-model="regionForm.lat"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="展示方式" required>
          <el-row>
            <el-col :span="4">
              <el-form-item label="填充颜色" label-width="80px">
                <el-color-picker v-model="regionForm.symbol.polygonFill" show-alpha></el-color-picker>
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="线条颜色" label-width="90px">
                <el-color-picker v-model="regionForm.symbol.lineColor" show-alpha></el-color-picker>
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="线宽" label-width="80px">
                <el-input v-model="regionForm.symbol.lineWidth" placeholder="请输入" :disabled="disabled"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item class="center-container">
          <el-button @click="cancel">取消</el-button>
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
export default {
  name: "PlaceNameType",
  components: { MyMap, ElSelectTree },
  props: {
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
      defaultProps: {
        children: "children",
        label: "label",
      },
      dialogVisible: false,
      dialogImageUrl: "",
      fileList: [],
      types: [],
    };
  },
  watch: {},
  created() {
    this.uid = guid();
    this.regionForm = {
      ...deepCopy(this.fromData),
      symbol: {
        polygonFill: "",
        lineColor: "",
        lineWidth: "",
      },
    };
    // console.log(this.regionForm.geojson)
    const geo =this.regionForm.geojson!=""?JSON.parse(this.regionForm.geojson):""
    if (geo != "") {
      if (geo.type == "FeatureCollection" && geo.features[0].properties.symbol ) {
        this.regionForm.symbol = geo.features[0].properties.symbol 
      } else if (geo.type == "Feature" && geo.properties.symbol) {
        this.regionForm.symbol = geo.properties.symbol 
      }
    }
    this.types = deepCopy(this.legendData);
  },
  mounted() { },
  methods: {
    uploadFile() {
      this.$refs["mymap"].uploadFile();
    },
    /**
     * 编辑地名geom回调
     * @param {*} data
     */
    editPlaceNameGeomCallback(geojson, coordinate) {
      // console.log(coordinate);
      this.regionForm.geojson = geojson;
      // this.regionForm.lon = coordinate[0].x;
      // this.regionForm.lat = coordinate[0].y;
    },
    cancel() {
      this.$emit("cancel");
    },
    handlePreview() { },
    handleRemove() { },
    handlePictureCardPreview() { },
    onSubmit() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          let params = {};
          Object.keys(this.regionForm).forEach((item) => {
            if (item != "lon" && item != "lat") {
              params[item] = this.regionForm[item];
            } else if (item == "secondLevel") {
              if (Array.isArray(this.regionForm[item])) {
                params[item] = this.regionForm[item][0];
              }
            } else if (this.regionForm[item] == null) {
              params[item] = "";
            }
          });
          params["center"] = this.regionForm.lon + "," + this.regionForm.lat;
          // 处理geojson，添加样式到属性中
          let geo = JSON.parse(params.geojson);
          if (geo.type == "FeatureCollection") {
            geo.features.forEach((item, key) => {
              geo.features[key].properties.symbol = this.regionForm.symbol;
            })
          } else if (geo.type == "Feature") {
            geo.properties.symbol = this.regionForm.symbol;
          }
          // console.log(geo)
          delete params.symbol;
          params.geojson = JSON.stringify(geo);
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
.mymap {
  height: 600px;
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
  padding: 12px 24px;

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
}

.upload-tips {
  color: #8e95a4;
  margin: 0;
}
</style>
