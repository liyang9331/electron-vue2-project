<template>
  <div class="page">
    <div class="login-container" v-if="isShow">
      <div class="left">
        <img src="@/assets/images/login-bg.png" alt="" srcset="" />
        <div class="text">
          <p class="name">{{ name }}</p>
          <p>Geographic Data Management System</p>
        </div>
      </div>
      <div class="right">
        <p class="title">欢迎使用{{ name }}</p>
        <!-- <div class="from-box">
          <div class="loginBox">
            <el-form
              ref="loginForm"
              :model="loginForm"
              :rules="loginRules"
              class="login-form"
              auto-complete="on"
              label-position="left"
            >
              <el-form-item prop="name" style="margin-bottom: 40px">
                <span class="svg-container">
                  <img
                    src="@/assets/images/icons/user-icon.svg"
                    alt=""
                    srcset=""
                  />
                </span>
                <el-input
                  ref="name"
                  v-model="loginForm.name"
                  placeholder="用户名"
                  type="text"
                  tabindex="1"
                  auto-complete="on"
                />
              </el-form-item>
              <el-form-item prop="password" style="margin-bottom: 40px">
                <span class="svg-container">
                  <img
                    src="@/assets/images/icons/pwd-icon.svg"
                    alt=""
                    srcset=""
                  />
                </span>
                <el-input
                  :key="passwordType"
                  ref="password"
                  v-model="loginForm.password"
                  :type="passwordType"
                  placeholder="密码"
                  name="password"
                  tabindex="2"
                  auto-complete="on"
                  @keyup.enter.native="handleLogin"
                />
                <span class="show-pwd" @click="showPwd">
                  <svg-icon
                    :icon-class="
                      passwordType === 'password' ? 'eye' : 'eye-open'
                    "
                  />
                </span>
              </el-form-item>
              <div>
                <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
              </div>
              <el-button
                :loading="loading"
                class="loginbtn"
                @click.native.prevent="handleLogin"
                >登录</el-button
              >
            </el-form>
          </div>
        </div> -->
        <div class="from-box" v-if="isKey === false">
          <div class="loginBox">
            <div class="text">
              <p class="">欢迎使用{{ name }}，请输入秘钥:</p>
              <span>请根据保密要求使用此软件</span>
            </div>

            <el-form
              ref="loginForm"
              :model="loginForm"
              :rules="loginRules"
              class="login-form"
              auto-complete="on"
              label-position="left"
            >
              <el-form-item prop="name" style="margin-bottom: 40px">
                <el-input
                  v-model="loginForm.name"
                  placeholder="请输入单位名称"
                  type="text"
                  tabindex="1"
                  auto-complete="on"
                />
              </el-form-item>
              <el-form-item prop="key" style="margin-bottom: 10px">
                <el-input
                  type="textarea"
                  v-model="loginForm.key"
                  rows="6"
                  placeholder="输入对应秘钥"
                ></el-input>
              </el-form-item>
              <div>
                <div class="el-alert-parent">
                  <el-alert
                    v-if="keyError"
                    :title="keyError"
                    type="error"
                    :closable="false"
                  >
                  </el-alert>
                </div>
              </div>
              <el-button
                style="margin-top: 40px"
                :loading="loading"
                class="loginbtn"
                @click="activeKeyHandle"
                >确认</el-button
              >
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import ElectronRemote from "../../layout/components/electron-remote/index";
import AES from "@/utils/verify/AES";
import dayjs from "dayjs";
export default {
  name: "",
  components: {
    // ElectronRemote,
  },
  data: () => {
    // const validateUsername = (rule, value, callback) => {
    //   if (!validUsername(value)) {
    //     callback(new Error("请输入用户名!"));
    //   } else {
    //     callback();
    //   }
    // };
    // const validatePassword = (rule, value, callback) => {
    //   if (value.length < 6) {
    //     callback(new Error("请输入密码(不得少于6位)!"));
    //   } else {
    //     callback();
    //   }
    // };
    return {
      name: window.packageJSON.systemNameZH,
      isKey: false, //是否激活了key
      key: null, // 激活的key
      unit: null, //选择的单位
      loginForm: {
        name: "",
        // name: "",
        password: "",
        remember: false,
        //秘钥
        key: "",
      },
      loginRules: {
        name: [{ required: true, trigger: "blur", message: "单位名称必填" }],
        password: [{ required: true, trigger: "blur" }],
        key: [{ required: true, trigger: "blur", message: "秘钥必填" }],
      },
      loading: false,
      passwordType: "password",
      redirect: undefined,
      keyError: null,
      isShow: false,
    };
  },
  created() {
    console.log("login created");
    this.checkingkey();
  },
  mounted() {},
  methods: {
    activeKeyHandle() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          // alert('submit!');
          const obj = JSON.parse(AES.decrypt(this.loginForm.key, AES.getKey()));

          if (obj != "" && obj.deptName == this.loginForm.name) {
            const time = dayjs().valueOf();
            const start = dayjs(obj.startTime).valueOf();
            const end = dayjs(obj.endTime).valueOf();
            // console.log(time, end);
            if (time >= end) {
              this.keyError = "秘钥已过期，请联系管理员";
            } else {
              this.$message.success("密钥已激活");
              this.$store.commit("app/setKey", obj);
              this.keyError = null;
              this.$router.push({ path: "/home" });
            }
          } else {
            this.keyError = "输入的单位名称与密钥解析不一致，请核对后重新输入";
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    checkingkey() {
      let key = localStorage.getItem("key");
      if (key) {
        key = JSON.parse(key);
        if (dayjs(key.endTime).valueOf() > dayjs().valueOf()) {
          this.isShow = false;
          this.$store.commit("app/setKey", key);
          this.$router.push({ path: "/home" });
        } else {
          this.keyError = "秘钥已过期，请联系管理员";
          this.isShow = true;
        }
      } else {
        this.isShow = true;
      }
    },
    showPwd() {
      if (this.passwordType === "password") {
        this.passwordType = "";
      } else {
        this.passwordType = "password";
      }
      this.$nextTick(() => {
        this.$refs.password.focus();
      });
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$store
            .dispatch("user/login", this.loginForm)
            .then((res) => {
              this.$router.push({ path: this.redirect || "/" });
              setTimeout(() => {
                location.reload();
              }, 10);
            })
            .catch((res) => {
              this.$message.warning(res.message);
              // this.loginForm.password = ''
              this.loginForm.remember = false;
            })
            .finally((res) => {
              this.loading = false;
            });
        } else {
          return false;
        }
      });
    },
    // 获取cookies中的用户名和密码
    getCookies() {
      this.loginForm.name = Cookies.get("userName")
        ? Cookies.get("userName")
        : "";
      const enPassword = Cookies.get("userPwd") ? Cookies.get("userPwd") : "";
      if (enPassword) {
        // 对密码进行解密
        this.loginForm.password = enPassword;
        // 将是否记住密码置为true
        this.loginForm.remember = true;
      } else {
        this.loginForm.password = "";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.page{
  min-width:1650px;
}
::v-deep .el-form-item__content {
  position: relative;
}

.el-alert-parent {
  height: 34px;
}

.login-container {
  height: calc(100vh - 25px);
  width: 100%;
  /* background-repeat: no-repeat; */
  /* background-size: cover; */
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  /* justify-content: center;*/

  .left {
    display: flex;
    position: relative;
    height: 100%;

    & > img {
      height: 100%;
      width: auto;
    }

    .text {
      position: absolute;
      bottom: 0px;
      left: 0px;
      width: 100%;
      padding: 186px 0 60px 81px;
      //   align-items: center;
      background: linear-gradient(
        180deg,
        rgba(0, 96, 206, 0) 0%,
        rgba(0, 96, 206, 0.08) 24%,
        rgba(0, 96, 206, 0.81) 66%,
        #0060ce 100%
      );
      border-radius: 0px 0px 0px 0px;
      opacity: 1;

      display: flex;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      font-family: Source Han Sans CN-Bold, Source Han Sans CN;
      flex-direction: column;

      img {
        width: 62px;
        height: 67px;
        margin-right: 60px;
      }

      p {
        margin: 0;
      }

      p:nth-child(1) {
        line-height: 44px;
        font-size: 44px;
        font-family: Source Han Sans CN-Bold, Source Han Sans CN;
        font-weight: bold;
        color: #ffffff;
        line-height: 78px;
        letter-spacing: 10px;
      }

      p:nth-child(2) {
        line-height: 35px;
        font-size: 28px;
        font-family: Corbel-Bold, Corbel;
        font-weight: bold;
        color: #ffffff;
        line-height: 35px;
        -webkit-background-clip: text;
      }

      .arrow-box {
        width: 83px;
        height: 75px;
        background: #ffffff;
        border-radius: 0px 0px 0px 0px;
        opacity: 1;
        border: 1px solid #707070;
        margin-right: 30px;
      }
    }
  }

  .right {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    & > .title {
      width: 380px;
      height: 38px;
      font-size: 38px;
      font-family: Source Han Sans CN-Bold, Source Han Sans CN;
      font-weight: bold;
      color: #001a58;
      line-height: 0px;
      width: 100%;
      text-align: center;
      //   -webkit-background-clip: text;
      //   -webkit-text-fill-color: transparent;
    }

    .from-box {
      //   width: 651px;
      //   height: 433px;
      margin-top: 90px;
      //   background: rgba(0, 42, 99, 0.81);
      border-radius: 20px 20px 20px 20px;
      opacity: 1;

      ::v-deep .el-select {
        width: 420px;
      }

      ::v-deep .el-form-item:nth-child(1) {
        .el-input__inner {
          height: 46px;
          line-height: 46px;
        }
      }

      ::v-deep .el-form-item:nth-child(2) {
        .el-input__inner {
          // border: none;
          border-radius: 25px;
          height: 46px;
          line-height: 46px;
          padding-left: 50px;
          background: #002070;
          border-color: #2467f1;
        }
      }

      ::v-deep .el-button {
        border-radius: 34px;
      }

      .loginBox {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        font-family: "Source Sans Pro", sans-serif;

        .text {
          margin-bottom: 40px;

          & > p {
            font-size: 20px;
            font-family: Source Han Sans CN-Bold, Source Han Sans CN;
            font-weight: bold;
            color: #0060ce;
            line-height: 0px;
          }

          & > span {
            font-size: 14px;
            // margin-top: 10px;
            display: block;
            color: red;
          }
        }

        .loginbtn {
          color: #ffffff;
          font-size: 16px;
          border: none;
          // line-height: 20px;
          letter-spacing: 5px;

          width: 420px;
          height: 40px;
          background: #005bd5;
          box-shadow: 0px 3px 6px 1px rgba(36, 103, 241, 0.4);
          // border-radius: 34px 34px 34px 34px;
          opacity: 1;
        }
      }

      .login-form {
        position: relative;
        width: 420px;
        overflow: hidden;
      }

      .tips {
        font-size: 14px;
        color: #34367e;
        margin-bottom: 10px;

        span {
          &:first-of-type {
            margin-right: 16px;
          }
        }
      }

      .svg-container {
        vertical-align: middle;
        display: flex;
        margin: 0 20px;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        height: 100%;
        align-items: center;

        & img {
          width: 17.91px;
        }
      }

      .title-container {
        position: relative;
        margin-top: 15px;
        margin-bottom: 32px;

        .title {
          font-size: 34px;
          font-family: Source Han Sans CN-Medium, Source Han Sans CN;
          font-weight: 500;
          color: #0080ff;
          margin: 0px auto 10px auto;
          text-align: center;
          letter-spacing: 5px;
        }

        .titeng {
          font-size: 21px;
          letter-spacing: 3px;
        }
      }

      .show-pwd {
        position: absolute;
        right: 15px;
        top: 0;
        display: flex;
        height: 100%;
        align-items: center;
        font-size: 16px;
        color: #889aa4;
        cursor: pointer;
        user-select: none;
      }

      .login_footer {
        position: absolute;
        left: 50%;
        transform: translate(-50%);
        bottom: 33px;
        font-size: 14px;
        font-family: Source Han Sans CN-Regular, Source Han Sans CN;
        font-weight: 400;
        color: #9192be;
        letter-spacing: 5px;
      }
    }
  }
}
</style>
