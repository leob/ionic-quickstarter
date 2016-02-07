;(function() {
  "use strict";

//
// Enhance the built-in angularjs logger with some extra features (e.g. printing the timestamp, and logging the number
// of AngularJS watchers in debug mode).
//

  appModule('app.util')

    .factory('loggingDecorator', function (loggingService, dateFilter, TrackLogLevels) {
      var decorate = function(log, appName) {

        log.log = enhanceLogging(log.log, appName, 'LOG', TrackLogLevels.log);
        log.info = enhanceLogging(log.info, appName, 'INFO', TrackLogLevels.info);
        log.warn = enhanceLogging(log.warn, appName, 'WARN', TrackLogLevels.warn);
        log.debug = enhanceLogging(log.debug, appName, 'DEBUG', TrackLogLevels.debug);
        log.error = enhanceLogging(log.error, appName, 'ERROR', TrackLogLevels.error);

        log.getLogger = function(context) {
          return {
            log   : enhanceLogging(log.log, appName, 'LOG', TrackLogLevels.log, context),
            info  : enhanceLogging(log.info, appName, 'INFO', TrackLogLevels.info, context),
            warn  : enhanceLogging(log.warn, appName, 'WARN', TrackLogLevels.warn, context),
            debug : enhanceLogging(log.debug, appName, 'DEBUG', TrackLogLevels.debug, context, true),
            error : enhanceLogging(log.error, appName, 'ERROR', TrackLogLevels.error, context)
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

      function enhanceLogging(loggingFunc, appName, logLevel, trackLogLevel, context, debug) {
        return function () {
          var modifiedArguments = [].slice.call(arguments);

          var prefix = '';

          if (!trackLogLevel) {
            prefix = logLevel + ' - ';
          }

          if (appName) {
            prefix = prefix + appName + ' - ';
          }

          if (context) {
            prefix = prefix + '[' + context + ']';
          } else {
            prefix = prefix + dateFilter(new Date(), 'yyyy-MM-dd HH:mm:ss');
          }

          if (debug) {
            prefix += " {WATCHERS: " + getWatchers().length + "} ";
          }

          modifiedArguments[0] = prefix + " - " + modifiedArguments[0];

          if (trackLogLevel) {
            loggingService.log(context || '(unknown)', loggingFunc, logLevel, modifiedArguments);
          } else {
            loggingFunc.apply(null, modifiedArguments);
          }
        };
      }

      return {
        decorate: decorate
      };
    })

    // see: http://blog.pdsullivan.com/posts/2015/02/19/ionicframework-googleanalytics-log-errors.html
    .factory('loggingService', function (APP, TrackingService) {

      var deviceId = null;

      var setDeviceId = function(id) {
        deviceId = id;
      };

      var log = function(context, loggingFunc, logLevel, args) {
        var message = args[0];
        args[0] = logLevel + ' - ' + args[0];

        loggingFunc.apply(null, args);

        if (APP.tracking) {
          trackEvent(logLevel, message);
        }
      };

      //
      // Track an event using some kind of (remote) tracking/logging system.
      //
      function trackEvent(logLevel, message) {
        var prefix = deviceId ? deviceId + ' - ' : '';

        TrackingService.trackEvent(logLevel, prefix + message);
      }

      return {
        setDeviceId: setDeviceId,
        log: log
      };
    })
  ;
}());
