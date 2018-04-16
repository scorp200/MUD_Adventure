
(function() {

	var command = {
		_capture: null,

		"test": {
			_execute: exeTest
		},
		
		"new": {
			_condition: "start",
			_execute: exeNew
		}

	}

	/**
	 *
	 */
	command.execute = function( cmd ) {
		
		console.log( command._capture );
		if ( command._capture === null ) {
			
			if ( typeof command[cmd] !== "undefined" )
				command[cmd]._execute();
			else
				Story.log( "Unknown command: " + cmd );
			
		} else {
		
			if ( command._capture.check === null || command._capture.check( cmd ) ) {
				command._capture.success();
			} else {
				command._capture.fail();
			}
		
		}
		
	}
	
/** */
function exeNew() {
	Story.log( "Creating a new character..." );
	Story.log( "Please enter the name of your character:" );
	command._capture = {
		check: function( x ) { return x !== "fuck"; },
		success: exePassword,
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
			success: function() {
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