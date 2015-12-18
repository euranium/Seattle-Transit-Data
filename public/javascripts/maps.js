var map,
    subStr,
    heatmap,
    locations,
    removeStr;
var heatmapData = [];
removeStr = dict.removeStr;
subStr = dict.subStr;

function initMap() {
    parseData();
    var seattle = {lat: 47.609895, lng: -122.330259}
    map = new google.maps.Map(document.getElementById('map'), {
        center: seattle,
        zoom: 11
    });

    heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: map
    });
    changeRadius();
}

// change color gradient of heat map
function changeGradient() {
    var gradient = [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
    ]
    heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
}

// change radius of each heat map point
function changeRadius() {
    heatmap.set('radius', heatmap.get('radius') ? null : 30);
}

// change opacity of heat map
function changeOpacity() {
    heatmap.set('opacity', heatmap.get('opacity') ? null : 0.4);
}

function parseData() {
    if (err) {
        return;
    }
    for(var i=data.length-1; i >= 0 ; i--){
        if (data[i].year !== "2009.0") {
            data.splice(i, 1);
        } else if (data[i].stname === undefined) {
            data.splice(i, 1);
        }
    }

    // weight smoothing using exponential smoothing, not the best
    // smoothing because points are more descreete than they should be
    data[0].aawdt = parseInt(data[0].aawdt);
    for (var i=1; i<data.length; i++) {
        var weight = parseInt(data[i].aawdt);
        var last = data[i-1].aawdt;
        weight = .5*weight + .5*last;
        data[i].aawdt = weight;
    }

    // generate google maps heat points with weights
    var obj;
    for (var i=0; i<data.length; i++) {
        obj = {};
        obj.weight = data[i].aawdt;
        var addr = formatAddr(data[i].stname);
        var latLng = dict[addr];
        if (latLng !== undefined) {
            obj.location = new google.maps.LatLng(latLng.lat, latLng.lng);
            heatmapData.push(obj);
        } else {
            console.log(addr);
        }
    }
}

function formatAddr(addr) {
    // make sure input is good
    if (typeof(addr) !== 'string') {
        console.log('wrong type', typeof(addr));
        return "";
    }
    // remove any part of an address that doesn't play nice
    // with google maps
    for (var i in removeStr) {
        while(addr.indexOf(removeStr[i]) !== -1) {
            addr = addr.replace(removeStr[i], '');
        }
    }
    // substite abrieviated strings
    for (var i in subStr) {
        while(addr.indexOf(i) !== -1) {
            addr = addr.replace(i, subStr[i]);
        }
    }
    addr = addr.toLowerCase();
    return addr.trim();
}
