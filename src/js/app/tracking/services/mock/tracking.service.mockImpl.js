;(function() {
"use strict";

appModule('app.tracking')

  .factory('TrackingMockImpl', function ($log) {

    var init = function (options) {
      $log.debug("TrackingMockImpl#init " + (options ? "with" : "without") + " options");
    };

    var initUser = function (user) {
      $log.debug("TrackingMockImpl#initUser with user: " + (user ? user.username : "(none)"));
    };

    var trackEvent = function (name, event) {
      $log.debug("TrackingMockImpl#trackEvent for '" + name + "'");
    };

    return {
      init: init,
      initUser: initUser,
      trackEvent: trackEvent
    };
  });
}());
