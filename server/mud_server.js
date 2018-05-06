const fs = require('fs');
const ws = require('ws');
const World = require('../shared/world.js');
const logger = require('./modules/logger.js');
const Game = require('./modules/game.js');
const Player = require('./modules/player.js');
const Chunk = require('../shared/chunk.js');
const PouchDB = require('pouchdb');
var modules = {};
var game = null;
var world = {};
var accounts = {};
var clients = [];
var db = null;
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
		console.log("creating default server properties");
	} else {
		// load existing server properties
		data = data.split('\n');
		data.forEach(function(e) {
			e = e.split('=');
			if (settings[e[0]])
				settings[e[0]] = e[1];
		});
		console.log('previous properties have been loaded');
		writeProperties();
	}
	try {
		db = new PouchDB('worlds/' + settings.world_name);
	} catch (err) { throw err }
	//attempt to load world, else generate a new one
	var world_settings = {};
	db.get('settings')
		.then(function(doc) {
			Object.assign(world_settings, doc.data);
			console.log('loading existing world');
			create_world(world_settings);
		})
		.catch(function(err) {
			world_settings = {
				width: 20,
				height: 20,
				chunkWidth: 64,
				chunkHeight: 64,
				name: settings.world_name
			};
			console.log('creating a new world');
			db.put({ _id: 'settings', data: world_settings })
				.catch(function(err) { logger.log(err); });
			create_world(world_settings, true);
		});
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
function create_world(world_settings, generate = false) {
	//set generate options to auto generate world
	if (generate)
		world_settings.generate = true;
	world = new World(world_settings);
	if (generate) {
		//generate a new world and bulk save it into the db
		saveTheWorld(true, true);
	} else {
		//load all docs and loop trough them all loading all the chunks.
		db.allDocs({ include_docs: true })
			.then(function(docs) {
				console.log('loading world...');
				docs.rows.forEach(function(data) {
					var doc = data.doc;
					if (doc._id == 'settings')
						return;
					var index = parseInt(doc._id);
					doc.properties.stringData = doc.data;
					var chunk = new Chunk(doc.properties);
					world.chunks[index] = chunk;
				});
				startup();
			}).catch(function(err) { logger.log(err); });
	}
}

function saveTheWorld(all = true, firstTime = false) {
	// *disclaimer no hero will actually save the world :,(
	var now = Date.now();
	var bulk = [];
	var keys = [];
	if (all) {
		console.log('generate all');
		Object.keys(world.chunks).forEach(function(key) { keys.push(key.toString()) });
	} else {
		Object.keys(world.changes).forEach(function(key) {
			keys.push(key.toString());
			delete world.changes[key];
		});
	}
	//keys.push('accounts');
	if (firstTime) {
		console.log('Saving world for the first time...');
		keys.forEach(function(index) {
			var chunk = world.chunks[parseInt(index)];
			var prop = {
				_id: index,
				properties: chunk.getProperties(),
				players: chunk.players,
				data: chunk.bufferToString()
			};
			bulk.push(prop);
		})
		db.bulkDocs(bulk)
			.then(function() { game ? null : startup(); })
			.catch(function(err) { logger.log(err) });
	} else
		db.allDocs({ include_docs: true, keys: keys })
		.then(function(docs) {
			console.log('generating bulk action...');
			docs.rows.forEach(function(data) {
				var doc = data.doc;
				var chunk = world.chunks[parseInt(doc._id)];
				Object.assign(doc, {
					properties: chunk.getProperties(),
					players: chunk.players,
					data: chunk.bufferToString()
				});
				bulk.push(doc);
			});
		})
		.then(function() {
			db.bulkDocs(bulk);
			console.log('Bulk saving the world...');
		})
		.then(function() {
			console.log('save succesfully');
			game ? null : startup();
		})
		.catch(function(err) { logger.log(err); });
}

/**
 *
 */
function startup() {
	console.log("starting simulation...");
	game = new Game(world, settings.server_tick, clients, db, logger);
	setInterval(saveTheWorld.bind(true), 600000);
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
						player: clients[cid].getStats()
					});
				} else {
					logger.log("There's already an account with the name: " + data.name);
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
						clients[cid].index = -1;
						game.updatePlayerPosition(clients[cid]);
						game.sendToClient(conn, {
							world: world.getProperties(),
							player: clients[cid].getStats()
						});
					} else {
						console.log("FAILED LOGIN: Incorrect password: " + data.name, acc.pass);
						game.sendToClient(conn, { error: "FAILED LOGIN: Incorrect password!" });
					}
				} else {
					console.log("FAILED LOGIN: Account with name doesn't exist: " + data.name);
					game.sendToClient(conn, { error: "FAILED LOGIN: No character with that name exists!" });
				}
			}

			// command
			else if (clients[cid] && data.command) {
				if (data.command == 'save-world') {
					saveTheWorld(true);
					return;
				}
				console.log(clients[cid].name + ' has send the command ' + data.command);
				game.push({
					player: clients[cid],
					command: data.command
				});
			}
		});
		conn.on('close', function() {
			if (clients[cid])
				game.updateChunkPlayers(clients[cid], {
					remove: true
				})
			clients[cid] = null;
			console.log('Client ' + cid + ' has left.')
		});
	});
	var usage = process.memoryUsage();
	console.log(usage);
}
