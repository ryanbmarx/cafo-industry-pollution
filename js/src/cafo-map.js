var $ = require('jquery');
var L = require('leaflet');
require('./stamen-tiles');
var d3 = require('d3');

function getCountyOpacity(d, attribute, scale) {

	/*
		d = datum
		attribute = the property being depicted on the map
		scale = the appropriate scale for the attribute from the scales object
	*/

	console.log(d, attribute, scale(d));
	return scale(d);
}

function getScales(counties) {
	// Counties is the entire geoJSON dataset.

	// These are the available datasets (each is a domain)
	let dataSets=[
		"hogs_data_FARM_1000",
		"hogs_data_HOGS_1000",
		"hogs_data_SALES_ALL",
		"hogs_data_NUMBER_12",
		"hogs_data_DOLLARS_12",
		"hogs_data_FERT_ACRES",
		"hogs_data_MANURE_ACRES",
		"hogs_data_CORN_ACREA",
		"hogs_data_CORN_BUSHELS",
		"hogs_data_WORKERS"
	];

	// These are the desired opacities (the desired range)
	let opacities = [0, .25, .5, .75, .95];

	// This object will hold the scales
	let scales = {};

	dataSets.forEach( dataSet => {
		scales[dataSet] = d3.scale.quantile()
			.domain(counties.map(county => county.properties[dataSet] || 0 ))
			.range(opacities);	
	});
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
		console.log(app.scales.hogs_data_FARM_1000.domain());
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

module.exports = CafoMap;