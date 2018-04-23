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

        for (var x = 0; x < this.width; x++)
            for (var y = 0; y < this.height; y++) {

                //
                cX = this.x * this.width + x;
                cY = this.y * this.height + y;

                // base
                var type = "grass";

                //
                var river = Math.pow(Math.abs(Simplex.getHeight(cX, cY, 1, 0.0025, 3)), 2);
                tributary = Math.pow(Math.abs(Simplex.getHeight(cX, cY, 1, 0.04, 1)), 1.5);
                //river += height = Simplex.getHeight( cX, cY, 1, 0.01, 1 ) * 1;
                var moisture = river * 0.8 + Simplex.getHeight(cX, cY, 1, 0.16, 1) * 0.2;

                if (moisture > 1.5) {
                    type = "drylands";
                }

                // forests
                var forest = Simplex.getHeight(cX, cY, 1, 0.24, 1);
                if (forest > 0.85 || (forest > 0.5 && moisture < 0.5)) type = "tree";

                // mountain
                var height = Simplex.getHeight(cX, cY, 1, 0.01, 1) * 0.6;
                height += Simplex.getHeight(cX, cY, 1, 0.04, 1) * 0.2;
                height += Simplex.getHeight(cX, cY, 1, 0.16, 1) * 0.2;
                height *= river;
                if (height > 0.2) type = "mountain";

                // hills
                height *= 0.8;
                height += Simplex.getHeight(cY, cX, 1, 0.16, 1) * 0.2;
                if (height > 0.1 && height <= 0.2) type = "hill";

                // rivers
                if (river < 0.001) type = "water";
                tributary += river * 0.2;
                if (tributary < 0.025) type = "water";

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
