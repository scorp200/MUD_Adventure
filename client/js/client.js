// cache DOM
var domTools = document.getElementById("tools"),
    domCharacter = document.getElementById("character");

//
Client = {

    characterName: "",
    characterPass: "",
    playerID: null,
    chunk: null,
    x: 80,
    y: 40,
    socket: null

}

//
var world = new World(),
    renderer = new Renderer();

renderer.createField();
renderer.update(world, Client.x, Client.y);

//server connection
Story.log("<1-Connecting...->");
var socket = null;
var con = new WebSocket(ServerConfig.path);
con.onopen = function() {
    Story.log("<1-You have entered a new world!->");
    Story.log("<1-waiting to open eyes....->");
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
        world = Object.assign(data.world);
        Client.playerID = data.id.toString();
        //renderer.update(world, Client.x, Client.y);
        Story.log("<1-you now see the vast world->");
        console.log("playerID set to " + Client.playerID);
        //autoLogin();
    }

    // received update from server
    else if (data.update) {
        data.update.forEach(function(update) {
            console.log(update);
            if (update.change) {
                //cell change code goes here it should be 11/10 and no less
            }

            // player moved
            else if (update.move) {
                world.chunks[update.key].players[update.move] = update.position;
                console.log(update.move == Client.playerID);
                if (update.move.toString() == Client.playerID) {
                    Client.x = update.position.x;
                    Client.y = update.position.y;
                }
            }

            // player say
            else if (update.say) {
                Story.log("<a-" + update.name + "->: " + update.say);
            }
        });
        renderer.update(world, Client.x, Client.y);
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

    Command.execute("new");
    Command.execute("test");
    Command.execute("pass");

}
