# clmutils

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

This is a set of utility functions which can be used to decipher CLM Trackr

## Usage

[![NPM](https://nodei.co/npm/clmutils.png)](https://www.npmjs.com/package/clmutils)

You can consume these utility functions in the following two ways:
```javascript
var utils = require('clmutils');

utils.faceOrientation
utils.getFaceSize
utils.textureCapture
utils.forehead
utils.halo
```

or

```javascript
var faceOrientation = require('clmutils/faceOrientation');
var getFaceSize = require('clmutils/getFaceSize');
var textureCapture = require('clmutils/textureCapture');
var forehead = require('clmutils/forehead');
var halo = require('clmutils/halo');
```

Here are examples as to how to use these utility functions:
```javascript
var faceOrientation = require('clmutils/faceOrientation');
var getFaceSize = require('clmutils/getFaceSize');
var textureCapture = require('clmutils/textureCapture');
var forehead = require('clmutils/forehead');
var halo = require('clmutils/halo');

// clmPositions would be the positions of vertices from clm

// returns aproximated y and z rotations of face in degrees
var rotationDegrees = faceOrientation(clmPositions); 
console.log(rotationDegrees.z); // z rotation of face
console.log(rotationDegrees.y); // y rotation of face

// an object containing 2d width and height of face is returned
var size = getFaceSize(clmPositions);
console.log(size.width); // width of face
console.log(size.height); // height of face

// add 10 points to create an approximate forehead (original array is modified) since the CLM positions do not include one
forehead(clmPositions, 10); 
// create a halo (original array is modified) if you want extra padding around the face
halo(clmPositions); 

// textureCapture returns UV coordinates based on the clmPositions and can optionally extract a texture from the image or video element onto a canvas2d context.
var texOptions = {
	outContext: null, //an optional canvas2d context if you want a texture rendered from options.image or options.video
	options.video: null, //an optional video element that was used to generate the CLM points
	options.image: null, //an optional image element that was used to generate the CLM points
	options.forehead: false, //include or exclude the points that make up the forehead
	options.halo: false, //include or exclude the points that make up the halo
};
var uvs = textureCapture(clmPositions, texOptions);

```

## License

MIT, see [LICENSE.md](http://github.com/mikkoh/clmutils/blob/master/LICENSE.md) for details.
