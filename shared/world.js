
(function() {

	/**
	 * @constructor
	 */
	var world = function( opts = {} ) {

		// get values or set defaults
		this.width = opts.width || 48,
		this.height = opts.height || 22;
		this.data = {};

		// fill map
		this.clear();
		this.generateTrees();

	}
	
	/**
	 *
	 */
	world.prototype.clear = function() {
	
		for ( var x=0; x<this.width; x++ )
		for ( var y=0; y<this.height; y++ ) {
			this.data[x+"-"+y] = new world.Cell();
		}
	
	}
	
	/**
	 *
	 */
	world.prototype.generateTrees = function() {
	
		// create some randomly place trees (TEST)
		for ( var n=0; n<50; n++ ) {
			var x = ~~( Math.random() * this.width );
			var y = ~~( Math.random() * this.height );
			this.data[x+"-"+y].set({ type: "tree" });
		}
	
	}
	
	//
	var permutation = [];
	for (  var n=0; n<512; n++ ) {
		permutation[n] = ~~( Math.random() * 512 );
	}

	/**
	 * Iterates through the map and builds a HTML string.
	 */
	world.prototype.render = function() {

		//
		var html = "<div>";
		for ( var y=0; y<this.height; y++ ) {
			html += "<div class='row'>";
			for ( var x=0; x<this.width; x++ ) {
				
				var cell = this.data[x+"-"+y],
					tiles = cell.draw.tiles.length,
					index = permutation[(y + (y*48) + x) % 512] % tiles,
					tileX = cell.draw.tiles[index].x,
					tileY = cell.draw.tiles[index].y,
					colors = cell.draw.color.length,
					ci = permutation[(y + (y*48) + x) % 512] % colors,
					color = cell.draw.color[ci];
				
				html += "<div style=\"width: 12px; height: 12px; background-color: "+color+"; background-image: url(test/codepage-437.png); background-position: -"+tileX+"px -"+tileY+"px;\"></div>";
				
			}
			html += "</div>";
		}
		html += "</div>";

		//
		return html;

	}

	/**
	 * @constructor
	 */
	world.Cell = function( opts = {} ) {
		this.type = opts.type || "grass";
		this.draw = world.Cell.mapping[this.type];
	}
	
	/**
	 *
	 */
	world.Cell.prototype.set = function( opts = {} ) {
		Object.assign( this, opts );
		this.draw = world.Cell.mapping[this.type];
	}

	// See https://www.martinstoeckli.ch/fontmap/fontmap.html reference
	// Assume Courier New is used
	world.Cell.mapping = {
		
		"grass": {
			tiles: [
				{x: 0,   y: 0},
				{x: 24 , y: 24},
				{x: 144, y: 24},
				{x: 168, y: 24},
				{x: 84,  y: 24},
				{x: 108, y: 180},
				{x: 120, y: 180}
			],
			color: [
				"#005500",
				"#006600"
			]
		},
		
		"tree": {
			tiles: [
				{x: 168, y: 12}
			],
			color: [
				"#00cc00"
			]
		}
		
	}

	// export
	if ( typeof module === "undefined" )
		window["World"] = world
	else
		module.exports = world;

})();
