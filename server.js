const express = require('express');
const mongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const app = express();
const options = {
    redirect: true,
    extensions: ['htm', 'html'],
    setHeaders: function (res, path, stat) {
        res.set('access-control-allow-origin', '*');
        res.set('access-control-allow-methods', 'POST, GET, OPTIONS');
    }
};
app.use(express.static('public', options));
require('./routes')(app, {});
app.listen(8000, () => {
    console.log('Start server on port 8000');
});
