;(function() {
"use strict";

//
// Track an event using the Logentries service.
//
// NOTE: for this to work, edit the "index-template.html" file, uncomment the following 4 lines, and substitute
// your Logentries token into the "LE.init" call:
//
// <!--<script src="js/lib/logentries/le.min.js"></script>-->
//    <!--<script>-->
//    <!--LE.init({token: 'PASTE-YOUR-LOGENTRIES-TOKEN-HERE', print: false});-->
//  <!--</script>-->
//

appModule('app.util')
  .factory('TrackingServiceLogentriesImpl', function () {

    var trackEvent = function (logLevel, message) {
      // Note: object "LE" is defined by logentries/le.min.js
      if (logLevel === 'ERROR') {
        LE.error(message);
      } else if (logLevel === 'WARN') {
        LE.warn(message);
      } else if (logLevel === 'INFO') {
        LE.info(message);
      } else {
        LE.log(message);
      }
    };

    return {
      trackEvent: trackEvent
    };
  })
;
}());
