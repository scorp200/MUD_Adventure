
/**
 * @constructor
 */
var player = function(cid, conn, name, pos = {}) {
	this.rank = 0;
    this.hp = 100;
	this.hunger = 100;
	this.hydration = 100;
    this.inventory = {};
    this.name = name;
	this.color = "#00FFFF";
    this.id = cid;
    this.conn = conn;
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
		hydration: this.hydration
	}
}

// export
module.exports = player;
