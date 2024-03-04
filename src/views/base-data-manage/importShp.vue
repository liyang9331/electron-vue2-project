<template>
    <el-dialog title="导入特殊数据" :visible.sync="isShow" :destroy-on-close="true" top="20%" width="50%" :modal="true"
        @closed="openTransformation">
        <el-form ref="form" :model="symbol" :rules="placeRules" label-width="120px" class="search-form" label-suffix=":">
            <el-form-item label="展示方式" required>
                <el-row>
                    <el-col :span="6">
                        <el-form-item label="填充颜色" label-width="80px">
                            <el-color-picker v-model="symbol.polygonFill" show-alpha></el-color-picker>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item label="线条颜色" label-width="90px" prop="lineColor">
                            <el-color-picker v-model="symbol.lineColor" show-alpha></el-color-picker>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="线宽" label-width="80px" prop="lineWidth">
                            <el-input v-model="symbol.lineWidth" placeholder="请输入" :disabled="disabled"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form-item>
            <el-form-item label="导入shp文件" prop="geojson">
                <el-button @click="openImportData">上传</el-button>
            </el-form-item>

            <el-form-item class="center-container">
                <el-button @click="cancel">取消</el-button>
                <!-- <el-button v-if="!disabled" type="primary" @click="onSubmit">保存</el-button> -->
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script>
import MyMap from "@/components/map/index.vue";
import ElSelectTree from "@/components/el-select-tree/index.vue";
import { guid } from "@/utils/index";
import { ipcRenderer } from "electron";
import { deepCopy } from "@/utils/index";
import parseShapeFile from "@/utils/map/parseShapefile";
export default {
    name: "PlaceNameType",
    components: { MyMap, ElSelectTree },
    props: {
        isShow: {
            type: Boolean,
            default: false
        },
        fromData: {
            type: Object,
            default: {},
        },
        legendData: {
            type: Array,
            default: [],
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
            symbol: {},
            defaultProps: {
                children: "children",
                label: "label",
            },
            dialogVisible: false,
            dialogImageUrl: "",
            fileList: [],
            types: [],
            placeRules: {
                lineColor: [{ required: true, message: "请选择线条颜色", trigger: "blur" }],
                lineWidth: [{ required: true, message: "请输入线宽", trigger: "change" }],
                // geojson: [{ required: true, message: "请上传shp文件或者绘制图形", trigger: "change" }],
                // lon: [{ required: true, message: "请输入经度", trigger: "change" }],
                // lat: [{ required: true, message: "请输入纬度", trigger: "change" }],
            }
        };
    },
    watch: {},
    created() {
        this.uid = guid();
        this.symbol = {
            polygonFill: "",
            lineColor: "",
            lineWidth: "",
        };
        this.types = deepCopy(this.legendData);
    },
    mounted() { },
    methods: {
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
                    Object.keys(this.symbol).forEach((item) => {
                        if (item != "lon" && item != "lat") {
                            params[item] = this.symbol[item];
                        } else if (item == "secondLevel") {
                            if (Array.isArray(this.symbol[item])) {
                                params[item] = this.symbol[item][0];
                            }
                        } else if (this.symbol[item] == null) {
                            params[item] = "";
                        }
                    });
                    params["center"] = this.symbol.lon + "," + this.symbol.lat;
                    // 处理geojson，添加样式到属性中
                    let geo = JSON.parse(params.geojson);
                    if (geo.type == "Feature") {
                        geo.properties.symbol = this.symbol.symbol;
                    }
                    // console.log(geo)
                    params.geojson = JSON.stringify(geo);
                    delete params.symbol;
                    this.$emit("save", params);
                } else {
                    console.log("error submit!!");
                }
            });
        },
        // 上传文件
        openImportData() {
            this.$refs["form"].validate((valid) => {
                if (valid) {
                    const customEventHandler = (event, files) => {
                        if (files.eventType == "uploadShp") {
                            parseShapeFile(files.filePaths).then(async (geojson) => {
                                if (geojson.type == "FeatureCollection") {
                                    geojson.features = geojson.features.map(item => {
                                        item.properties.symbol = this.symbol
                                        return item
                                    })
                                } else {
                                    geojson.properties.symbol = this.symbol
                                }
                                ipcRenderer.removeListener("uploadFileWatch", customEventHandler);
                                this.$emit('save', geojson)
                            });
                        }
                    };
                    ipcRenderer.on("uploadFileWatch", customEventHandler);
                    ipcRenderer.send("uploadShp", { eventType: "uploadShp" });
                }
            })
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
  