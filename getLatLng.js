/*
* Once per day or on server start up update a cached key/value store of addresses to lat/long locations.
* This is to keep requests to Google Geocoding API down and not go over request caps.
*/

var request = require('request');
var fs = require('fs');
var util = require('util');
var dict;

try {
    dict = require('./addressToGeo.json');
} catch (e) {
    dict = {};
}

var tokens = require('./token.json');
    google = "https://maps.googleapis.com/maps/api/geocode/json?address=%s&key=" + tokens.google,
    url = 'https://data.seattle.gov/resource/pht6-7efs.json';

// some string manipulation needs to be done to translate between address
// there's a lot of addresses which need to be remapped, mostly ramps and some street names
// some edge cases with S needing to be remapped to south only some times
// solving this with a natural langague solution would take to long, so here's a quick hack
var removeStr = [" ON RAMP", " NB", " SB", " &amp;", " &", " VI", " EB", " WB", "W/O 15TH ", "ON RP", "OFF RP", "OFF RAMP", 'REV RAMP'],
    subStr = {" WY": " way", " WS": " west", " AV ": " ave ", "1ST AVE S": '1st avenue south', 'YALE ST': 'yale ave',
        'ST RAMP': 'st', " BR": " bridge", "SR509": "wa-509", "M L": "martin luther", 'NORTHGATE WAY AVE NE': 'ne northgate way',
        'BLVD S': 'way s', '31st avenue south': '31st ave s', "BROADWAY": 'capitol hill', "SR99 FY": "wa-99", "EAST MARGINAL": "e marginal",
        "ML K": "martin luther k", "ELLIOTT AV ": 'ELLIOTT AVE', "WEST MARGINAL": "w marginal", "PIKE RAMP": 'pike st',
        'HOLGATE bridge': 'holgate st', '51st avenue south': '51st ave s', '31st avenue south': '31st ave s'},
    data = {},
    streets = [],
    qu = 0,
    todo = 0;

var options = {
    'url': url,
    headers: {
        'X-App-Token': tokens.token
    }
};

// call back from getting all streets
function callback(err, response, body) {
    // error checking
    var code = response.statusCode;
    if (err || code < 200 || code > 299) {
        console.log("\n\n error \n\n");
        console.log(err, response);
        return;
    }
    data = JSON.parse(body);
    // start out 9 requests for data
    for (var i=0; i<5; i++) {
        parseData();
    }
}

function parseData() {
    var str = "";
    var memberOf = true;
    // loop through all retrieved data and find a valid street that is not stored
    while (memberOf && qu < data.length) {
        while (qu < data.length && data[qu].year === '2009.0' || !data[qu].stname) {
            qu++;
        }
        // check if an address has already been stored
        if (qu < data.length && typeof(data[qu].stname) === 'string') {
            str = formatAddr(data[qu].stname).toLowerCase().trim();
            memberOf = !!dict[str];
            qu = (memberOf) ? qu+1 : qu;
        }
    }
    // send out a request to google with a valid url
    if (qu < data.length) {
        str += ', Seattle, WA';
        str = str.split(' ').join('+');
        str = util.format(google, str);
        console.log('sending: ' + str);
        request(str, cb);
        qu++;
        todo++;
    } else if (!todo) {
        process.exit(1);
    }
}

function cb(err, response, body) {
    // initiate next request, wait a second to avoid query limit
    todo--;
    setTimeout(function() {
        parseData();
    }, 1000);

    // check for errors
    var code = response.statusCode;
    if (err || code < 200 || code > 299) {
        console.log('\n\n error \n\n');
        console.error(err, body);
        process.exit(1);
        return;
    }
    var resp = JSON.parse(body);
    if (resp.status !== "OK") {
        console.log('\n\nnot ok: ' + resp.status + '\n\n');
        process.exit(1);
        return;
    }

    // parse a good response for lat, lng
    resp = resp.results[0];
    var addr = resp.address_components[0].short_name.toLowerCase();
    console.log('adding: ' + resp.address_components[0].short_name);
    var lng = resp.geometry.location.lng;
    var lat = resp.geometry.location.lat;
    dict[addr] = {
        lat: lat,
        lng: lng
    };
    if (!todo && qu >= data.length) {
        process.exit(1);
    } else if (!todo) {
        saveCache();
    }
    // if no more queued up requests
}

function formatAddr(addr) {
    // for some reason, sometimes a null is someimes passed in
    // causing a program crash
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
    return addr.trim();
}

/*
* save the json to a file along with the rules for removing parts of an address
* and subing parts of an address
*/
function saveCache() {
    console.log('saving');
    dict.removeStr = removeStr;
    dict.subStr = subStr;
    var str = JSON.stringify(dict);
    fs.writeFileSync('addressToGeo.json', str, 'utf-8');
}

// if no file or empty, do full request and query
console.log('starting');
request(options, callback);

process.stdin.resume();//so the program will not close instantly
function exitHandler(options, err) {
    console.log('exiting cleanup');
    if (options.cleanup || options.exit) {
        saveCache();
    } else {
        process.exit(1);
    }
    if (err) {
        console.log('err:', err);
    }
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
