/**
 * @module
 */

/**
 * @constructor
 * @param {int} pid Player ID.
 * @param {int}  cid Client ID
 * @param {string} name Name of the new player.
 * @param {*} pos An object containing "x" and "y" properties for coordinates.
 */
var player = function(pid, cid, name, pos = {}) {
	this.rank = 0;
	this.hp = 100;
	this.hunger = 100;
	this.hydration = 100;
	this.inventory = {};
	this.name = name;
	this.pass = '';
	this.color = "#00FFFF";
	this.id = pid;
	this.cid = cid;
	this.position = pos || {
		x: 0,
		y: 0
	};
	this.index = -1;
	this.active = {};
	this.update = [];
}

/**
 * Use to package player data relevant to the client.
 */
player.prototype.getStats = function() {
	return {
		name: this.name,
		color: this.color,
		hp: this.hp,
		position: this.position,
		hunger: this.hunger,
		hydration: this.hydration,
		inventory: this.inventory,
		playerID: this.id
	}
}

player.prototype.resetPlayer = function(newPos = { x: 0, y: 0 }) {
	this.hp = this.hunger = this.hydration = 100;
	this.inventory = {};
	this.position = newPos;
}

// export
module.exports = player;
