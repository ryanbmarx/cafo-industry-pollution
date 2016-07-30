var CafoMapSelect = function(options){
	// Bind handlers to select menu
	var forEach = Array.prototype.forEach;
	forEach.call(options.menu, menu => {
		menu.addEventListener('change', function(e){
 	 		e.preventDefault();
 	 		// update choropleth map base on selected <option>

 	 		// Send that category to the analytics method of the map class
			options.map.trackButtonClick("Map data changed to " + e.target.value);

			options.map.updateMapData(e.target.value);
 	 	}, false);
	});
};
module.exports = CafoMapSelect;

