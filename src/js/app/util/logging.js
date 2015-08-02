angular.module('app.logging')

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
