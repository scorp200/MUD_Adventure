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

renderer.createField();
//renderer.update(world, Client.x, Client.y);
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

    // get the world from the server
    if (data.world) {
        Story.log("It's a whole new world, a new fantastic point of view!");
        world = Object.assign(data.world);
        Client.playerID = data.id.toString();
        renderer.update(world, Client.x, Client.y);
        console.log("playerID set to " + Client.playerID);
    }

    // received chunk from server
    else if (data.chunk) {

        var chunk = data.chunk;
        world.chunks[data.key] = chunk;
        renderer.update(world, chunk.players[Client.playerID].x, chunk.players[Client.playerID].y);

    }
	
	// received chat from server
	else if (data.say) {

        Story.log("<a-" + data.name + "->: " + data.say);

    }

    if (data == 'ping!') {
        console.log('ping: ' + Date.now());
    }

    return true;

}
