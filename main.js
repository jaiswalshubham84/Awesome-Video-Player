const electron = require("electron");
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;

var ipc = require("electron").ipcMain;
const path = require("path");
const url = require("url");
const { dialog } = require("electron");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
var ready = false;
var vidiourl;
var openIt = function(e, lnk) {
  e.preventDefault();
  vidiourl = lnk;
  // if (ready) {
  //   mainWindow.webContents.send("add-to-playlist", lnk);
  // }
  return;
};

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: "awesome",
    width: 860,
    height: 470,
    minWidth: 600,
    show: false
  });
  // and load the index.html of the app.
  mainWindow.loadURL(
    "file://" +
      path.join(
        __dirname,
        "index.html#" + JSON.stringify(process.argv.slice(2))
      )
  );
  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("open-file", openIt);

app.on("activate", function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
ipc.on("ready", function() {
  ready = true;
  if (vidiourl) {
    mainWindow.webContents.send("add-file", [vidiourl]);
  }
  mainWindow.show();
});
ipc.on("toglescreen", (event, value) => {
  mainWindow.setFullScreen(!value);
});
ipc.on("open-the-file", function() {
  var files = dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    filters: [
      {
        name: "Movies",
        extensions: ["mkv", "webm", "mp4", "flv", "Ogg", "vob", "ogv"]
      }
    ]
  });
  if (files) mainWindow.send("add-file", files);
});
ipc.on("open-subtitle", function() {
  var files = dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    filters: [
      {
        name: "Subtitles",
        extensions: ["srt", "vtt"]
      }
    ]
  });
  if (files) mainWindow.send("load-subtitle", files);
});
