/**
 * @module Items
 */

(function() {
	
	var server = typeof module !== "undefined";
	
	var items = {}

	/**
	 *
	 */
	items.getName = function(id) {
		var keys = Object.keys(items.mapping);
		for (var n = 0; n < keys.length; n++) {
			var key = keys[n];
			console.log(key, n, id);
			if (items.mapping[key].id === Number(id)) {
				return key;
			}
		}
	}

	/**
	 *
	 */
	items.getID = function(name) {
		if (items.mapping[name])
			return items.mapping[name].id;
		else
			((server) ? console : Story).warn("Item \"" + name + "\" does not exist!");
	}

	/**
	 * @namespace
	 */
	items.mapping = {
		"wood": {
			id: 1,
			dropAmount: 2,
			dropRate: 1
		},
		"rock": {
			id: 2,
			dropAmount: 2,
			dropRate: 1
		},
		"gold": {
			id: 3,
			dropAmount: 2,
			dropRate: 1
		},
		"sapling": {
			id: 4,
			dropAmount: 1,
			dropRate: 0.3
		},
		"waterskin": {
			id: 5,
			dropAmount: 1,
			dropRate: 1,
			actions: {
				"drink": {
					playerStats: { hydration: 100 },
					required: { "waterskin": 1 },
					notify: "You drank out of the waterskin, quenching your thirst."
				}
			}
		},
		"berries": {
			id: 6,
			dropAmount: 5,
			dropRate: 1,
			actions: {
				"eat": {
					playerStats: { hunger: 100 },
					required: { "berries": 1 },
					notify: "You eat the berries."
				}
			}
		},
	}


	// export
	if (typeof module === "undefined")
		window["Items"] = items
	else
		module.exports = items;
})();
