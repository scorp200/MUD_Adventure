
(function() {
	
	// cache DOM
	var el = document.querySelector( "#story" ),
		domStory = document.querySelector("#story div"),
		lines = [];

	//
	var story = {
		
		intro: function() {
			
			story.space();
			
			story.log( "<r-Welcome to Dogeylvania, a land you never intended to spend much time in. You were part of a group, mercenaries, hired to guard a merchant caravan through this dangerous region. For some reason, you are abandoned. Maybe you were cut out so the others get a larger share. Or something terrible happened to the rest and you're all that's left. Either way, you're on your own now.->" );
			
			story.space();
			
			story.log( "<r-If you're a stranger to these lands, type <g-new-> into the command console to create a new character. If you're already trapped here, type <g-login-> followed by your character name and password.'->" );
			
			story.space();
			
		},
		
		log: function( text ) {
			
			// add colors
			var parseTags = function( text ) {
				text = text.split( "<1-" ).join( "<span style='color: #555555;'>" );
				text = text.split( "<r-" ).join( "<span style='color: #ff0000;'>" );
				text = text.split( "<g-" ).join( "<span style='color: #00ff00;'>" );
				text = text.split( "<b-" ).join( "<span style='color: #0000ff;'>" );
				text = text.split( "<a-" ).join( "<span style='color: #00ffff;'>" );
				text = text.split( "->" ).join( "</span>" );
				return text;
			}
			
			// final print + scroll
			var atBottom = (el.scrollHeight - el.scrollTop === el.clientHeight);
			
			if ( lines.length > 0 && lines[lines.length-1] === text ) {
				
				// increment line counter at end
				var child = domStory.children[lines.length-1];
				var count = Number(child.textContent.slice(-1));
				count = (isNaN(count)) ? 2 : count + 1;
				text += " <1-x" + count + "->";
				child.innerHTML = parseTags(text);
				
			} else {
				
				// original text, new p tag
				var p = document.createElement( "P" );
				p.innerHTML = parseTags(text);
				domStory.appendChild( p );
				lines[domStory.children.length-1] = text;
				
			}
			
			if (atBottom)
				el.scrollTop = el.scrollHeight;
			
		},
		
		/**
		 *
		 */
		space: function() {
			var atBottom = (el.scrollHeight - el.scrollTop === el.clientHeight);
			domStory.innerHTML += "<br/>";
			if (atBottom) el.scrollTop = el.scrollHeight;
		}
		
	}

	// export
	if ( typeof module === "undefined" )
		window["Story"] = story
	else
		module.exports = story;
		
})();