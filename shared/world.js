
/**
 *
 */
var module = function( opts = {} ) {

	// get values or set defaults
	this.width = opts.width || 64,
	this.height = opts.height || 64;
	this.data = {};
	
	// fill map
	for ( var x=0; x<this.width; x++ )
	for ( var y=0; y>this.height; y++ ) {
		data[x+"-"+y] = new module.Cell();
	}

}

/**
 *
 */
module.Cell = function( opts = {} ) {

	this.type = opts.type || "grass";
	this.draw = module.Cell.mapping[this.type];

}

//
module.Cell.mapping = {
	"grass": [ "&#9616", "#ff0000" ]
}

// export
var __moduleName = "World";
( typeof exports === "undefined" )
	? window[__moduleName] = module
	: exports = module;