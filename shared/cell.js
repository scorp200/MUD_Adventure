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
				"-0px -0px",
				"-24px -24px",
				"-144px -24px",
				"-168px -24px",
				"-84px -24px",
				"-108px -180px",
				"-120px -180px"
			],
			color: [
				"#005500",
				"#006600"
			]
		},

		"tree": {
			tiles: [
				"-60px -0px",
				"-72px -0px",
				"-96px -12px"
			],
			color: [
				"#00bb00"
			]
		},
		
		"water": {
			tiles: [
				"-84px -180px"
			],
			color: [
				"#00cccc"
			]
		},
		
		"mountain": {
			tiles: [
				"-168px -12px",
				"-168px -60px"
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