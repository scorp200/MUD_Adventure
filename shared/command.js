(function() {

    // cache DOM
    var domCommand = document.querySelector("#command input");
    var server = false;
    domCommand.onkeydown = function(e) {

        //wait for connection
        if (Client.socket == null)
            return;

        // if enter key pressed
        if (e.key === "Enter") {
            var cmd = domCommand.value;
            Command.execute(cmd);
            domCommand.value = "";
        }

    }

    //
    var command = {

        _capture: null,

        "test": { _execute: exeTest },
        "say": { _execute: exeSay },
        "new": { _execute: exeNew },
        "move": { _execute: exeMove },
		"n": { _execute: exeMove.bind( null, "n" ) },
		"e": { _execute: exeMove.bind( null, "e" ) },
		"s": { _execute: exeMove.bind( null, "s" ) },
		"w": { _execute: exeMove.bind( null, "w" ) }

    }

    /**
     * Attemps to execute the given command.
     * @param {string} cmd The command the execute.
     */
    command.execute = function(cmd) {

        // if console is not waiting to capture input
        if (command._capture === null) {

            // separate root command and send anything else as a parameter
            var index = cmd.indexOf(" "),
                first = cmd.substr(0, (index === -1) ? cmd.length : index),
                theRest = cmd.replace(first + " ", "");

            // if command exists, execute it with remaining text as parameter
            if (typeof command[first] !== "undefined")
                command[first]._execute(theRest);
            else
                Story.log("Unknown command: " + first);

        }

        // waiting to capture input
        else {

            var check = command._capture.check;
            if (check === null || check(cmd)) {
                command._capture.success(cmd);
            } else {
                command._capture.fail(cmd);
            }

        }

    }

    /**
     * Prints a string to the Story, with the current character's name.
     * @param {string} text The text to "say"
     */
    function exeSay(text) {
        if (server) {

        } else
            Story.log("<a-" + Client.characterName + "->: " + text);

    }


    /**
     * Asks for a new character name, with basic filter system.
     * When input is accepted, goes onto exePassword().
     */
    function exeNew() {
        if (!server) {
            Story.log("Creating a new character...");
            Story.space();
            Story.log("Please enter the name of your character:");
            command._capture = {
                check: function(x) {
                    return x !== "fuck";
                },
                success: function(x) {
                    Client.characterName = x;
                    Story.log(x + ", huh? I guess that'll do.");
                    Story.space();
                    exePassword();
                },
                fail: function() {
                    Story.log("Terrible name! Try again:");
                }
            }
        }

    }

    /**
     * Asks for a new character password.
     * Completion finishes character creation, and sends the information to the server
     */
    function exePassword() {
        if (!server) {
            Story.log("Please enter a password:");
            command._capture = {
                check: null,
                success: function(x) {
                    Client.characterPass = x;
                    Story.log("You now exist!");
                    Story.space();
                    command._capture = null;
                    try {
                        socket.send(JSON.stringify(Client));
                    } catch (e) {
                        console.log('error sending client data: ' + e);
                    }
                },
                fail: function() {
                    Story.log("Try again:");
                }
            }
        }
    }
    /**
     * Move to a specified direction
     */
    function exeMove(dir) {
        if (server) {

        } else {
            if (dir == 'n' || dir == 'e' || dir == 's' || dir == 'w') {
                Story.log('Moving ' + dir);
				
				switch ( dir ) {
					case ( "n" ): Client.y -= 1; break;
					case ( "e" ): Client.x += 1; break;
					case ( "s" ): Client.y += 1; break;
					case ( "w" ): Client.x -= 1; break;
				}
				
				Client.updatePosition();
				domMap = document.getElementById("map");
				renderer.update( world, Client.x, Client.y );
				
                try {
                    var cmd = {
                        command: 'move',
                        opt: dir
                    };
                    socket.send(JSON.stringify(cmd));
                } catch (e) {
                    console.log('error sending command data: ' + e);
                }
            } else {
                Story.log('Please use n,e,s,w for direction!');
            }
        }
    }

    /**
     * Just a test function. If this doesn't work, something is very wrong!
     */
    function exeTest() {

        Story.log("Yep, the command system seems to be working...");

    }

    // export
    if (typeof module === "undefined")
        window["Command"] = command
    else {
        server = true;
        module.exports = command;
    }

})();
