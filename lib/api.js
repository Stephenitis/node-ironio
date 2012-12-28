/*!
 * Module dependencies.
 */
var request = require('request')
  , path = require('path')
  ;

/**
 * @constant
 */
var CLOUDS = {
  aws: {
      cache: 'cache-aws-us-east-1'
    , queue: 'mq-aws-us-east-1'
    , worker: 'worker-aws-us-east-1'
  },
  rackspace: {
    queue: 'mq-rackspace-dfw'
  }
};

/**
 * Creates the API object. 
 *
 * @param {Object} [options] 
 * @return {Object} api
 */
function api(options) {
  options = options || {};
  var version = (options.apiVersion || 1).toString();
  var cloud = options.cloud || 'aws';
 
  function exec(endpoint, method, body, fn) {
    var service = 'queue';
    if (/projects\/\w{24}\/caches/.test(endpoint)) {
      service = 'cache';
    } else if (/projects\/\w{24}\/(codes|tasks|schedules)/.test(endpoint)) {
      service = 'worker';
    }
    var subdomain = CLOUDS[cloud][service];
    var url = 'https://' + subdomain + '.iron.io/' + 
      path.join(version, endpoint);
       
    var requestOptions = {
        url: url 
      , json: true
      , method: method
    };
  
    if (body) requestOptions.body = body;

    request(requestOptions, function(err, res, body) {
      if (err) return fn(err);
      if (res.statusCode !== 200) {
        return fn(new Error('Response code ' + 
          res.statusCode + ': ' + body));
      }
      fn(null, body);
    });
  }
  
  function get(endpoint, fn) {
    exec(endpoint, 'GET', null, fn);
  }

  function post(endpoint, body, fn) {
    exec(endpoint, 'POST', body, fn);
  }
  
  function put(endpoint, body, fn) {
    exec(endpoint, 'PUT', body, fn);
  }

  function del(endpoint, fn) {
    exec(endpoint, 'DELETE', null, fn);
  }

  return {
      get: get
    , post: post
    , put: put
    , del: del
  };
}

/*!
 * Module exports.
 */
module.exports = api;