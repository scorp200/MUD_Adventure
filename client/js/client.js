
// cache DOM
var domTools = document.getElementById( "tools" ),
	domCharacter = document.getElementById( "character" ),
	domMap = document.getElementById( "map" ),
	domStory = document.querySelector( "#story div" ),
	domCommand = document.querySelector( "#command input" );

//
var world = new World();
domMap.innerHTML = world.render();

//
domCommand.onkeydown = function( e ) {
	if ( e.key === "Enter" ) {
		
		// scrolling element
		var el = document.querySelector( "#story" )
		var atBottom = ( el.scrollHeight - el.scrollTop === el.clientHeight );
		
		// grab command, "print" it and clear input
		// Do something with command later
		var cmd = domCommand.value;
		domStory.innerHTML += "<p>" + cmd + "</p>"
		domCommand.value = "";
		
		// if at bottom, stay there
		if ( atBottom ) el.scrollTop = el.scrollHeight;
		
	}
}