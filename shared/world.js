/**
 * @module
 */

(function() {

	//
	var server = typeof require !== "undefined";
	if (server) {
		Simplex = require('../shared/simplex.js');
		Chunk = require('../shared/chunk.js');
		Cell = require('../shared/cell.js');
	}

	/**
	 * @constructor
	 * @param opts
	 * @param opts.name Name of the world, use for saving.
	 * @param opts.chunkWidth The width of each chunk in the world.
	 * @param opts.chunkHeight The height of each chunk in the world.
	 * @param opts.width The width, in chunks, of the world.
	 * @param opts.height The height, in chunks, of the world.
	 * @param opts.generate Whether the world should generate, or start blank.
	 */
	var world = function(opts = {}) {

		// get values or set defaults
		this.chunkWidth = opts.chunkWidth || 64;
		this.chunkHeight = opts.chunkHeight || 64;
		this.width = opts.width || 4;
		this.height = opts.height || 4;
		this.dataMethod = 1;
		this.chunks = {};
		this.name = opts.name || 'world';
		this.changes = {};

		// generate self
		if (opts.generate)
			this.generate();
		else
			this.blank();

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
	 * In absence of generation, we can create a blank world.
	 */
	world.prototype.blank = function() {

		for (var x = 0; x < this.width; x++)
		for (var y = 0; y < this.height; y++) {

			var index = y * this.width + x;
			this.chunks[index] = new Chunk({
				x: x,
				y: y,
				width: this.chunkWidth,
				height: this.chunkHeight,
				dataMethod: this.dataMethod
			});

		}

	}

	/**
	 * Generates the world.
	 */
	world.prototype.generate = function() {

		console.log("generating world...");
		var totalSize = this.width * this.height,
			currentSize = 0;

		for (var x = 0; x < this.width; x++)
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
			if (server) {
				//throws an error as a service.
				/*process.stdout.clearLine();
				process.stdout.cursorTo(0);
				process.stdout.write(report);
				if (currentSize === totalSize) {
					process.stdout.write("\n");
				}*/
			} else {
				(progress % 20 == 0) && console.log(report);
			}

		}

	}

	/**
	 * Returns the chunk that the given player is currently in.
	 * @param {object} pos Position object, must contain "x" and "y" properties.
	 */
	world.prototype.getChunk = function(pos) {
		var index = this.getChunkIndex(pos);
		return this.chunks[index];
	}

	/**
	 * Returns the ID of the chunk that the given player is currently in.
	 * @param {object} pos Position object, must contain "x" and "y" properties.
	 */
	world.prototype.getChunkIndex = function(pos) {
		var x = ~~(pos.x / this.chunkWidth),
			y = ~~(pos.y / this.chunkHeight),
			index = y * this.width + x;
		return index;
	}

	/**
	 * Just a nifty function to output the world as a bitmap, so it can be human observable in all it's glory!
	 */
	world.prototype.saveAsPNG = function() {

		var hexToRgb = function(hex) {
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
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
		for (var y = 0; y < h; y++)
			for (var x = 0; x < w; x++) {

				var chunk = this.getChunk({x: x, y: y});
				var cx = x - chunk.realX,
					cy = y - chunk.realY;
				var cell = chunk.getCell({x: cx, y: cy});

				var perm = Simplex.permutation[(y + (y * 48) + x) % 512],
					colors = cell.color.length,
					ci = perm % colors,
					color = hexToRgb(cell.color[ci]);

				canvasData.data[i + 0] = color.r;
				canvasData.data[i + 1] = color.g;
				canvasData.data[i + 2] = color.b;
				canvasData.data[i + 3] = 255;
				i += 4;
			}

		ctx.putImageData(canvasData, 0, 0);

		//
		canv.toBlob(function(blob) {
			var download = document.createElement("A");
			download.href = URL.createObjectURL(blob);
			download.download = "test.png";
			download.click();
		});


	}

	// export
	if (typeof module === "undefined")
		window["World"] = world
	else
		module.exports = world;

})();
