var map,
    subStr,
    removeStr;

// initialize map and parse data
function initMap() {
    removeStr = dict.removeStr;
    subStr = dict.subStr;
    var seattle = {lat: 47.609895, lng: -122.330259}
    map = new google.maps.Map(document.getElementById('map'), {
        center: seattle,
        zoom: 11
    });
    initHeat();
    initBikes();
    initBounds();
}

// turn heat map on/off
function toggleHeat(input) {
    clearError();
    setHeapMap(input.checked);
}

// turn showing traffic on/off
function toggleTraffic(input) {
    clearError();
    setTraffic(input.checked);
}

// change how many bikes are displayed
function toggleBikes(input) {
    clearError();
    var num = input.value;
    setBikes(num);
}

// find clossest bike rack to a location in seattle
function checkAddress(input) {
    clearError();
    findMinDistance(input.value);
}

function dataError(msg, type) {
    msg = msg || 'Error getting data, please try again later';
    var div = document.getElementById(type);
    div.innerHTML = msg
}

// display error message
function handleError(msg) {
    msg = msg || 'An error occured, please try again. ' +
        'You may have exceded your query limit, please wait a few moments '+
        'before trying again';
    var div = document.getElementById('error');
    div.innerHTML = msg;
}

// remove error text
function clearError() {
    var div = document.getElementById('error');
    div.innerHTML = '';
}
