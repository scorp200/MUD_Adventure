const fs = require('fs');
const EventEmitter = require('events');
//const reload = require('require-reload')(require);
//const sqlite3 = require('sqlite3').verbose();
const ws = require('ws');
const World = require('../shared/world.js');
const Game = require('./modules/game.js');
const Player = require('./modules/player.js');
var modules = {};
var game = null;
var world = {};
var clients = [];
//setup default server setings incase .properties is missing or damaged
var settings = {
    world_name: 'world',
    world_seed: Date.now(),
    server_port: 8123,
    server_tick: 1000
};
// server properties
fs.readFile('./server.properties', 'utf8', function(err, data) {

    if (err) {
        // just write the default server.properties
        writeProperties();
        console.log("using default server settings");
    } else {
        // load existing server properties
        data = data.split('\n');
        data.forEach(function(e) {
            e = e.split('=');
            if (settings[e[0]])
                settings[e[0]] = e[1];
        });
        console.log('previous settings have been loaded');
        writeProperties();
    }

    // start
    startup();

});

/**
 * Always write into the .properties file to make sure it contains all the correct settings
 */
function writeProperties() {
    var data = '';
    var keys = Object.keys(settings);
    keys.forEach(function(e) {
        data += e + '=' + settings[e] + '\n';
    });
    fs.writeFile("./server.properties", data, 'utf8', function(err) {
        if (err) {
            throw err;
        }
    });
}

/**
 *
 */
function startup() {

    // create world
    console.log("creating world...");
    world = new World({
        width: 1,
        height: 1,
        chunkWidth: 64,
        chunkHeight: 64,
        name: settings.world_name
    });

    //
    console.log("starting simulation...");
    game = new Game(world, settings.server_tick, clients);

    // create server
    console.log("creating server...");
    var server = new ws.Server({
        port: settings.server_port
    }, function() {
        console.log('Websockets server up on port ' + settings.server_port);
    });

    // handle connection
    server.on('connection', function(conn) {
        //reusing old id if any otherwise use the length of clients array
        var cid = clients.indexOf(null);
        cid = cid == -1 ? clients.length : cid;
        console.log('Client ' + cid + ' has connected');
        try {
            conn.send(JSON.stringify({
                world: world,
                id: cid
            }));
        } catch (e) {
            console.log(e);
        }
        conn.on('message', function(msg) {
            var data = JSON.parse(msg);
            if (!clients[cid] && data.characterName && data.characterPass) {
                console.log('Client ' + cid + ' is now ' + data.characterName);
                clients[cid] = new Player(cid, conn, data.characterName, {
                    x: 32,
                    y: 32
                });
                game.updatePlayerPosition(clients[cid]);
            } else if (clients[cid] && data.command) {
                console.log(clients[cid].name + ' has send the command ' + data.command);
                game.push({
                    player: clients[cid],
                    command: data.command
                });
            }
        });
        conn.on('close', function() {
            clients[cid] = null;
            console.log('Client ' + cid + ' has left.')
        });
    });
}
