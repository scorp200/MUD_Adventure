(function() {
    var server = typeof module !== "undefined";

    var actions = {
        game: null,
        user: {
            'cut': { _execute: exeAction },
            'mine': { _execute: exeAction }
        }
    }

    actions.init = function(commands) {
        actions.commands = commands;
        Object.assign(commands.user, actions.user);
    }

    function exeAction(dir, opts = {}, action) {
        if (server) {
            var player = opts.player;
            var world = opts.world;
            var aPos = Object.assign({}, player.position);
            switch (dir) {
                case ("n"):
                    aPos.y -= 1;
                    break;
                case ("e"):
                    aPos.x += 1;
                    break;
                case ("s"):
                    aPos.y += 1;
                    break;
                case ("w"):
                    aPos.x -= 1;
                    break;
            }

            var chunk = world.getChunk(aPos);
            aPos.x -= chunk.x * world.chunkWidth;
            aPos.y -= chunk.y * world.chunkHeight;
            var cell = chunk.getCell(aPos);
            console.log(aPos);
            if (cell.action == action)
                actions.game.dropItem(player, cell);
            else
                actions.game.pushUpdate({ error: 'nothing to ' + action + ' here :(' }, { client: player });
        } else {
            if (Utils.checkDir(dir))
                sendToServer({ command: action + ' ' + dir });
            else {
                Story.log('Please use n, e, s or w for direction!');
            }
        }
    }

    //
    if (!server) {
        actions.init(Command);
    }

    // Export
    if (!server) {
        window["Action"] = actions;
    } else {
        module.exports = actions;
    }

})();
