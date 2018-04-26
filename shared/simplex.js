
(function() {
	
	// setup
	var permutation = [];
	for ( var n=0; n<512; n++ ) {
		permutation[n] = ~~( Math.random() * 256 );
	}

	/**
	 *
	 */
	var simplex = {
		
		//
		permutation: permutation,
		
		/**
		 *
		 */
		getHeight: function( x, y, gain, freq, octaves ) {
			
			var total = 0,
				amplitude = gain,
				lacunarity = 2.0;

			for ( i=0; i<octaves; i++ ) {
				total += simplex.noise( x*freq, y*freq ) * amplitude;
				freq *= lacunarity;
				amplitude *= gain;
			}

			return total;
			
		},
		
		/**
		 *
		 */
		gradient: function( h, u, v ) {
		
			h = h & 7;

			if ( h >= 4 ) {
				var a = u;
				u = v;
				v = a;
			}

			if ( h & 1 ) {
				
				if ( h & 2 )
					return -u + -2.0 * v;
				else
					return -u + 2.0 * v;
				
			} else {
				
				if ( h & 2 )
					return  u + -2.0 * v;
				else
					return  u + 2.0 * v;
				
			}
		
		},
		
		/**
		 *
		 */
		noise: function( x, y ) {
		
			var s = (x+y)*0.366025403;
			var i = Math.floor(x + s);
			var j = Math.floor(y + s);

			var t = (i+j)*0.211324865;
			var x0 = x-(i-t);
			var y0 = y-(j-t);

			var i1 = (x0 > y0);

			var x1 = x0 - i1  + 0.211324865;
			var y1 = y0 - !i1 + 0.211324865;
			var x2 = x0 - 0.57735027;
			var y2 = y0 - 0.57735027;

			var ii = i & 255;
			var jj = j & 255;
			
			var plist = permutation;

			var total = 0;
			var t0 = 0.5 - x0*x0-y0*y0;
			if (t0 >= 0) {
				total += Math.pow(t0, 4) * simplex.gradient(plist[ii+plist[jj]], x0, y0); 
			}

			var t1 = 0.5 - x1*x1-y1*y1;
			if (t1 >= 0) {
				total += Math.pow(t1, 4) * simplex.gradient(plist[ii+i1+plist[jj+!i1]], x1, y1);
			}

			var t2 = 0.5 - x2*x2-y2*y2;
			if (t2 >= 0) {
				total += Math.pow(t2, 4) * simplex.gradient(plist[ii+1+plist[jj+1]], x2, y2);
			}

			return 40 * total;
		
		}
		
	
	}
	
	// export
	if ( typeof module === "undefined" )
		window["Simplex"] = simplex
	else
		module.exports = simplex;

})();