var CafoProfileButtons = function(options){

	// Bind click handlers to button elements
	var forEach = Array.prototype.forEach;
	forEach.call(options.buttons, button => {
		button.addEventListener('click', function(e){
			e.preventDefault();

			// Send word to the analytics method of the map class that a new profile has been selected.
			options.map.trackButtonClick("One profile navigated");

			// update choropleth map base on selected button/data- attribute
			if(this.dataset.direction == "next"){
				options.map.showNextPollutionEvent();
			} else {
				options.map.showPreviousPollutionEvent();
			}
		}, false);
	});
};
module.exports = CafoProfileButtons;
