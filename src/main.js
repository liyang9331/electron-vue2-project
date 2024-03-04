import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";

// import "./utils/rem";
import ElementUI from "element-ui";
import zhCn from "element-ui/lib/locale/lang/zh-CN";
import "element-ui/lib/theme-chalk/index.css";

// import "./assets/iconfont/iconfont.css";
// 导入封装得svg 组件
import SvgIcon from "@/components/SvgIcon";
import buttonr from "@/components/button";
import "./assets/css/reset.css";
import "./assets/css/index.scss";
import "./assets/css/index.css";
import "./assets/css/element-ui-theme.scss";
// 富文本编辑器
import VueTinymce from "@packy-tang/vue-tinymce";
// 树形选择器
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import Treeselect from "@riophae/vue-treeselect";
// import VScaleScreen from 'v-scale-screen'
// import "@/utils/screen/rem"
// 导入所有svg文件
const req = require.context("./icons/svg", false, /\.svg$/);
const requireAll = (requireContext) =>
  requireContext.keys().map(requireContext);
requireAll(req);

Vue.use(ElementUI, { size: "small", zIndex: 3000, locale: zhCn });
Vue.config.productionTip = false;
Vue.component("SvgIcon", SvgIcon);
Vue.component("buttonr", buttonr);
Vue.component("Treeselect", Treeselect);
Vue.use(VueTinymce);
// Vue.use(VScaleScreen);
new Vue({
  store,
  router,
  render: (h) => h(App),
}).$mount("#app");
