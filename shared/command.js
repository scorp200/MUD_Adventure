
(function() {

	var command = {
		_capture: null,

		"test": { _execute: exeTest },
		"say": { _execute: exeSay },
		"new": { _execute: exeNew }

	}

	/**
	 *
	 */
	command.execute = function( cmd ) {
		
		// if console is not waiting to capture input
		if ( command._capture === null ) {
			
			var index = cmd.indexOf( " " ),
				first = cmd.substr( 0, ( index === -1 ) ? cmd.length : index ),
				theRest = cmd.replace( first+" ", "");
			
			console.log( index, first, theRest );
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
	
	/** */
	function exeSay( text ) {
		Story.log( "<a-" + Client.characterName + "->: " + text );
	}

	
	/** */
	function exeNew() {
		Story.log( "Creating a new character..." );
		Story.log( "Please enter the name of your character:" );
		command._capture = {
			check: function( x ) { return x !== "fuck"; },
			success: function( x ) {
				Client.characterName = x;
				exePassword();
			},
			fail: function() {
				Story.log( "Terrible name! Try again:" );
			}
		}
	}
	
	/** */
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

	/** */
	function exeTest() {
		Story.log( "Yep, the command system seems to be working..." );
	}

	// export
	if ( typeof module === "undefined" )
		window["Command"] = command
	else
		module.exports = command;
		
})();