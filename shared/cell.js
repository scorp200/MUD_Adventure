(function() {

	/**
	 * @constructor
	 */
	cell = function( opts = {} ) {
		this.type = opts.type || "grass";
		this.draw = cell.mapping[this.type];
	}

	/**
	 *
	 */
	cell.prototype.set = function( opts = {} ) {
		Object.assign( this, opts );
		this.draw = cell.mapping[this.type];
	}

	// See https://www.martinstoeckli.ch/fontmap/fontmap.html reference
	// Assume Courier New is used
	cell.mapping = {

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
				{x: 60, y: 0},
				{x: 72, y: 0},
				{x: 96, y: 12}
			],
			color: [
				"#00bb00"
			]
		},
		
		"water": {
			tiles: [
				{x: 84, y: 180}
			],
			color: [
				"#00cccc"
			]
		},
		
		"mountain": {
			tiles: [
				{x: 168, y: 12}
			],
			color: [
				"#aaaaaa"
			]
		}

	}
	
	// export
	if ( typeof module === "undefined" )
		window["Cell"] = cell
	else
		module.exports = cell;
	
})();