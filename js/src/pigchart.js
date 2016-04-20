var d3 = require('d3');

var formatNumber = function(d, number){
	if (d.type == "currency"){
		return d3.format("$,")(number);
	} else {
		return d3.format(",")(number);
	}
}


var pigChart = function(){

	var margin = {top: 20, right: 20, bottom: 70, left: 80},
		outerWidth, 
		outerHeight = 500,
		width,
		height = outerHeight - margin.top - margin.bottom,
		transitionTime = 1000,
		labelTransitionTime = 150,
		x = d3.scale.ordinal(),
		y = d3.scale.linear();

	var component = function(selection){
		selection.each(function(data) {
			let container = d3.select(this);

			// container.selectAll('*').remove();
			
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

			var chart = container;

			if(chart.select('svg').size() < 1){
				console.log('first time');

				chart = container
					.append('svg')
						.attr("width", outerWidth)
						.attr("height", outerHeight)
					.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
						.attr('class','chart-inner');
				var bar = chart.selectAll(".bar-wrapper")
						.data(data, d => d.year)
					.enter().append('g')
						.attr('class','bar-wrapper')
						.attr('transform', function(d,i){
							return "translate(" + x(d.year) + ",0)";
						});
				
				var bar = chart.selectAll(".bar-wrapper")
					.data(data);
				bar.selectAll('.bar--big')
						.data(d => [d])
					.enter()
					.append("rect")
						.attr("width", x.rangeBand())
						.attr('class', 'bar--big')
						.attr("y", height)
						.attr("height", 0);
		
				bar.selectAll(".bar--rest")
						.data(d => [d])
					.enter()
					.append("rect")
						.attr("width", x.rangeBand())
						.attr('class', 'bar--rest')
						.attr("y", height)
						.attr("height", 0);
					
				bar.selectAll('.bar-label--big')
						.data(d => [d])	
					.enter()
					.append("text")
						.attr('class', 'bar-label--big')
						.attr("x", x.rangeBand()/2)
						.style('opacity', 0)
						.attr("y", d => height - y(d.big) + 30)
						.attr("dy", "-.75em")
						.attr('text-anchor', 'middle');

				bar.selectAll('.bar-label--rest')
						.data(d => [d])
					.enter()
					.append("text")
						.attr('class', 'bar-label--rest')
						.attr("x", x.rangeBand()/2)
						.attr("dy", "-.75em")
						.attr('text-anchor', 'middle')
						.attr("y", d => height - y(d.rest) - y(d.big) + 30)
						.style('opacity', 0)

				chart.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")			
					.transition()
						.duration(transitionTime)
					.call(xAxis);
				
				chart.append("g")
					.attr("class", "y axis")
					.transition()
						.duration(transitionTime)
					.call(yAxis);
			} else {console.log('subsequent time');}
			
			var rebars = chart.selectAll(".chart-inner .bar-wrapper").data(data, d => d.year)
				
			// Size and transition the bars
			rebars.selectAll('.bar--big')
				.data(d => [d])
				.transition()
					.duration(transitionTime)
				.attr("y", d => height - y(d.big))
				.attr("height", d => y(d.big));
	
			rebars.selectAll('.bar--rest')
				.data(d => [d])
				.transition()
					.duration(transitionTime)
				.attr("y", d => (height - y(d.rest) - y(d.big)))
				.attr("height", d => y(d.rest));


			// Populate and place the text labels
			rebars.selectAll ('.bar-label--big')
				.data(d => [d])
				.transition()
					.duration(labelTransitionTime)
					.each("start", function(){
						d3.select(this).style('opacity', 0)
					})
					.each("end", function(){
						d3.select(this).text( d => {
							return formatNumber(d, d.big);
						})
						.attr("y", d => height - y(d.big) + 30);
					})
					.transition()
						.delay(transitionTime)
						.duration(labelTransitionTime)
					.style('opacity', 1)
					.attr("y", d => height - y(d.big) + 3);

			rebars.selectAll ('.bar-label--rest')
				.data(d => [d])
				.transition()
					.duration(labelTransitionTime)
					.each("start", function(){
						d3.select(this).style('opacity', 0)
					})
					.each("end", function(){
						d3.select(this).text( d => {
							return formatNumber(d, d.rest);
						})
						.attr("y", d => height - y(d.rest) - y(d.big) + 30);						
					})
				.style('opacity', 0)

				.transition()
					.delay(transitionTime)
					.duration(labelTransitionTime)
				.style('opacity', 1)
				.attr("y", d => height - y(d.rest) - y(d.big) + 3);
				
			chart.select(".y.axis")
				.transition()
					.duration(transitionTime)
				.call(yAxis);
		});
	};


	return component;
};

module.exports = pigChart;