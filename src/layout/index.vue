<template>
  <div class="app-wrapper">
    <!-- <electron-remote /> -->
    <!-- 应用导航 -->
    <Header class="header" @secondMenu="secondMenu"></Header>
    <div :class="['app-content', isList ? 'list-bg' : '']">
      <!-- 页面 -->
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
    <!-- 底部 -->
    <!-- <Footer></Footer> -->
  </div>
</template>
<script>
import ElectronRemote from "./components/electron-remote/index";
import Header from "./components/Header/index";
import Footer from "../views/footer/Footer.vue";
export default {
  name: "Layout",
  components: {
    ElectronRemote,
    Header,
    Footer,
  },
  computed: {},
  watch: {
    $route: {
      handler(val) {
        this.isList = val.meta.isList;
      },
      immediate: true,
    },
  },
  data() {
    return {
      isList: false,
      constantRoutes: [],
    };
  },
  methods: {
    secondMenu(data) {
      this.constantRoutes = data;
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-main {
    height: 100%;
    overflow: auto;
    background-color: #f3f6fe;
    padding: 0;
    overflow-x: hidden;
  }
}

.app-wrapper {
  height: 100%;
  min-width: 1650px;
  & > .app-content {
    height: calc(100vh - 85px);
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
    background-image: url("../assets/images/list_bg.png");
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    display: flex;
    // align-items: center;
    justify-content: center;
  }

  // @media screen and (min-width: calc((100vh + 40px) / 9 * 16)) {
  //   /* 在屏幕宽度大于等于高度的 16 倍时应用的样式 */

  // }
  .page-content {
    // width: calc((100vh + 40px) * (16 / 9) - 48px);
    width: calc(((100vh + 40px) / 9) * 16 - 48px);
    min-height: calc(100% - 12px);
    margin-top: 12px;
    // overflow: auto;
    // overflow-x: hidden;
    // padding: 12px 24px 24px 24px;
    background-position: center center;
  }

  .map-page-content {
    width: 100%;
    height: 100%;
    // overflow: auto;
    overflow: hidden;
    // padding: 12px 24px 24px 24px;
  }
}

.header {
  width: 100%;
  height: 60px;
}
</style>
