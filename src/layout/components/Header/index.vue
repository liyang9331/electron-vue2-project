<template>
  <div class="header">
    <img src="@/assets/images/header/header-bg.png" alt="" srcset="" />
    <div class="header-content">
      <div class="nav">
        <div class="logo">
          <!-- <img src="@/assets/images/header/header-logo.png" alt="" /> -->
          <p>{{ name }}</p>
          <p>{{ nameEN }}</p>
        </div>
        <div :class="['header-item', activeNum == index ? 'active' : 'no-active']"
          v-for="(item, index) in permission_routes" :key="index" @click="onChange(item, index)">
          <img v-if="item.name.length <= 4" class="bg" src="@/assets/images/header/header-nav-item-bg-active.svg" alt=""
            srcset="" />
          <img v-else class="bg" src="@/assets/images/header/header-nav-item-big-bg.svg" alt="" srcset="" />
          <div class="a">
            <div class="img">
              <img :src="item.imgUrl" />
            </div>
            <div class="text">
              {{ item.name }}
            </div>
          </div>
          <!-- <router-link :to="resolvePath(item.path)">
            <div class="img">
              <img :src="item.imgUrl" />
            </div>
            <div class="text">
              {{ item.name }}
            </div>
          </router-link> -->
        </div>
      </div>
      <div class="header-right">
        <span>欢迎您，{{ $store.state.app.name }}！</span>
        <div @click="logout">
          <img src="@/assets/images/icons/exit-system.png" alt="" srcset="" />
          <span>退出登录</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { constantRoutes } from "@/router";
export default {
  name: "Header",
  components: {},
  data() {
    return {
      mini1080P:true,
      permission_routes: [],
      basePath: "/",
      secondaryMenu: [],
      activeNum: 0,
      name: window.packageJSON.systemNameZH,
      nameEN: window.packageJSON.systemNameEN
    };
  },
  computed: {},
  created() {
    window.addEventListener("resize",e=>{
      const viewportWidth = document.documentElement.clientWidth || document.body.clientWidth;
      const viewportHeight = document.documentElement.clientHeight || document.body.clientHeight;
      // console.log(viewportWidth)
      if(viewportWidth<1650){
        this.mini1080P=false
      }
    })
    this.permission_routes = constantRoutes.filter((item) => {
      // 管理员权限过滤
      if (!item.parent && !item.hidden) {
        if (item.isAdmin === false) {
          return true;
        } else if (
          item.isAdmin === true &&
          this.$store.state.app.isAdmin === true
        ) {
          return true;
        }
      }
    });
    this.secondaryMenu = constantRoutes.filter((item) => {
      if (item.parent == constantRoutes[0].name) {
        return item;
      }
    });
    this.$emit("secondMenu", this.secondaryMenu);
  },
  methods: {
    logout() {
      this.$confirm("此操作将永久退出, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$store.commit("app/removeKey");
          this.$router.push({ path: "/login" });
        })
        .catch(() => { });
    },
    onChange(data, index) {
      // console.log(data)
      this.$router.push({ path: "/" + data.path })
      this.activeNum = index;
      this.secondaryMenu = constantRoutes.filter((item) => {
        if (item.parent == data.name) {
          return item;
        }
      });

      this.$emit("secondMenu", this.secondaryMenu);
    },
    isExternal(path) {
      return /^(https?:|mailto:|tel:)/.test(path);
    },
    resolvePath(routePath) {
      // console.log(routePath);
      if (this.isExternal(routePath)) {
        return routePath;
      }
      if (this.isExternal(this.basePath)) {
        return this.basePath;
      }
      // console.log("routePath", this.basePath + routePath);
      return this.basePath + routePath;
    },
  },
};
</script>

<style lang="scss" scoped>
.a {
  display: flex;
  text-decoration: none;
  color: #000;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 100%;
  // padding: 0 26px;
}

.header {
  position: relative;
  display: flex;
  align-items: center;

  &>img {
    width: 100%;
    height: 60px;
    position: absolute;
    z-index: -1;
  }

  .header-content {
    display: flex;
    height: 100%;
    width: 100%;
    align-items: center;
    justify-content: space-between;

    .nav {
      display: flex;
    }

    .logo {
      // height: 22px;
      // width: 108px;
      max-height: 36px;
      display: flex;
      align-items: center;
      margin-left: 33px;
      margin-right: 90px;
      flex-direction: column;

      p {
        color: #ffffff;
        margin: 0;
        text-align: center;
      }

      p:nth-child(1) {
        font-size: 20px;
        margin-bottom: 5px;

        // font-weight: 500;
        // text-decoration: ;
        // line-height: 0;
      }

      p:nth-child(2) {
        font-size: 11px;
        // font-weight: 100;
        letter-spacing: 0.01px;
        font-family: Source Han Sans CN-Medium, Source Han Sans CN;
      }

      img {
        width: 100%;
        height: 100%;
      }
    }

    .header-item {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-width: calc(180px - 72px);
      position: relative;
      padding: 0 36px;
      margin-left: -10px;

      &>.bg {
        position: absolute;
        width: 100%;
        height: 120%;
        z-index: -1;
      }

      a {
        flex-direction: row !important;
        padding: 0;
      }

      .img {
        width: 24px;
        height: 24px;
        margin-right: 12px;

        img,
        svg {
          width: 100%;
          height: 100%;
        }
      }

      .text {
        // width: 36px;
        // height: 18px;
        font-size: 18px;
        font-family: Source Han Sans CN-Medium, Source Han Sans CN;
        font-weight: 500;
        color: #ffffff;
        // line-height: 0px;
        // -webkit-background-clip: text;
        // -webkit-text-fill-color: transparent;
      }

      &:hover {
        opacity: 1;
      }
    }

    .active {
      opacity: 1;
    }

    .no-active {
      opacity: 0.6;
    }

    .header-right {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #ffffff;
      margin-right: 5px;

      &>div {
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 5px 0;

        &:hover {
          background-color: rgba($color: #ffffff, $alpha: 0.4);
        }
      }

      img {
        width: 18.4px;
        margin-right: 13px;
      }
    }
  }
}
</style>
