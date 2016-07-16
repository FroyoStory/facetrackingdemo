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