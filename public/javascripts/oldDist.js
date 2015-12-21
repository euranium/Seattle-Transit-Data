var request = require('browser-request');
var util = require('util');

var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=seattle+wa%s&destinations=nordstrom+downtown+seattle&key=AIzaSyBkBmL-9e7fABt6DeEiO-lMZnUNNfhkiME'
var fmt = '|%s,%s'
var rq  = 'https://data.seattle.gov/resource/vncn-umqp.json'

function callback(err, response, bikes) {
    if (response) {
        var code = response.statusCode || 1;
    }
    bikes = JSON.parse(bikes);
    var str = '';
    for (var i=0; i<50; i++) {
        str += util.format(fmt, bikes[i].latitude, bikes[i].longitude);
    }

    function cb(err, response, body) {
        if (response) {
            var code = response.statusCode || 1;
            if (err || code < 200 || code > 299) {
                console.log(err, response);
                return;
            }
        }
        var rsp = JSON.parse(body);
        var org = rsp.origin_addresses;
        var rows = rsp.rows;
        var least = parseInt(rows[1].elements[0].distance.value);
        var index = 1;
        for (var i=2; i<rows.length; i++) {
            if (rows[i].elements.status === "OK") {
                var len = parseInt(rows[i].elements[0].distance.value);
                if (len < least) {
                    len = least;
                    index = i;
                }
            }
        }
        console.log(index, org[index], rows[index].elements[0].distance.value);
    }
    url = util.format(url, str);

    request(url, cb);
}

request(rq, callback);
