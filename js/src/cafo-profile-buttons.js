var CafoProfileButtons = function(options){
	console.log(options);
	// Bind click handlers to button elements
	var forEach = Array.prototype.forEach;
	forEach.call(options.buttons, button => {
		button.addEventListener('click', function(e){
			e.preventDefault();
			// update choropleth map base on selected button/data- attribute
			if(this.dataset.direction == "next"){
				console.log('next');
				options.map.showNextPollutionEvent();
			} else {
				console.log('back');
				options.map.showPreviousPollutionEvent();
			}
		}, false);
	});
};
module.exports = CafoProfileButtons;
