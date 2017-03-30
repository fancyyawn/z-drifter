const express = require('express');
const bodyParser = require('body-parser');
const config = require('config-lite');

const redis = require('./models/redis');

const app = express();
app.use(bodyParser());

app.get('/', function (req, res) {
    redis.pick(req.query, function (result) {
        res.json(result);
    });
});

app.post('/', function (req, res) {
    redis.throw(req.body, function (result) {
        res.json(result);
    });
});

app.post('/back', function (req, res) {
    redis.throwBack(req.body, function (result) {
        res.json(result);
    });
});

app.listen(config.port, function () {
    console.log(`server listening on port ${config.port}`);
});