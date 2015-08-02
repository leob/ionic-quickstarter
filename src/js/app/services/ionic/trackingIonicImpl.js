angular.module('app.tracking')

  .factory('TrackingIonicImpl', function ($log, $ionicUser, $ionicAnalytics) {

    var init = function (options) {
      $log.debug("TrackingIonicImpl#init");

      $ionicAnalytics.register(options);
    };

    var initUser = function (user) {

      $log.debug("TrackingIonicImpl#initUser with user: " + (user ? user.username : "(none)"));

      // Identify the user (if any) to ionic,io through the user's username (if available).
      // This will aid in making sense of the ionic.io Analytics data.

      // Note: the function returns a promise, so it will finalize in the background, we don't wait for its resolution.

      if (user && user.username) {

        $ionicUser.identify({
          user_id: user.username
        });
      }
    };

    var trackEvent = function (name, event) {
      try {
        $ionicAnalytics.track(name, {event: event});
      } catch (e) {
        $log.error("error tracking " + name + ":" + e);
      }
    };

    return {
      init: init,
      initUser: initUser,
      trackEvent: trackEvent
    };
  });
