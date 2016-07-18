var forehead = require('clmutils/forehead');

var vid = document.getElementById('videoel');
var overlay = document.getElementById('overlay');
var overlayCC = overlay.getContext('2d');

var ctrack = new clm.tracker({useWebGL : true});
ctrack.init(pModel);

stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
document.getElementById('container').appendChild( stats.domElement );

var startbutton = document.getElementById("startbutton");
startbutton.addEventListener("click", startVideo);

var printbutton = document.getElementById("printbutton");
printbutton.addEventListener("click", printLine);

function enablestart() {
  startbutton.value = "start";
  startbutton.disabled = null;
}

var insertAltVideo = function(video) {
  if (supports_video()) {
    if (supports_ogg_theora_video()) {
      video.src = "./media/cap12_edit.ogv";
    } else if (supports_h264_baseline_video()) {
      video.src = "./media/cap12_edit.mp4";
    } else {
      return false;
    }
    //video.play();
    return true;
  } else return false;
}
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

// check for camerasupport
if (navigator.getUserMedia) {
  // set up stream
  
  var videoSelector = {video : true};
  if (window.navigator.appVersion.match(/Chrome\/(.*?) /)) {
    var chromeVersion = parseInt(window.navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10);
    if (chromeVersion < 20) {
      videoSelector = "video";
    }
  };

  navigator.getUserMedia(videoSelector, function( stream ) {
    if (vid.mozCaptureStream) {
      vid.mozSrcObject = stream;
    } else {
      vid.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
    }
    vid.play();
  }, function() {
    insertAltVideo(vid);
    document.getElementById('gum').className = "hide";
    document.getElementById('nogum').className = "nohide";
    alert("There was some problem trying to fetch video from your webcam, using a fallback video instead.");
  });
} else {
  insertAltVideo(vid);
  document.getElementById('gum').className = "hide";
  document.getElementById('nogum').className = "nohide";
  alert("Your browser does not seem to support getUserMedia, using a fallback video instead.");
}

vid.addEventListener('canplay', enablestart, false);

function startVideo() {
  // start video
  vid.play();
  // start tracking
  ctrack.start(vid);
  // start loop to draw face
  drawLoop();
}

function drawLoop() {
  requestAnimFrame(drawLoop);
  overlayCC.clearRect(0, 0, 400, 300);
  //psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);
  var positions = ctrack.getCurrentPosition();
  
  if (positions) {
    var withForehead = forehead.add(positions, 8);
    var triangles = Delaunay.triangulate(withForehead);
    
    for(var i = triangles.length; i;) {
      overlayCC.beginPath();
      --i;overlayCC.moveTo(positions[triangles[i]][0], positions[triangles[i]][1]);
      --i; overlayCC.lineTo(positions[triangles[i]][0], positions[triangles[i]][1]);
      --i; overlayCC.lineTo(positions[triangles[i]][0], positions[triangles[i]][1]);
      overlayCC.closePath();
      overlayCC.stroke();
    }
     
    ctrack.draw(overlay);
  }
}

// update stats on every iteration
document.addEventListener('clmtrackrIteration', function(event) {
  stats.update();
}, false);

function printLine() {
  var image = new Image();
  image.src = overlay.toDataURL("image/png");
  document.getElementById("result-image").appendChild(image);
}
