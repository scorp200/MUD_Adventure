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

    // export
    if (!server) {
        window["Utils"] = utils;
    } else {
        module.exports = utils;
    }
})();
