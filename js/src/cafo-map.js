var $ = require('jquery');
var L = require('leaflet');
require('./stamen-tiles');
import {format} from 'd3-format';
var _ = require('lodash/collection');
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';

var choroplethScale = require('./choropleth-scale');

var formatNumber = function(number){
	//Sometimes the numbers are served up from the spreadsheet as strings. 
	// Other times, they are actual numbers needing formatting
	if (typeof(number) == "number"){
		return format(",")(number);
	}
	return number;
}

var formatExcelDate = function(number){
		var options = {
			month:'short',
			day:"numeric",
			year:"numeric"
		};

		var newDate = new Date((number - (25567 + 1))*86400*1000);
		newDate = newDate.toLocaleDateString("en-us", options);
		return newDate;
}

var dateToApStyle = function (date){
	
	var stringDate = String(date)
		.replace("Jan", "Jan.")
		.replace("Feb", "Feb.")
		.replace("Mar", "March")
		.replace("Apr", "April")
		.replace("Jun", "June")
		.replace("Jul", "July")
		.replace("Aug", "Aug.")
		.replace("Sep", "Sept.")
		.replace("Oct", "Oct.")
		.replace("Nov", "Nov.")
		.replace("Dec", "Dec.");

	return stringDate;
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
	"hogs_data_CORN_ACRES",
	"hogs_data_CORN_BUSHELS",
	"hogs_data_WORKERS"
	];

	// These are the desired opacities (the desired range)
	let opacities = [.1, .25, .39, .5, .95];

	// This object will hold the scales
	let scales = {};

	dataSets.forEach( dataSet => {
		scales[dataSet] = choroplethScale()
		.domain(counties.map(county => county.properties[dataSet] ))
		.range(opacities);	
	});
	return scales;
}

var CafoMap = function(options){
	var app = this;
	app.options = options;
	app._propertyToMap = app.options.propertyToMap;
	app.activeIndex = -1;


	//Make a new map
	var map = app.map = L.map(document.getElementById(app.options.mapTargetID),
		{
			center: [39.739190, -89.503629],
			zoom: 7,
			scrollWheelZoom:false,
			maxZoom:10,
			maxBounds:L.latLngBounds(L.latLng(36.590379, -92.133247),L.latLng(42.478624, -87.015605))
		}
	);

	// Add the fricking cool map tiles
	var layer = new L.StamenTileLayer("toner");
	map.addLayer(layer);

	// Lay the choropleth
	// TODO: Use fetch polyfill to do JSON request instead of jQuery. Or just use straight-up XHR
	$.getJSON( options.dataRootUrl + "hogs_data.geojson", function(data){
		app.scales = getScales(data.features);
		app.countyLayer = L.geoJson(data.features, {
			style: app.styleCounties.bind(app)
		}).addTo(map);

		// Add pollution profiles to the map.
		$.getJSON(options.dataRootUrl + "pollution-events.json", function(data){
			
			app.profileData = _.sortBy(data, 'pollution_start');

			// This layer group will let me iterate over markers and style them.
			app.markers = L.layerGroup({});
			var counter = 0;

			var markerLookup = {}

			// This is the icon to be used for all profiles, except the one being highlighted
			app.pollutionIcon = L.divIcon({
				className:'profile-marker',
				html:"<span class='ring'></span>"
			});

			// This is the highlighted profile icon
			app.activePollutionIcon = L.divIcon({
				className:'profile-marker--active',
				html:"<span class='ring'></span>"
			});

			// Let's build an xScale to make a little timeline of pollution events. 
			// We only need to build it once, so we'll make it here and then pass
			// it in to the function used to build the timelines.

			var xMin = d3Array.min(app.profileData, profile => profile.pollution_start);
			var xMax = d3Array.max(app.profileData, profile => profile.pollution_start);

			app.x = d3Scale.scaleLinear()
				.range([0,100])
				.domain([xMin, xMax]);

			// Here we pluck the years from the first and last pollution events to label the mini timelines
			app.firstDate = formatExcelDate(app.profileData[0].pollution_start).slice(-4);
			let lastEvent = app.profileData[app.profileData.length - 1];
			app.lastDate = lastEvent.pollution_end ? formatExcelDate(lastEvent.pollution_end).slice(-4) : formatExcelDate(lastEvent.pollution_start).slice(-4);


			app.profileData.forEach( (pollutionEvent,i) => {
				// The first row of points data actually is labels/descriptions from
				// spreadsheet. This uses the lat and tests if it is a number. If it is,
				// then add point. If it isn't, then skip (b/c it is probably label or a 
				// point without coordinates yet). Also, check for the publish boolean in 
				// the JSON. Don't publish except when it's true.
				if (pollutionEvent.publish == 1){
					counter++;

					// if key does not exist, make new marker. Otherwise
					pollutionEvent.marker = L.marker(
						{lat:parseFloat(pollutionEvent.lat), 
							lng:parseFloat(pollutionEvent.lng)},
							{icon:app.pollutionIcon}
						).on('click', function(e){
							app.showPollutionProfileByIndex(i);
						});
						pollutionEvent.marker.profileId = pollutionEvent.id;
						pollutionEvent.marker.addTo(app.markers);
				}
			});
			app.markers.addTo(map);
			
			// Since the pollution profile counter doesn't advance after the last one, 
			//we need to add 1 to trigger the last/most recent profile
			app.showPollutionProfileByIndex(counter+1);
		});	
	});
}

function profilesTimeline(profiles, x, profileIdToHighlight,firstDate,lastDate){

	/*
		Uses D3 to draw a little timeline of all pollution profiles. 

	*/

	var retval = `<div class='profiles-timeline'>
						<span>${ firstDate }</span>
						<div class='timeline'>`;
						
	profiles.forEach( (profile,i) => {

		// We will want to add a highlight class if this is the event in question
		let addClass = "";
		let width = 0;

		// Calculate the left position of the circle
		var left = x(profile.pollution_start);
		
		if (profile.id == profileIdToHighlight){
			// If this is the circle for the highlighted event, the load up the highlight class
			addClass = "timeline__event--active";
		}

		// If there is an end date, then extend the circle to cover the length of time
		width = (profile.pollution_end) ? x(profile.pollution_end) - x(profile.pollution_start) : "";

		// Now add the the span/event to the return value
		retval += `<span 	data-profile="${ profile.id }" 
							class='timeline__event ${addClass}'
							style='left:${left}%; width:${ width }%'>
					</span>`;
	});

	// And close up the shop on the timeline.
	retval += `</div>
				<span>${ lastDate }</span>
			</div>`;

	return retval;
}

CafoMap.prototype.showPollutionProfileByIndex = function(i){

	var app = this;
	let markers = app.markers;
	app.activeIndex = i;
	let profileContainer = app.options.profileOptions.profileContainer;
	// Take the profile data (array of objects) and filter
	// down to just the one we want, storing it in variable "p"
	let p = app.profileData[app.activeIndex];
	
	// console.log("Now showing: ",i, app.activeIndex);
	
	// Start by removing any existing active marker
	if (this.activeMarker){
		this.activeMarker.setIcon(app.pollutionIcon);
	}

	this.activeMarker = p.marker.setIcon(app.activePollutionIcon);
	let dates = "";
	if (p.hasOwnProperty('pollution_start')){
		dates = `<p class='profile__date'><strong>Date: </strong> ${dateToApStyle(formatExcelDate(p.pollution_start))}`;

		if (p.hasOwnProperty('pollution_end')){
			dates = dates + ` - ${dateToApStyle(formatExcelDate(p.pollution_end))}`;
		}
	}

	// Fill out the profile content.
	let profileText = `
	<div id="${p.id}" class="profile">
	<h2 class='profile__header'>${p.operator}</h2>
	<p class='profile__address'>${p.county} County</p>
	<p>${dates}</p>
	${profilesTimeline(app.profileData, app.x, p.id, app.firstDate, app.lastDate)}`;
	profileText = profileText + (p.hasOwnProperty('waterway_affected') ? `<p><strong>Affected waterway: </strong>${p.waterway_affected}</p>` : "");
	profileText = profileText + (p.hasOwnProperty('pigs') ? `<p><strong>Number of pigs: </strong>${formatNumber(p.pigs)}</p>` : "");
	profileText = profileText + (p.hasOwnProperty('fish_killed') ? `<p><strong>Fish killed: </strong>${formatNumber(p.fish_killed)}</p>` : "");
	profileText = profileText + (p.hasOwnProperty('event_description') ? `<p><strong>What happened: </strong>${p.event_description}</p>` : "");
	profileText = profileText + (p.hasOwnProperty('event_outcome') ? `<p><strong>Outcome: </strong>${p.event_outcome}</p>` : "");
	profileContainer.innerHTML = profileText + "</div>";

	app.map.panTo(p.marker.getLatLng());
}

CafoMap.prototype.showNextPollutionEvent = function(){
	var nextIndex = this.activeIndex + 1;

	if(nextIndex >= this.profileData.length){
		nextIndex = 0;
	}
	this.showPollutionProfileByIndex(nextIndex);
}

CafoMap.prototype.showPreviousPollutionEvent = function(){
	var nextIndex = this.activeIndex - 1;

	if(nextIndex < 0){
		nextIndex = this.profileData.length - 1;
	}

	this.showPollutionProfileByIndex(nextIndex);
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

CafoMap.prototype.updateMapData = function(property){
	// This method is to be used when switching data sets for the chorpleth
	var app = this;
	app._propertyToMap = property;
	app.countyLayer.eachLayer(function(layer){
		app.countyLayer.resetStyle(layer);
	});
}

CafoMap.prototype.trackButtonClick = function(buttonProfileClick){

	// The analytics thingy
	// console.log('Tracking click', buttonProfileClick);
	var linkName = 'cafo-pollution-map';

	if (window.s) {
		s.linkTrackVars = "server,prop3,prop20,prop28,prop33,prop34,prop57,eVar3,eVar20,eVar21,eVar34,eVar35,eVar36,eVar37,eVar38,eVar39,eVar51";
		s.linkTrackEvents = "";
		s.prop3 = buttonProfileClick;
		s.eVar3 = buttonProfileClick;
		s.prop57 = linkName;
		s.tl(
        // Since we're not actually tracking a link click, use
        // true instead of `this`.  This also supresses a
        // delay
        true,
        // linkType
        // 'o' for custom link
        'o',
        // linkName
        linkName,
        // variableOverrides
        null
        );
	}
}

module.exports = CafoMap;