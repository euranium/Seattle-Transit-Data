var map;
function initMap() {
    var seattle = {lat: 47.609895, lng: -122.330259}
    map = new google.maps.Map(document.getElementById('map'), {
        center: seattle,
        zoom: 11
    });
}

function parseData() {
    if (document.getElementById('error')) {
        return;
    }
    var div = document.getElementById('data');
    var data = JSON.parse(div.innerHTML);
    for(var i = data.length-1; i >= 0 ; i--){
        if (obj.year !== "2009.0") {
            data.splice(i, 1);
        }
    }
}
