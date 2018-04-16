
(function() {

	var command = {

		test: {
			_execute: exeTest
		}

	}

	/**
	 *
	 */
	command.execute = function( cmd ) {
		
		if ( typeof command[cmd] !== "undefined" )
			command[cmd]._execute();
		else
			Story.log( "Unknown command: " + cmd );
		
	}

	/**
	 *
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