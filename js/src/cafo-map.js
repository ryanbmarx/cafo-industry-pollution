var $ = require('jquery');
var L = require('leaflet');
require('./stamen-tiles');
var d3 = require('d3');

function hexToRgb(hex) {
	// Found here: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
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
	let opacities = [0, .25, .39, .5, .95];

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
		app.countyLayer = L.geoJson(data.features, {
			style: app.styleCounties.bind(app)
		}).addTo(map);
	});

}

CafoMap.prototype.styleCounties = function(feature){
	var app = this;

	let scale = app.scales[app._propertyToMap];
	let datum = feature["properties"][app._propertyToMap]

    return {
        fillColor: app.options.countyFillColor,
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: scale(datum)
    };
}

CafoMap.prototype.updateMapData = function(property){
	// This method is to be used when switching data sets for the chorpleth
	var app = this;
	app._propertyToMap = property;
	app.countyLayer.eachLayer(function(layer){
		app.countyLayer.resetStyle(layer);
	});
	app.renderLegend(app._propertyToMap);
}

CafoMap.prototype.renderLegend = function(property){
	var app = this;
	console.log(app.scales[property].quantiles());
	var label = app.options.dataLabelLookup[property].primary,
		sublabel = app.options.dataLabelLookup[property].secondary,
		mapRange = app.scales[property].range(),
		opacitiesText = "",
		backgroundFill = hexToRgb(app.options.countyFillColor),
		thresholds = app.scales[property].quantiles(),
		thresholdText = "";

		for (var i=0;i<mapRange.length;i++){
			if (thresholds[i] == undefined){
				// TODO: Format and style these figures.
				thresholdText = "More than " + thresholds[i-1];
			} else if ( i === 0){
				// TODO: Format and style these figures.
				thresholdText = "0 to " + thresholds[i];
			} else {
				// TODO: Format and style these figures.
				thresholdText = thresholds[i-1] + " to " + thresholds[i];
			}
			opacitiesText += `
				<dt>
					<span class='box' style='background:rgba(
					${backgroundFill.r},
					${backgroundFill.g},
					${backgroundFill.b},
					${mapRange[i]}
					);'></span>
				</dt>
				<dd>
					${thresholdText}
				</dd>
			`;
		}
	var legendOutput = `
		<div class='legend'>
			<h4 class='label'>${label}</h4>
			<h5 class='sublabel'>${sublabel}</h5>
			<dl>${opacitiesText}</dl>
		</div>
	`;

	console.log(legendOutput);
	app.options.legendContainer.innerHTML = legendOutput;
}

module.exports = CafoMap;