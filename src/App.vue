<template>
  <div class="app-page">
    <ElectronRemote />
    <div class="app-content">
      <router-view />
    </div>
  </div>
</template>
<script>
import ElectronRemote from "@/layout/components/electron-remote/index";
// 屏幕自适应
// import { triggerScaleTrends } from "@/utils/screen/screenAdaptation";
export default {
  name: "App",
  components: { ElectronRemote },
  data() {
    return {
      activeDragData: null,
    };
  },
  created() {
    // window.onload = function () {
    //   triggerScaleTrends();
    //   window.addEventListener("resize", function () {
    //     triggerScaleTrends();
    //   });
    // };
  },
  mounted() {},
};
</script>
<style>
.app-page {
  position: relative;
  width: 100%;
  height: 100%;
}
/* 当视口宽度小于或等于 768 像素时应用的样式 */
@media (max-width: 1600px) {
  .app-content {
    width: 100%;
    max-height: calc(100vh - 25px);
    overflow-x: auto;
  }
}

body {
  margin: 0;
  padding: 0;
  background: #fff;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
