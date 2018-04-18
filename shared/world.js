
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
		for ( var x=0; x<this.width; x++ )
		for ( var y=0; y<this.height; y++ ) {
			this.data[x+"-"+y] = new world.Cell();
		}

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
				var cell = this.data[x+"-"+y];
				html += "<div style=\"width: 12px; height: 12px; background-color: "+cell.draw[1]+"; background-image: url(test/codepage-437.png); background-position: -24px -132px;\"></div>";
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

	// See https://www.martinstoeckli.ch/fontmap/fontmap.html reference
	// Assume Courier New is used
	world.Cell.mapping = {
		"grass": [ "&#8718;", "#00ff00" ]
	}

	// export
	if ( typeof module === "undefined" )
		window["World"] = world
	else
		module.exports = world;

})();
