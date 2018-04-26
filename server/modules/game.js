module.exports = function(world, rate, clients) {
    var game = this;
    console.log("rate = " + rate);
    setInterval(update, rate);
    console.log('game world has started');
    var commandList = [];
    var commandLimit = {};
    var commands = require('../../shared/command.js');
    commands.game = this;
    var living = {};


    /**
     * add a player command into an array.
     */
    this.push = function(cmd) {
        if (!commandLimit[cmd.player.id]) {
            commandList.push(cmd);
            commandLimit[cmd.player.id] = true;
        }
    }

    /**
     * queue changes to send to players.
     */
    this.pushUpdate = function(change, opts = {}) {
        clients.forEach(function(client) {
            if (opts.index && !client.active[opts.index])
                return;
            client.update.push(change);
        });
    }
    /**
     * update player position in the world
     */
    this.updatePlayerPosition = function(player) {

        var oldIndex = player.index;
        var index = world.getChunk(player.position);
        var chunk = world.chunks[index];
        if (oldIndex != index) {
            if (oldIndex > -1) {
				var oldChunk = world.chunks[oldIndex];
                delete oldChunk.players[player.id];
				oldChunk.playerCount = Object.keys(oldChunk.players).length;
                //world.chunks[oldIndex].playerCount--;
            }
            player.index = index;
			chunk.playerCount = Object.keys(chunk.players).length;
            //chunk.playerCount++;
			
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
            y: player.position.y - chunk.y * world.chunkWidth
        };
        console.log(player.name + ' has moved to chunk ' + index + ' with position: ' + player.position.x + ',' + player.position.y);
    }

    var getPlayerChunk = function(player) {
        var x = ~~(player.position.x / world.chunkWidth),
            y = ~~(player.position.y / world.chunkHeight),
            index = y * world.width + x;
        return index;
    }

    function update() {
        //do stuff

        while (commandList.length > 0) {
            var command = commandList.shift();
            //execute the commands
            commands.execute('' + command.command, {
                player: command.player,
                clients: clients,
                world: world
            });
            commandLimit[command.player.id] = null;
        }
        //update all clients
        clients.forEach(function(client) {
            if (!client || client.update.length == 0)
                return;
            var data = {
                update: client.update
            };
            game.sendToClient(client.conn, data);
            client.update.length = 0;
        })
    }

    this.sendToClient = function(conn, data) {
        try {
            conn.send(JSON.stringify(data));
        } catch (e) {
            console.log(e);
        }
    }
}
