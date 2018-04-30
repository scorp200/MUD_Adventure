(function() {

    //
	var server = false;
    if (typeof require !== "undefined") {
		server = true;
        Simplex = require('../shared/simplex.js');
        Chunk = require('../shared/Chunk.js');
        Cell = require('../shared/Cell.js');
    }

    /**
     * @constructor
     */
    var world = function(opts = {}) {

        // get values or set defaults
        this.chunkWidth = opts.chunkWidth || 64;
        this.chunkHeight = opts.chunkHeight || 64;
        this.width = opts.width || 20;
        this.height = opts.height || 20;
        this.dataMethod = 1;
        this.chunks = {};
        this.name = opts.name || 'world';
		
		// generate self
		if (opts.generate)
			this.generate();

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

		console.log("generating world...");
		var totalSize = this.width * this.height,
			currentSize = 0;

		for (var x = 0; x < this.width; x++) {
			for (var y = 0; y < this.height; y++) {
				
				// create new chunk
				var index = y * this.width + x;
				this.chunks[index] = new Chunk({
					world: this,
					x: x,
					y: y,
					width: this.chunkWidth,
					height: this.chunkHeight,
					dataMethod: this.dataMethod
				});
				
				// report progress
				var progress = ~~((++currentSize / totalSize) * 100);
				var report = "generation progress: " + progress + "%";
				if ( server ) {
					process.stdout.clearLine();
					process.stdout.cursorTo(0);
					process.stdout.write(report);
					if (currentSize === totalSize ) {
						process.stdout.write("\n");
					}
				} else {
					(progress % 20 == 0) && console.log(report);
				}
				
			}
			
		}

	}
	
	/**
	 * Returns the chunk that the given player is currently in.
	 * @param {object} pos
	 */
	world.prototype.getChunk = function(pos) {
		var index = this.getChunkIndex(pos);
		return this.chunks[index];
	}

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
	
	/**
	 *
	 */
	world.prototype.saveAsPNG = function() {
		
		var hexToRgb = function( hex ) {
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt( result[1], 16 ),
				g: parseInt( result[2], 16 ),
				b: parseInt( result[3], 16 )
			} : null;
		}
	
		var w = this.width * this.chunkWidth,
			h = this.height * this.chunkHeight;
		
		var canv = document.createElement("CANVAS");
		canv.width = w;
		canv.height = h;
		
		var ctx = canv.getContext("2d");
		var canvasData = ctx.getImageData(0, 0, w, h);
		
		//
		var i = 0;
		for ( var y=0; y<h; y++ )
		for ( var x=0; x<w; x++ ) {
			
			var cX = ~~(x/this.chunkWidth);
			var cY = ~~(y/this.chunkHeight);
			var cKey = cY * this.width + cX;
			var chunk = this.chunks[cKey];
			var cx = x - chunk.x * this.chunkWidth,
				cy = y - chunk.y * this.chunkHeight,
				index = cy * this.chunkWidth + cx;
			var cell = Cell.getPropertiesById(chunk.data[index]);
			
			var perm = Simplex.permutation[(y + (y*48) + x) % 512],
				colors = cell.color.length,
				ci = perm % colors,
				color = hexToRgb(cell.color[ci]);
			
			canvasData.data[i+0] = color.r;
			canvasData.data[i+1] = color.g;
			canvasData.data[i+2] = color.b;
			canvasData.data[i+3] = 255;
			i += 4;
		}
		
		ctx.putImageData(canvasData, 0, 0);
		
		var download = document.createElement("A");
		download.href = canv.toDataURL("image/png");
		download.download = "test.png";
		download.click();
	
	}

    // export
    if (typeof module === "undefined")
        window["World"] = world
    else
        module.exports = world;

})();
