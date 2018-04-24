(function() {

    // cache DOM
    var domCommand;
    //
    var command = {

        _capture: null,

        // stop expanding these! They easily fit on one line
        "test": {
            _execute: exeTest
        },
        "say": {
            _execute: exeSay
        },
        "new": {
            _execute: exeNew
        },
        "login": {
            _execute: exeLogin
        },
        "move": {
            _execute: exeMove
        },
        "look": {
            _execute: exeLook
        },
        "n": {
            _execute: exeMove.bind(null, "n")
        },
        "e": {
            _execute: exeMove.bind(null, "e")
        },
        "s": {
            _execute: exeMove.bind(null, "s")
        },
        "w": {
            _execute: exeMove.bind(null, "w")
        }

    }
    var server = false;
    command.game = null;
    /**
     * Attemps to execute the given command.
     * @param {string} cmd The command the execute.
     */
    command.execute = function(cmd, opts = {}) {

        // if console is not waiting to capture input
        if (command._capture === null) {

            // separate root command and send anything else as a parameter
            var index = cmd.indexOf(" "),
                first = cmd.substr(0, (index === -1) ? cmd.length : index),
                theRest = cmd.replace(first + " ", "");

            // if command exists, execute it with remaining text as parameter
            if (typeof command[first] !== "undefined")
                command[first]._execute(theRest, opts);
            else if (server)
                console.log('Attempted to execute unknown command ' + first);
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
     * Asks for a new character name, with basic filter system.
     * When input is accepted, goes onto exePassword().
     */
    function exeLogin(x) {

        if (server)
            return;

        try {
            x = x.split(" ");
            socket.send(JSON.stringify({
                type: "login",
                name: x[0],
                pass: x[1]
            }));
        } catch (e) {
            console.log('error sending client data: ' + e);
        }

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
                    Story.log("<a-" + x + "->, huh? I guess that'll do.");
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

        if (server)
            return;

        Story.log("Please enter a password:");
        command._capture = {
            check: null,
            success: function(x) {
                Client.characterPass = x;
                Story.log("You now exist!");
                Story.space();
                command._capture = null;
                try {
                    socket.send(JSON.stringify({
                        type: "new",
                        name: Client.characterName,
                        pass: Client.characterPass
                    }));
                } catch (e) {
                    console.log('error sending client data: ' + e);
                }
            },
            fail: function() {
                Story.log("Try again:");
            }
        }
    }

    /**
     * Look around at current surroundings
     */
    function exeLook() {

        if (server)
            return;

        Story.log("You take a look around at your surroundings...");

        var getCell = function(x, y) {
            var chunk = world.chunks[~~(x / world.chunkWidth) + "-" + ~~(y / world.chunkHeight)];
            var cell = chunk.data[(x - chunk.x * world.chunkWidth) + "-" + (y - chunk.y * world.chunkHeight)];
            return cell;
        }

        //
        var north = getCell(Client.x, Client.y - 1).type;
        var east = getCell(Client.x + 1, Client.y).type;
        var south = getCell(Client.x, Client.y + 1).type;
        var west = getCell(Client.x - 1, Client.y).type;
        Story.log("There's " + north + " to the north.");
        Story.log("There's " + east + " to the east.");
        Story.log("There's " + south + " to the south.");
        Story.log("There's " + west + " to the west.");

    }


    /**
     * Prints a string to the Story, with the current character's name.
     * @param {string} text The text to "say"
     */
    function exeSay(text, opts) {
        if (server) {
            command.game.pushUpdate({
                say: text,
                name: opts.player.name
            });
        } else {
            try {
                var cmd = {
                    command: 'say ' + text
                };
                socket.send(JSON.stringify(cmd));
            } catch (e) {
                console.log('error sending command data: ' + e);
            }
        }
        //Story.log("<a-" + Client.characterName + "->: " + text);
    }


    /**
     * Move to a specified direction
     */
    function exeMove(dir, opts = {}) {

        var player = opts.player;

        if (server) {

            var world = command.game.world;

            var newPos = Object.assign({}, player.position);
            switch (dir) {
                case ("n"):
                    newPos.y -= 1;
                    break;
                case ("e"):
                    newPos.x += 1;
                    break;
                case ("s"):
                    newPos.y += 1;
                    break;
                case ("w"):
                    newPos.x -= 1;
                    break;
            }
            //test if cell is walkable
            if (newPos.x >= 0 &&
                newPos.y >= 0 &&
                newPos.x < opts.world.width * opts.world.chunkWidth &&
                newPos.y < opts.world.height * opts.world.chunkHeight) {

                Object.assign(player.position, newPos);
                command.game.updatePlayerPosition(player);
                command.game.pushUpdate({
                    move: player.id.toString(),
                    position: newPos
                }, {
                    key: opts.world.getChunk(newPos)
                });
            }

        } else {
            if (dir == 'n' || dir == 'e' || dir == 's' || dir == 'w') {
                Story.log('Moving ' + dir);
                try {
                    var cmd = {
                        command: 'move ' + dir
                    };
                    socket.send(JSON.stringify(cmd));
                } catch (e) {
                    console.log('error sending command data: ' + e);
                }
            } else {
                Story.log('Please use n, e, s or w for direction!');
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
    if (typeof module === "undefined") {
        window["Command"] = command;
        domCommand = document.querySelector("#command input");
        domCommand.onkeydown = function(e) {

            //wait for connection
            if (Client.socket == null)
                return;

            // if enter key pressed
            if (e.key === "Enter") {
                var cmd = domCommand.value;
                command.execute(cmd);
                domCommand.value = "";
            }

        }
    } else {
        server = true;
        module.exports = command;
    }

})();
