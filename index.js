var selenium = require('selenium-standalone');
var minimist = require('minimist');

var arg = minimist(
  process.argv.slice(2),
  { boolean: ['only-proxy'] }
);

var app = require('./proxy');
app.config = arg;

function run() {
  console.log("Persistent selenium listening on port 4443");
  app.listen(arg['app-port'] || 4443);
};

if (arg['only-proxy']) {
  run();
} else {
  selenium.install({ logger: function(msg) { console.log(msg); }}, function(instErr) {
    selenium.start({ spawnOptions: {}, seleniumArgs: arg._ }, function(startErr) {
      if (startErr) {
        console.log(startErr);
      } else {
        run();
      }
    });
  });
}
