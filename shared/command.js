
(function() {

	var module = {

		test: {
			_execute: exeTest
		}

	}

	/**
	 *
	 */
	module.execute = function( cmd ) {
		
		if ( typeof module[cmd] !== "undefined" )
			module[cmd]._execute();
		
		else
			Story.log( "Unknown command: " + cmd, module	);
	}

	/**
	 *
	 */
	function exeTest() {
		Story.log( "Yep, the command system seems to be working..." );
	}

	// export
	var __moduleName = "Command";
	( typeof exports === "undefined" )
		? window[__moduleName] = module
		: exports = module;
		
})();