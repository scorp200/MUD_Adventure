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

	/**
	 * Takes a tile type and returns the tile ID for it. The tile ID should be
	 * between 0 and 255 (a byte).
	 * @param {string} type Cell type.
	 * @returns {int} Cell ID.
	 */
	cell.getID = function( type = "grass" ) {
		return cell.mapping[type].id;
	}

	/**
	 *
	 */
	cell.getName = function( id ) {
		var keys = Object.keys( cell.mapping );
		for ( var n=0; n<keys.length; n++ ) {
			var key = keys[n];
			if ( cell.mapping[key].id === id ) {
				return key;
			}
		}
	}

	/**
	 *
	 */
	cell.getPropertiesById = function( id ) {
		var keys = Object.keys( cell.mapping );
		for ( var n=0; n<keys.length; n++ ) {
			var key = keys[n];
			if ( cell.mapping[key].id === id ) {
				return cell.mapping[key];
			}
		}
	}

	/**
	 *
	 */
	cell.getPropertiesByName = function( name ) {
		var keys = Object.keys( cell.mapping );
		for ( var n=0; n<keys.length; n++ ) {
			var key = keys[n];
			if ( key === name ) {
				return cell.mapping[key];
			}
		}
	}

	/**
	 * object defining how each cell type is displayed, accepts multiple tile
	 * offsets and colors that are procedurally chosen based on world location.
	 * @namespace
	 */
	cell.mapping = {

		"grass": {
			id: 65,
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

		"drylands": {
			id: 66,
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
				"#525500",
				"#525430",
				"#005500",
				"#006600"
			]
		},

		"tree": {
			id: 67,
			tiles: [
				"-60px -0px",
				"-72px -0px",
				"-96px -12px"
			],
			color: [
				"#24A024"
			],
			action: "cut",
			drop: [
				"wood"
			]
		},

		"water": {
			id: 68,
			tiles: [
				"-84px -180px"
			],
			color: [
				"#00cccc"
			]
		},

		"sea": {
			id: 69,
			desc: "Water, but too wavy to traverse safely.",
			tiles: [
				"-84px -180px"
			],
			color: [
				"#005555"
			]
		},

		"mountain": {
			id: 70,
			tiles: [
				"-168px -12px",
				"-168px -60px"
			],
			color: [
				"#aaaaaa"
			]
		},

		"hill": {
			id: 71,
			tiles: [
				"-168px -60px",
				"-168px -84px"
			],
			color: [
				"#966045"
			]
		},

		"sand": {
			id: 72,
			desc: "Sand, it get's everywhere!",
			tiles: [
				"-24px -24px",
				"-144px -24px",
				"-168px -24px",
				"-84px -24px",
				"-108px -180px",
				"-120px -180px"
			],
			color: [
				"#FFFF00"
			]
		},

	}

	// export
	if ( typeof module === "undefined" )
		window["Cell"] = cell
	else
		module.exports = cell;

})();
