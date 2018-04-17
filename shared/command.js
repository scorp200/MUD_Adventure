
(function() {

	var command = {
		
		_capture: null,

		"test": { _execute: exeTest },
		"say": { _execute: exeSay },
		"new": { _execute: exeNew }

	}

	/**
	 * Attemps to execute the given command.
	 * @param {string} cmd The command the execute.
	 */
	command.execute = function( cmd ) {
		
		// if console is not waiting to capture input
		if ( command._capture === null ) {
			
			// separate root command and send anything else as a parameter
			var index = cmd.indexOf( " " ),
				first = cmd.substr( 0, ( index === -1 ) ? cmd.length : index ),
				theRest = cmd.replace( first+" ", "");
			
			// if command exists, execute it with remaining text as parameter
			if ( typeof command[first] !== "undefined" )
				command[first]._execute( theRest );
			else
				Story.log( "Unknown command: " + first );
			
		}
		
		// waiting to capture input
		else {
		
			var check = command._capture.check;
			if ( check === null || check( cmd ) ) {
				command._capture.success( cmd );
			} else {
				command._capture.fail( cmd );
			}
		
		}
		
	}
	
	/**
	 * Prints a string to the Story, with the current character's name.
	 * @param {string} text The text to "say"
	 */
	function exeSay( text ) {
		
		Story.log( "<a-" + Client.characterName + "->: " + text );
		
	}

	
	/** 
	 * Asks for a new character name, with basic filter system.
	 * When input is accepted, goes onto exePassword().
	 */
	function exeNew() {
		
		Story.log( "Creating a new character..." );
		Story.log( "Please enter the name of your character:" );
		command._capture = {
			check: function( x ) {
				return x !== "fuck";
			},
			success: function( x ) {
				Client.characterName = x;
				Story.log( x + ", huh? I guess that'll do." );
				exePassword();
			},
			fail: function() {
				Story.log( "Terrible name! Try again:" );
			}
		}
		
	}
	
	/**
	 * Asks for a new character password.
	 * Completion finishes character creation.
	 */
	function exePassword() {
		
		Story.log( "Please enter a password:" );
		command._capture = {
			check: null,
			success: function( x ) {
				Client.characterPass = x;
				Story.log( "You now exist!" );
				command._capture = null;
			},
			fail: function() { Story.log( "Try again:" ); }
		}
		
	}

	/**
	 * Just a test function. If this doesn't work, something is very wrong!
	 */
	function exeTest() {
		
		Story.log( "Yep, the command system seems to be working..." );
		
	}

	// export
	if ( typeof module === "undefined" )
		window["Command"] = command
	else
		module.exports = command;
		
})();