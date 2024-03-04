/**
 * 自定义字典
 */
export const usage_status = [{ dictValue: '1', dictLabel: '禁用' }, { dictValue: '0', dictLabel: '启用' }]

/**
 * 搜索组件依赖数据抽象
 */
// 依赖的接口
// import { executionAlgorithm } from '@/api/taskScheduling'
export const Search = {
  // el-form的model
  model: (data = {}) => {
    return {
      code: '', // 编码
      name: '', // 名称
      status: '', // 状态 0启用，1禁用
      ...data
    }
  },
  // 非传参字段，另做他用，自行添加
  otherModel: (data = {}) => {
    return {
      taskName: '',
      device: '',
      algorithm: '',
      channel: ''
    }
  },
  /**
   * el-form-item数组
 * 支持类型：
 *  公共参数 @param {type: '类型', model: '绑定的字段名', label: 'label', placeholder: 'a',disabled:"修改是否禁用"}
 *  输入框-input   -- 私有参数 @param {inputType:"textarea || text"} 其他类型请参考：https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Form_%3Cinput%3E_types
 *  远程搜索文本框-remoteSearch   -- 私有参数 @param {querySearchAsync:()=>{},handleSelect:()=>{},createStateFilter:()=>{}} 参考element-ui 远程搜索
 *  选择器-select   -- 私有参数 @param {option:"选择器的数据源",multiple:"是否多选"}
 *  树形控件-tree -- 私有参数 @param {data:"展示数据"}
 *  日期世间选择器-dateTimePicker -- 私有参数 @param {change:(value,form,item)=>{}}
 *  */
  formItemList: [
    {
      type: 'input', inputType: 'text', model: 'code', label: '算法编码', placeholder: '请输入算法编码',
      disabled: false
    },
    {
      type: 'input', inputType: 'text', model: 'name', label: '算法名称', placeholder: '请输入算法名称',
      disabled: false
    },
    {
      type: 'select', model: 'status', label: '使用状态', placeholder: '请选择使用状态',
      disabled: false,
      multiple: false,
      option: usage_status
    },
    {
      type: 'remoteSearch', inputType: 'text', model: 'deviceId', label: '执行设备', placeholder: '请输入执行设备',
      disabled: false,
      timeout: null,
      otherModel: 'device', // 文本框label绑定的字段
      restaurants: [], // 数据源
      // 动态请求数据源
      request: (item) => {
        if (item.restaurants.length === 0) {
          return new Promise((resolve, reject) => {
            executiveDevice({}).then(res => {
              if (res.status === 200) {
                const data = res.data.map(item => { return { ...item, value: '' } })
                item.restaurants = data
                resolve(data)
              } else {
                reject(res)
              }
            }).catch(err => {
              reject(err)
            }).finally(res => { })
          })
        } else {
          return new Promise((resolve, reject) => {
            resolve(item.restaurants)
          })
        }
      },
      createStateFilter: (queryString) => {
        return (state) => {
          if (state.deviceName.toLowerCase().indexOf(queryString.toLowerCase()) === 0) {
            state.value = state.deviceName
            return true
          } else if (state.deviceCode.toLowerCase().indexOf(queryString.toLowerCase()) === 0) {
            state.value = state.deviceCode
            return true
          } else {
            return false
          }
        }
      },
      querySearchAsync: (queryString, cb, form, item) => {
        item.request(item).then(res => {
          const restaurants = res
          const results = queryString ? restaurants.filter(item.createStateFilter(queryString)) : restaurants
          clearTimeout(item.timeout)
          item.timeout = setTimeout(() => {
            cb(results)
          }, 500 * Math.random())
        })
      },
      // 设置动态搜索上传参数字段值
      handleSelect: (data, form, item) => { form.deviceId = data.id }
    }
  ]
}

/**
 * 表格表头-字段、自定义渲染
 */
export const columns = [
  { label: '算法编码', prop: 'code' },
  { label: '算法名称', prop: 'name' },
  { label: '版本', prop: 'version' },
  // { label: '算法描述', prop: 'description',
  // },
  { label: '更新时间', prop: 'updateTime' },
  {
    label: '使用状态', prop: 'status',
    component: {
      functional: true,
      render (_, context) {
        const status = context.props.context.status
        if (status == '0') {
          return <div class='blue'><span><i class='el-icon-success' style='margin-right:10px' />启用</span></div>
        } else if (status == '1') {
          return <div class='gray'><span><i class='el-icon-error' style='margin-right:10px' />禁用</span></div>
        }
      }
    }
  }
]

/**
 * 添加、编辑-表单
 * @param {*} data
 * @returns
 */
// import { addAlgorithmModel, editAlgorithmModel } from '@/api/algorithmModel'
import store from '@/store'
export const Form = {
  // el-form的model
  text: '算法模型', // 表单头部标题
  model: (data = {}) => {
    return {
      code: '', // 编码
      description: '', // 描述
      modelFile: '', // 模型文件
      name: '', // 名称
      status: '', // 状态 0启用，1禁用
      userId: 0, // 用户id
      version: '', // 版本
      level: null,
      ...data
    }
  },
  /**
 * el-form-item数组
 * 支持类型：
 *  公共参数 @param {type: '类型', model: '绑定的字段名', label: 'label', placeholder: 'a',disabled:"修改是否禁用"}
 *  输入框-input   -- 私有参数 @param {inputType:"textarea || text"} 其他类型请参考：https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Form_%3Cinput%3E_types
 *  富文本-RichText   -- 私有参数 @param {}
 *  选择器-select   -- 私有参数 @param {option:"选择器的数据源",multiple:"是否多选"}
 *  树形控件-tree -- 私有参数 @param {data:"展示数据"}
 *  文件上传-upload --私有参数 @param {}
 *  单选-radio
 *  多选-radio-group
 *  */
  formItemList: [
    {
      type: 'input', inputType: 'text', model: 'code', label: '算法编码', placeholder: '请输入算法编码',
      disabled: false
    },
    {
      type: 'input', inputType: 'text', model: 'name', label: '算法名称', placeholder: '请输入算法名称',
      disabled: false
    },
    {
      type: 'input', inputType: 'text', model: 'version', label: '算法版本', placeholder: '请输入算法版本',
      disabled: false
    },
    {
      type: 'RichText', model: 'description', label: '算法描述', placeholder: '请输入算法描述',
      disabled: false
    },
    {
      type: 'select', model: 'status', label: '使用状态', placeholder: '请选择使用状态',
      disabled: false,
      multiple: false,
      option: usage_status
    },
    {
      type: 'radio', model: 'level', label: '数据密级', placeholder: '',
      disabled: false, data: [
        { name: '1级', value: 1 },
      ]
    },
    {
      type: 'radio-group', model: 'level', label: '数据密级', placeholder: '',
      disabled: false, data: [
        { name: '1级', value: 1 },
        { name: '2级', value: 2 },
        { name: '3级', value: 3 },
      ]
    },
    {
      type: 'input', inputType: 'textarea', rows: 3, model: 'key', label: '激活KEY', placeholder: '请输入描述信息',
      disabled: false, textButton: "生成安装key", textButtonClick: (item, form, model) => {
        console.log("正在生成安装key")
      }
    },
    {
      type: 'upload', model: 'modelFile', label: '算法模型', placeholder: '请上传算法模型',
      disabled: false,
      // 文件选择
      fileChange: (file = null, form, model) => {
        if (file !== null) {
          form[model] = file.raw
        }
      }
    }
  ],
  /**
   * 添加、编辑-表单过滤
   * 过滤示例：
   * rule: [{ required: true, message: 'xx' },{ max: 100, message: '最长 100 个字符', trigger: 'blur' },      {
        validator(rule, value, callback, source, options) {
          const pattern = /[a-zA-Z]+/
          if (pattern.test(value)) {
            callback(new Error('只能为数字'))
          } else {
            callback()
          }
        }
      }],
   */
  rules: {
    code: [{ required: true, message: '请选择输入算法编码' }, { max: 50, message: '最长 50 个字符', trigger: 'blur' }],
    name: [{ required: true, message: '请输入算法名称' }, { max: 100, message: '最长 100 个字符', trigger: 'blur' }],
    version: [{ required: true, message: '请输入算法版本' }],
    description: [{ required: true, message: '请输入算法描述' }],
    status: [{ required: true, message: '请选择使用状态' }],
    modelFile: [{ required: true, message: '请选择算法模型' }]
  },
  /**
   * 接口
   */
  //   api: { add: addAlgorithmModel, edit: editAlgorithmModel }
}

/**
 * 表格字段字典匹配
 * @param {*} list
 * @param {*} option
 */
export function listProcess (list, option) {
  const { numberTypeList, factoryTypeList } = option
  list.forEach(item => {
    const numberType = numberTypeList.find(k => Number(k.dictValue) === Number(item.numberType))
    const factory = factoryTypeList.find(k => Number(k.dictValue) === Number(item.factory))
    item.lngAndLat = item.lng + ',' + item.lat
    item.channel_text = item.children.map(item => item.channelName).join()
    item['numberType_text'] = item.numberType != null ? typeof (numberType) === 'object' ? numberType.dictLabel : '' : ''
    item['factory_text'] = item.factory != null ? typeof (factory) === 'object' ? factory.dictLabel : '' : ''
  })
}