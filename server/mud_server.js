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
var accounts = {};
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
        width: 2,
        height: 2,
        chunkWidth: 64,
        chunkHeight: 64,
        name: settings.world_name
    });
    world.generate();
    // I know, WTF
    World.world = world;

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

        // send the connecting player their unique id
        // reusing old id if any, otherwise use the length of clients array
        var cid = clients.indexOf(null);
        cid = cid == -1 ? clients.length : cid;
        console.log('Client ' + cid + ' has connected');
        game.sendToClient(conn, {
            id: cid
        });

        // message from client
        conn.on('message', function(msg) {
            var data = JSON.parse(msg);

            // new character
            if (!clients[cid] && data.type === "new" && data.name && data.pass) {
                if (!accounts[data.name]) {
                    console.log('NEW: Client ' + cid + ' is now ' + data.name);
                    accounts[data.name] = new Player(cid, conn, data.name, {
                        x: 62,
                        y: 62
                    });
                    accounts[data.name].pass = data.pass;
                    clients[cid] = accounts[data.name];
                    game.updatePlayerPosition(clients[cid]);
                    game.sendToClient(conn, {
                        world: world.getProperties(),
                        player: clients[cid].position
                    });
                } else {
                    console.log("There's already an account with the name: " + data.name);
                }
            }

            // login character
            if (!clients[cid] && data.type === "login" && data.name && data.pass) {
                var acc = accounts[data.name];
                if (acc) {
                    if (acc.pass === data.pass) {
                        console.log('LOGIN: Client ' + cid + ' is now ' + data.name);
                        clients[cid] = accounts[data.name];
                        clients[cid].conn = conn;
						clients[cid].active = {};
						clients[cid].chunk = -1;
                        game.updatePlayerPosition(clients[cid]);
                        game.sendToClient(conn, {
                            world: world.getProperties(),
                            player: clients[cid].position
                        });
                    } else {
                        console.log("FAILED LOGIN: Incorrect password: " + data.name, acc.pass);
                    }
                } else {
                    console.log("FAILED LOGIN: Account with name doesn't exist: " + data.name);
                }
            }

            // command
            else if (clients[cid] && data.command) {
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
