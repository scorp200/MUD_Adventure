/**
 * @module Crafting
 */
(function() {

	// Is server?
	var server = typeof module !== "undefined";

	if ( server ) {
		Utils = ( server ) ? require('./utils.js') : Utils;
		Command = ( server ) ? require('./command.js') : Command;
	}

	//
	var crafting = {

		//
		world: null,

		//
		user: {
			"craft": { _execute: exeCraft }
		}
	};

	//
	//console.log(Command);
	Object.assign( Command.user, crafting.user );

	/**
	 *
	 */
	function exeCraft( params, opts = {} ) {

		var split = params.split( " " );
		var item = split[0];
		var dir = split[1];
		var player = (server) ? opts.player : Client;

		console.log( "CRAFTING: ", item, dir );

		if ( !crafting.mapping[item] ) {
			console.log( "Unknown craftable item!" );
			return;
		}

		if ( !Utils.checkDir(dir) ) {
			console.log( "Not a valid direction!" );
			return;
		}

		// Check player has all required resources
		var map = crafting.mapping[item];
		var consumes = map.consume;
		var hasAll = true;
		for (var prop in consumes) {
			if ((player.inventory[prop] || 0) < consumes[prop]) {
				hasAll = false;
			}
		}

		// All requirements for crafting have been met
		//if ( hasAll ) {
		if (server) {

			var pos = Object.assign({}, player.position);
			Utils.applyDir(pos, dir);
			var chunk = crafting.world.getChunk(pos);
			pos.x -= chunk.realX;
			pos.y -= chunk.realY;
			chunk.setCell(pos.x, pos.y, map.change, true);

		} else {

			// send craft command to server
			Story.log( "Crafting " + item );
			sendToServer({
				command: 'craft ' + params
			});

		}
		//}

	}

	/**
	 * @namespace
	 */
	crafting.mapping = {

		"bridge": {
			tile: ["water"],
			change: "bridge",
			consume: {
				wood: 2
			}
		},

		"wall": {
			tile: ["grass", "drylands"],
			change: "wall",
			consume: {
				wood: 2
			}
		}

	}

	// export
	if (!server) {
		window["Crafting"] = crafting;
	} else {
		module.exports = crafting;
	}

})();
