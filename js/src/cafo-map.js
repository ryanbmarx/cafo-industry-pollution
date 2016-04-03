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
		app.renderLegend(app._propertyToMap);
	});
	// console.log(app.options.profileOptions);
	$.getJSON(options.dataRootUrl + "../data.json", function(data){
		
		var pointsData = data.profiles;
		pointsData.forEach( point => {
			// The first row of points data actually is labels/descriptions from
			// spreadsheet. This uses the lat and tests if it is a number. If it is,
			// then add point. If it isn't, then skip (b/c it is probably label)
			if (!isNaN(parseFloat(point.lat))){
				// L.circleMarker({ lat:parseFloat(point.lat), lng:parseFloat(point.lng)}, app.stylePollutionEvents.bind(app))
				L.circleMarker(
					{lat:parseFloat(point.lat), lng:parseFloat(point.lng)},
					app.stylePollutionEvents(app)
				).on('click', function(e){
					app.showPollutionProfile(e);
				})
				.addTo(map);
			}
		});
		// console.log(app.styleCounties.bind(app));
	});			
}

CafoMap.prototype.showPollutionProfile = function(e){
	console.log("click", e);
}

CafoMap.prototype.styleCounties = function(feature){
	var app = this;

	let options = app.options.countyOptions;
	let scale = app.scales[app._propertyToMap];
	let datum = feature["properties"][app._propertyToMap]

    return {
        fillColor: options.fillColor,
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: scale(datum)
    };
}

CafoMap.prototype.stylePollutionEvents = function(feature){
	var app = this;
	let options = app.options.profileOptions;
	// TODO: Figure out why the danged circles are yellow.
    return {
        weight: options.strokeWidth,
        opacity: 1,
        color: options.strokeColor,
		fillColor: options.fillColor,
        fillOpacity: options.fillOpacity,
        className:'profile-marker',
        radius:options.radius
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

var formatNumbers = function(numbers, formatType){
	var retVal = [];
	if (formatType == "dollars"){
		numbers.forEach(number => {
			// TODO: Format $$ with commas
			retVal.push(number);
		});
	} if(formatType == "integer"){
		numbers.forEach(number => {
			// TODO: Format as integer, with commas
			retVal.push(number);
		});
	} else {
		// TODO: Defaults to regular 1-decimal-point numbers with commas
		numbers.forEach(number => {
			retVal.push(number);
		});
	}
	return retVal;
}

CafoMap.prototype.renderLegend = function(property){
	var app = this;
	var dataLookup = app.options.dataLabelLookup[property],
		mapRange = app.scales[property].range(),
		opacitiesText = "",
		countyBackgroundFill = hexToRgb(app.options.countyOptions.fillColor),
		thresholds = formatNumbers(app.scales[property].quantiles(), dataLookup.type),
		thresholdText = "",
		profileOptions = app.options.profileOptions,
		profilesFill = hexToRgb(profileOptions.fillColor);

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
					${countyBackgroundFill.r},
					${countyBackgroundFill.g},
					${countyBackgroundFill.b},
					${mapRange[i]}
					);'></span>
				</dt>
				<dd>
					${thresholdText}
				</dd>
			`;
		}
	var pollutionEventText = `
		<hr class='legend__divider'>
		<dt>
			<span class='box circle' style='background:rgba(
				${profilesFill.r},
				${profilesFill.g},
				${profilesFill.b},
				${profileOptions.fillOpacity}
			);border:${profileOptions.strokeWidth}px solid ${profileOptions.strokeColor};'></span>
		</dt>
		<dd>${profileOptions.label}</dd>
	`;	
	var legendOutput = `
		<div class='legend'>
			<h4 class='label'>${dataLookup.primary}</h4>
			<h5 class='sublabel'>${dataLookup.secondary}</h5>
			<dl>
				${opacitiesText}
				${pollutionEventText}
			</dl>
		</div>
	`;
	app.options.legendContainer.innerHTML = legendOutput;
}

module.exports = CafoMap;