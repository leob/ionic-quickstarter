;(function() {
"use strict";

appModule('app.util')

  // Conditional DI, technique taken from:
  // http://phonegap-tips.com/articles/conditional-dependency-injection-with-angularjs.html

  .factory('TrackingService', function ($injector, APP) {
    //if (APP.devMode) {
      return $injector.get('TrackingServiceDummyImpl');
    //} else {
    //  return $injector.get('TrackingServiceLogentriesImpl');
    //}
  });
}());
