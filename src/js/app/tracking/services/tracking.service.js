;(function() {
"use strict";

appModule('app.tracking')

   // Conditional DI, technique taken from:
   // http://phonegap-tips.com/articles/conditional-dependency-injection-with-angularjs.html

  .factory('Tracking', function ($injector, APP) {
    if (APP.devMode) {
      return $injector.get('TrackingMockImpl');
    } else {
      return $injector.get('TrackingIonicImpl');
    }
  });
}());
