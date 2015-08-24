/* global browser */
exports.config = {
        seleniumServerJar: './node_modules/protractor/selenium/selenium-server-standalone-2.44.0.jar',
        chromeDriver: './node_modules/protractor/selenium/chromedriver',
        allScriptsTimeout: 20000,
        specs: [
                // E2E test specs are organized by user stories, not necessarily
                // reflecting the code structure of the project. Imagine things your
                // users might do, and write e2e tests around those behaviors.
                //'test/e2e/auth/forgotPassword.spec.js',
                'test/e2e/auth/login.spec.js',
                //'test/e2e/auth/signup.spec.js'
        ],
        capabilities: {
                // You can use other browsers
                // like firefox, phantoms, safari, IE, etc.
                'browserName': 'chrome' 
        },
        
        baseUrl: 'http://localhost:8100',
        
        framework: 'jasmine',
        
        jasmineNodeOpts: {
                showColors: true,
                defaultTimeoutInterval: 30000,
                isVerbose: true,
        }
};