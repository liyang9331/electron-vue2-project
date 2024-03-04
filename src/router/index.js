import Vue from "vue";
import VueRouter from "vue-router";
/* Layout */
import Layout from "@/layout";
Vue.use(VueRouter);
export const constantRoutes = [
  {
    path: "home",
    name: "主页",
    isAdmin:false,
    meta: { title: "主页", affix: true },
    component: () => import("@/views/home/index.vue"),
    imgUrl: require("@/assets/images/icons/home.svg"),
  },
  {
    path: "placeNameManage",
    name: "地名管理",
    isAdmin:false,
    meta: { title: "地名管理", affix: true, isList: true },
    component: () => import("@/views/place-name-manage/index.vue"),
    imgUrl: require("@/assets/images/icons/placeName.svg"),
  },
  {
    path: "placeNameTypeManage",
    name: "地名类型管理",
    isAdmin:true,
    meta: { title: "地名类型管理", affix: true, isList: true },
    component: () => import("@/views/place-name-type-manage/index.vue"),
    imgUrl: require("@/assets/images/icons/region.svg"),
  },
  {
    path: "regionManage",
    name: "区域管理",
    isAdmin:true,
    meta: { title: "区域管理", affix: true, isList: true },
    component: () => import("@/views/region-manage/index.vue"),
    imgUrl: require("@/assets/images/icons/type.svg"),
  },
  {
    path: "statisticAnalysis",
    name: "统计分析",
    isAdmin:false,
    meta: { title: "统计分析", affix: true, isList: true },
    component: () => import("@/views/statistic-analysis/index.vue"),
    imgUrl: require("@/assets/images/icons/statistics.svg"),
  },
  {
    path: "baseDataManage",
    name: "特殊数据管理",
    isAdmin:true,
    meta: { title: "特殊数据管理", affix: true, isList: true },
    component: () => import("@/views/base-data-manage/index.vue"),
    imgUrl: require("@/assets/images/icons/base-data.svg"),
  },
];

export const routes = [
  {
    path: "/",
    name: "Home",
    component: Layout,
    redirect: "/login",
    children: constantRoutes,
  },
  {
    path: "/login",
    name: "login",
    meta: { title: "登录", affix: true },
    component: () => import("@/views/login/index.vue"),
    imgUrl: require("@/assets/images/icons/home.svg"),
  },
];

const router = new VueRouter({
  mode: "hash",
  routes,
});

export default router;
