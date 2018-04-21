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
	renderer.prototype.update = function( world, wx, wy ) {

		var time = Date.now();
		var chunks = {};
		var players = {};
	
		// center view on given location
		wx -= ~~(this.width / 2);
		wy -= ~~(this.height / 2);

		// render base map
		for ( var y=wy; y<wy+this.height; y++ )
		for ( var x=wx; x<wx+this.width; x++ ) {

			// get chunk and cell
			var cKey = ~~(x/world.chunkWidth)+"-"+~~(y/world.chunkHeight);
			var chunk = world.chunks[cKey];
			var cell = undefined;
			if ( chunk ) {
				chunks[cKey] = chunk;
				cell = chunk.data[(x-chunk.x*world.chunkWidth)+"-"+(y-chunk.y*world.chunkHeight)];
			}

			//
			var cellDiv = this.field[(y-wy)*this.width+(x-wx)];
			if ( cell ) {

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
		
		// render players
		var w = this.width,
			h = this.height,
			field = this.field;
		 
		Object.keys( chunks ).forEach( function( key ) {
			var chunk = chunks[key];
			Object.assign( players, chunk.players );
		} );
			
		Object.keys(players).forEach( function( key ) {
			
			var p = players[key],
				x = p.x - wx,
				y = p.y - wy;
			
			if ( x>0 && y>0 && x<w && y<h ) {
				
				var chunk = world.chunks[~~(p.x/world.chunkWidth)+"-"+~~(p.y/world.chunkHeight)];
				var cell = chunk.data[(p.x-chunk.x*world.chunkWidth)+"-"+(p.y-chunk.y*world.chunkHeight)];
				var cellDiv = field[y*w+x];
				
				if ( Client.playerID === key ) {
					tile = "-24px -0px";
					color = "#00ffff";
				} else {
					tile = "-12px -0px"
					color = "#ffff00";
				}
				
				//
				cellDiv.backgroundColor = color;
				cellDiv.backgroundPosition = tile;
				
			}
			
		} );
		
		//
		console.log( "Map rendered in " + (Date.now() - time) + "ms" );

	}

	// export
	if ( typeof module === "undefined" )
		window["Renderer"] = renderer
	else
		module.exports = renderer;

})();
