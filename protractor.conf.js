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
  //seleniumAddress: 'http://localhost:4444/wd/hub',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    isVerbose: true,
    //isVerbose: false,
    //stackoverflow.com/questions/28893436/how-to-stop-protractor-from-running-further-testcases-on-failure
    realtimeFailure: true,
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
  },

  afterLaunch: function () {
    failFast.clean(); // Cleans up the "fail file"
  }

};