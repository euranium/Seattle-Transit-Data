var bounds,
    service,
    geocoder;
var marks = [];

function initBounds() {
    service = new google.maps.DistanceMatrixService;
    geocoder = new google.maps.Geocoder();
    // default to show nearest bike rack provided in the html
    var def = document.getElementById('address').value;
    findMinDistance(def);
}

// make sure the address is within seattle
function findMinDistance(addr) {
    geocoder.geocode({address: addr}, function(results, status) {
        // error handling
        if (status != google.maps.GeocoderStatus.OK) {
            if (status === 'OVER_QUERY_LIMIT') {
                handleError('Over query limit, please try again in a few moments');
            } else {
                handleError('Invalid Address');
            }
            console.log('error', status);
            return;
        }
        // check if seattle is in the address component
        // if so find the nearest bike rack, else show an error
        results = results[0].address_components;
        for (var i in results) {
            if (results[i].short_name === "Seattle") {
                minDistance(addr);
                return;
            }
        }
        handleError('Address not in Seattle');
    });
}

// given an array of bike racks, find a best guess of one clossest to
// a given address
function minDistance(addr) {
    var bikeRacks = shuffle(bikes);
    var dest = [addr];
    var i = 0;
    var limit = 25;
    var k = 0;
    var distances = [];
    var addresses = [];

    // poll 100 random bike rack locations, there are about 1000
    // and a query limit of 25 address per query so not enough time
    // to poll all 1000 along with a limit of ~2500 query per day
    // and a rate limit of ~10 persecond to google, so limit to
    // just 4 queries per lookup (any more would go over rate limit)
    for (var j=0; j<4; j++) {

        var origins = [];
        // generate 25 geo locations per request
        for (i; i<limit; i++) {
            var loc = {};
            loc.lat = bikeRacks[i].latitude;
            loc.lng = bikeRacks[i].longitude;
            loc = new google.maps.LatLng(loc.lat, loc.lng);
            origins.push(loc);
        }
        limit += 25;

        // request a lookup from google for distance to provided address
        service.getDistanceMatrix({
            origins: origins,
            destinations: dest,
            travelMode: google.maps.TravelMode.DRIVING
        }, function(resp, status) {
            // error handing
            if (status !== google.maps.DistanceMatrixStatus.OK) {
                console.log('error', status);
                handleError();
                return;
            }
            addresses = addresses.concat(resp.originAddresses);
            distances =  distances.concat(resp.rows);
            k++;
            // after all 4 requests have gone through, parse results
            if (k===4) {
                parseResults(addresses, distances, bikeRacks);
            }
        });
    }
}

// parse results of address distance query,
// pass in list of addresses coresponding to the list of
// distances and the coresponding bike objects
function parseResults(addresses, distances, bikeRacks) {
    // find min lengh, set default min length to max int
    var minLen = Number.MAX_SAFE_INTEGER;
    var index = 0;

    // iterate over distances and find the min length
    for (var i in distances) {
        var obj = distances[i].elements[0];
        if (obj.status === "OK") {
            var dist = obj.distance.value;
            minLen = (dist < minLen) ? dist : minLen;
            index = (dist === minLen) ? i : index;
        }
    }
    // show the bike rack possition by clearing the map of locations
    // and displaying the found location
    clearBikeRacks();
    setBikeRack(bikeRacks[index]);
}
