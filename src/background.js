import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import {
  app,
  protocol,
  BrowserWindow,
  ipcMain,
  dialog,
  Menu,
  screen,
  session,
  net,
} from "electron";
const isDevelopment = process.env.NODE_ENV !== "production";
require('v8-compile-cache');
/**
 * @electron/remote是一个Electron模块，它将 JavaScript 对象从主进程连接到渲染器进程。
 * 这使您可以访问仅主进程的对象，就好像它们在渲染器进程中可用一样。
 * @electron/remote/main必须在主进程中初始化，然后才能从渲染器中使用它
 */
const remote = require("@electron/remote/main");
remote.initialize();

const url = require("url");
const path = require("path");
const fs = require("fs");
const httpServer = require("http-server");
var packageJSON = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"))
);

// 系统日志
import log from "electron-log";
// Optional, initialize the logger for any renderer process
log.transports.console.level = false;
log.transports.console.level = "silly";
console.log = log.info;
console.error = log.error;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

/**
 * 您可以在app 模块的ready事件生效之前，使用app.commandLine.appendSwitch将它们附加到您的应用程序的主要脚本中：
 */
// 禁用HTTP请求的磁盘缓存
// app.commandLine.appendSwitch('--disable-http-cache')

// 设置当前应用程序的名字
// 注意： 此函数会覆盖Electron内部使用的名称；它不会影响操作系统使用的名称。
app.setName(packageJSON.productName);

const appPath = app.getAppPath();

var rootPath = "";
let win;

if (process.env.WEBPACK_DEV_SERVER_URL) {
  // 开发模式中的
  rootPath = path.join(appPath, "../");
} else {
  rootPath = path.dirname(app.getPath("exe"));
}
let screenConfig = {
  width: 800,
  height: 600,
};
/**
 * @Description: electron程序入口
 */
const createWindow = () => {
  Menu.setApplicationMenu(null);
  // Create the browser window.
  win = new BrowserWindow({
    ...screenConfig,
    maxWidth: screen.getPrimaryDisplay().workAreaSize.width,
    maxHeight: screen.getPrimaryDisplay().workAreaSize.height,
    // 是否显示渲染进程窗口
    show: false,
    center: true,
    // fullscreen:true,
    // useContentSize:true,
    // 是否全屏
    // fullscreen: false,
    // 应用 hidden 标题栏样式的结果是隐藏标题栏和全尺寸内容窗口。
    titleBarStyle: "hidden",
    /**
     * 无边框窗口是没有 chrome 的窗口。 不要与 Google Chrome 浏览器混淆，
     * 窗口的 chrome 是指窗口的某些部分（例如工具栏、控件等），它们不是网页的一部分。
     * 要创建无边框窗口，需在 BrowserWindow 的构造中将 frame 参数设置为 false：
     */
    frame: false,
    backgroundColor: "#2e2c29",
    // icon: new Tray(path.join(rootPath, './icons/icon.ico')),
    skipTaskbar: false,
    transparent: false,
    webPreferences: {
      // partition: String(+new Date()),
      // devTools: isDevelopment, // 启用DevTools
      hardwareAcceleration:true,//启动硬件加速
      contextIsolation: false, // 关闭上下文隔离
      nodeIntegration: true,
      enableRemoteModule: true, // 取消 Remote 模块警告
      // 禁用同源策略,跨域http请求
      webSecurity: false,
      preload: path.join(__dirname, "preload.js"),
      // 启用 Chromium 的实验功能。 默认值为 false.
      experimentalFeatures: false,
    },
  });

  //打开调试模式
  remote.enable(win.webContents);

  if (isDevelopment) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    // 开发环境-打开页面调试
    win.webContents.openDevTools({ mode: "bottom" });
  } else {
    // 生产环境-打开页面调试
    // win.webContents.openDevTools({ mode: "undocked" });
    createProtocol("app");
    win.loadURL("app://./index.html");
    // autoUpdater.checkForUpdates()
  }

  //设置title名称
  win.setTitle(packageJSON.productName);
  // -------------- 优雅地显示窗口 ----------------
  /**
   * ① 使用 ready-to-show 事件
   * 在加载页面时，渲染进程第一次完成绘制时，如果窗口还没有被显示，渲染进程会发出 ready-to-show 事件 。
   * 在此事件后显示窗口将没有视觉闪烁
   * ② 设置 backgroundColor 属性
   * 对于一个复杂的应用，ready-to-show 可能发出的太晚，会让应用感觉缓慢。 在这种情况下，
   * 建议立刻显示窗口，并使用接近应用程序背景的 backgroundColor
   */

  win.once("ready-to-show", () => {
    console.log("ready-to-show");
    // 最大化窗口。 如果窗口尚未显示，该方法也会将其显示 (但不会聚焦)。
    win.maximize();
    // win.show();
  });

  win.on("closed", () => {
    // win = null
  });
};

// 此方法返回你的应用实例当前是否持有单例锁
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    if (win) {
      if (win.isMinimized()) win.restore();
      // 聚焦到当前的窗口
      win.focus();
    }
  });
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {
    if (isDevelopment && !process.env.IS_TEST) {
      // Install Vue Devtools
      session.defaultSession
        .loadExtension(path.resolve(__dirname, "../.devtools"))
        .then(({ id }) => {
          // ...
        });
    }

    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  //创建nodejs http server 静态资源代理服务
  const serverPath = app.isPackaged
    ? path.join(__dirname, "../../", "data")
    : path.join(__dirname, "../", "data");
  httpServer.createServer({ root: serverPath }).listen(9090);
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.commandLine.appendSwitch("no-sandbox");

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

//------------------- IPC 进程间通信模块 start ------------------------
// ipc通信，关闭应用
ipcMain.on("close", (event, data) => {
  win.close();
});
ipcMain.on("restore", (event, data) => {
  console.log("restore");
  win.setContentSize(screenConfig.width, screenConfig.height);
});
ipcMain.on("maximize", (event, data) => {
  // 如果已经是最大化窗口就还原
  if (win.isMaximized()) {
    win.restore();
  } else {
    win.maximize();
  }
});
ipcMain.on("minimize", (event, data) => {
  win.minimize();
});
//通过事件修改数据信息
ipcMain.on("changTitleData", (event, data) => {
  //title 需要是字符串数据
  win.setTitle(data.toString());
});

//上传shp文件
ipcMain.on("uploadShp", (event, data) => {
  dialog
    .showOpenDialog({
      filters: [
        { name: "Shapefile", extensions: ["shp"] },
        { name: "All", extensions: ["*"] },
      ],
      properties: ["openFile"],
    })
    .then((result) => {
      const extendNames = ["shp", "shx", "dbf", "prj", "sbn", "sbx", "cpg"];
      let splitArray = result.filePaths[0].split("\\");
      const fileName = splitArray.slice(-1)[0].split(".")[0];
      splitArray.pop();
      const basePath = splitArray.join("\\");
      const filesPath = [];
      // 依次判断其他文件是否存在
      extendNames.forEach((extendName) => {
        const filepath = path.join(basePath, fileName + "." + extendName);
        if (fs.existsSync(filepath)) {
          filesPath.push({ path: filepath, name: fileName, type: extendName });
        }
      });
      event.sender.send("uploadFileWatch", {
        filePaths: filesPath,
        fileName: fileName,
        ...data,
      });
    });
});

//上传Excel文件
ipcMain.on("uploadExcel", (event, data) => {
  dialog
    .showOpenDialog({
      filters: [
        { name: "Excel", extensions: ["xlsx", "xls", "xlw"] },
        { name: "All", extensions: ["*"] },
      ],
      properties: ["openFile"],
    })
    .then((result) => {
      const filePath = result.filePaths[0];
      // 使用path模块提取文件格式
      const type = path.extname(filePath).toLowerCase().replace(".", ""); // 获取小写的文件格式
      event.sender.send("uploadFileWatch", { ...result, type, ...data });
    });
});

// 上传文件
ipcMain.on("uploadImage", (event, filePaths, name) => {
  const selectedFilePath = filePaths;
  const fileExtension = path.extname(selectedFilePath);
  const timestamp = Date.now();
  const fileName = `${timestamp}${fileExtension}`;
  let tempPath = app.isPackaged
    ? path.join(__dirname, "../../")
    : path.join(__dirname, "../");
  const destinationPath = path.join(tempPath, "data", "uploads", fileName);
  // 检查目标目录是否存在，如果不存在则创建
  const targetDir = path.dirname(destinationPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  // console.log(selectedFilePath,destinationPath)
  fs.copyFile(selectedFilePath, destinationPath, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("文件上传成功");
      event.sender.send("image-path", destinationPath, fileName);
    }
  });
});

// 重启应用
ipcMain.on("relaunch_app", (event, arg) => {
  // console.log(arg) // prints "ping"
  app.relaunch({ args: process.argv.slice(1).concat(["--relaunch"]) });
  app.exit(0);
  // event.reply('asynchronous-reply', 'pong')
});

// 获取所有自定义标注图标
ipcMain.handle("getIcons", (event, arg) => {
  let tempPath = app.isPackaged
    ? path.join(__dirname, "../../")
    : path.join(__dirname, "../");
  const destinationPath = path.join(tempPath, "data", "point-icon");
  // 递归获取目录中的所有 PNG 文件
  function getAllPngFiles(directoryPath, result = []) {
    const files = fs.readdirSync(directoryPath);

    files.forEach((file) => {
      if (path.extname(file).toLowerCase() === ".png") {
        result.push(`http://127.0.0.1:9090/point-icon/${file}`);
      }
    });

    return result;
  }
  if (fs.existsSync(destinationPath)) {
    // 目录存在
    const pngFiles = getAllPngFiles(destinationPath);
    return pngFiles
  }else{
    return []
  }
});

// ======================================================================
// 更新模块
// ======================================================================
// if (!process.env.WEBPACK_DEV_SERVER_URL) {
//   autoUpdater.autoDownload = false;

//   autoUpdater.signals.updateDownloaded(() => {});
//   autoUpdater.on("error", (error) => {
//     log.warn(
//       "检查更新失败: " + error == null
//         ? "unknown"
//         : (error.stack || error).toString()
//     );
//     // dialog.showErrorBox('Error: ', error == null ? 'unknown' : (error.stack || error).toString())
//   });

//   autoUpdater.on("update-available", (info) => {
//     log.warn(info);
//     // var appInfo = {
//     //   info: info.version,
//     //   files: info.files,
//     //   path: info.path,
//     //   sha512: info.sha512,
//     //   releaseDate: info.releaseDate
//     // }
//     dialog
//       .showMessageBox({
//         type: "info",
//         title: "更新提示",
//         message: "软件需要更新，您是否立即更新？",
//         buttons: ["推迟", "立即更新"],
//       })
//       .then((res) => {
//         log.warn("index:" + res.response);
//         if (res.response === 1) {
//           log.warn("选择升级");
//           autoUpdater.downloadUpdate();
//         } else {
//           log.warn("选择不升级:");
//         }
//       });
//   });

//   // 检查更新时触发
//   autoUpdater.on("update-available", (res) => {
//     log.warn("检查更新时触发");
//     log.warn(res);
//     // dialog.showMessageBox({
//     //   title: '检查更新',
//     //   message: '正在检查更新'
//     // })
//   });

//   // 没有可用更新
//   autoUpdater.on("update-not-available", () => {
//     log.warn("没有可用更新");
//     // dialog.showMessageBox({
//     //   title: '已是最新版',
//     //   message: '当前版本是最新版本。'
//     // })
//   });

//   // 安装更新
//   autoUpdater.on("update-downloaded", (res) => {
//     log.warn(res);
//     log.warn("下载完毕！提示安装更新");
//     dialog.showMessageBox(
//       {
//         title: "升级提示！",
//         message: "已自动升级为最新版，请重启应用！",
//       },
//       () => {
//         log.warn("确认安装");
//         setImmediate(() => autoUpdater.quitAndInstall(true, true));
//       }
//     );
//   });

//   // 下载进度
//   // autoUpdater.on('download-progress', (event) => {
//   //   dialog.showMessageBox({
//   //     title: '安装更新',
//   //     message: event.percent
//   //   })
//   // })
// }
