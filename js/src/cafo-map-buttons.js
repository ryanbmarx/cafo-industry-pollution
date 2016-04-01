var CafoMapButtons = function(options){
	// Bind click handlers to button elements
	var forEach = Array.prototype.forEach;
	forEach.call(options.buttons, button => {
		button.addEventListener('click', function(e){
 	 		e.preventDefault();
 	 		// update choropleth map base on selected button/data- attribute
			options.map.updateMapData(this.dataset.feature);
			forEach.call(options.buttons, button => {
				button.classList.remove('active');
			});
			this.classList.add('active');
 	 	}, false);
	});
};
module.exports = CafoMapButtons;