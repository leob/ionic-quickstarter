;(function() {
"use strict";

//
// logging.js
//
// Enhance the built-in angularjs ogger with some extra features (e.g. printing the timestamp, and logging the number
// of AngularJS watchers in debug mode).
//
appModule('app.util')

  .factory('loggingDecorator', function (dateFilter) {
    var decorate = function(log) {

      log.log = enhanceLogging(log.log);
      log.info = enhanceLogging(log.info);
      log.warn = enhanceLogging(log.warn);
      log.debug = enhanceLogging(log.debug);
      log.error = enhanceLogging(log.error);

      log.getLogger = function(context) {
        return {
          log   : enhanceLogging(log.log, context),
          info  : enhanceLogging(log.info, context),
          warn  : enhanceLogging(log.warn, context),
          debug : enhanceLogging(log.debug, context, true),
          error : enhanceLogging(log.error, context)
        };
      };
    };

    // From: https://medium.com/@kentcdodds/counting-angularjs-watchers-11c5134dc2ef
    function getWatchers(root) {
      root = angular.element(root || document.documentElement);
      var watcherCount = 0;

      function getElemWatchers(element) {
        var isolateWatchers = getWatchersFromScope(element.data().$isolateScope);
        var scopeWatchers = getWatchersFromScope(element.data().$scope);
        var watchers = scopeWatchers.concat(isolateWatchers);
        angular.forEach(element.children(), function (childElement) {
          watchers = watchers.concat(getElemWatchers(angular.element(childElement)));
        });
        return watchers;
      }

      function getWatchersFromScope(scope) {
        if (scope) {
          return scope.$$watchers || [];
        } else {
          return [];
        }
      }

      return getElemWatchers(root);
    }

    function enhanceLogging(loggingFunc, context, debug) {
      return function () {
        var modifiedArguments = [].slice.call(arguments);

        var prefix = "";

        if (context) {
          prefix = '[' + context + ']';
        } else {
          prefix = dateFilter(new Date(), 'yyyy-MM-dd HH:mm:ss');
        }

        if (debug) {
          prefix += " {WATCHERS: " + getWatchers().length + "} ";
        }

        modifiedArguments[0] = prefix + " - " + modifiedArguments[0];

        loggingFunc.apply(null, modifiedArguments);
      };
    }

    return {
      decorate: decorate
    };
  })

  // see: http://blog.pdsullivan.com/posts/2015/02/19/ionicframework-googleanalytics-log-errors.html
  .factory('loggingService', function ($log, Tracking) {

    // The idea of the logging service is that serious errors in your app can be sent to a remote server so that you
    // can track problems in your app. Remote application logging, so to speak.
    //
    // Here, I've used "Tracking.trackEvent(...)" which means the Ionic.io Analytic service, but I'm not sure if this
    // is a good solution (seems you can't see the full error trace in the Ionic.io Analytics dashboard).
    //
    // Other (better?) solutions would be to use Google Analytics, or a service such as loggly, or use your own server.
    //

    //
    ///* use Google Analytics to log the error remotely */
    //
    //var logError = function(error, logger) {
    //
    //  if (!logger) {
    //    logger = $log;
    //  }
    //
    //  //if(window.cordova){
    //  //  $cordovaGoogleAnalytics.trackEvent('error handler', message);
    //  //} else {
    //    logger.error(error);
    //  //}
    //
    //  Tracking.trackEvent("error", error);
    //}

    var log = function(name, event, logger) {

      if (!logger) {
        logger = $log;
      }

      logger.log(name + " " + event);

      Tracking.trackEvent(name, event);
    };

    return {
      log: log
    };
  })

;
}());
