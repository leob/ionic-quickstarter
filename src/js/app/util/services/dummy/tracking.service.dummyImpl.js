;(function() {
"use strict";

appModule('app.util')

  .factory('TrackingServiceDummyImpl', function () {

    var trackEvent = function (logLevel, message) {
      // do nothing  :-)
    };

    return {
      trackEvent: trackEvent
    };
  })
;
}());
