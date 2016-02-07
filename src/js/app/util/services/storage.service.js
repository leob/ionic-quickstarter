;(function() {
"use strict";

appModule('app.util')

  // Conditional DI, technique taken from:
  // http://phonegap-tips.com/articles/conditional-dependency-injection-with-angularjs.html

  .factory('StorageService', function ($injector, APP) {
    //if (APP.devMode) {
      return $injector.get('StorageServiceLocalImpl');
    //} else {
    //  return $injector.get('StorageServiceLocalImpl');
    //}
  });
}());
