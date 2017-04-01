const express = require('express');
const bodyParser = require('body-parser');
const config = require('config-lite');

const redis = require('./models/redis');
const mongodb = require('./models/mongodb');

const app = express();
app.use(bodyParser());

app.get('/', function (req, res) {
  redis.pick(req.query, function (result) {
    if(result.code === 1){
      mongodb.save(req.query.user, result.msg, function (err) {
        if(err){
          console.log({code: 0, msg: 'fail to save bottle'});
        }
      });
    }
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


app.get('/user/:user', function (req, res) {
  mongodb.getAll(req.params.user, function (result) {
    res.json(result);
  });
});

app.get('/bottle/:_id', function (req, res) {
  mongodb.getOne(req.params._id, function (result) {
    res.json(result);
  });
});

app.post('/reply/:_id', function (req, res) {
  if(!(req.body.user && req.body.content)){
    return res.json({code: 0, msg: 'reply message invalid...'});
  }
  mongodb.reply(req.params._id, req.body, function (result) {
    res.json(result);
  });
});

app.get('/delete/:_id', function (req, res) {
  mongodb.delete(req.params._id, function (result) {
    res.json(result);
  })
});

app.listen(config.port, function () {
  console.log(`server listening on port ${config.port}`);
});