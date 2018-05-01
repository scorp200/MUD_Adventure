(function() {
    var actions = {
        'cut': { _execute: exeAction },
        'mine': { _execute: exeAction }
    }
    actions.game = null;
    actions.execute = function(cmd, opts = {}) {
        var index = cmd.indexOf(" "),
            first = cmd.substr(0, (index === -1) ? cmd.length : index),
            theRest = cmd.replace(first + " ", "");

        // if command exists, execute it with remaining text as parameter
        if (typeof actions[first] !== "undefined")
            actions[first]._execute(first, theRest, opts);
        else
            console.log('Attempted to execute unknown Action' + first);
    }

    function exeAction(action, dir, opts = {}) {
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
    }

    module.exports = actions;
})();
