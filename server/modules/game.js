module.exports = function(world, rate, clients, db, logger) {

	//
	var commandList = [];
	var commandLimit = {};
	var commands = require('../../shared/command.js');
	var items = require('../../shared/items.js');
	var actions = require('../../shared/actions.js');
	var crafting = require('../../shared/crafting.js');
	var utils = require('../../shared/utils.js');
	var living = {};

	// cache references
	var game = this;
	commands.game = this;
	game.actions = actions;
	actions.game = this;
	crafting.game = this;
	crafting.world = world;
	commands.utils = actions.utils = utils;
	actions.init(commands);

	/**
	 * Add a player command into an array.
	 * @param {string} cmd
	 */
	this.push = function(cmd) {
		if (!commandLimit[cmd.player.id]) {
			commandList.push(cmd);
			commandLimit[cmd.player.id] = true;
		}
	}

	/**
	 * Queue changes to send to players.
	 * @param {object} change
	 * @param {object} opts
	 */
	this.pushUpdate = function(change, opts = {}) {
		if (opts.player) {
			opts.player.update.push(change);
		} else {
			clients.forEach(function(client) {
				var player = client.account;
				if (!isNaN(opts.index) && !player.active[opts.index])
					return;
				player.update.push(change);
			});
		}
	}

	/**
	 * Send some data to a client.
	 * @param {WebSocket} conn
	 * @param {object} data
	 */
	this.sendToClient = function(conn, data) {
		try {
			conn.send(JSON.stringify(data));
		} catch (e) {
			logger.log(e);
		}
	}

	/**
	 * Update player position in the world.
	 * @param {object} player
	 */
	this.updatePlayerPosition = function(player) {

		var oldIndex = player.index;
		var index = world.getChunkIndex(player.position);
		var chunk = world.chunks[index];

		chunk.players[player.id] = {
			x: player.position.x - chunk.x * world.chunkWidth,
			y: player.position.y - chunk.y * world.chunkWidth,
			color: player.color
		};

		if (oldIndex != index) {
			if (oldIndex > -1) {
				game.updateChunkPlayers(player, {
					remove: true,
					index: oldIndex
				})
			}
			player.index = index;
			game.updateChunkPlayers(player);
			setActiveChunks(player, chunk);
		}

		game.pushUpdate({
			move: player.id.toString(),
			position: player.position,
			index: index
		}, { index: index });

		console.log(player.name + ' has moved to chunk ' + index + ' with position: ' + player.position.x + ',' + player.position.y);
	}


	/**
	 * Updates player count in players or specified index
	 */
	this.updateChunkPlayers = function(player, opts = {}) {
		var index = opts.index || player.index;
		if (opts.remove) {
			delete world.chunks[index].players[player.id];
			world.chunks[index].playerCount--;
			game.pushUpdate({ delete: player.id.toString(), index: index }, { index: index });
		} else {
			world.chunks[index].playerCount++;

		}
	}

	/**
	 * attempt to drop the items in the cell drop list.
	 */
	this.dropItem = function(player, drop) {
		drop.forEach(function(drop) {
			item = items.mapping[drop];
			if (Math.random() <= item.dropRate) {

				// not sure how to make it more streamline
				player.inventory[item.id] = player.inventory[item.id] || 0;
				player.inventory[item.id] += item.dropAmount;

				game.pushUpdate({
					inventory: player.inventory,
					notify: "You aquaired " + item.dropAmount + " " + drop
				}, { player: player });

				console.log(player.name + ' acquaired ' + item.dropAmount + ' ' + drop);
			}
		});
	}

	/**
	 * Set active chunks for the player and the server
	 * @param {object} player
	 */
	var setActiveChunks = function(player, chunk) {
		//Set new active chunks
		for (x = -1; x < 2; x++) {
			for (y = -1; y < 2; y++) {
				var activeIndex = (chunk.y + y) * world.width + (chunk.x + x);
				if (world.chunks[activeIndex]) {
					if (!player.active[activeIndex]) {
						game.pushUpdate({
							chunk: {
								props: world.chunks[activeIndex].getProperties(),
								players: world.chunks[activeIndex].players,
								data: world.chunks[activeIndex].bufferToString()
							}
						}, { player: player });
					}
					player.active[activeIndex] = true;
				}
			}
		}

		Object.keys(player.active).forEach(function(aIndex) {
			var pos = [~~(player.position.x / world.chunkWidth), ~~(player.position.y / world.chunkHeight)];
			var changePos = [world.chunks[aIndex].x, world.chunks[aIndex].y];
			if (Math.abs(pos[0] - changePos[0]) > 2 && Math.abs(pos[1] - changePos[1]) > 2) {
				delete player.active[aIndex];
			}
		});
	}

	/**
	 * Sends current list of updates to all connected clients.
	 */
	var update = function() {
		var now = Date.now();
		// execute commands
		while (commandList.length > 0) {
			var command = commandList.shift();
			try {
				commands.execute('' + command.command, {
					player: command.player,
					clients: clients,
					world: world
				});
				commandLimit[command.player.id] = null;
			} catch (e) {
				logger.log(e);
			}
		}

		//update all players
		for (var i = 0; i < clients.length; i++) {
			if (!clients[i])
				continue;
			var player = clients[i].account;
			if (!player || player.update.length === 0)
				return;
			var data = {
				update: player.update
			};
			game.sendToClient(clients[player.cid], data);
			player.update.length = 0;
		}
		/*clients.forEach(function(client) {

		})*/
		//console.log(Date.now() - now + ' ms');
	}

	//
	setInterval(update, rate);
	console.log('game world simulation started at ' + rate + "ms");

}
