var vidio = document.getElementById("vidio");
var ipc = require("electron").ipcRenderer;
var fl = require("./mainfunction");
document.onkeydown = function(e) {
  vidio = document.getElementById("vidio");
  switch (e.keyCode) {
    case 32:
      fl.play();
      break;

    case 38:
      if (vidio.volume < 1) {
        fl.volumeChange(Number(volume.value) + 0.1);
      }
      break;

    case 40:
      if (vidio.volume > 0) {
        fl.volumeChange(volume.value - 0.1);
      }
      break;

    case 187:
      fl.playFast();
      break;

    case 189:
      fl.playSlow();
      break;
    case 77:
      if (vidio.volume) {
        volumeset = vidio.volume;
        fl.volumeChange(vidio.volume - vidio.volume);
      } else {
        fl.volumeChange(volumeset);
      }
      break;
    case 37:
      vidio.currentTime = vidio.currentTime - 5;
      break;
    case 27:
      ipc.send("toglescreen", true);
      break;
    case 39:
      vidio.currentTime = vidio.currentTime + 5;
      break;
    default:
  }
};
