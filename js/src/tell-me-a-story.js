var $ = require('jquery');
var d3 = require('d3');

/*
    storytellingButton:document.getElementsByClassName('button--story'),
    text:storyText,
    chart:'.pigchart',
    chartButtons:pigChartButtons,
    timeInterval:'5000'
   */

function hide(el, transitionTime){
	// console.log('hiding', el, transitionTime)
	d3.select(el)
		.transition()
		.duration(transitionTime)
		.style('transform', 'scale(0)');
}

function show(el, transitionTime){
	// console.log('showing', el, transitionTime)
	d3.select(el)
		.transition()
		.duration(transitionTime)
		.style('transform', 'scale(1)');
}

function chapter1(app){
		console.log('chapter 1!!!');
		var chart = d3.select(app.options.chart);

		// Show the chart
		chart
			.transition()
			.style('opacity', 1);

		// render the bars for the first time.
	  	document.querySelector(".chart-button[data-chart='farms']").click();

	  	// Create/append the quote box and fill it with the first item;
	  	var annotation = chart.append('div')
	  		.classed('chart-annotation', true)
	  		.style({right: "0", top: "25%", background:'white'})
	  		.append('p')
	  			.text(app.text.chart1);
	  	hide('.changeline--big',150);
	  	hide('.changelabel--big', 150);
}
function chapter2(app){
		console.log('chapter 2!!!');

		var annotation_text = d3.select('.chart-annotation p')
			.text(app.text.chart2);

		show('.changeline--big',150)
		hide('.changeline--rest',150)
		show('.changelabel--big',150)
		hide('.changelabel--rest',150)	

}

function chapter3(app){
	  	document.querySelector(".chart-button[data-chart='pigs']").click();
		var annotation = d3.select('.chart-annotation')
			.style({
				top:"19%", 
				left:"13%",
				right:"auto",
				background: app.options.fadedBackground,
			    'box-shadow': app.options.boxShadow
			});

	  	var annotation_text = d3.select('.chart-annotation p')
			.text(app.text.chart3);
}

function chapter4(app){
	document.querySelector(".chart-button[data-chart='value']").click();
	var annotation_text = d3.select('.chart-annotation p')
			.text(app.text.chart4);
}
function chapter5(app){
	// We're leaving the chart, so hide the annotation
	hide('.chart-annotation', 300);

	// Find the map's position, then scroll there
	var mapIntroTop = d3.select('.pollution-map-intro').node().offsetTop;

	window.scrollTo(0, mapIntroTop);

	// Load the next text blurb
	d3.select('.pollution-map-intro').text(app.text.map_intro)

	window.setTimeout(function(){
		d3.select('.pollution-map')
			.transition()
			.style('opacity', 1);
	},3000)
}
function chapter6(app){}
function chapter7(app){}


var TellMeAStory = function(options){

	// MAIN CONSTRUCTOR HERE. START HERE

	var app = this;
	app.options = options;
	app.text = options.text;
	app.activeIndex = 5;

	$(app.options.storytellingButton).click(function(){
		// trigger the proper chapter function
		app.showStoryChapterByIndex(app.activeIndex);
		// get ready for the next one by increase the active index by 1
		app.activeIndex++;
	});
}

TellMeAStory.prototype.showStoryChapterByIndex = function(chapter){

		// This method triggers the individual chapters to be shown. I'd rather
		// concatenate the function call, but it was erroring when I tried using
		// d3.call(), so for now I will do it the long way. Not a bad way, per se,
		// but probably not the best way.

		var app = this;
		console.log('now showing chapter ' + chapter);
		switch(chapter) {
			case 0:
				chapter1(app)
				break;
			case 1:
				chapter1(app)
				break;
			case 2:
				chapter2(app)
				break;
			case 3:
				chapter3(app)
				break;
			case 4:
				chapter4(app)
				break;
			case 5:
				chapter5(app)
				break;
			case 6:
				chapter6(app)
				break;
			case 7:
				chapter7(app)
				break;
		}
}

module.exports = TellMeAStory;