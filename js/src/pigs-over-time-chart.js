// Formatting http://koaning.s3-website-us-west-2.amazonaws.com/html/d3format.html
// TODO: Add dynamic chart title, y-axis label
// TODO: Fill out the stubbed legend method
// TODO: Figure out the redraw function

var $ = require('jquery');
var d3 = require('d3');
var pigChart = require('./pigChart');

var PigsOverTimeChart = function(options){
	
	var app = this;
	app.options = options;
	app.data = options.data;
	app._category = options.category;
	
	app.chart = pigChart();
	// app.draw(app._category);
	
}

PigsOverTimeChart.prototype.renderLegend = function(category){
	var app = this;
	console.log('drawing new legend');
}

PigsOverTimeChart.prototype.draw = function(category){
	var app = this;
	d3.select(app.options.container)
		.datum(app.selectData(category, app.data))
		.call(app.chart);
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