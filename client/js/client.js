// cache DOM
var domTools = document.getElementById("tools"),
    domCharacter = document.getElementById("character");

/**
 * @namespace
 */
Client = {

    characterName: "",
    characterPass: "",
    color: "#FFFFFF",
    playerID: null,
    chunk: null,
    position: {
        x: 80,
        y: 40
    },
    socket: null,

    /**
     * Refreshes the player's stats in the DOM.
     */
    refreshStats: function() {
        var elHP = document.querySelector("#character .health");
        var elHUN = document.querySelector("#character .hunger");
        var elHYD = document.querySelector("#character .hydration");
        elHP.textContent = "HP: " + (Client.hp || 0);
        elHUN.textContent = "HUN: " + (Client.hunger || 0);
        elHYD.textContent = "HYD: " + (Client.hydration || 0);
    }

}

//
var world = new World();
var renderer = new Renderer();
renderer.createField();
//renderer.renderImage();

world.generate();
renderer.update(world, Client.x, Client.y);
world.saveAsPNG();

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
    Story.log('<r-Whoops there was a problem entering the world...->');
}

con.onclose = function(err) {
    console.log('socket closed');
    Story.log('<r-The world has been lost...-> <w-refresh?->');
    socket = null;
}

con.onmessage = function(msg) {
    var data = JSON.parse(msg.data);
    // error
    if (data.error) {
        Story.log("<r-" + data.error + "->");
    }

    // get the client id from the server
    if (data.id !== undefined) {
        Story.intro();
        Client.playerID = data.id.toString();
        console.log("playerID set to " + Client.playerID);
        //autoLogin();
    }

    // get the world from the server
    if (data.player !== undefined) {
        Object.assign(Client, data.player);
        Client.refreshStats();
    }

    // get the world from the server
    if (data.world !== undefined) {
        world = new World(data.world);
        console.log("data.world");
        Story.log("<1-you now see the vast world->");
    }

    // received update from server
    if (data.update) {
        data.update.forEach(function(update) {

            if (update.change) {
                console.log("update.change");
                //cell change code goes here it should be 11/10 and no less
            }

            // player moved
            else if (update.move) {
                world.chunks[update.index].players[update.move] = update.position;
                if (update.index != update.oldIndex)
                    delete world.chunks[update.oldIndex].players[update.move];
                if (update.move.toString() == Client.playerID) {
                    Client.position.x = update.position.x;
                    Client.position.y = update.position.y;
                }
            }

            // player say
            else if (update.say) {
                console.log("update.say");
                Story.log("<a-" + update.name + "->: " + update.say);
            }

            //get new chunks
            else if (update.chunk) {
                console.log("update.chunk");
                var x = update.chunk.x,
                    y = update.chunk.y,
                    i = y * world.width + x;
                world.chunks[i] = update.chunk;
                console.log(msg);
            }
        });
        Object.keys(world.chunks).forEach(function(index) {
            var chunk = world.chunks[index];
            //console.log(index, chunk.playerCount);
        });
        renderer.update(world, Client.position);
    }

    // primarily for debugging
    if (data == 'ping!') {
        console.log('ping: ' + Date.now());
    }

    return true;

}

var sendToServer = function(data) {
    try {
        socket.send(JSON.stringify(data));
    } catch (e) {
        console.log('error sending data: ' + e);
    }
}

/**
 *
 */
function autoLogin() {
    Command.execute("new");
    Command.execute("test");
    Command.execute("pass");
}
