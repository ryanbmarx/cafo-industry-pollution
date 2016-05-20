// Formatting http://koaning.s3-website-us-west-2.amazonaws.com/html/d3format.html
// TODO: Add dynamic chart title, y-axis label
// TODO: Fill out the stubbed legend method
// TODO: Figure out the redraw function

var $ = require('jquery');
var d3 = require('d3');
var pigChart = require('./pigChart');
var debounce = require('lodash/debounce');

var PigsOverTimeChart = function(options){
	
	var app = this;
	app.options = options;
	app.data = options.data;
	app._category = options.category;
	
	app.chart = pigChart();

		


}

PigsOverTimeChart.prototype.initResizeHandler = function(){
	d3.select(window).on('resize', this.draw())
}


PigsOverTimeChart.prototype.setCategory = function(category){
	this._category = category;
	return this;
}

PigsOverTimeChart.prototype.renderLegend = function(category){
	var app = this;
	console.log('drawing new legend');
}

PigsOverTimeChart.prototype.draw = function(){
	var app = this;

	// Draw the chart use an app variable to define the data
	d3.select(app.options.container)
		.datum(app.selectData(app._category, app.data))
		.call(app.chart);

	// After drawing the chart, we want to make sure to debounce the redraw
	d3.select(window).on('resize',debounce(function(){
		app.draw();
	}, 300));
	return app;
}

PigsOverTimeChart.prototype.selectData = function(category, data){
	return data.map(d => {
		return {
			year: d.year,
			type: d[category].type,
			big: d[category].big,
			rest: d[category].rest
		};
	});
}


module.exports = PigsOverTimeChart;