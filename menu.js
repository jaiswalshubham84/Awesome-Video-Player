const electron = require("electron");
const { remote, webContents } = require("electron");
const { Menu, MenuItem } = remote;
const electronScreen = electron.screen;
const menu = new Menu();
const path = require("path");
var fl = require("./mainfunction");
var onTop = false;
var playing = "pausedefe";
var ipc = require("electron").ipcRenderer;
const os = require("os");
const shell = electron.shell;
const fs = require("fs");
vidio = document.getElementById("vidio");
menu.append(
  new MenuItem({
    label: "Add Media",
    accelerator: "CommandOrControl+O",
    click: function() {
      ipc.send("open-the-file");
    }
  })
);
menu.append(new MenuItem({ type: "separator" }));
menu.append(
  new MenuItem({
    label: "Add Subtitle",
    checked: true,
    click: function() {
      ipc.send("open-subtitle");
    }
  })
);
menu.append(new MenuItem({ type: "separator" }));
menu.append(
  new MenuItem({
    label: "Take Screen Sort",
    click: function() {
      const thumpSize = determineScreenShot();
      option = { types: ["screen"] };
      screensortPath1 = path.join(os.tmpdir(), "screensort1.png");
      el = document.getElementById("vidio");
      let svgBound = el.getBoundingClientRect();
      xx = Math.floor(svgBound.left);
      yy = Math.floor(svgBound.top);
      w = Math.floor(svgBound.width);
      h = Math.floor(svgBound.height);
      remote.getCurrentWindow().capturePage({
        x: xx,
        y: yy,
        height: h,
        width: w
      },
      function handleCapture(img) {
        fs.writeFile(screensortPath1, img.toPng());
      });
      setTimeout(function() {
        shell.openExternal("file://" + screensortPath1);
      });
    }
  })
);
menu.append(new MenuItem({ type: "separator" }));
menu.append(
  new MenuItem({
    label: "Play/Pause",
    type: "checkbox",
    checked: true,
    click: function() {
      fl.play();
    }
  })
);
menu.append(new MenuItem({ type: "separator" }));
menu.append(
  new MenuItem({
    label: "Show/Hide Subtitle",
    type: "checkbox",
    checked: true,
    click: function() {
      if (vidio.textTracks[0].mode === "hidden") {
        vidio.textTracks[0].mode = "showing";
      } else {
        vidio.textTracks[0].mode = "hidden";
      }
    }
  })
);
menu.append(new MenuItem({ type: "separator" }));
menu.append(
  new MenuItem({
    label: "Toogle Full Screen",
    click: function() {
      var value = remote.getCurrentWindow().isFullScreen();
      ipc.send("toglescreen", value);
    }
  })
);
menu.append(new MenuItem({ type: "separator" }));
menu.append(
  new MenuItem({
    label: "Always on top",
    type: "checkbox",
    checked: onTop,
    click: function() {
      onTop = !onTop;
      remote.getCurrentWindow().setAlwaysOnTop(onTop);
    },
    mouseover: function() {
      onTop = !onTop;
      remote.getCurrentWindow().setAlwaysOnTop(onTop);
    }
  })
);
window.addEventListener(
  "contextmenu",
  e => {
    e.preventDefault();
    menu.popup(remote.getCurrentWindow(), {
      async: true
    });
  },
  false
);

function determineScreenShot() {
  const screenSize = electronScreen.getPrimaryDisplay().workAreaSize;
  const maxDimention = Math.max(screenSize.width, screenSize.height);
  return {
    width: maxDimention * window.devicePixelRatio,
    height: maxDimention * window.devicePixelRatio
  };
}
const template = [
  {
    label: "Electron",
    submenu: [
      {
        role: "undo"
      },
      {
        role: "redo"
      },
      {
        type: "separator"
      },
      {
        role: "cut"
      }
    ]
  },
  {
    label: "File",
    submenu: [
      {
        label: "Add media",
        accelerator: "Command+O",
        click: function() {
          ipc.send("open-the-file");
        }
      }
    ]
  },
  {
    label: "Edit",
    submenu: [
      {
        role: "undo"
      },
      {
        role: "redo"
      },
      {
        type: "separator"
      },
      {
        role: "cut"
      },
      {
        role: "copy"
      },
      {
        role: "paste"
      }
    ]
  },

  {
    label: "View",
    submenu: [
      {
        role: "reload"
      },
      {
        role: "toggledevtools"
      },
      {
        type: "separator"
      },
      {
        role: "zoomin"
      },
      {
        role: "zoomout"
      },
      {
        type: "separator"
      },
      {
        role: "togglefullscreen"
      }
    ]
  },

  {
    role: "window",
    submenu: [
      {
        role: "minimize"
      },
      {
        role: "close"
      }
    ]
  },

  {
    role: "help",
    submenu: [
      {
        label: "Learn More"
      }
    ]
  }
];

const men = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(men);
