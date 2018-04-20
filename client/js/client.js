// cache DOM
var domTools = document.getElementById("tools"),
    domCharacter = document.getElementById("character");

//
Client = {

    characterName: "",
    characterPass: "",
    playerID: null,
    chunk: null,
    x: 32,
    y: 32,
    socket: null

}

//
var world = new World(),
    renderer = new Renderer();

renderer.update(world, Client.x, Client.y);
Story.intro();

//server connection
var socket = null;
var con = new WebSocket('ws://localhost:8123/');
con.onopen = function() {
    Story.log('You have entered a new world!');
    socket = con;
    Client.socket = socket;
}
con.onerror = function(err) {
    console.log('Socket error: ' + err);
    Story.log('Whoops there was a problem entering the world...');
}
con.onclose = function(err) {
    console.log('socket closed');
    Story.log('The world has been lost... refresh?');
    socket = null;
}
con.onmessage = function(msg) {
    var data = JSON.parse(msg.data);
    //console.log(data);

    //get the world from the server
    if (data.world) {
        Story.log("It's a whole new world, a new fantastic point of view!");
        world = Object.assign(data.world);
        Client.playerID = data.id;
        renderer.update(world, Client.x, Client.y);
    } else if (data.chunk) {
        world.chunks[data.key] = data.chunk;
        renderer.update(world, world.chunks[data.key].players[Client.playerID].x, world.chunks[data.key].players[Client.playerID].y);
    }

    if (data == 'ping!') {
        console.log('ping: ' + Date.now());
    }

    return true;

}
