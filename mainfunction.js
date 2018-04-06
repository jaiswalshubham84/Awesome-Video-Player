var ipc = require("electron").ipcRenderer;
const electron = require("electron");
const { remote, clipboard } = require("electron");
const { webContents } = require("electron");
const fs = require("fs");
const path = require("path");
var toBuffer = require("blob-to-buffer");
const os = require("os");
const electronScreen = electron.screen;
const shell = electron.shell;
var volume = document.getElementById("volume");
control = document.getElementById("control");
var volumeoff = document.getElementById("volumeoff");
var volumeon = document.getElementById("volumeon");
vidio = document.getElementById("vidio");
var volumeset = 0;
var backward = false;
var cleartime;
var onTop = false;
var playing = false;
setTimeout(() => {
  ipc.send("ready", "");
}, 100);
ipc.on("add-file", (event, links) => {
  vidio.src = links[0];
  spt = links[0].split("/");
  document.title = spt[spt.length - 1];
  startPlaying();
  toogledisplay(false);
});
ipc.on("load-subtitle", (event, links) => {
  addSubtitle(links[0]);
});
document.getElementById("container").addEventListener("mousemove", () => {
  control.classList.toggle("m-fadeIn", true);
  control.classList.toggle("m-fadeOut", false);
  document.getElementById("container").style.cursor = "auto";

  clearTimeout(cleartime);
  cleartime = setTimeout(function() {
    control.classList.toggle("m-fadeIn", false);
    control.classList.toggle("m-fadeOut", true);
    document.getElementById("container").style.cursor = "none";
  }, 10000);
});
window.addEventListener("paste", event => {
  url = event.clipboardData.getData("text");
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  var link = url.split(".")[1];
  if (pattern.test(url)) {
    switch (link) {
      case "youtube":
        embedYoutube(url);
        break;
      case "facebook":
        var newUrl = "https://www.facebook.com/plugins/video.php?href=" + url;
        break;
      default:
        generalLinks(url);
    }
  } else {
    alert("Please enter a valid URL.");
  }
});
document.getElementById("container").addEventListener("mouseleave", () => {
  //   control.classList.toggle("m-fadeIn", false);
  //   control.classList.toggle("m-fadeOut", true);
});

document.getElementById("volume").oninput = function() {
  volumeChange(volume.value);
};
document.getElementById("seek-bar").oninput = function() {
  var progress = document.getElementById("seek-bar");
  var time = vidio.duration * (progress.value / 100);
  vidio.currentTime = time;
};

document
  .getElementById("vidio")
  .addEventListener("timeupdate", updateProgress, false);
setTimeout(function() {
  document.ondblclick = function() {
    var value = remote.getCurrentWindow().isFullScreen();
    ipc.send("toglescreen", value);
  };

  document.getElementById("play1").addEventListener("click", play_pause, false);

  document
    .getElementById("pause1")
    .addEventListener("click", play_pause, false);
  var volumeoff = document.getElementById("volumeoff");
  var volumeon = document.getElementById("volumeon");
  volumeon.addEventListener("click", () => {
    volumeset = vidio.volume;
    volumeChange(volumeset - volumeset);
  });
  volumeoff.addEventListener("click", () => {
    volumeChange(volumeset);
  });
  document.getElementById("fastBack").addEventListener("click", rewind, false);

  document.getElementById("fastforward").addEventListener("click", playFast);
}, 500);

document.addEventListener("drop", function(e) {
  e.preventDefault();
  e.stopPropagation();
  for (let f of e.dataTransfer.files) {
    handleFileUpload(f);
  }
});
document.addEventListener("dragover", function(e) {
  e.preventDefault();
  e.stopPropagation();
});
function handleFileUpload(evt) {
  toogledisplay(false);
  var file = evt; // FileList object
  strs = file.name.split(".");
  l = strs.length;
  if (strs[l - 1] === "vtt" || strs[l - 1] === "srt") {
    addSubtitle(file.path);
  } else {
    vidio = document.getElementById("vidio");
    vidio.src = file.path;
    spt = file.path.split("/");
    document.title = spt[spt.length - 1];
    startPlaying();
  }
}
function startPlaying() {
  vidio.play();
  document.getElementById("pause1").style.display = "inline";
  document.getElementById("play1").style.display = "none";
}
function addSubtitle(filePath) {
  newfile = path.join(os.tmpdir(), "subtitle.vtt");
  strs = filePath.split(".");
  l = strs.length;
  var track2 = document.getElementById("track1");
  if (strs[l - 1] === "srt") {
    var srt2vtt = require("srt-to-vtt");
    fs
      .createReadStream(filePath)
      .pipe(srt2vtt())
      .pipe(fs.createWriteStream(newfile));
    filePath = newfile;
  }
  setTimeout(function() {
    vidio.removeChild(track2);
    var $track = document.createElement("track");
    $track.setAttribute("default", "default");
    $track.setAttribute("src", filePath);
    $track.setAttribute("label", "Subtitles");
    $track.setAttribute("id", "track1");
    $track.setAttribute("kind", "subtitles");
    vidio.appendChild($track);
  }, 500);
}

function timeDisplay(value) {
  var hour = timeFormator(Math.floor(value / 3600));
  var minute = timeFormator(Math.floor(value / 60));
  var second = timeFormator(Math.floor(value % 60));
  var timeformated = hour + ":" + minute + ":" + second;
  return timeformated;
}

function timeFormator(value) {
  if (value.toString().length === 1) {
    value = "0" + value;
  }
  return value;
}

function play_pause() {
  backward = false;
  vidio.playbackRate = 1;
  play1 = document.getElementById("play1");
  pause1 = document.getElementById("pause1");
  if (!playing) {
    play1.style.display = "none";
    pause1.style.display = "inline";
    vidio.play();
    playing = !playing;
  } else {
    vidio.pause();
    pause1.style.display = "none";
    play1.style.display = "inline";
    playing = !playing;
  }
}

function volumeChange(value) {
  if (value === 0 || value === "0") {
    volumeoff.style.display = "inline";
    volumeon.style.display = "none";
  } else {
    if (vidio.volume === 0) {
      volumeoff.style.display = "none";
      volumeon.style.display = "inline";
    }
  }
  vidio.volume = value;
  volume.value = value;
  var val = value * 100;
  volume.style.background =
    "-webkit-gradient(linear, left top, right top, color-stop(" +
    val.toString() +
    "%, #31A357), color-stop(" +
    val.toString() +
    "%, #727374))";
}

function embedYoutube(url) {
  toogledisplay(true);
  var n = url.indexOf("watch");
  if (n > 0) {
    arr = url.split("=");
    id = arr[arr.length - 1];
    newUrl = "https://www.youtube.com/embed/" + id;
  } else {
    newUrl = url;
  }
  var embedNode = document.getElementById("embedlink");
  var Clone = embedNode.cloneNode(true);
  Clone.setAttribute("src", newUrl);
  embedNode.parentNode.replaceChild(Clone, embedNode);
}

function generalLinks(url) {
  vidio.src = url;
  toogledisplay(false);
}
function toogledisplay(value) {
  document.getElementById("container").classList.toggle("hidden", value);
  document.getElementById("linkss").classList.toggle("hidden", !value);
}

function playFast() {
  backward = false;
  i = vidio.playbackRate;
  if (i >= 1) {
    i++;
  } else {
    i = i + 0.1;
  }
  vidio.playbackRate = i;
}

function playSlow() {
  i = vidio.playbackRate;
  if (i > 1) {
    i--;
  } else {
    i = i - 0.1;
  }
  vidio.playbackRate = i;
}

function rewind() {
  backward = true;
  document.getElementById("pause1").style.display = "none";
  document.getElementById("play1").style.display = "inline";
  vidio.pause();
  vidio.playbackRate = 1;
  var refreshIntervalId = setInterval(function() {
    if (backward === true) {
      vidio.currentTime = vidio.currentTime - 1;
    } else {
      clearInterval(refreshIntervalId);
    }
  }, 100);
}
function updateProgress() {
  if (vidio.duration) {
    document.getElementById("vidiotime").innerHTML =
      timeDisplay(vidio.currentTime) + " / " + timeDisplay(vidio.duration);
  }
  var progress = document.getElementById("seek-bar");
  var value = 0;
  if (vidio.currentTime > 0) {
    value = Math.floor(100 / vidio.duration * vidio.currentTime);
  }
  progress.value = value;
  var val = progress.value;
  progress.style.background =
    "-webkit-gradient(linear, left top, right top, color-stop(" +
    val.toString() +
    "%, #31A357), color-stop(" +
    val.toString() +
    "%, #727374))";
}

var functionList = (function() {
  return {
    play: play_pause,
    upload: handleFileUpload,
    volumeChange: volumeChange,
    playFast: playFast,
    playSlow: playSlow,
    volumeset: volumeset
  };
})();
module.exports = functionList;
