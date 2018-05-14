/**
 * @module Crafting
 */
(function() {

	// Is server?
	var server = typeof module !== "undefined";

	if ( server ) {
		Utils = require('./utils.js');
		Command = require('./command.js');
		Items = require('./items.js');
	}

	//
	var crafting = {

		//
		game: null,
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
		var map = crafting.mapping[item];

		if ( !crafting.mapping[item] ) {
			console.log( "Unknown craftable item!" );
			return;
		}

		if ( map.tile && !Utils.checkDir(dir) ) {
			console.log( "Not a valid direction!" );
			return;
		}

		//
		var hasAll = true;

		//
		var pos = Object.assign({}, player.position);
		Utils.applyDir(pos, dir);
		var chunk = crafting.world.getChunk(pos);
		pos.x -= chunk.realX;
		pos.y -= chunk.realY;
		var cell = chunk.getCell(pos).name;

		//
		if (!map.tile.includes(cell)) {
			hasAll = false;
			if (!server)
				Story.warn("Cannot craft that item in this location");
		}

		// Check player has all required resources
		var consumes = map.consume;
		for (var prop in consumes) {
			var itemID = Items.getID(prop);
			if ((player.inventory[itemID] || 0) < consumes[prop]) {
				//console.log(player.inventory[itemID], consumes[prop]);
				hasAll = false;
			}
		}

		// All requirements for crafting have been met
		if (server) {

			if ( hasAll ) {

				// If the crafted item effects world change
				if (map.change)
					chunk.setCell(pos.x, pos.y, map.change, true);

				// If the crafted item create a new item
				if (map.item)
					crafting.game.dropItem(player, map.item);

				for (var prop in consumes) {
					var itemID = Items.getID(prop);
					player.inventory[itemID] -= consumes[prop];
				}

				crafting.game.pushUpdate({
					inventory: player.inventory
				}, { player: player });

			}

		} else {

			if ( hasAll ) {

				// send craft command to server
				Story.log( "Crafting " + item );
				sendToServer({
					command: 'craft ' + params
				});

			} else {

				//
				Story.warn("Unable to craft item, you are missing requirements!");
				console.log(cell, consumes, map.tile);

			}

		}

	}

	exeCraft.desc = "Craft an item or structure. Type 'craft help' for more details.";

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

		"fence": {
			tile: ["grass", "drylands"],
			change: "fence",
			consume: {
				wood: 2
			}
		},
		
		"wall": {
			tile: ["grass", "drylands"],
			change: "wall",
			consume: {
				rock: 2
			}
		},

		"waterskin": {
			tile: ["water"],
			item: "waterskin",
			consume: {
				wood: 1
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
