var CafoMapSelect = function(options){
	// Bind handlers to select menu
	var forEach = Array.prototype.forEach;
	forEach.call(options.menu, menu => {
		menu.addEventListener('change', function(e){
 	 		e.preventDefault();
 	 		// update choropleth map base on selected <option>
			options.map.updateMapData(e.target.value);
 	 	}, false);
	});


};
module.exports = CafoMapSelect;

