var app = require('express')();
var proxy = require('express-http-proxy');
var Request = require('request');

var currentSession = null;
var currentSessionObj = null;

function initBrowser(cb) {
  var seleniumPort = app.config['selenium-port'] || 4444;
  var seleniumHost = app.config['selenium-host'] || 'localhost';

  Request({
    method: 'post',
    url: 'http://' + seleniumHost + ':' + seleniumPort + '/wd/hub/session/' + currentSession + '/url',
    json: { url: "data:text/html;charset=utf-8;base64,PGh0bWw+PGhlYWQ+PHRpdGxlPm5vZGUtcGVyc2lzdGVudF9zZWxlbml1bTwvdGl0bGU+PGhlYWQ+PGJvZHk+PGgxPm5vZGUtcGVyc2lzdGVudF9zZWxlbml1bSBzdGFydGluZy4uLjwvaDE+PC9ib2R5PjwvaHRtbD4=" }
  }, function(err, response, body) {
    cb();
  });
};

app.use(proxy('localhost', {
  filter: function(req, res) {
    if (currentSession) {
      if (req.path === '/wd/hub/session/' + currentSession &&
        req.method.toLowerCase() === 'delete') {
        req._wasDelete = true;
      }

      if (req.path === '/wd/hub/session' &&
        req.method.toLowerCase() === 'post') {
        req._wasCreate = true;
      }
    }

    return true;
  },
  decorateRequest: function(req) {
    req.port = app.config['selenium-port'] || 4444;
    req.hostname = app.config['selenium-host'] || 'localhost';

    if (currentSession) {
      if (req.path === '/wd/hub/session/' + currentSession &&
        req.method.toLowerCase() === 'delete') {
        req.method = 'GET';
        req.path = '/wd/hub/sessions';
      }

      if (req.path === '/wd/hub/session' &&
        req.method.toLowerCase() === 'post') {
        req.method = 'GET';
        req.path = '/wd/hub/sessions';
      }
    }

    return req;
  },
  intercept: function(origRes, data, req, res, callback) {
    if (!currentSession && req.url === '/wd/hub/session' &&
      req.method.toLowerCase() === 'post') {

      currentSessionObj = JSON.parse(data.toString('utf-8'));
      currentSession = currentSessionObj.sessionId;
      initBrowser(function() { callback(null, data); });
    } else {
      if (req._wasCreate) {
        data = JSON.stringify(currentSessionObj);
        initBrowser(function() { callback(null, data); });
      } else {
        if (req._wasDelete) {
          callback(null, JSON.stringify('{}'));
        } else {
          callback(null, data);
        }
      }
    }
  }
}));

module.exports = app;
