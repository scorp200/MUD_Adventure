
// cache DOM
var domTools = document.getElementById( "tools" ),
	domCharacter = document.getElementById( "character" ),
	domMap = document.getElementById( "map" ),
	domStory = document.getElementById( "story" ),
	domCommand = document.getElementById( "command" );

// placeholder stuff
domStory.innerHTML = window.backToTheIpsum;

//
var world = new World();
console.log( world );