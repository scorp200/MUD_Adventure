module.exports = function(world, rate, clients) {

    //
    var commandList = [];
    var commandLimit = {};
    var commands = require('../../shared/command.js');
    var items = require('../../shared/items.js');
    var living = {};

    // cache references
    var game = this;
    commands.game = this;

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
        if (opts.client) {
            opts.client.update.push(change);
        } else
            clients.forEach(function(client) {
                if (opts.index && !client.active[opts.index])
                    return;
                client.update.push(change);
            });
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
            console.log(e);
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
        if (oldIndex != index) {
            if (oldIndex > -1) {
                game.updateChunkPlayers(player, {
                    remove: true,
                    index: oldIndex
                })
            }
            player.index = index;
            game.updateChunkPlayers(player);
            //Set new active chunks
            for (x = -1; x < 2; x++) {
                for (y = -1; y < 2; y++) {
                    var activeIndex = (chunk.y + y) * world.width + (chunk.x + x);
                    if (world.chunks[activeIndex]) {
                        if (!player.active[activeIndex]) {
                            game.pushUpdate({
                                chunk: world.chunks[activeIndex]
                            });
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

        chunk.players[player.id] = {
            x: player.position.x - chunk.x * world.chunkWidth,
            y: player.position.y - chunk.y * world.chunkWidth,
            color: player.color
        };
        console.log(player.name + ' has moved to chunk ' + index + ' with position: ' + player.position.x + ',' + player.position.y);
    }


    /**
     * Updates player count in players or specified index
     */
    this.updateChunkPlayers = function(player, opts = {}) {
        if (opts.remove) {
            delete world.chunks[opts.index || player.index].players[player.id];
            world.chunks[opts.index || player.index].playerCount--;
        } else
            world.chunks[opts.index || player.index].playerCount++;
    }

    this.dropItem = function(player, cell) {
        cell.drop.forEach(function(drop) {
            item = items.mapping[drop];
            if (Math.random() <= item.dropRate) {
                // not sure how to make it more streamline
                player.inventory[item.id] = player.inventory[item.id] ? 0 : player.inventory[item.id];
                //
                player.inventory[item.id] += item.dropAmount;
                commands.execute('say You aquaired ' + item.dropAmount + ' ' + drop, {
                    name: 'Server',
                    client: player
                });
                console.log(player.name + ' acquaired ' + item.dropAmount + ' ' + drop);
            }
        });
    }

    /**
     * Sends current list of updates to all connected clients.
     */
    var update = function() {

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
                console.log(e);
            }
        }

        //update all clients
        clients.forEach(function(client) {
            if (!client || client.update.length === 0)
                return;
            var data = {
                update: client.update
            };
            game.sendToClient(client.conn, data);
            client.update.length = 0;
        })

    }

    //
    setInterval(update, rate);
    console.log('game world simulation started at ' + rate + "ms");

}
