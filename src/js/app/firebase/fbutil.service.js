;(function() {
"use strict";

//
// Enhance the built-in angularjs ogger with some extra features (e.g. printing the timestamp, and logging the number
// of AngularJS watchers in debug mode).
//

appModule('app.firebase')

  .factory('fbutil', function (FirebaseConfiguration, $window) {

    var ref = function (path) {
      return new $window.Firebase(FirebaseConfiguration.url + (path || ''));
    };

    return {
      ref: ref
    };
  })
;
}());
