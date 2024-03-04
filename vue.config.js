const path = require("path");
const fs = require("fs");
// const px2rem = require('postcss-px2rem')
// 配置基本大小
// const postcss = px2rem({
//   // 基准大小 baseSize，需要和rem.js中相同
//   remUnit: 16
// })

function resolve(dir) {
  return path.join(__dirname, dir);
}

const packageData = fs.readFileSync(resolve("package.json"));
var packageJSON = JSON.parse(packageData);
module.exports = {
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "./src/assets/css/index.scss";`,
      },
      postcss: {
        plugins: [
          require("postcss-px-to-viewport")({
            unitToConvert: "px", // 需要转换的单位，默认为"px"
            viewportWidth: 1920, // 视窗的宽度，对应的是我们设计稿的宽度，一般是750
            viewportHeight: 1080, // 视窗的高度，对应设计搞的高度
            unitPrecision: 6, // 单位转换后保留的精度
            propList: [""],// 能转化为vw的属性列表
            viewportUnit: "vw", // 希望使用的视口单位
            fontViewportUnit: "vw", // 字体使用的视口单位
            // 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。
            selectorBlackList: ["ts-header","login-container","app-content","base-data","header","page-content"],
            minPixelValue: 1, // 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
            mediaQuery: true, // 媒体查询里的单位是否需要转换单位
            replace: true, // 是否直接更换属性值，而不添加备用属性
            // 设置忽略文件，用正则做目录名匹配
            exclude: /(\/|\\)(node_modules)(\/|\\)/,
            // landscape: false // 是否处理横屏情况
          }),
          // require("postcss-pxtorem")({
          //   rootValue: 100, //换算基数， 默认100  ，这样的话把根标签的字体规定为1rem为50px,这样就可以从设计稿上量出多少个px直接在代码中写多上px了。
          //   propList: ["*"], //可以从px更改到rem的属性,值需要精确匹配。
          //   // 1.使用通配符 * 启用所有属性。 示例：['*']
          //   // 2.在单词的开头或者结尾使用 *。 ( ['*position*'] 将匹配 background-position-y )
          //   // 3.使用 与属性不匹配。! 示例：['*','letter-spacing']!
          //   // 4.将"非"前缀与其他前缀合并。 示例：['*','font*']!
          //   unitPrecision: 5, //允许REM单位增长到的十进制数字。
          //   propWhiteList: [], //默认值是一个空数组，这意味着禁用白名单并启用所有属性。
          //   propBlackList: [], //黑名单
          //   exclude: /(node_module)/, //默认false，可以（reg）利用正则表达式排除某些文件夹的方法，例如/(node_module)/ 。如果想把前端UI框架内的px也转换成rem，请把此属性设为默认值
          //   selectorBlackList: [], //要忽略并保留为px的选择器
          //   ignoreIdentifier: false, //（boolean/string）忽略单个属性的方法，启用ignoreidentifier后，replace将自动设置为true。
          //   replace: true, // （布尔值）替换包含REM的规则，而不是添加回退。
          //   mediaQuery: false, //（布尔值）允许在媒体查询中转换px。
          //   minPixelValue: 3, //设置要替换的最小像素值(3px会被转rem)。 默认 0
          // }),
        ],
      },
    },
  },
  lintOnSave: false,
  configureWebpack: {
    externals: { archiver: "require('archiver')" },
  },
  chainWebpack(config) {
    config.module.rule("svg").exclude.add(resolve("src/icons")).end();
    config.module
      .rule("icons")
      .test(/\.svg$/)
      .include.add(resolve("src/icons"))
      .end()
      .use("svg-sprite-loader")
      .loader("svg-sprite-loader")
      .options({
        symbolId: "icon-[name]",
      })
      .end();

    // worker   配置
    config.module
      .rule("worker")
      .test(/\.worker\.js$/)
      .use("worker-loader")
      .loader("worker-loader")
      .options({ filename: "WorkerName.[hash].js", esModule: true })
      .end();

    //加上几下参数 打包之后报错
    // config.output.globalObject('this');
    config.module.rule("js").exclude.add(/\.worker\.js$/);
  },
  pluginOptions: {
    electronBuilder: {
      chainWebpackMainProcess: (config) => {
        config.output.filename((file) => {
          if (file.chunk.name === "index") {
            return "background.js";
          } else {
            return "[name].js";
          }
        });
      },
      externals: ["sqlite3", "archiver"],
      nodeIntegration: true,
      parallel: false, // worker  配置打包时报错
      // 预加载文件
      preload: "src/preload.js",
      // 渲染进程也可以获取原生node包
      nodeIntegration: true,
      // 打包配置
      builderOptions: {
        // 应用程序名称
        productName: packageJSON.productName,
        // 包名
        appId: packageJSON.appId,
        // 版权信息
        copyright: packageJSON.copyright,
        compression: "store", // "store" | "normal"| "maximum" 打包压缩情况(store 相对较快)，store 39749kb, maximum 39186kb
        // 更新app的服务器地址
        // publish: [
        //   {
        //     provider: "generic",
        //     url: "http://127.0.0.1/app/",
        //   },
        // ],
        // asar: true,
        asar: true, // asar打包
        // 不需要打包至asar中的文件如数据库文件
        extraResources: [
          {
            from: "./data/",
            to: "../data/",
            filter: ["**/*"],
          },
          {
            from: "./icons/",
            to: "../icons/",
            filter: ["**/*"],
          },
        ],
        win: {
          // 图标文件大小为 256*256
          icon: "./icons/logo_win.ico",
          target: [
            {
              target: "nsis",
              arch: [
                "x64",//确保应用的依赖库也支持64位系统
              ],
            },
          ],

          // 打包权限 asInvoker | highestAvailable
          requestedExecutionLevel: "highestAvailable",
        },
        mac: {
          // 图标文件大小为 512*512
          icon: "./icons/logo_mac.ico", //图标路径
        },
        // 安装包名称，可自行配置
        artifactName:packageJSON.shortcutName+"-v${version}-${platform}-x64-setup.${ext}",
        nsis: {
          // 一键安装，如果设为true，nsis设置就无意义请直接删除 nsis 配置
          oneClick: false,
          // "guid": "xxxx", //注册表名字，不推荐修改
          // true全用户安装【目录为：C:\Program Files (x86)】，false安装到当前用户
          perMachine: true, // 是否开启安装时权限限制（此电脑或当前用户）
          // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
          allowElevation: true,
          // 允许修改安装目录
          allowToChangeInstallationDirectory: true,
          //卸载后删除用户数据
          deleteAppDataOnUninstall: true,
          // 创建桌面图标
          createDesktopShortcut: true,
          // 创建开始菜单图标
          createStartMenuShortcut: true,
          // 快捷方式的名称,默认为应用程序名称
          shortcutName: packageJSON.shortcutName,
          // 安装图标
          installerIcon: "./icons/logo_win.ico",
          // 卸载图标
          uninstallerIcon: "./icons/uninstall.ico",
          // 安装时头部图标
          installerHeaderIcon: "./icons/logo_win.ico",
          // 配置 nsn 如修改默认安装目录
          include: "./installer.nsh",
        },
      },
    },
  },
};
