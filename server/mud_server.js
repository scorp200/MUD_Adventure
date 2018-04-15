const fs = require('fs');
const EventEmitter = require('events');
const reload = require('require-reload')(require);
const sqlite3 = require('sqlite3').verbose();
const ws = require('ws');

var modules = {};
var port;

fs.readFile('./server.properties', 'utf8', function(err, data) {
    if (err) {
        data = 'world_name=world\nworld_seed=' + (Math.floor(Math.random() * 100 * 100) / 100) + '\nserver_port=8123\n';
        port = 8123;
        fs.writeFile("./server.properties", data, 'utf8', function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("new default server protperties has been created");
        });
    } else {
        console.log(data);
        data = data.split('\n');
        console.log(data);
    }
});


/*var server = new ws.Server({
    port: port
}, function() {
    console.log('Websockets server up on port' + port);
});*/
