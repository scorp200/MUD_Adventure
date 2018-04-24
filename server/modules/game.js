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
     *synax: change = {chunk: 'x-x', change: [a>b], player: [{id:id, pos: pos}], playerCount: x}
     */
    this.pushUpdate = function(change, opts = {}) {
        //fancy amazing 11/10 stuff
        clients.forEach(function(client) {
            var key = change.key = getPlayerChunk(client);
            if (opts.key) {
                var pos = key.split('-');
                var changePos = opts.key.split('-');
                if (Math.abs(pos[0] - changePos[0]) > 2 && Math.abs(pos[1] - changePos[1]) > 2)
                    return;
            }
            client.update.push(change);
        });
    }
    /**
     * update player position in the world
     */
    this.updatePlayerPosition = function(player) {
        var key = world.getChunk(player.position);
        var chunk = world.chunks[key];
        if (player.chunk != '' && key != player.chunk) {
            world.chunks[player.chunk].players[player.id] = null;
            world.chunks[player.chunk].playerCount--;
        }
        player.chunk = key;
        chunk.players[player.id] = {
            x: player.position.x - chunk.x * world.chunkWidth,
            y: player.position.y - chunk.y * world.chunkWidth
        };
        chunk.playerCount++;
        console.log(player.name + ' has moved to chunk ' + key + ' with position: ' + player.position.x + ',' + player.position.y);
    }

    var getPlayerChunk = function(player) {
        return Math.floor(player.position.x / world.chunkWidth) + '-' + Math.floor(player.position.y / world.chunkHeight);
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
            var key = getPlayerChunk(client);
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
