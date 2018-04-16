
(function() {

	//
	var story = {
		
		intro: function() {
			
			story.log( "<r-Welcome to Dogeylvania, a land you never intended to spend much time in. You were part of a group, mercenaries, hired to guard a merchant caravan through this dangerous region. For some reason, you are abandoned. Maybe you were cut out so the others get a larger share. Or something terrible happened to the rest and you're all that's left. Either way, you're on your own now.->" );
			
			story.log( "<r-If you're a stranger to these lands, type <g-new-> into the command console to create a new character. If you're already trapped here, type <g-login-> into the command console.'->" );
			
		},
		
		log: function( text ) {
			
			// add colors
			text = text.split( "<r-" ).join( "<span style='color: #ff0000;'>" );
			text = text.split( "<g-" ).join( "<span style='color: #00ff00;'>" );
			text = text.split( "->" ).join( "</span>" );
			
			// final print
			domStory.innerHTML += "<p>" + text + "</p>"
			
		}
		
	}

	// export
	if ( typeof module === "undefined" )
		window["Story"] = story
	else
		module.exports = story;
		
})();