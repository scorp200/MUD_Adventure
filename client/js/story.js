
(function() {
	
	// cache DOM
	var el = document.querySelector( "#story" ),
		domStory = document.querySelector("#story div"),
		lines = [];

	/**
	 * @namespace
	 */
	var story = {
		
		/**
		 * Scripted introduction.
		 */
		intro: function() {
			
			story.space();
			story.log( "<dg-Having thus far enjured a life of materialistic wants under the oppressive grind of capitalism., you decided something drastic had to change with your life. You tried many things, such as taking up Yoga, veganism, and having tiny fish eat the old dead skin off your feet. But, for whatever reason, none of this seemed to help. You decided there was only one thing for it, a pilgrimage to Dogeylvania; where you could really get in touch with nature and \"find yourself\"->" );
			story.space();
			story.log( "<dg-After many dissapointing attempts booking flights and hotels, none of which exist in Dogeylvania, you finally found your way. The only passage to Dogeylvania was by ship, just one ship in fact, a rotten old thing that barely classifies as a dinghy, captained by a rugged old seafarer name Ted. Nether the less, you braved the trip.->" );
			story.space();
			story.log( "<dg-But, one does not simply float into Dogeylvania. During the journey you grow skeptical of Ted. You ask him how far we are from our destination, he replies that he hasn't the faintest idea and it's his first day on the job, and something about him being paid in whiskey and Vimto. You, expectedly, start to worry. This worry seems to manifest as a thick fog decends, the waves grow higher, stronger and thunder crackles through your senses. By now, even in this dazed state, you realize Ted has gone and you're on your own. Then, sheer blackness overtakes you, and everything slows to a stop...->" );
			story.space();
			story.log( "<r-If you're a stranger to these lands, type <g-new-> into the command console to create a new character. If you're already trapped here, type <g-login-> followed by your character name and password.'->" );
			
		},
		
		/**
		 * Prints the given text on a new line.
		 * @param {string} text
		 */
		log: function( text ) {
			
			// final print + scroll
			var atBottom = (el.scrollHeight - el.scrollTop === el.clientHeight);
			
			if ( lines.length > 0 && lines[lines.length-1] === text ) {
				
				// increment line counter at end
				var child = domStory.children[lines.length-1];
				var count = Number(child.textContent.slice(-1));
				count = (isNaN(count)) ? 2 : count + 1;
				text += " <1-x" + count + "->";
				child.innerHTML = story.parseTags(text);
				
			} else {
				
				// original text, new p tag
				var p = document.createElement( "P" );
				p.innerHTML = story.parseTags(text);
				domStory.appendChild( p );
				lines[domStory.children.length-1] = text;
				
			}
			
			if (atBottom)
				el.scrollTop = el.scrollHeight;
			
		},
		
		/**
		 * Completely removes the previously printed line.
		 * @param {string} text
		 */
		remove: function() {
			var child = domStory.children[lines.length-1];
			domStory.removeChild( child );
		},
		
		/**
		 * Replces the text on the previously printed line with the given text.
		 * @param {string} text
		 */
		replace: function( text ) {
			story.remove();
			story.log( text );
		},
		
		/**
		 * Appends the given text to the previously printed line.
		 * @param {string} text
		 */
		append: function( text ) {
			var child = domStory.children[lines.length-1];
			story.parseTags( text );
			child.innerHTML += text;
		},
		
		/**
		 * Adds an empty line.
		 */
		space: function() {
			var atBottom = (el.scrollHeight - el.scrollTop === el.clientHeight);
			domStory.innerHTML += "<br/>";
			if (atBottom) el.scrollTop = el.scrollHeight;
		},
		
		/**
		 * Completely removes all text from the story box.
		 */
		clear: function() {
			domStory.innerHTML = "";;
			lines = [];
		},
		
		/**
		 * Parses the tags in a given text string.
		 * @param {string}
		 */
		parseTags: function( text ) {
			var prefix = "<span style='color: ";
			text = text.split( "<w-" ).join( prefix + "#ffffff;'>" );
			text = text.split( "<1-" ).join( prefix + "#555555;'>" );
			text = text.split( "<r-" ).join( prefix + "#ff0000;'>" );
			text = text.split( "<dg-" ).join( prefix + "#00aa00;'>" );
			text = text.split( "<g-" ).join( prefix + "#00ff00;'>" );
			text = text.split( "<b-" ).join( prefix + "#0000ff;'>" );
			text = text.split( "<a-" ).join( prefix + "#00ffff;'>" );
			text = text.split( "->" ).join( "</span>" );
			return text;
		}
		
	}

	// export
	if ( typeof module === "undefined" )
		window["Story"] = story
	else
		module.exports = story;
		
})();