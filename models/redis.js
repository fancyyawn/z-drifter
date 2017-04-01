const redis = require('redis');
const client = redis.createClient();
const client3 = redis.createClient();
const client4 = redis.createClient();

exports.throw = function (bottle, callback) {

  client3.SELECT(3, function () {
    client3.GET(bottle.owner, function (err, result) {
      if(result >= 10){
        return callback({code: 0, msg: 'no throw chance available, try tomorrow...'});
      }
      client3.INCR(bottle.owner, function () {
        client3.TTL(bottle.owner, function (err, ttl) {
          if(ttl === -1){ //如果没有设置过生存期，则会返回-1
            client3.EXPIRE(bottle.owner, 86400); //计数键只能保持一天，第二天应该重新开始计算
          }
        });
      });

      doThrow(bottle, callback);

    });
  });

};

function doThrow(bottle, callback) {

  bottle.time = bottle.time || Date.now();
  const sexType = {male: 1, female: 2};

  let bottleId = `${bottle.owner}:${sexType[bottle.type]}:${Date.now().toString()}`;

  client.SELECT(sexType[bottle.type], function () {
    client.HMSET(bottleId, bottle, function (err, result) {
      if (err) {
        return callback({code: 0, msg: "try again after a while!"});
      }
      callback({code: 1, msg: result});
      client.EXPIRE(bottleId, 24 * 3600); //1day
    });
  });
}


exports.pick = function (info, callback) {

  client4.SELECT(4, function () {
    client4.GET(info.user, function (err, result) {
      if(result >= 10){
        return callback({code: 0, msg: "no pick chance available, try tomorrow..."});
      }
      client4.INCR(info.user, function () {
        client4.TTL(info.user, function (err, ttl) {
          if(ttl === -1){
            client4.EXPIRE(info.user, 86400);
          }
        });
      });
      doPick(info, callback);
    });
  });


};

function doPick(info, callback) {
  if (Math.random() <= 0.2) {
    return callback({code: 0, msg: 'sea star...'});
  }

  let type = {any: Math.round(Math.random()) + 1, male: 1, female: 2};
  info.type = info.type || 'any';

  client.SELECT(type[info.type], function () {
    client.RANDOMKEY(function (err, bottleId) {
      if (!bottleId) {
        return callback({code: 0, msg: 'the sea is empty!'});
      }
      client.HGETALL(bottleId, function (err, bottle) {
        if (err) {
          return callback({code: 0, msg: 'the bottle is broken...'});
        }
        callback({code: 1, msg: bottle});
        client.DEL(bottleId);
      });
    });
  });
}

exports.throwBack = function (bottle, callback) {
  const type = {male: 1, female: 2};
  let bottleId = `${bottle.owner}:${type[bottle.type]}:${Date.now().toString()}`;

  client.SELECT(type[bottle.type], function () {
    client.HMSET(bottleId, bottle, function (err, result) {
      if (err) {
        return callback({code: 0, msg: "try again after a while!"});
      }
      callback({code: 1, msg: result});
      client.PEXPIRE(bottleId, bottle.time + 24 * 3600 * 1000 - Date.now()); //1day
    });
  });
};