module.exports = function(app, db) {
    app.get('/latency', (req, res) => {
        const srcPing = 'google.com';
        const ping = require('ping');
        ping.promise.probe(srcPing, {
        timeout: 10,
    }).then(function (response) {
        console.log('User request latency : > ' + response.time + 'ms');
        res.send('Ping to host "' + srcPing + '" ' +  response.time + ' ms');
    });
    });
};
