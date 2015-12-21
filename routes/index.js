var express = require('express');
var router = express.Router();
var request = require('request');
var util = require('util');

var tokens = require('../token.json');
var map;
try {
    map = require('../addressToGeo.json');
} catch(e) {
    map = {};
}
var dict = JSON.stringify(map);

var url = 'https://data.seattle.gov/resource/%s'
var options = {
    headers: {
            'X-App-Token': tokens.token
    }
};

/* GET home page. */
router.get('/', function(req, res, next) {
    // get traffic flow stats

    function callback(err, response, body) {

        if (response) {
            var code = response.statusCode || 1;
        }
        var Heaterr = false;
        // error handling
        if (err || code < 200 || code > 299) {
            console.log(err, response);
            Heaterr = err || body;
            body = '';
        }
        console.log(response.statusCode);
        options.url = util.format(url, 'vncn-umqp.json');
        var heat = body;
        request(options, cb);

        function cb(err, response, b) {
            if (response) {
                var code = response.statusCode || 1;
            }
            // error handling
            if (err || code < 200 || code > 299) {
                console.log(b, err);
                res.render('map', {"token": tokens.google, title: 'Transportation', bikes: '', heat: heat, Heaterr: Heaterr,
                    Bikerr: err || b, code: response, dict: dict});
                return;
            }
            res.render('map', {token: tokens.google, title: 'Transportation', bikes: b, heat: heat, Heaterr: Heaterr,
                Bikerr: false, code: response, dict: dict});
        }
    }

    options.url = util.format(url, 'pht6-7efs.json');
    request(options, callback);
});

router.get('/traffic', function(req, res, next) {
    // get traffic flow stats
    options.url = util.format(url, 'pht6-7efs.json');
    function callback(err, response, body) {
        var code = response.statusCode;
        if (err || code < 200 || code > 299) {
            console.log(err, response);
            res.render('map', {"token": tokens.google, title: 'Streets', data: body, 'err': err, 'code': response, map: dict});
            return;
        }
        console.log(response.statusCode);
        res.render('map', {"token": tokens.google, title: 'Streets', data: body, code: response, map: dict});
    }

    request(options, callback);
});

router.get('/bike-racks', function(req, res, next) {
    options.url = util.format(url, 'vncn-umqp.json');

    function callback(err, response, body) {
        var code = response.statusCode;
        if (err || code < 200 || code > 299) {
            console.log(err, response);
            res.render('locations', {"token": tokens.google, title: 'Bike Rack Locations', data: body, 'err': err, 'code': response, map: dict});
            return;
        }
        console.log(response.statusCode);
        res.render('locations', {"token": tokens.google, title: 'Bike Rack Locations', data: body, code: response, map: dict});
    }

    request(options, callback);
});

module.exports = router;
