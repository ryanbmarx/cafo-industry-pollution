/*

##TO DO
- Remove jquery from button class toggles
- Make legend renderer


*/
var $ = require('jquery');
var L = require('leaflet');
require('./stamen-tiles');
var d3 = require('d3');

function getCountyOpacity(d, attribute) {
	// This function will return the proper colors for the choropleth. 
	// The `attribute` argument is used in case I want to wire up other 
	// attributes which would need a bespoke set of buckets.
	
	var baseOpacity = 1;

	// ## GLOSSARY
	// "hog_farms_1000" = Number of farms with 1,000 or more hogs

	if (attribute == "hogs_data_FARM_1000"){
		return 	d > 10000 	? 	baseOpacity :
				d > 13		? 	baseOpacity * .5 :
				d > 4  		? 	baseOpacity * .25 :
				d > 2  		? 	baseOpacity * .1 :
								'0';
	} else if (attribute == "hogs_data_HOGS_1000"){
		return 	d > 200000 	? 	baseOpacity :
								'0';
	} else{
		return .5;
	}
}

function getScales(counties) {
  var scales = {};

  // TODO: populate scales

  return scales;
}



var CafoMap = function(options){
	var app = this;
	app.options = options;
	app._propertyToMap = app.options.propertyToMap;
	
	//Make a new map
	var map = app.map = L.map(document.getElementById(app.options.mapTargetID),
        {
            center: [39.739190, -89.503629],
            zoom: 7
        }
	);

	// Add the fricking cool map tiles
	var layer = new L.StamenTileLayer("toner");
	map.addLayer(layer);

	// Lay the choropleth
	// TODO: Use fetch polyfill to do JSON request instead of jQuery.
	// Or just use straight-up XHR
	$.getJSON( options.dataRootUrl + "hogs_data.geojson", function(data){
		app.scales = getScales(data.features);
		app.countyLayer = L.geoJson(data.features, {
			style: app.styleCounties.bind(app)
		}).addTo(map);
	});

}

CafoMap.prototype.styleCounties = function(feature){
	var app = this;
    return {
        fillColor: app.options.countyFillColor,
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: getCountyOpacity(
        	feature["properties"][app._propertyToMap],
        	app._propertyToMap,
        	app.scales[app._propertyToMap]
        )
    };
}

CafoMap.prototype.updateCountyFill = function(property){
	// This method is to be used when switching data sets for the chorpleth
	var app = this;
	app._propertyToMap = property;
	app.countyLayer.eachLayer(function(layer){
		app.countyLayer.resetStyle(layer);
	});
}

var CafoMapButtons = function(options){
	// Bind click handlers to button elements
	var forEach = Array.prototype.forEach;
	forEach.call(options.buttons, button => {
		button.addEventListener('click', function(e){
 	 		e.preventDefault();
 	 		// update choropleth map base on selected button/data- attribute
			options.map.updateCountyFill(this.dataset.feature);
			forEach.call(options.buttons, button => {
				button.classList.remove('active');
			});
			this.classList.add('active');
 	 	}, false);
	});
};


window.CafoMap = CafoMap;
window.CafoMapButtons = CafoMapButtons;