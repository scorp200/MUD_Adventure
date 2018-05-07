/**
 * @module Items
 */

(function() {
	var items = function() {

	}
	
	/**
	 *
	 */
	items.getName = function(id) {
		var keys = Object.keys(items.mapping);
		for (var n = 0; n < keys.length; n++) {
			var key = keys[n];
			console.log( key, n, id );
			if (items.mapping[key].id === Number(id)) {
				return key;
			}
		}
	}
	
	/**
	 *
	 */
	items.getID = function(name) {
		return items.mapping[name].id;
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
		}
	}


	// export
	if (typeof module === "undefined")
		window["Items"] = items
	else
		module.exports = items;
})();
