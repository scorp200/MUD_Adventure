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

    function exeAction(dir, opts = {}, toAction) {
        if (server) {
            var player = opts.player;
            var world = opts.world;
            var aPos = Object.assign({}, player.position);

            actions.utils.applyDir(aPos, dir);

            var chunk = world.getChunk(aPos);
            aPos.x -= chunk.x * world.chunkWidth;
            aPos.y -= chunk.y * world.chunkHeight;
            var cell = chunk.getCell(aPos);
            if (cell.actions) {
                var action = cell.actions[toAction];
                action.drop ? drop(action.drop, player) : null;
                action.change ? change(action.change, cell) : null;
                action.required ? required(action.required, player) : null;
            } else
                actions.game.pushUpdate({ error: 'nothing to ' + toAction + ' here :(' }, { client: player });
        } else {
            if (Utils.checkDir(dir))
                sendToServer({ command: toAction + ' ' + dir });
            else {
                Story.log('Please use n, e, s or w for direction!');
            }
        }
    }

    function drop(drop, player) {
        actions.game.dropItem(player, drop);
    }

    function change(change, cell) {
        console.log(change)
    }

    function required(req, player) {
        console.log(req);
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
