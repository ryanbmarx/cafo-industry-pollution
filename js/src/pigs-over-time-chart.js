// Formatting http://koaning.s3-website-us-west-2.amazonaws.com/html/d3format.html
// TODO: Add dynamic chart title, y-axis label
// TODO: Fill out the stubbed legend method
// TODO: Figure out the redraw function

var $ = require('jquery');
var d3 = require('d3');

var PigsOverTimeChart = function(options){
	
	var app = this;
	app.options = options;
	var data = options.data;
	app._category = options.category
	var margin = {top: 20, right: 20, bottom: 70, left: 80},
	outerWidth = app.options.container.offsetWidth,
	outerHeight = 500,
	width =  outerWidth - margin.left - margin.right,
	height = outerHeight - margin.top - margin.bottom;


	// Scales and axes
	var x = d3.scale.ordinal()
	.rangeBands([0,width], .1)
	.domain(data.map(d => d.year));

	var xAxis = d3.svg.axis()
	.scale(x)
	.tickSize(1)
	.orient('bottom');

	var y = d3.scale.linear()
	.range([0, height])
	.domain([0,d3.max(data, d => {
		return d[app._category].big + d[app._category].rest;
	})]);
	
	var yAxis = d3.svg.axis()
	.scale(y)
	.tickSize(1)
	.orient('left');

	// Make the chart
	var chart = d3.select(app.options.container)
	.append('svg')
	.attr("width", outerWidth)
	.attr("height", outerHeight)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var bar = chart.selectAll("g")
	.data(data)
	.enter().append('g')
	.attr('transform', function(d,i){
		return "translate(" + x(d.year) + ",0)";
	});

	bar.append("rect")
	.attr("y", d => height - y(d[app._category].big))
	.attr("height", d => y(d[app._category].big))
	.attr("width", x.rangeBand())
	.attr('class', 'bar big');

	bar.append("rect")
	.attr("y", d => (height - y(d[app._category].rest) - y(d[app._category].big)))
	.attr("height", d => y(d[app._category].rest))
	.attr("width", x.rangeBand())
	.attr('class', 'bar rest');

	bar.append("text")
	.attr("x", x.rangeBand()/2)
	.attr("y", d => height - y(d[app._category].big) + 3)
	.attr("dy", "-.75em")
	.text(d => {
		if (d[app._category].type == "currency"){
			return d3.format("$,")(d[app._category].big)
		} else {
			return d3.format(",")(d[app._category].big)
		}
	}).attr('class', 'bar-label')
	.attr('text-anchor', 'middle');

	bar.append("text")
	.attr("x", x.rangeBand()/2)
	.attr("y", d => height - y(d[app._category].rest) - y(d[app._category].big) + 3)
	.attr("dy", "-.75em")
	.text(d => {
		if (d[app._category].type == "currency"){
			return d3.format("$,")(d[app._category].rest)
		} else {
			return d3.format(",")(d[app._category].rest)
		}
	}).attr('class', 'bar-label')
	.attr('text-anchor', 'middle');


	chart.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")			
	.call(xAxis);

	chart.append("g")
	.attr("class", "y axis")
	.call(yAxis);

}

PigsOverTimeChart.prototype.renderLegend = function(category){
	var app = this;
	console.log('drawing new legend');
}

PigsOverTimeChart.prototype.draw = function(category){
	var app = this;
	console.log('redrawing chart');
}




	  module.exports = PigsOverTimeChart;