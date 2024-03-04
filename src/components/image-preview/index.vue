<template>
    <div class="preview-image">
        <div @click="show()"><i class="el-icon-zoom-in"></i></div>
        <el-dialog title="图片预览" :append-to-body="true" :modal="false" :show-close="true" :visible.sync="dialogVisible"
            :before-close="cacel">
            <div class="img" style="width: 100%; height: 100%" :style="{ backgroundImage: `url(${imageUrl})` }">
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cacel()">关闭</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    props: {
        url: {
            type: String,
            default: ""
        }
    },
    watch: {
    },
    data() {
        return {
            dialogVisible: false,
            imageUrl: ""
        }
    },
    methods: {
        cacel() {
            this.dialogVisible = false
        },
        show() {
            if (this.url != "" && this.url != undefined) {
                console.log(this.url)
                this.imageUrl = this.isJSON(this.url)? JSON.parse(this.url)[0] :this.url
            } else {
                this.imageUrl = ""
            }
            this.dialogVisible = true
        },
        isJSON(str) {
            if (typeof str == 'string') {
                try {
                    var obj = JSON.parse(str);
                    if (typeof obj == 'object' && obj) {
                        return true;
                    } else {
                        return false;
                    }

                } catch (e) {
                    console.log('error：' + str + '!!!' + e);
                    return false;
                }
            }
            // console.log('It is not a string!')
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep .el-dialog {
    // height: 78%;
    height: 80vh;
    width: 100vh;

    .el-dialog__body {
        padding: 0 5px;
        height: 80%;
    }

    .el-dialog__footer {
        padding: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}

.preview-image {
    // position: relative;
    height: 14px;
    width: 14px;

    &>div {
        cursor: pointer;
        height: 100%;
        width: 100%;
        display: flex;

        i {
            color: #fff;
        }
    }
}

.img {
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    position: relative;
}
</style>
