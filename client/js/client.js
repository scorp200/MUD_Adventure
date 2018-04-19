// cache DOM
var domTools = document.getElementById("tools"),
    domCharacter = document.getElementById("character"),
    domMap = document.getElementById("map"),
    domStory = document.querySelector("#story div");

//
Client = {

    characterName: "",
    characterPass: "",
	playerID: "testID",
    socket: null

}

//
var world = new World();

// quick test, wang a player in a chunk!
var chunk = world.chunks["1-1"];
chunk.players["testID"] = {
	x: 1,
	y: 1
};

domMap.innerHTML = world.render();
Story.intro();

//server connection
var socket = null;
var con = new WebSocket('ws://localhost:8123/');
con.onopen = function() {
    Story.log('You have entered a new world!')
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
        world.width = data.world.world.width;
        world.height = data.world.world.height;
        world.data = data.world.world.data;
        domMap.innerHTML = world.render();
    }

    if (data == 'ping!') {
        console.log('ping: ' + Date.now());
    }

    return true;

}
