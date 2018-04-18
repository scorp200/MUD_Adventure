const fs = require('fs');
const EventEmitter = require('events');
//const reload = require('require-reload')(require);
//const sqlite3 = require('sqlite3').verbose();
const ws = require('ws');
const World = require('../shared/world.js');
var modules = {};
var world = {};
var clients = [];
var settings = {
    world_name: '',
    world_seed: '',
    server_port: ''
};

fs.readFile('./server.properties', 'utf8', function(err, data) {
    if (err) {
        var seed = (Math.floor(Math.random() * 100 * 100) / 100);
        data = 'world_name=world\nworld_seed=' + seed + '\nserver_port=8123\n';
        fs.writeFile("./server.properties", data, 'utf8', function(err) {
            if (err) {
                throw err;
            }
            console.log("new default server protperties has been created");
            settings.world_name = 'world';
            settings.world_seed = seed;
            settings.server_port = 8123;
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
    world.world = new World({width: 20, height: 20});
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
            }
        });
    });
}
