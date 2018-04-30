(function() {

    //
    if (typeof require !== "undefined") {
        Simplex = require('../shared/simplex.js');
        Cell = require('../shared/Cell.js');
    }

    /**
     * @constructor
     */
    var chunk = function(opts) {

        this.x = opts.x || 0;
        this.y = opts.y || 0;
        this.width = opts.width || 16;
        this.height = opts.height || 16;
		this.size = this.width * this.height;
        this.players = {};
        this.playerCount = 0;

		//
		this.dataMethod = opts.dataMethod || 0;
		this.data = this.dataMethod
			? new Uint8Array( this.size )
			: {};

		//
        this.generate( opts.world );

	}

	/**
	 *
	 */
	chunk.prototype.generate = function( world ) {

		// get the center of the world, for island generation.
		var centerX = world.width * this.width * 0.5,
			centerY = world.height * this.height * 0.5;

		for ( var x=0; x<this.width; x++ )
		for ( var y=0; y<this.height; y++ ) {

			//
			var cX = this.x * this.width + x;
			var cY = this.y * this.height + y;

			// base
			var type = "grass";

			// island modifier
			var distX = Math.abs(centerX-cX)/centerX,
				distY = Math.abs(centerY-cY)/centerY;

			distX = Math.pow(distX, 0.5*world.width);
			distY = Math.pow(distY, 0.5*world.height);
			var dist = 1-Math.max(distX, distY);
			
			//
			var river = Math.pow(Math.abs( Simplex.getHeight( cX, cY, 1, 0.0025, 4 ) ), 2.5 );
			var tributary = Math.pow( Math.abs( Simplex.getHeight( cX, cY, 1, 0.04, 1 ) ), 2 );
			var moisture = river*0.8 + Simplex.getHeight( cX, cY, 1, 0.16, 1 ) * 0.2;

			if ( moisture > 1.5 ) {
				type = "drylands";
			}
			
			// forests
			var forest = Simplex.getHeight( cX, cY, 1, 0.24, 1 );
			if ( forest > 0.8 || (forest > 0.4 && moisture < 0.5) ) type = "tree";

			// mountain
			var height = 1 + Simplex.getHeight( cX, cY, 1, 0.04, 1 ) * 0.4;
				height += Simplex.getHeight( cX, cY, 1, 0.02, 1 ) * 0.6;
				height += Simplex.getHeight( cX, cY, 1, 0.16, 1 ) * 0.6;
				height *= river;
				height *= dist;
			if (height > 1.2) type = "mountain";
			
			// mineral deposits
			var mineral = Math.abs( Simplex.getHeight( cX+1000, cY+1000, 1, 0.02, 1 ) );
			mineral += Math.abs( Simplex.getHeight( cX+937, cY+cX+379, 1, 1.0, 1 ) );
			if (height > 1.2) mineral /= height / 2;
			if ( mineral < 0.2 ) type = "stone";
			
			var mineral = Math.abs( Simplex.getHeight( cX+1000, cY+1000, 1, 0.02, 1 ) );
			mineral += Math.abs( Simplex.getHeight( cY+937, cX+cY+379, 1, 1.0, 1 ) );
			if (height > 1.2) mineral /= height / 1;
			if ( mineral < 0.1 ) type = "gold";

			// hills
			//height *= 0.8;
			height += 0.5+Simplex.getHeight( cY, cX, 1, 0.16, 1 ) * 0.5;
			if ( height > 1.1 && height <= 1.2 ) type = "hill";
			height += 0.8;

			// rivers
			if ( river < 0.001 ) type = "water";
			tributary += river*0.2;
			if ( tributary < 0.025 ) type = "water";

			height *= dist;
			height -= (1+Simplex.getHeight( cX, cY, 1, 0.08, 1 )) * 0.2;
			if (height <= 0.12) type = "sand";
			if (height <= 0.1) type = "water";
			if (height <= 0.02) type = "sea";

			// set data
			this.setCell(x, y, type);

		}

	}

	/**
	 *
	 */
	chunk.prototype.setCell = function(x, y, type) {
		var index = y * this.width + x;
		this.data[index] = this.dataMethod
			? Cell.getID( type )
			: new Cell({ type: type });
	}

	/**
	 *
	 */
	chunk.prototype.getCell = function(pos){
		var index = pos.y * this.width + pos.x;
		return Cell.getPropertiesById(this.data[index]);
	}

	/**
	 *
	 */
	chunk.prototype.bufferToString = function() {
		var s;
		s = encodeRLE(this.data);
		s = String.fromCharCode.apply(null, s);
		s = encodeURI(s);
		return s;
	}

	/**
	 *
	 */
	var encodeRLE = function(x) {
		var rle = [],
			nVal = x[0],
			nCount = 1;
		for ( var n=1; n<x.length; n++ ) {
			var c = x[n];
			if ( c === nVal && nCount < 9 && n !== x.length-1 ) {
				nCount += 1;
			} else {
				//console.log( nCount, String.fromCharCode(nVal) );
				if ( nCount >= 3 ) {
					rle.push(48 + nCount);
					rle.push(nVal);
				} else {
					for ( var i=0; i<nCount; i++ ) {
						rle.push(nVal);
					}
				}
				nCount = 1;
				nVal = c;
			}
		}
		return rle;
	}

	// export
	if ( typeof module === "undefined" )
		window["Chunk"] = chunk
	else
		module.exports = chunk;

})();
