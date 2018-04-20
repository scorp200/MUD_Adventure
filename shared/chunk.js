(function() {

    //
    if (typeof require !== "undefined") {
        Simplex = require('../shared/simplex.js');
        Cell = require('../shared/Cell.js');
    }

    /**
     * @constructor
     */
    var chunk = function(opts) {

        this.x = opts.x || 0;
        this.y = opts.y || 0;
        this.width = opts.width || 16;
        this.height = opts.height || 16;
        this.data = {};
        this.players = {};
        this.playerCount = 0;
        this.generate();

    }

    /**
     *
     */
    chunk.prototype.generate = function() {

        console.log(this);
        for (var x = 0; x < this.width; x++)
            for (var y = 0; y < this.height; y++) {

                // create height
                var height = Simplex.getHeight(this.x * this.width + x, this.y * this.height + y, 1, 0.16, 1) + 1;
                type = (height > 1) ? "grass" : "tree";

                // set data
                this.data[x + "-" + y] = new Cell({
                    type: type
                });

            }

    }

    // export
    if (typeof module === "undefined")
        window["Chunk"] = chunk
    else
        module.exports = chunk;

})();
