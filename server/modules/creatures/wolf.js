const creatures = require('../../../shared/creatures.js');
var creature = function(id, pos) {
	this.name = 'wolf';
	Object.assign(this, creatures.mapping[this.name]);
	this.id = id;
	this.position = pos || { x: 0, y: 0 };
	this.index = -1;
}

/**
 * update creature
 */
creature.prototype.update = function(clients, game, utils) {
	//creature logic
}

/**
 * get creature properties
 */
creature.prototype.getStats = function() {
	return {
		name: this.name,
		hp: this.hp,
		position: this.position,
		id: this.id
	}
}

/**
 *
 */
creature.prototype.getCreature = function() {
	return player;
}

/**
 * Sets this creature's properties
 * @param {object} newCreature
 */
creature.prototype.setCreature = function(newCreature) {
	Object.assign(this, newCreature);
}

// export
module.exports = creature;
