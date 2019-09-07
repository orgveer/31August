// This application uses express as it's web server
// for more info, see: http://expressjs.com
var express = require('express');
var redis = require('redis');
var redisClient = redis.createClient(6379, 'redis');

var redisConnection = false;

redisClient.on('connect', function() {
    console.log('Redis client connected');
    redisConnection = true;
});

redisClient.on('error', function (err) {
    console.log('Something went wrong ' + err);
});

// create a new express server
var app = express();

var hostname = '0.0.0.0';
var hostport = 5000;


// NODE server should not exit in case of any failure/crash
process.on('uncaughtException', function (error) {
   console.log(error.stack);
});

// start server on the specified port and binding host
app.listen(hostport, hostname, function() {
  console.log( 'server started... on ' + hostname + ',' + hostport);
});

app.get('/', async function(req, res){
    try {
        if ( redisConnection ) {
            redisClient.incr('hits');
            var hitCount = await getRedisKey('hits');
            res.write('I have been hit ' + hitCount + ' times. The current version is 1.0');
        } else {
            res.write( 'Redis connection error');
        }
    } catch (ex) {
        res.write( ex);
    } finally {
        res.end();
    }
    
});


function getRedisKey(key) {
    return new Promise(function(resolve, reject) {
        redisClient.get(key, function (error, result) {
            if (error) {
                console.log(error);
                reject(error);
            }
            resolve(result);
        });
    });
}

