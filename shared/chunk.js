(function() {

	//
	if ( typeof require !== "undefined" ) {
		Simplex = require('../shared/simplex.js');
		Cell = require('../shared/Cell.js');
	}

	/**
	 * @constructor
	 */
	var chunk = function( opts ) {

		this.x = opts.x || 0;
        this.y = opts.y || 0;
        this.width = opts.width || 16;
        this.height = opts.height || 16;
        this.data = {};
        this.players = {};
        this.playerCount = 0;
        this.generate();

	}

	/**
	 *
	 */
	chunk.prototype.generate = function() {

		for ( var x=0; x<this.width; x++ )
		for ( var y=0; y<this.height; y++ ) {

			//
			cX = this.x * this.width + x;
			cY = this.y * this.height + y;

			// base
			var type = "grass";

			//
			var river = Math.abs( Simplex.getHeight( cX, cY, 1, 0.0025, 4 ) );
			var moisture = river;

			// forests
			var height = Simplex.getHeight( cX, cY, 1, 0.24, 1 );
			if ( height > 0.85 || (height > 0.5 && moisture < 0.5) ) type = "tree";

			// mountain
			var height = Simplex.getHeight( cX, cY, 1, 0.01, 1 ) * 0.6;
				height += Simplex.getHeight( cX, cY, 1, 0.04, 1 ) * 0.2;
				height += Simplex.getHeight( cX, cY, 1, 0.16, 1 ) * 0.2;
			if ( height > 0.2 ) type = "mountain";

			// rivers
			if ( river > -0.1 && river < 0.1 ) type = "water";

			// set data
			this.data[x+"-"+y] = new Cell({ type: type });

		}

	}

	// export
	if ( typeof module === "undefined" )
		window["Chunk"] = chunk
	else
		module.exports = chunk;

})();
