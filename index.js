var express = require('express');
var app = express();
const srcPing = 'google.com';
var ping = require('ping');
var options = {
    redirect: true,
    extensions: ['htm', 'html'],
    setHeaders: function (res, path, stat) {
        res.set('access-control-allow-origin', '*');
        res.set('access-control-allow-methods', 'POST, GET, OPTIONS');
    }
};

app.use(express.static('public', options));
app.get('/', function (req, res) {
    res.send('Hello, World');
});
app.get('/latency', function (req, res) {
    ping.promise.probe(srcPing, {
        timeout: 10,
    }).then(function (response) {
        console.log(response.time);
        res.send('Ping to host "' + srcPing + '" ' +  response.time + ' ms');
    });
});
app.listen(3000);

/*
var bearerToken = require('bearer-token');
var http = require("http");

server = http.createServer();
server.listen(8000, function () {
    console.log('server started on 8000');
});

server.on('request', function(req ,res) {
    bearerToken(req, function(err, token) {
        console.log('Start verification');
        // Now you have to verify the token
    });
});
*/
