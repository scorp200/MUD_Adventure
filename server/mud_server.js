const fs = require('fs');
const EventEmitter = require('events');
//const reload = require('require-reload')(require);
//const sqlite3 = require('sqlite3').verbose();
const ws = require('ws');
const World = require('../shared/world.js');
const Game = require('./modules/game.js');
var modules = {};
var game = null;
var world = {};
var clients = [];
var settings = {
    world_name: '',
    world_seed: 0,
    server_port: 0,
    server_tick: 0
};

fs.readFile('./server.properties', 'utf8', function(err, data) {
    if (err) {
        var seed = (Math.floor(Math.random() * 100 * 100) / 100);
        data = 'world_name=world\nworld_seed=' + seed + '\nserver_port=8123\nserver_tick=1000';
        fs.writeFile("./server.properties", data, 'utf8', function(err) {
            if (err) {
                throw err;
            }
            console.log("new default server protperties has been created");
            settings.world_name = 'world';
            settings.world_seed = seed;
            settings.server_port = 8123;
            settings.server_tick = 1000;
            game =
                startup()
        });
    } else {
        data = data.split('\n');
        data.forEach(function(e) {
            e = e.split('=');
            settings[e[0]] = e[1];
        })
        console.log('previous settings have been loaded');
        startup()
    }
});

function startup() {
    world.world_name = settings.world_name;
    world.world = new World({
        width: 100,
        height: 100
    });
    game = new Game(world, settings.server_tick, clients);
    var server = new ws.Server({
        port: settings.server_port
    }, function() {
        console.log('Websockets server up on port ' + settings.server_port);
    });
    server.on('connection', function(conn) {
        var cid = clients.length;
        console.log('Player ' + cid + ' has connected');
        try {
            conn.send(JSON.stringify(world));
        } catch (e) {
            console.log(e);
        }
        conn.on('message', function(msg) {
            var data = JSON.parse(msg);
            console.log(data);
            if (data.characterName && data.characterPass) {
                clients[cid] = data;
                clients[cid].conn = conn;
            }
        });
    });
}
