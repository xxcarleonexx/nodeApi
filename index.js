var express = require('express');
var app = express();
var bearerToken = require('bearer-token');
var http = require("http");

server = http.createServer();
server.listen(8000, function () {
    console.log('server started on 8000')
});

server.on('request', function(req ,res) {
    bearerToken(req, function(err, token) {
        console.log('Start verification');
        // Now you have to verify the token
    })
});
