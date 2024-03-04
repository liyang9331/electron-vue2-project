<template>
  <div class="ts-header">
    <div class="left">
      <!-- <span>Tiger Song</span> -->
    </div>
    <div class="items">
      <div @click="minimize()">
        <img src="@/assets/images/icons/reduce.png" srcset="" />
      </div>
      <div @click="maximize()" v-if="isMaximized">
        <img src="@/assets/images/icons/restore.png" srcset="" />
      </div>
      <div @click="maximize()" v-else>
        <img src="@/assets/images/icons/maximize.svg" srcset="" />
      </div>
      <div @click="close()">
        <img src="@/assets/images/icons/exit.png" srcset="" />
      </div>
    </div>
  </div>
</template>
   
<script>
const { ipcRenderer } = require("electron");
export default {
  name: "ElectronRemote",
  components: {},
  data() {
    return {
      isMaximized: true,
    };
  },
  methods: {
    minimize() {
      ipcRenderer.send("minimize");
    },
    maximize() {
      this.isMaximized = !this.isMaximized;
      ipcRenderer.send("maximize");
    },
    close() {
      ipcRenderer.send("close");
    },
  },
  mounted() {},
};
</script>
   
<style lang="scss" scoped>
.ts-header {
  // position: absolute;
  // &::after{display:block;clear:both;content:"";}
  // 通知Electron可拖拽
  -webkit-app-region: drag;
  -webkit-user-select: none;

  background-color: #e4e4e4;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 25px;
  width: 100%;
  .items {
    -webkit-app-region:no-drag;
    display: flex;
    align-items: center;
    justify-content: space-between;
    & > div {
      width: 25px;
      height: 25px;
      display: flex;
      align-items: center;
      justify-content: center;
      // background-color: aqua;
      
    }
    & > div:hover {
      background-color: #025fce;
    }
    & > div:nth-child(3):hover {
      background-color: red;
    }
  }
  & img {
    width: 12px;
    height: auto;
    // cursor: pointer;
  }
}
</style>