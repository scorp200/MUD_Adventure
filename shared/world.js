(function() {

    //
    if (typeof require !== "undefined") {
        Simplex = require('../shared/simplex.js');
        Chunk = require('../shared/Chunk.js');
        Cell = require('../shared/Cell.js');
        console.group = console.log;
        console.groupEnd = console.log;
    }

    /**
     * @constructor
     */
    var world = function(opts = {}) {

        // get values or set defaults
        this.chunkWidth = opts.chunkWidth || 64;
        this.chunkHeight = opts.chunkHeight || 64;
        this.width = opts.width || 2;
        this.height = opts.height || 2;
        this.dataMethod = 1;
        this.chunks = {};
        this.name = opts.name || 'world';

    }

    /**
     *
     */
    world.prototype.getProperties = function() {
        return {
            chunkWidth: this.chunkWidth,
            chunkHeight: this.chunkHeight,
            width: this.width,
            height: this.height,
            name: this.name
        };
    }

    /**
     *
     */
    world.prototype.generate = function() {

            console.group("generating world...");
            var totalSize = this.width * this.height,
                currentSize = 0;

            for (var x = 0; x < this.width; x++) {
                for (var y = 0; y < this.height; y++) {
                    currentSize++;
                    var index = y * this.width + x;
                    //console.log( "new chunk: " + index );
                    this.chunks[index] = new Chunk({
                        world: this,
                        x: x,
                        y: y,
                        width: this.chunkWidth,
                        height: this.chunkHeight,
                        dataMethod: this.dataMethod
                    });
                }
                var progress = ~~((currentSize / totalSize) * 100);
                if (progress % 20 == 0)
                    console.log("generation progress: " + progress + "%");
            }

            console.groupEnd();

        },

        /**
         * Returns the ID of the chunk that the given player is currently in.
         * @param {object} pos
         */
        world.prototype.getChunkIndex = function(pos) {
            var x = ~~(pos.x / this.chunkWidth),
                y = ~~(pos.y / this.chunkHeight),
                index = y * this.width + x;
            return index;
        }

    // export
    if (typeof module === "undefined")
        window["World"] = world
    else
        module.exports = world;

})();
