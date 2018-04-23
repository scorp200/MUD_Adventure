// cache DOM
var domTools = document.getElementById("tools"),
    domCharacter = document.getElementById("character");

//
Client = {

    characterName: "",
    characterPass: "",
    playerID: null,
    chunk: null,
    x: 64,
    y: 64,
    socket: null

}

//
var world = new World(),
    renderer = new Renderer();

renderer.createField();

//server connection
Story.log( "<1-Connecting...->" );
var socket = null;
var con = new WebSocket('ws://localhost:8123/');
con.onopen = function() {
    Story.log( "<1-You have entered a new world!->" );
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
    if (data.id !== undefined) {
        Story.intro();
        //world = Object.assign(data.world);
        Client.playerID = data.id.toString();
        console.log("playerID set to " + Client.playerID);
		autoLogin();
    }

    // received chunk from server
    else if (data.chunk) {

        var chunk = data.chunk;
        world.chunks[data.key] = chunk;
		
		var clientPlayer = chunk.players[Client.playerID];
		Object.assign( Client, clientPlayer );
        renderer.update( world, clientPlayer.x, clientPlayer.y );

    }
	
	// received chat from server
	else if (data.say) {
        Story.log("<a-" + data.name + "->: " + data.say);
    }

	// primarily for debugging
    else if (data == 'ping!') {
        console.log('ping: ' + Date.now());
    }

    return true;

}

/**
 *
 */
function autoLogin() {
	
	Command.execute( "new" );
	Command.execute( "test" );
	Command.execute( "pass" );
	
}
