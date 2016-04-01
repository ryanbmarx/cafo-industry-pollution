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

var CafoMap = function(options){
	var app = this;
	app.options = options;
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
	$.getJSON( data_root_url + "hogs_data.geojson", function(data){
	
		app.countyLayer = L.geoJson(data, {
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
        fillOpacity: getCountyOpacity(feature["properties"][app.options.propertyToMap], app.options.propertyToMap)
    };
}

CafoMap.prototype.updateCountyFill = function(property){
	// This method is to be used when switching data sets for the chorpleth
	var app = this;
	app.options.propertyToMap = property;
	app.countyLayer.eachLayer(function(layer){
		app.countyLayer.resetStyle(layer);
	});


}

// TODO: Initialize applicaton object in _content.html
// TODO: Find way around accessing global map object

var updateMap = function(property, button){
	// This is the main updating function
    // Property argument is the data to be applied to map
    // Button argument is the button needing the active class
    window.CafoMap.updateCountyFill(property);
    $('.map-button.active').removeClass('active');
    $(button).addClass('active');
}

window.onload = function(){
     window.CafoMap = new CafoMap({
    	/*Options here*/
    	mapTargetID:"map",
    	propertyToMap:"hogs_data_FARM_1000",
    	countyFillColor:"orange"
 	 });

 	 // Let's add some click handlers to the buttons
	window.mapButtons = document.getElementsByClassName('map-button');
 	 for (var i = 0; i < mapButtons.length; i++){
 	 	mapButtons[i].addEventListener('click', function(e){
 	 		e.preventDefault();
			var targetData = this.dataset.feature;
			updateMap(targetData, this);
 	 	}, {passive:true});
 	 }

 	 

}

// window.cafoMap = cafoMap;