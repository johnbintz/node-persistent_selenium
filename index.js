var selenium = require('selenium-standalone');
var proxy = require('express-http-proxy');
var Request = require('request');

var app = require('express')();
var currentSession = null;
var currentSessionObj = null;
var seleniumPort = 4444;

var initBrowser = function(cb) {
  Request({
    method: 'post',
    url: 'http://localhost:' + seleniumPort + '/wd/hub/session/' + currentSession + '/url',
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
    req.port = seleniumPort;

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

var seleniumArgs = process.argv.slice(2);

selenium.install({ logger: function(msg) { console.log(msg); }}, function(err) {
  selenium.start({ spawnOptions: {}, seleniumArgs: seleniumArgs }, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Persistent selenium listening on port 4443");
      app.listen(4443);
    }
  });
});

