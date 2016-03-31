var $ = require('jquery');
var L = require('leaflet');

var CafoMap = function(options){
	var app = this;
	app.options = options;

	var map = app.map = L.map(document.getElementById(app.options.mapTargetID),
        {
            center: [39.739190, -89.503629],
            zoom: 6
        }
	);
	var layer = new L.StamenTileLayer("toner");
	map.addLayer(layer);


}




window.onload = function(){
     window.CafoMap = new CafoMap({
    	/*Options here*/
    	mapTargetID:"map"
 	 });
}

// window.cafoMap = cafoMap;