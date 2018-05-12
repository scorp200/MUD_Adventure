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
				return Object.assign({ name: key },
					cell.mapping[key]
				);
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
			],
			actions: {
				"bath": {
					notify: "You roll in the mud like a small piglet, having the time of your life"
				}
			}
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
			],
			actions: {
				"drink": {
					playerStats: { hydration: 10 },
					notify: "You take a sip of water, and feel refreshed."
				},
				"bath": {
					playerStats: { hp: 1 },
					notify: "You bathe in the lake, feeling brand new and ready for action"
				}
			}
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
			],
			actions: {
				"drink": {
					player: { hydration: -5 },
					notify: "You take a sip of the sea, but its too salty, you feel terrible"
				}
			}
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

		"fence": {
			id: 76,
			canMove: false,
			desc: "A fence, I wonder how we breach it?",
			tiles: [
				"-72px -180px"
			],
			color: [
				"#966045"
			]
		},
		
		"berrybush": {
			id: 77,
			canMove: false,
			desc: "Nice bush!",
			tiles: [
				"-120px -24px"
			],
			color: [
				"#ff0000"
			],
			actions: {
				"cut": {
					drop: ["berries"],
					change: "grass"
				}
			}
		},

	}

	// export
	if (typeof module === "undefined")
		window["Cell"] = cell
	else
		module.exports = cell;

})();
