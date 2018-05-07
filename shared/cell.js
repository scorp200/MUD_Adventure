/**
 * @module
 */

(function() {

	/**
	 * @constructor
	 */
	cell = function(opts = {}) {
		this.type = opts.type || "grass";
		this.draw = cell.mapping[this.type];
	}

	/**
	 *
	 */
	cell.prototype.set = function(opts = {}) {
		Object.assign(this, opts);
		this.draw = cell.mapping[this.type];
	}

	/**
	 * Takes a tile type and returns the tile ID for it. The tile ID should be
	 * between 0 and 255 (a byte).
	 * @param {string} type Cell type.
	 * @returns {int} Cell ID.
	 */
	cell.getID = function(type = "grass") {
		return cell.mapping[type].id;
	}

	/**
	 *
	 */
	cell.getName = function(id) {
		var keys = Object.keys(cell.mapping);
		for (var n = 0; n < keys.length; n++) {
			var key = keys[n];
			if (cell.mapping[key].id === id) {
				return key;
			}
		}
	}

	/**
	 *
	 */
	cell.getPropertiesById = function(id) {
		var keys = Object.keys(cell.mapping);
		for (var n = 0; n < keys.length; n++) {
			var key = keys[n];
			if (cell.mapping[key].id === id) {
				return cell.mapping[key];
			}
		}
	}

	/**
	 *
	 */
	cell.getPropertiesByName = function(name) {
		var keys = Object.keys(cell.mapping);
		for (var n = 0; n < keys.length; n++) {
			var key = keys[n];
			if (key === name) {
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
			canMove: true,
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
			canMove: true,
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
			canMove: false,
			tiles: [
				"-60px -0px",
				"-72px -0px",
				"-96px -12px"
			],
			color: [
				"#24A024"
			],
			actions: {
				"cut": {
					drop: ["wood", "sapling"],
					change: "grass"
				}
			}
		},

		"water": {
			id: 68,
			canMove: false,
			tiles: [
				"-168px -84px"
			],
			color: [
				"#00cccc"
			]
		},

		"sea": {
			id: 69,
			canMove: false,
			desc: "Water, but too wavy to traverse safely.",
			tiles: [
				"-168px -84px"
			],
			color: [
				"#005555"
			]
		},

		"mountain": {
			id: 70,
			canMove: false,
			tiles: [
				"-168px -12px",
				"-168px -60px"
			],
			color: [
				"#888888",
				"#999999",
				"#aaaaaa",
				"#bbbbbb",
				"#cccccc",
				"#dddddd"
			],
			actions: {
				"mine": {
					drop: ["rock"],
					change: "drylands"
				}
			}
		},

		"hill": {
			id: 71,
			canMove: true,
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
			canMove: true,
			desc: "Sand, it get's everywhere!",
			tiles: [
				"-156px -36px"
			],
			color: [
				"#FFFF00"
			]
		},

		"gold": {
			id: 73,
			canMove: false,
			desc: "Gold, it's so shiny!",
			tiles: [
				"-84px -120px"
			],
			color: [
				"#FFBA00"
			],
			actions: {
				"mine": {
					drop: ["gold"],
					change: "drylands"
				}
			}
		},

		"stone": {
			id: 74,
			canMove: false,
			desc: "Stone, it's hard.",
			tiles: [
				"-84px -120px"
			],
			color: [
				"#777777"
			],
			actions: {
				"mine": {
					drop: ["rock"],
					change: "drylands"
				}
			}
		},
		
		"bridge": {
			id: 75,
			canMove: true,
			desc: "A bridge, maybe there's a troll beneath it.",
			tiles: [
				"-24px -132px"
			],
			color: [
				"#966045"
			]
		},

	}

	// export
	if (typeof module === "undefined")
		window["Cell"] = cell
	else
		module.exports = cell;

})();
