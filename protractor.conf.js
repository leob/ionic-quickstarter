var failFast = require('protractor-fail-fast');

/* global browser */
exports.config = {
  allScriptsTimeout: 20000,
  specs: [
    // E2E test specs are organized by user stories, not necessarily reflecting the code structure of the project.
    // Imagine things your users might do, and write e2e tests around those behaviors.
    'test/e2e/**/*.spec.js',
  ],
  capabilities: {
    // You can use other browsers like firefox, phantoms, safari, IE, etc.
    'browserName': 'chrome'
  },
  baseUrl: 'http://localhost:8100',
  // Configuration needed if you use a "permanently running" Selenium server (instead of starting a server each time):
  //seleniumAddress: 'http://localhost:4444/wd/hub',
  // http://stackoverflow.com/questions/31662828/how-to-access-chromedriver-logs-for-protractor-test/31662935
  //seleniumArgs: [
  //  '-Dwebdriver.chrome.logfile=_chromedriver.log',
  //],
  // http://stackoverflow.com/questions/30600738/difference-running-protractor-with-without-selenium
  //directConnect: false,
  directConnect: true,
  // http://stackoverflow.com/questions/31662828/how-to-access-chromedriver-logs-for-protractor-test/31840996#31840996
  chromeDriver: 'bin/protractor-chromedriver.sh',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    //
    // Increased "defaultTimeoutInterval" from 30000 to 60000 to prevent "Async callback was not invoked within timeout
    // specified by jasmine.DEFAULT_TIMEOUT_INTERVAL", see Stackoverflow post:
    //
    // stackoverflow.com/questions/29218981/jasmine-2-async-callback-was-not-invoked-within-timeout-specified-by-jasmine-d
    //
    defaultTimeoutInterval: 60000,
    //isVerbose: true,
    isVerbose: false,
    //stackoverflow.com/questions/28893436/how-to-stop-protractor-from-running-further-testcases-on-failure
    //realtimeFailure: true,
    realtimeFailure: false,
    // https://github.com/bcaudan/jasmine-spec-reporter/blob/master/docs/protractor-configuration.md
    print: function () {}
  },

  plugins: [{
    package: 'protractor-fail-fast'
  }],

  onPrepare: function () {
    jasmine.getEnv().addReporter(failFast.init());

    // add jasmine spec reporter: https://github.com/bcaudan/jasmine-spec-reporter
    var SpecReporter = require('jasmine-spec-reporter');

    var opts = {
      displayStacktrace: 'none',    // display stacktrace for each failed assertion, values: (all|specs|summary|none)
      displayFailuresSummary: true, // display summary of all failures after execution
      displayPendingSummary: true,  // display summary of all pending specs after execution
      displaySuccessfulSpec: true,  // display each successful spec
      displayFailedSpec: true,      // display each failed spec
      displayPendingSpec: false,    // display each pending spec
      displaySpecDuration: false,   // display each spec duration
      displaySuiteNumber: true,     // display each suite number (hierarchical)
      colors: {
        success: 'green',
        failure: 'red',
        pending: 'yellow'
      },
      prefixes: {
        success: '✓ ',
        failure: '✗ ',
        pending: '* '
      },
      customProcessors: []
    };

    jasmine.getEnv().addReporter(new SpecReporter(opts));

    browser.driver.manage().window().setSize(900, 750);
    browser.driver.manage().window().setPosition(400, 0);
  },

  afterLaunch: function () {
    failFast.clean();   // cleans up the "fail file"
  }

};