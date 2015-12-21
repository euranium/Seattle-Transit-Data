var heatmap,
    trafficLayer;
var heatmapData = [];

// initialize heat map and parse data
function initHeat() {
    if (Heaterr) {
        dataError('Error getting heat map data, please try again later', 'heatErr');
        var div = document.getElementById('heatmap');
        div.readOnly = true;
        div = document.getElementById('traffic');
        div.readOnly = true;
        return;
    }

    // iterate over all data and remove old data points
    for(var i=heat.length-1; i >= 0 ; i--){
        if (heat[i].year !== "2009.0") {
            heat.splice(i, 1);
        } else if (heat[i].stname === undefined) {
            heat.splice(i, 1);
        }
    }

    // weight smoothing using exponential smoothing, not the best
    // smoothing because points are more descreete than they should be
    heat[0].aawdt = parseInt(heat[0].aawdt);
    for (var i=1; i<heat.length; i++) {
        var weight = parseInt(heat[i].aawdt);
        var last = heat[i-1].aawdt;
        weight = .5*weight + .5*last;
        heat[i].aawdt = weight;
    }

    // generate google maps heat points with weights
    var obj;
    for (var i=0; i<heat.length; i++) {
        obj = {};
        obj.weight = heat[i].aawdt;
        var addr = formatAddr(heat[i].stname);
        var latLng = dict[addr];
        if (latLng !== undefined) {
            obj.location = new google.maps.LatLng(latLng.lat, latLng.lng);
            heatmapData.push(obj);
        }
    }

    trafficLayer = new google.maps.TrafficLayer();
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
    });
    changeRadius();
}

// toggle traffic display
function setTraffic(on) {
    if (on) {
        trafficLayer.setMap(map);
    } else {
        trafficLayer.setMap(null);
    }
}

// toggle heat map display
function setHeapMap(on) {
    if (on) {
        heatmap.setMap(map);
    } else {
        heatmap.setMap(null);
    }
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

// format a given address to one readable by google maps
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
