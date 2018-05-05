(function() {

    var server = typeof module !== "undefined";
    var utils = {};


    /**
     * Verifies if specified direction is acceptable
     * @param {string} dir
     */
    utils.checkDir = function(dir) {
        return dir == 'n' || dir == 'e' || dir == 's' || dir == 'w';
    }

    utils.applyDir = function(pos, dir) {
        switch (dir) {
            case ("n"):
                pos.y -= 1;
                break;
            case ("e"):
                pos.x += 1;
                break;
            case ("s"):
                pos.y += 1;
                break;
            case ("w"):
                pos.x -= 1;
                break;
        }
        return pos;
    }

    // export
    if (!server) {
        window["Utils"] = utils;
    } else {
        module.exports = utils;
    }
})();
