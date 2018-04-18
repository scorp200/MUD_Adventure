// cache DOM
var domTools = document.getElementById("tools"),
    domCharacter = document.getElementById("character"),
    domMap = document.getElementById("map"),
    domStory = document.querySelector("#story div");

//
var world = new World();
domMap.innerHTML = world.render();
Story.intro();

//
Client = {

    characterName: "",
    characterPass: "",
	socket: null

}

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
    console.log(data);
    //get the world from the server
    if (data.world) {
        world.width = data.world.width;
        world.height = data.world.height;
        world.data = data.world.data;
        domMap.innerHTML = world.render();
    }
    if (data === 'ping!')
        Story.log('server has pinged! ' + Date.now());
}
