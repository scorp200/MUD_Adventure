module.exports = function(world, rate, clients) {
    var game = this;
    console.log("rate = " + rate);
    setInterval(update, rate);
    console.log('game world has started');
    var commandList = [];
    var commands = require('../../shared/command.js');
    var queue = {};
    commands.game = this;

    /**
     * add a player command into an array.
     */
    this.push = function(cmd) {
        commandList.push(cmd);
    }

    /**
     * queue changes to send to players.
     *synax: change = {chunk: 'x-x', change: [a>b], player: [{id:id, pos: pos}], playerCount: x}
     */
    this.pushChanges = function(change) {
        //fancy amazing 11/10 stuff
        clients.forEach(function(client) {
            var pos = getPlayerChunk(client).split('-');
            var changePos = change.chunk.split('-');
            if (Math.abs(pos[0] - changePos[0]) <= 2 && Math.abs(pos[1] - changePos[1]) <= 2) {
                client.update.push(change);
            }
        });
    }
    /**
     * update player position in the world
     */
    this.updatePlayerPosition = function(player) {
        var key = getPlayerChunk(player);
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
                clients: clients
            });
        }
        //update all clients
        clients.forEach(function(client) {
            if (!client)
                return;
            var key = getPlayerChunk(client);
            game.sendToClients(JSON.stringify({
                chunk: world.chunks[key],
                key: key
            }), {
                conn: client.conn
            });
        })
    }

    this.sendToClients = function(data, opts = {}) {
        try {
            if (opts.conn)
                opts.conn.send(data);
            else
                clients.forEach(function(client) {
                    client.conn.send(data);
                });
        } catch (e) {
            console.log(e);
        }
    }
}
