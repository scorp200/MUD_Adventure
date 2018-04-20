// cache DOM
var domTools = document.getElementById("tools"),
    domCharacter = document.getElementById("character");

//
Client = {

    characterName: "",
    characterPass: "",
	playerID: "testID",
	chunk: null,
	x: 20,
	y: 10,
    socket: null

}

//
var world = new World(),
	renderer = new Renderer();

// quick test, wang a player in a chunk!
Client.updatePosition = function() {
	
	var cx = Math.floor( Client.x / world.chunkWidth );
	var cy = Math.floor( Client.y / world.chunkHeight );
	var chunk = world.chunks[cx+"-"+cy];
	Client.chunk = cx+"-"+cy;
	chunk.players["testID"] = {
		x: Client.x - chunk.x * world.chunkWidth,
		y: Client.y - chunk.y * world.chunkWidth
	};
	console.log( chunk.players["testID"] );
	
}

Client.updatePosition();

renderer.update( world, Client.x-7, Client.y-7 );
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
        //world.width = data.world.width;
        //world.height = data.world.height;
        //world.chunks = data.world.chunks;
        renderer.update( world, Client.x-7, Client.y-7 );
    }

    if (data == 'ping!') {
        console.log('ping: ' + Date.now());
    }

    return true;

}
