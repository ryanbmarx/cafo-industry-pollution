var $ = require('jquery');


/*

## TODO
- Consider whether the dots should scale with the dead fish
- Decide what data needs to be in the profile.
- We're gonna need some geolocating help, but still don't have real data.
- Programatically trigger a click so the buttons sync with the initial map data. 

- Add d3 charts

Need from david:
- Points of failure
- Farm to table

Other graphics:
- MAYBE: National map of animal cruelty on film
	- Links to videos
	- Links to court docs
	- Links to response

- MAYBE: Demystifying labels
	- Decoding logos/certifications, presented with a story
	- Follow the money

- MAYBE: Crowdsource CAFO locations?

// limit zoom on map

*/



module.exports = {
	CafoMap:require('./cafo-map'),
	CafoMapButtons:require('./cafo-map-buttons'),
	CafoProfileButtons:require('./cafo-profile-buttons'),
	CafoMapSelect:require('./cafo-map-select'),
};