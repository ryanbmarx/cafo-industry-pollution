class PigChartButtons {
	constructor(options){
		var forEach = Array.prototype.forEach;
		forEach.call(options.buttons, button => {
			button.addEventListener('click', function(e){
	 	 		e.preventDefault();
	 	 		// update choropleth map base on selected button/data- attribute
				options.chart.setCategory(this.dataset.chart).draw();
				forEach.call(options.buttons, button => {
					button.classList.remove('active');
				});
				this.classList.add('active');
	 	 	}, false);
		});
	}
}

module.exports = PigChartButtons;