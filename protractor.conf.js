/* global browser */
exports.config = {
        allScriptsTimeout: 20000,
        specs: [
                // E2E test specs are organized by user stories, not necessarily
                // reflecting the code structure of the project. Imagine things your
                // users might do, and write e2e tests around those behaviors.
                'test/e2e/**/*.spec.js',
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