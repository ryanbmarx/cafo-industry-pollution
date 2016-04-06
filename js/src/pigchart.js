var d3 = require('d3');

var pigChart = function(){

	var margin = {top: 20, right: 20, bottom: 70, left: 80},
		outerWidth, 
		outerHeight = 500,
		width,
		height = outerHeight - margin.top - margin.bottom,
		x = d3.scale.ordinal(),
		y = d3.scale.linear();

	var component = function(selection){
		selection.each(function(data) {
			let container = d3.select(this);

			container.selectAll('*').remove();
			
			outerWidth = container.node().offsetWidth;
			width = outerWidth - margin.left - margin.right;

			x.rangeBands([0,width], .1)
				.domain(data.map(d => d.year));

			y.range([0, height])
				.domain([0,d3.max(data, d => {
					return d.big + d.rest;
				})]);

			var xAxis = d3.svg.axis()
				.scale(x)
				.tickSize(1)
				.orient('bottom');

			var yAxis = d3.svg.axis()
				.scale(y)
				.tickSize(1)
				.orient('left');

			var chart = container
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
				.attr("y", d => height - y(d.big))
				.attr("height", d => y(d.big))
				.attr("width", x.rangeBand())
				.attr('class', 'bar big');

			bar.append("rect")
				.attr("y", d => (height - y(d.rest) - y(d.big)))
				.attr("height", d => y(d.rest))
				.attr("width", x.rangeBand())
				.attr('class', 'bar rest');

			bar.append("text")
				.attr("x", x.rangeBand()/2)
				.attr("y", d => height - y(d.big) + 3)
				.attr("dy", "-.75em")
				.text(d => {
					if (d.type == "currency"){
						return d3.format("$,")(d.big)
					} else {
						return d3.format(",")(d.big)
					}
				}).attr('class', 'bar-label')
				.attr('text-anchor', 'middle');

			bar.append("text")
				.attr("x", x.rangeBand()/2)
				.attr("y", d => height - y(d.rest) - y(d.big) + 3)
				.attr("dy", "-.75em")
				.text(d => {
					if (d.type == "currency"){
						return d3.format("$,")(d.rest)
					} else {
						return d3.format(",")(d.rest)
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
		});
	};


	return component;
};

module.exports = pigChart;