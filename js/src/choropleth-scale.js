import {scaleQuantile} from 'd3-scale'

function choropolethScale(){
	
	var realScale = scaleQuantile();

	function scale(value){
		if (!value) {
			return 0;
		} 

		return realScale(value);
	}

	scale.domain = function(value){
		if (!arguments.length){
			return realScale.domain();
		}

		// Filter our data to only values that are numeric
		realScale.domain(value.filter(v =>{
			// Test if value is a number. 
	    	return toString.call(v) === '[object Number]';
		}));
		return scale;
	}

	scale.range = function(value){
		if (!arguments.length){
			return realScale.range();
		}
		realScale.range(value);
		return scale;
	}

	scale.quantiles = function(){
		return realScale.quantiles();
	}

	return scale;
}

module.exports = choropolethScale;