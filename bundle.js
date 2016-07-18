(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"clmutils/forehead":3}],2:[function(require,module,exports){
module.exports = function(input, output) {
    if (typeof output === "undefined") 
        output = [];

    output.length = 0;
    output.push(input[0]);
    for (var i=0; i<input.length-1; i++) {
        var p0 = input[i];
        var p1 = input[i+1];
        var p0x = p0[0],
            p0y = p0[1],
            p1x = p1[0],
            p1y = p1[1];

        var Q = [ 0.75 * p0x + 0.25 * p1x, 0.75 * p0y + 0.25 * p1y ];
        var R = [ 0.25 * p0x + 0.75 * p1x, 0.25 * p0y + 0.75 * p1y ];
        output.push(Q);
        output.push(R);
    }
    output.push(input[ input.length-1 ]);
    return output;
};
},{}],3:[function(require,module,exports){
var SIDES_LENGTH = 0.9,
	TWO_PI = Math.PI * 2,
	HALF_PI = Math.PI * .5;

var smooth = require( 'chaikin-smooth' );

var indices = {
	start: -1,
	end: -1
};

function add( clmPositions, numPointsToAdd ) {
	if( clmPositions ) {
		if(indices.start == -1) indices.start = clmPositions.length;

		numPointsToAdd = numPointsToAdd || 7;

		var noseTopX = clmPositions[ 33 ][ 0 ],
			noseTopY = clmPositions[ 33 ][ 1 ],
			dX = clmPositions[ 0 ][ 0 ] - noseTopX,
			dY = clmPositions[ 0 ][ 1 ] - noseTopY,
			leftRadOff = Math.atan2( dY, dX ),
			lengthToLeftSide = Math.sqrt( dX * dX + dY * dY ),
			dX = clmPositions[ 14 ][ 0 ] - noseTopX,
			dY = clmPositions[ 14 ][ 1 ] - noseTopY,
			rightRadOff = Math.atan2( dY, dX ),
			lengthToRightSide = Math.sqrt( dX * dX + dY * dY ),
			minPoint = numPointsToAdd / 2,
			curLength, 
			weightLeft, 
			weightRight, 
			curRad, 
			radInc;

		
		
		while(leftRadOff > rightRadOff) leftRadOff -= TWO_PI;

		radInc = (rightRadOff - leftRadOff) / numPointsToAdd;


		for( var i = numPointsToAdd-1; i >= 0; i-- ) {

			weightLeft = 1 - i / numPointsToAdd;
			weightRight = i / numPointsToAdd;

			curLength = lengthToLeftSide * weightLeft + lengthToRightSide * weightRight;

			curRad = radInc * i + leftRadOff;

			clmPositions.push( [ noseTopX + Math.cos( curRad ) * curLength, 
								 noseTopY + Math.sin( curRad ) * curLength ] );
		}
	}
	if(indices.end == -1) indices.end = clmPositions.length-1;

	return clmPositions;
};

function setIndices(indicesData) {
	indices.start = indicesData.start;
	indices.end = indicesData.end;
}

var foreHead = {
	add: add,
	indices: indices,
	setIndices: setIndices
}
module.exports = foreHead;
},{"chaikin-smooth":2}]},{},[1]);
