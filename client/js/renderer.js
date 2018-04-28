(function() {

	// cache
	var domMap = document.getElementById("map");
	var permutation = Simplex.permutation;

	/**
	 * @constructor
	 */
	renderer = function() {

		this.width = 15;
		this.height = 15;
		this.autoSize();
		this.field = [];

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
	 * Sets the width and height of the renderer (in tiles)
	 * based on the size of the parent element
	 */
	renderer.prototype.createField = function() {
		
		var main = document.createElement( "DIV" );
		
		for ( var y=0; y<this.height; y++ ) {
			
			var row = document.createElement( "DIV" );
			row.classList.add( "row" );
			main.appendChild( row );
			
			for ( var x=0; x<this.width; x++ ) {
				
				var cell = document.createElement( "DIV" );
				cell.style.width = "12px";
				cell.style.height = "12px";
				cell.style.backgroundColor = "#FFFFFF";
				cell.style.backgroundImage = "url(test/codepage-437.png)";
				cell.style.backgroundPosition = "0px 0px";
				this.field[y*this.width+x] = cell.style;
				row.appendChild( cell );
				
			}
			
		}
		
		domMap.appendChild( main );
		
	}

	/**
	 * Iterates through the map and builds a HTML string.
	 */
	renderer.prototype.update = function( world, position ) {

		var time = Date.now();
		var chunks = {};
		var players = {};
		
		// center view on given location
		var wx = position.x;
		var	wy = position.y;
		wx -= ~~(this.width / 2);
		wy -= ~~(this.height / 2);

		// render base map
		for ( var y=wy; y<wy+this.height; y++ )
		for ( var x=wx; x<wx+this.width; x++ ) {

			// get chunk and cell
			var cX = ~~(x/world.chunkWidth);
			var cY = ~~(y/world.chunkHeight);
			var cKey = cY * world.width + cX;
			var chunk = world.chunks[cKey];
			var cell = undefined;
			if ( chunk ) {
				chunks[cKey] = chunk;
				var cx = x - chunk.x * world.chunkWidth,
					cy = y - chunk.y * world.chunkHeight,
					index = cy * world.chunkWidth + cx;
				cell = chunk.data[index];
			}

			//
			var cellDiv = this.field[(y-wy)*this.width+(x-wx)];
			//console.log( cell );
			if ( cell ) {
				
				if ( typeof cell === "number" )
					cell = { draw: Cell.getPropertiesById( cell ) };
				//console.log( cell );

				// if valid/in bounds
				var perm = permutation[(y + (y*48) + x) % 512],
					tiles = cell.draw.tiles.length,
					index = perm % tiles,
					tile = cell.draw.tiles[index],
					colors = cell.draw.color.length,
					ci = perm % colors,
					color = cell.draw.color[ci];
				
				cellDiv.backgroundColor = color;
				cellDiv.backgroundPosition = tile;

			} else {
				
				// out of bounds
				cellDiv.backgroundColor = "#000";
				
			}
			
		}
		
		//
		Object.keys( chunks ).forEach( function( key ) {
			var chunk = chunks[key];
			Object.assign( players, chunk.players );
		} );
		
		this.renderPlayers( world, wx, wy, players );

	}
	
	/**
	 *
	 */
	renderer.prototype.renderPlayers = function( world, wx, wy, players ) {
		
		// render players
		var w = this.width,
			h = this.height,
			field = this.field;
		
		Object.keys(players).forEach( function( key ) {
			
			var p = players[key];
			if ( !p ) {
				console.log( "error, unknown player(s): ", players );
				return;
			}
			
			var x = p.x - wx,
				y = p.y - wy;
			
			if ( x>0 && y>0 && x<w && y<h ) {
				
				var chunkX = ~~(p.x/world.chunkWidth),
					chunkY = ~~(p.y/world.chunkHeight),
					chunkIndex = chunkY * world.width + chunkX,
					chunk = world.chunks[chunkIndex];
					
				var cellX = (p.x - chunk.x * world.chunkWidth),
					cellY = (p.y - chunk.y * world.chunkHeight),
					cellIndex = cellY * chunk.width + cellY,
					cell = chunk.data[cellIndex];
				
				if ( Client.playerID === key ) {
					tile = "-24px -0px";
					color = Client.color;
				} else {
					tile = "-12px -0px"
					color = "#ffff00";
				}
				
				//
				var cellDiv = field[y*w+x];
				cellDiv.backgroundColor = color;
				cellDiv.backgroundPosition = tile;
				
			}
			
		} );
		
	}
	
	/**
	 * @param {Image} image
	 */
	renderer.prototype.renderImage = function( image ) {
		
		var that = this;
		var image = new Image();
		
		image.onload = function() {
			
			var canvas = document.createElement( "CANVAS" );
			canvas.width = image.width;
			canvas.height = image.height;
			var ctx = canvas.getContext( "2d" );
			ctx.drawImage( image, 0, 0 );
			var data = ctx.getImageData( 0, 0, canvas.width, canvas.height ).data;
			
			var i = 0;
			for ( var y=0; y<that.height; y++ )
			for ( var x=0; x<that.width; x++ ) {
				var cellDiv = that.field[y*that.width+x];
				
				r = data[i];
				g = data[i+1];
				b = data[i+2];
				i += 4;

				var cell = "";
				if ( r === 255 && g === 255 && b === 255 ) cell = "mountain";
				if ( r === 0 && g === 255 && b === 0 ) cell = "grass";
				if ( r === 255 && g === 0 && b === 0 ) cell = "drylands";
				if ( r === 0 && g === 0 && b === 255 ) cell = "sea";

				if ( cell !== "" ) {
					
					cell = { draw: Cell.getPropertiesByName( cell ) };
					
					var perm = permutation[(y + (y*48) + x) % 512],
						tiles = cell.draw.tiles.length,
						index = perm % tiles,
						tile = cell.draw.tiles[index],
						colors = cell.draw.color.length,
						ci = perm % colors,
						color = cell.draw.color[ci];
					
					cellDiv.backgroundColor = color;
					cellDiv.backgroundPosition = tile;
					
				} else {
					cellDiv.backgroundColor = "#000";
				}

			}
			
		}
		
		image.src = "test/title.png";
		
	}

	// export
	if ( typeof module === "undefined" )
		window["Renderer"] = renderer
	else
		module.exports = renderer;

})();
