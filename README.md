# Persistent Selenium in JavaScript

I'm moving to a more JavaScript-heavy environment but still wanted to preserve
my [development mode integration testing setup](https://github.com/johnbintz/bintz-integration_testing_setup).
Since I have no Capybara, I made this. It wraps [selenium-standalone](https://github.com/vvo/selenium-standalone)
with an Express proxy that intercepts calls to create and destroy sessions,
and ensures there's only ever one session that is never destroyed. Works
great with [Testium](https://github.com/groupon/testium/) and allows me
to recreate my RSpec/Cucumber + Capybara setup purely in JavaScript!

## Using

`npm install -g persistent_selenium`, then `persistent_selenium`. Point
your Selenium client to `http://localhost:4443/wd/hub`. Test away!

### Command Line Arguments

* `--only-proxy`: Do not download/start Selenium server locally
* `--selenium-host`: The host on which a Selenium server is running (default localhost)
* `--selenium-port`: The port on which a selenium server is running (default 4444)
* Additional arguments are passed directly to a locally running Selenium server on starting
