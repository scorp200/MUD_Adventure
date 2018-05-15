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
	 * Clamp the given number between min and max values.
	 * @param {number} min
	 * @param {number} max
	 * @param {number} num
	 */
	utils.clamp = function(min, max, num) {
		num = num > max ? max : num;
		num = num < min ? min : num;
		return num;
	}

	/**
	 * array.indexOf that can find undefined VALUES
	 * @param {array} arr
	 * @param {*} what
	 */
	utils.indexOf = function(arr, what) {
		for(var i = 0, last = arr.length; i < last; i++){
			if(arr[i] === what)
				return i;
		}
		return -1;
	}

	/**
	 *
	 */
	 utils.getWalkableCell = function(world) {
		 var x = 64,
			 y = 64;
		 //find a walkable spot to spawn
		 var maxX = world.width * world.chunkWidth - 30;
		 var maxY = world.height * world.chunkHeight - 30;
		 while (true) {
			 x = ~~(Math.random() * (maxX - 30)) + 30;
			 y = ~~(Math.random() * (maxY - 30)) + 30;
			 var chunk = world.getChunk({ x: x, y: y });
			 var cell = chunk.getCell({ x: x - chunk.realX, y: y - chunk.realY });
			 if (cell.canMove)
				 return {x: x, y: y};
		 }
	 }

	 utils.findAccountByName = function(accounts, name) {
	 	for (var i = 0, keys = Object.keys(accounts); i < keys.length; i++) {
	 		if (accounts[keys[i]].name === name)
	 			return accounts[keys[i]]
	 	}
	 	return undefined;
	 }


	// export
	if (!server) {
		window["Utils"] = utils;
	} else {
		module.exports = utils;
	}
})();
