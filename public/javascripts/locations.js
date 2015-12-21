var marker,
    numBikes,
    bikeMarkers = [];

function initBikes() {
    // if error getting bike don't do try and parse anything
    // and set options to readonly
    if (Bikerr) {
        dataError('Error getting bike rack data', 'bikeErr');
        var div = document.getElementById('bikes');
        div.readOnly = true;
        div = document.getElementById('address');
        div.readOnly = true;
        return;
    }

    // generate a maps marker for each bike rack
    for (var i=0; i<bikes.length; i++) {
        var lat = parseFloat(bikes[i].latitude);
        var lng = parseFloat(bikes[i].longitude);
        bikes[i].latitude = lat;
        bikes[i].longitude = lng;

        var latlng = new google.maps.LatLng(lat, lng);
        var title = bikes[i].unitdesc;
        bikeMarkers.push(new google.maps.Marker({
            position: latlng,
            title: title
        }));
    }

    // shuffle up bikes to display them at random
    bikeMarkers = shuffle(bikeMarkers);
    numBikes = 0;
}

// display however many bike rack locations are requested
function setBikes(num) {
    num = parseInt(num);
    // if not displaying any bike markers, shuffle up the array
    // to display new markers
    if (num < 0) {
        clearBikeRacks();
        bikeMarkers = shuffle(bikeMarkers);
        return;
    }

    // dont go over the number of bikes there are
    num = (num < bikeMarkers.length) ? num : bikeMarkers.length-1;
    // display new bikes
    for (var i=numBikes; i<num; i++) {
        bikeMarkers[i].setMap(map);
    }
    // hide bikes
    for (var i=num; i<numBikes; i++) {
        bikeMarkers[i].setMap(null);
    }
    numBikes = num;
}

// clear are bikes from map
function clearBikeRacks() {
    for (var i=0; i<bikeMarkers.length; i++) {
        bikeMarkers[i].setMap(null);
    }
    numBikes = 0;
    var div = document.getElementById('bikes');
    div.value = 0;
}

// set one bike on map
function setBikeRack(bike) {
    for (var i in bikeMarkers) {
        //if (bikeMarkers[i].position.lat() === bike.latitude && bikeMarkers[i].position.lng() === bike.longitude) {
        if (bikeMarkers[i].title === bike.unitdesc) {
            bikeMarkers[i].setMap(map);
            numBikes++;
            var div = document.getElementById('bikes');
            div.value = numBikes;
            return;
        }
    }
}

// shuffle an array to get random locations,
// Fisher-Yates shuffle
function shuffle(array) {
    var counter = array.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}
