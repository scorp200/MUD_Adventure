(function() {

	var server = typeof module !== "undefined";
	var utils = {};
	var validDirections = [
		"n", "e", "s", "w",
		"north", "east", "south", "west",
		"up", "right", "down", "left"
	];


	/**
	 * Verifies if specified direction is acceptable
	 * @param {string} dir
	 */
	utils.checkDir = function(dir) {
		return validDirections.includes( dir );
	}

	/**
	 *
	 */
	utils.applyDir = function(pos, dir, amount = null) {
		switch (dir) {
			case ("n"): case ("north"): case ("up"):
				pos.y -= amount || 1;
				break;
			case ("e"): case ("east"): case ("right"):
				pos.x += amount || 1;
				break;
			case ("s"): case ("south"): case ("down"):
				pos.y += amount || 1;
				break;
			case ("w"): case ("west"): case ("left"):
				pos.x -= amount || 1;
				break;
		}
		return pos;
	}

	/**
	 *
	 */
	utils.positionInBounds = function(pos, world) {
		return pos.x >= 0
			&& pos.y >= 0
			&& pos.x < world.width * world.chunkWidth
			&& pos.y < world.height * world.chunkHeight;
	}

	/**
	 *
	 */
	utils.clamp = function(min, max, num) {
		num = num > max ? max : num;
		num = num < min ? min : num;
		return num;
	}

	// export
	if (!server) {
		window["Utils"] = utils;
	} else {
		module.exports = utils;
	}
})();
