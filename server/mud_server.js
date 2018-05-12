const fs = require('fs');
const ws = require('ws');
const World = require('../shared/world.js');
const logger = require('./modules/logger.js');
const Game = require('./modules/game.js');
const Player = require('./modules/player.js');
const Chunk = require('../shared/chunk.js');
const PouchDB = require('pouchdb');
const utils = require('../shared/utils.js');
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
 * Load existing world if any, else generate a new world.
 */
function create_world(world_settings, generate = false) {
	//set generate options to auto generate world
	if (generate)
		world_settings.generate = true;
	world = new World(world_settings);
	if (generate) {
		//save the newly generated world
		saveTheWorld(true, true);
	} else {
		//load all docs and loop through them all loading all the chunks.
		db.allDocs({ include_docs: true })
			.then(function(docs) {
				console.log('loading world...');
				var now = Date.now();
				for (var i = 0; i < docs.rows.length; i++) {
					var doc = docs.rows[i].doc;
					//ignore settings doc
					if (doc._id == 'settings')
						continue;
					else if (doc._id == 'accounts') {
						for (var y = 0, keys = Object.keys(doc.accounts); y < keys.length; y++) {
							var acc = new Player(0, 0, '')
							var key = keys[y];
							acc.setPlayer(doc.accounts[key]);
							accounts[key] = acc;
						}
					} else {
						var index = parseInt(doc._id);
						doc.properties.stringData = doc.data;
						var chunk = new Chunk(doc.properties);
						world.chunks[index] = chunk;
					}
				}
				console.log(Date.now() - now);
				startup();
			}).catch(function(err) { logger.log(err); });
	}
}

function saveTheWorld(all = true, firstTime = false) {
	// *disclaimer no hero will actually save the world :,(
	var now = Date.now();
	var bulk = [];
	var keys = [];
	var keyList = [];
	if (all) {
		console.log('generate all');
		keyList = Object.keys(world.chunks);
	} else {
		keyList = Object.keys(world.changes);
		world.changes = {};
	}
	//toString() all the indexes for allDocs
	for (var i = 0; i < keyList.length; i++) {
		keys.push(keyList[i].toString());
	}

	keys.push('accounts');
	if (firstTime) {
		console.log('Saving world for the first time...');
		keys.forEach(function(index) {
			if (index == 'accounts') {
				prop = { _id: index, accounts: accounts };
			} else {
				var chunk = world.chunks[parseInt(index)];
				var prop = {
					_id: index,
					properties: chunk.getProperties(),
					data: chunk.bufferToString()
				};
			}
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
				if (doc._id == 'accounts') {
					doc.accounts = accounts;
				} else {
					var chunk = world.chunks[parseInt(doc._id)];
					Object.assign(doc, {
						properties: chunk.getProperties(),
						players: chunk.players,
						data: chunk.bufferToString()
					});
				}
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
	game = new Game(world, settings.server_tick, clients, db, logger, utils);
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

		var cid = utils.indexOf(clients, undefined);
		cid = cid == -1 ? clients.length : cid;
		console.log('Client ' + cid + ' has connected');
		clients[cid] = conn;
		game.sendToClient(conn, { cid: cid });
		var account = null;

		// message from client
		conn.on('message', function(msg) {
			var data = JSON.parse(msg);

			// new character
			if (!account && data.type === "new" && data.name && data.pass) {
				if (!accounts[data.name]) {
					console.log('NEW: Client ' + cid + ' is now ' + data.name);
					//get a new player id;
					var pid = Object.keys(accounts).length;
					var x = 64,
						y = 64;
					//find a walkable spot to spawn
					var maxX = world.width * world.chunkWidth - 30;
					var maxY = world.height * world.chunkHeight - 30;
					while (true) {
						x = ~~(Math.random() * (maxX - 30)) + 30;
						y = ~~(Math.random() * (maxY - 30)) + 30;
						var chunk = world.getChunk({ x: x, y: y });
						var cell = chunk.getCell({ x: x - chunk.realX, y: y - chunk.realY });
						if (cell.canMove)
							break;
					}
					account = new Player(pid, cid, data.name.trim(), { x: x, y: y });
					account.pass = data.pass.trim();
					conn.account = account;
					accounts[account.name] = account;
					game.sendToClient(conn, {
						world: world.getProperties(),
						player: account.getStats()
					});
					game.updatePlayerPosition(account);
				} else {
					logger.log("There's already an account with the name: " + data.name);
					game.sendToClient(conn, { error: "Account with that name already exists!" })
				}
			}

			// login character
			else if (!account && data.type === "login" && data.name && data.pass) {
				account = accounts[data.name];
				if (account) {
					account.cid = cid;
					if (account.pass === data.pass) {
						console.log('LOGIN: Client ' + cid + ' is now ' + data.name);
						conn.account = account;
						account.active = {};
						account.index = -1;
						game.sendToClient(conn, {
							world: world.getProperties(),
							player: account.getStats()
						});
						game.updatePlayerPosition(account);
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
			else if (account && data.command) {
				if (data.command == 'save-world') {
					saveTheWorld(true);
					return;
				}
				console.log(account.name + ' has send the command ' + data.command);
				game.push({
					player: account,
					command: data.command
				});
			}
		});
		conn.on('close', function() {
			if (conn && account)
				game.updateChunkPlayers(account, { remove: true });
			account = null;
			delete clients[cid];
			console.log('Client ' + cid + ' has left.')
		});
	});
	var usage = process.memoryUsage();
	console.log(usage);
}
