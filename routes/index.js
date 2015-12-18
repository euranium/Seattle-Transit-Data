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
    //res.render('index', { title: 'Express' });
});

router.get('/traffic', function(req, res, next) {
    options.url = util.format(url, '7svg-ds5z.json');

    function callback(err, response, body) {
        var code = response.statusCode;
        if (err || code < 200 || code > 299) {
            console.log(err, response);
            res.render('index', {"token": tokens.google, title: 'Traffic Density', data: body, 'err': err, 'code': response, map: map});
            return;
        }
        console.log(response.statusCode);
        body = JSON.parse(body);
        res.render('index', {"token": tokens.google, title: 'Traffic Density', data: body, code: response, map: map});
    }

    request(options, callback);
});

router.get('/bike-racks', function(req, res, next) {
    options.url = util.format(url, 'vncn-umqp.json');

    function callback(err, response, body) {
        var code = response.statusCode;
        if (err || code < 200 || code > 299) {
            console.log(err, response);
            body = JSON.parse(body);
            res.render('index', {"token": tokens.google, title: 'Bike Rack Locations', data: body, 'err': err, 'code': response, map: map});
            return;
        }
        console.log(response.statusCode);
        body = JSON.parse(body);
        res.render('index', {"token": tokens.google, title: 'Bike Rack Locations', data: body, code: response, map: map});
    }

    request(options, callback);
});

module.exports = router;
