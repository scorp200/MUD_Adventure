(function() {
	
	// cache
	var domMap = document.getElementById("map");

	//
	var permutation = [];
	for (  var n=0; n<512; n++ ) {
		permutation[n] = ~~( Math.random() * 512 );
	}
	
	/**
	 * @constructor
	 */
	renderer = function() {
		
		this.width = 15;
		this.height = 15;
		this.autoSize();
		
	};
	
	/**
	 * Sets the width and height of the renderer (in tiles)
	 * based on the size of the parent element
	 */
	renderer.prototype.autoSize = function() {
		this.width = ~~(domMap.clientWidth / 12);
		this.height = ~~(domMap.clientHeight / 12);
	}

	/**
	 * Iterates through the map and builds a HTML string.
	 */
	renderer.prototype.update = function( world, wx, wy ) {

		// center view on given location
		wx -= ~~(this.width / 2);
		wy -= ~~(this.height / 2);
	
		//
		var html = "<div>";
		for ( var y=wy; y<wy+this.height; y++ ) {
			html += "<div class='row'>";
			for ( var x=wx; x<wx+this.width; x++ ) {
				
				// get chunk and cell
				var chunk = world.chunks[~~(x/world.chunkWidth)+"-"+~~(y/world.chunkHeight)];
				var cell = undefined;
				if ( chunk )
					cell = chunk.data[(x-chunk.x*world.chunkWidth)+"-"+(y-chunk.y*world.chunkHeight)];
				
				// if valid/in bounds
				if ( cell ) {
					
					var tiles = cell.draw.tiles.length,
						index = permutation[(y + (y*48) + x) % 512] % tiles,
						tileX = cell.draw.tiles[index].x,
						tileY = cell.draw.tiles[index].y,
						colors = cell.draw.color.length,
						ci = permutation[(y + (y*48) + x) % 512] % colors,
						color = cell.draw.color[ci];
						
					// IGNORE THIS, INFACT NONE OF THIS IS HOW THINGS WILL ACTUALLY RENDER!!
					var key = "testID";
					if ( Client.playerID === key ) {
						var player = chunk.players[key];
						if ( player && player.x === x-chunk.x*world.chunkWidth && player.y === y-chunk.y*world.chunkHeight ) {
							tileX = 24;
							tileY = 0;
							color = "#00ffff";
						}
					}
					
				}
				
				// invalid/out of bounds
				else {
				
					tileX = 0;
					tileY = 0;
					color = "#000000";
				
				}

				html += "<div style=\"width: 12px; height: 12px; background-color: "+color+"; background-image: url(test/codepage-437.png); background-position: -"+tileX+"px -"+tileY+"px;\"></div>";

			}
			html += "</div>";
		}
		html += "</div>";

		//
		domMap.innerHTML = html;

	}
	
	// export
	if ( typeof module === "undefined" )
		window["Renderer"] = renderer
	else
		module.exports = renderer;

})();