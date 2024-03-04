<template>
  <div class="configParamsCom">
    <el-dialog :visible.sync="visible" :title="editText" width="50%" :close-on-click-modal="false" :before-close="close"
      center>
      <div class="content">
        <el-form ref="form" :model="form" :rules="rules" class="form-container" label-position="right" label-width="110px"
          size="normal">
          <!-- template start flag:1,添加 flag:2,编辑-->
          <template v-for="(item, key) in formItemList">
            <!-- 预置：输入框 -->
            <el-form-item v-if="item.type == 'input'" :key="key" :label="item.label" :prop="item.model">
              <!-- 文字按钮 -->
              <span class="input-textButton" v-if="item.textButtonClick" @click="item.textButtonClick(item,form,model)">{{ item.textButton }}</span>
              <el-input v-model="form[item.model]" :type="item.inputType" :disabled="item.disabled"
                :placeholder="item.placeholder" :rows="item.rows ? item.rows : 6" clearable />
            </el-form-item>
            <!-- 富文本编辑器 -->
            <el-form-item v-if="item.type == 'RichText'" :key="key" :label="item.label" :prop="item.model">
              <VueTinymce v-model="form[item.model]" :setup="setup" :setting="setting" />
            </el-form-item>
            <!-- 预置：选择器 -->
            <el-form-item v-if="item.type == 'select'" :key="key" :label="item.label" :prop="item.model">
              <el-select v-model="form[item.model]" :placeholder="item.placeholder">
                <el-option v-for="item in item.option" :key="item.dictValue" :disabled="item.disabled"
                  :label="item.dictLabel" :value="item.dictValue" />
              </el-select>
            </el-form-item>
            <!-- 预置：树形控器 -->
            <el-form-item v-if="item.type == 'tree'" :key="key" :label="item.label" :prop="item.model">
              <treeselect v-model="form[item.model]" :disabled="item.disabled" style="width: 100%"
                :placeholder="item.placeholder" :multiple="false" :options="item.data" :normalizer="normalizer" />
            </el-form-item>
            <!-- 预置：文件上传 -->
            <el-form-item v-if="item.type == 'upload'" :key="key" :label="item.label" :prop="item.model">
              <el-upload ref="upload" class="upload-demo mr10" action="" :multiple="false" :limit="1" :auto-upload="false"
                :show-file-list="false" :file-list="fileList" :disabled="item.disabled" :on-change="(file, files) => {
                  fileList = files;
                  item.fileChange(file, form, item.model);
                }
                  ">
                <el-button slot="trigger" type="info" class="textBtn">
                  <i class="el-icon-upload">上传</i>
                </el-button></el-upload>
              <!-- 文件列表 -->
              <div class="file-list">
                <span v-for="(item, index) in fileList" :key="item.url">
                  <el-link class="file-link" :underline="false" icon="el-icon-link" type="primary" :href="item.url"
                    target="_blank">{{ item.name }}</el-link>
                </span>
              </div>
            </el-form-item>
            <!-- 预置：单选 -->
            <el-form-item v-if="item.type == 'radio'" :key="key" :label="item.label" :prop="item.model">
              <template v-for="itemmin in item.data">
                <el-radio v-model="form[item.model]" :label="itemmin.value">{{ itemmin.name }}</el-radio>
              </template>
            </el-form-item>
            <!-- 预置：多选 -->
            <el-form-item v-if="item.type == 'radio-group'" :key="key" :label="item.label" :prop="item.model">
              <el-checkbox-group v-model="form[item.model]">
                <el-checkbox v-for="itemmin in item.data"  :label="itemmin.value" :disabled="item.disabled">{{ itemmin.name }}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </template>
          <!-- template end -->
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button v-if="type == 'preview'" size="small" @click="close">关闭</el-button>
          <el-button v-else size="small" @click="close">取消</el-button>
          <el-button v-else size="small" type="primary" @click="handlerConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import { testTypeObj } from "@/utils/data";
import { Form } from './default'
import { Handler } from "maptalks";
export default {
  name: "tableDialog",
  mixins: [],
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    configData: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      default: "",
    },
    formConfig: {
      type: Object,
      default: function (){
        return Form
      }
    }
  },
  data () {
    return {
      editText: "",
      formItemList: null,
      form: null,
      rules: null,
      testTypeObj,
      fileList: [],
      setting: {
        height: 400,
        menubar: false,
        plugins: [
          'advlist autolink lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media table paste code help wordcount'
        ],
        toolbar: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
      },
    }
  },
  computed: {
    ...mapState("fileUpload", ["configAccident"]),
  },
  created () {
    this.editText = this.formConfig.text
    console.log(this.type)
    this.formItemList = this.formConfig.formItemList.map(item=>{
      item.disabled = this.type == "preview"?true:false
      return item
    })
    this.form = this.formConfig.model()
    this.rules = this.formConfig.rules
  },
  methods: {
    // 点击确定
    handlerConfirm () {
      this.close();
    },
    close () {
      this.$emit("close");
    },
    reset (needRefresh, options = {}) {
      this.form = formInit()
      this.$refs['form'].resetFields()
      this.$emit('reset', needRefresh, options)
    },
    cancel () {
      this.reset()
    },
    confrim () {
      const api = apiMap[this.flag]
      this.$refs['form'].validate(valid => {
        // if (this.form.status == '') {
        //   this.form.status = 2
        // } else {

        // }
        const params = {
          ...this.form
        }
        if (valid) {
          api(params).then((res) => {
            if (res.status === 200) {
              this.$message.success('操作成功')
              this.reset(true, res)
              this.formItemList.forEach(element => {
                if (element.type === 'upload') {
                  this.fileList = []
                }
              })
            } else {
              this.$message.warning(res.message)
            }
          })
        }
      })
    },
    setup(editor) {
      console.log(editor)
    }
  },
};
</script>

<style lang="scss" scoped>
.input-textButton{
  // font-size: 18px;
  cursor: pointer;
  color: $color_primary;
  &:hover{
    background-color: #ccc;
  }
}
::v-deep {
  .el-dialog {
    margin-top: 14% !important;
  }
}

.content {
  padding: 0 40px;
  ::v-deep .el-form-item{
    margin-bottom: 30px !important;
  }
  :deep(.el-radio__inner) {
    border-radius: 2px;
  }
 
  :deep(.el-radio__input.is-checked) .el-radio__inner::after {
    content: "";
    width: 10px;
    height: 5px;
    border: 1px solid white;
    border-top: transparent;
    border-right: transparent;
    text-align: center;
    display: block;
    position: absolute;
    top: 3px;
    left: 3px;
    vertical-align: middle;
    transform: rotate(-45deg);
    border-radius: 0px;
    background: none;
  }
  .infor-item {
    display: flex;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.65);
    line-height: 22px;
    margin-bottom: 10px;

    .label {
      color: rgba(0, 0, 0, 0.85);
      white-space: nowrap;
    }

    .text {
      flex: 1;
    }
  }
}
</style>
