/**
 * @module
 */

(function() {

    //
    var server = typeof module !== "undefined";

    //
    var command = {

        _capture: null,
        game: null,

        // there happy? :D
        user: {
            "help": { _execute: exeHelp },
            "say": { _execute: exeSay },
            "new": { _execute: exeNew },
            "login": { _execute: exeLogin },
            "move": { _execute: exeMove },
            "movechunk": { _execute: exeMoveChunk },
            "look": { _execute: exeLook },
            "n": { _execute: exeMove.bind(null, "n") },
            "e": { _execute: exeMove.bind(null, "e") },
            "s": { _execute: exeMove.bind(null, "s") },
            "w": { _execute: exeMove.bind(null, "w") }
        }

    }

    /**
     * Attemps to execute the given command.
     * @param {string} cmd The command the execute.
     */
    command.execute = function(cmd, opts = {}) {

        // if console is not waiting to capture input
        if (command._capture === null) {

            // separate root command and send anything else as a parameter
            cmd = cmd.toLowerCase();
            var index = cmd.indexOf(" "),
                first = cmd.substr(0, (index === -1) ? cmd.length : index),
                theRest = cmd.replace(first + " ", "");

            // if command exists, execute it with remaining text as parameter
            if (typeof command.user[first] !== "undefined")
                command.user[first]._execute(theRest, opts, first);
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
     *
     */
    function exeHelp(x) {

        Story.space();
        Story.log("All commands:");
        Object.keys(command.user).forEach(function(name) {
            var desc = command.user[name]._execute.desc || "NO_DESC";
            Story.log("<g-" + name + "-> - <1-" + desc + "->");
        });
        Story.space();

    }

    /**
     * Asks for a new character name, with basic filter system.
     * When input is accepted, goes onto exePassword().
     */
    function exeLogin(x) {

        if (server)
            return;

        x = x.split(" ");
        sendToServer({
            type: "login",
            name: x[0],
            pass: x[1]
        })

    }

    exeLogin.desc = "Login with your character. Takes 2 extra parameters; your username and your password.";

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
                check: Filter.test, //function(x) {
                //return x !== "fuck";
                //},
                success: function(x) {
                    Client.characterName = x;
                    Story.append(" " + x);
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
                Story.append(" " + x);
                Story.log("You now exist!");
                Story.space();
                command._capture = null;
                sendToServer({
                    type: "new",
                    name: Client.characterName,
                    pass: Client.characterPass
                });
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

            var chunkX = ~~(x / world.chunkWidth),
                chunkY = ~~(y / world.chunkHeight),
                chunkIndex = chunkY * world.width + chunkX,
                chunk = world.chunks[chunkIndex];

            var cellX = x - chunk.x * world.chunkWidth,
                cellY = y - chunk.y * world.chunkHeight,
                cellIndex = cellY * world.chunkWidth + cellX,
                cell = chunk.data[cellIndex];

            return cell;

        }

        //
        var pos = Client.position;
        var north = Cell.getName(getCell(pos.x, pos.y - 1));
        var east = Cell.getName(getCell(pos.x + 1, pos.y));
        var south = Cell.getName(getCell(pos.x, pos.y + 1));
        var west = Cell.getName(getCell(pos.x - 1, pos.y));
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
                name: opts.name || opts.player.name
            }, {
                client: opts.client || null
            });
        } else {
            sendToServer({ command: 'say ' + text });
        }
    }

    /**
     * Move to next chunk
     * ONLY FOR TESTING
     */
    function exeMoveChunk(dir, opts = {}) {
        if (server) {
            opts.amount = 64;
            exeMove(dir, opts);
        } else {
            if (Utils.checkDir(dir)) {
                Story.log('Moving ' + dir);
                sendToServer({ command: 'moveChunk ' + dir });
            } else {
                Story.log('Please use n, e, s or w for direction!');
            }
        }
    }

    /**
     * Move to a specified direction
     */
    function exeMove(dir, opts = {}) {

        var player = opts.player;

        if (server) {

            var newPos = Object.assign({}, player.position);
            command.utils.applyDir(newPos);
            //test if cell is walkable
            if (newPos.x >= 0 &&
                newPos.y >= 0 &&
                newPos.x < opts.world.width * opts.world.chunkWidth &&
                newPos.y < opts.world.height * opts.world.chunkHeight) {
                //  var oldIndex = opts.world.getChunkIndex(player.position);
                Object.assign(player.position, newPos);
                var index = opts.world.getChunkIndex(newPos);
                command.game.updatePlayerPosition(player);
                command.game.pushUpdate({
                    move: player.id.toString(),
                    position: newPos,
                    index: index
                }, { index: index });
            }

        } else {
            console.log(Utils);
            if (Utils.checkDir(dir)) {
                Story.log('Moving ' + dir);
                sendToServer({ command: 'move ' + dir });
            } else {
                Story.log('Please use n, e, s or w for direction!');
            }
        }
    }


    // Setup command input box in DOM
    if (!server) {
        var domCommand = document.querySelector("#command input");
        domCommand.onkeydown = function(e) {

            //wait for connection
            if (socket == null)
                return;

            // if enter key pressed
            if (e.key === "Enter") {
                var cmd = domCommand.value;
                command.execute(cmd);
                domCommand.value = "";
            }

        }
    }

    // export
    if (!server) {
        window["Command"] = command;
    } else {
        module.exports = command;
    }

})();
