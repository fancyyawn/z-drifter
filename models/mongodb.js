const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const config = require('config-lite');

mongoose.connect(config.mongodb);

const bottleModel = mongoose.model('Bottle', new mongoose.Schema({
  bottle: Array,
  message: Array
},{collection: 'bottles'}));

exports.save = function (picker, _bottle, cb) {
  let bottle = {bottle: [], message: []};
  bottle.bottle.push(picker);
  bottle.message.push([_bottle.owner, _bottle.time, _bottle.content]);
  bottle = new bottleModel(bottle);
  bottle.save(function (err) {
    cb(err);
  });
};

exports.getAll = function (user, cb) {
  bottleModel.find({"bottle": user}, function (err, bottles) {
    if(err){
      return cb({code: 0, msg: "fail to get bottle list..."});
    }
    cb({code: 1, msg: bottles});
  });
};

exports.getOne = function (_id, cb) {
  bottleModel.findById(_id, function (err, bottle) {
    if(err){
      return cb({code: 0, msg: 'fail to get bottle...'});
    }
    cb({code: 1, msg: bottle});
  });
};

exports.reply = function (_id, reply, cb) {
  reply.time = reply.time || Date.now();

  bottleModel.findById(_id, function (err, bottle) {
    if(err){
      return cb({code: 0, msg: 'fail to reply bottle...'});
    }
    let newBottle = {};
    newBottle.bottle = bottle.bottle;
    newBottle.message = bottle.message;

    if(newBottle.bottle.length === 1){
      newBottle.bottle.push(bottle.message[0][0]); //将主人的名字加到列表中
    }

    newBottle.message.push([reply.user, reply.time, reply.content]);

    bottleModel.findByIdAndUpdate(_id, newBottle, function (err, bottle) {
      if(err){
        return cb({code: 0, msg: 'fail to reply bottle...'});
      }
      cb({code: 1, msg: bottle});
    });
  });
};

exports.delete = function (_id, cb) {
  bottleModel.findByIdAndRemove(_id, function (err) {
    if(err){
      return cb({code: 0, msg: 'delete bottle fail...'});
    }
    cb({code: 1, msg: 'delete success!'});
  });
};