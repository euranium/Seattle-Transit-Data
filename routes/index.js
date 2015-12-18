var express = require('express');
var router = express.Router();
var request = require('request');

var tokens = require('../token.json');
var url = 'https://data.seattle.gov/resource/'

/* GET home page. */
router.get('/', function(req, res, next) {
    var options = {
        'url': url + 'pht6-7efs.json',
        headers: {
            'X-App-Token': tokens.token
        }
    }
    function callback(err, response, body) {
        var code = response.statusCode;
        if (err || code < 200 || code > 299) {
            console.log(err, response);
            res.render('map', {"token": tokens.google, title: 'Streets', 'body': body, 'err': err, 'code': response});
            return;
        }
        console.log(response.statusCode);
        var resp = JSON.stringify(response);
        res.render('map', {"token": tokens.google, title: 'Streets', 'body': body, code: response});
    }

    request(options, callback);
    //res.render('index', { title: 'Express' });
});

router.get('/traffic', function(req, res, next) {
    var options = {
        'url': url + '7svg-ds5z.json',
        headers: {
            'X-App-Token': tokens.token
        }
    }
    function callback(err, response, body) {
        var code = response.statusCode;
        if (err || code < 200 || code > 299) {
            console.log(err, response);
            res.render('index', {"token": tokens.google, title: 'Traffic Density', 'body': body, 'err': err, 'code': response});
            return;
        }
        console.log(response.statusCode);
        var resp = JSON.stringify(response);
        res.render('index', {"token": tokens.google, title: 'Traffic Density', 'body': body, code: response});
    }

    request(options, callback);
});

router.get('/bike-racks', function(req, res, next) {
    var options = {
        'url': url + 'vncn-umqp.json',
        headers: {
            'X-App-Token': tokens.token
        }
    }
    function callback(err, response, body) {
        var code = response.statusCode;
        if (err || code < 200 || code > 299) {
            console.log(err, response);
            res.render('index', {"token": tokens.google, title: 'Bike Rack Locations', 'body': body, 'err': err, 'code': response});
            return;
        }
        console.log(response.statusCode);
        var resp = JSON.stringify(response);
        res.render('index', {"token": tokens.google, title: 'Bike Rack Locations', 'body': body, code: response});
    }

    request(options, callback);
});

module.exports = router;
