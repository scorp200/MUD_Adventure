/**
 * @module Crafting
 */
(function() {
	
	// Is server?
	var server = typeof module !== "undefined";

	//
	var crafting = {
		user: {
			"craft": { _execute: exeCraft }
		}
	};
	
	/**
	 *
	 */
	function exeCraft( params ) {
		
		params = params.split(" ");
		var item = params[0];
		var dir = params[1];
		
		console.log( "CRAFTING: ", item, dir );
		
		if ( !crafting.mapping[item] ) {
			console.log( "Unknown craftable item!" );
			return;
		}
		
		if ( !Utils.checkDir(dir) ) {
			console.log( "Not a valid direction!" );
			return;
		}
		
		var map = crafting.mapping[item];
		var consumes = map.consume;
		
		// Check player has all required resources
		var hasAll = true;
		for (var prop in consumes) {
			if ((Client.inventory[prop] || 0) < consumes[prop]) {
				hasAll = false;
			}
		}
		
		// All requirements for crafting have been met
		if (hasAll) {
			// DO CRAFTING HERE!
		}
		
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
	
	//
	if ( !server ) {
		Object.assign( Command.user, crafting.user );
	}
	
	// export
	if (!server) {
		window["Crafting"] = crafting;
	} else {
		module.exports = crafting;
	}

})();