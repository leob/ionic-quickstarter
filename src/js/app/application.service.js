;(function () {
  "use strict";

  angular.module('app')

    //
    // This service provides a set of convenience/utility methods that you can use throughout your app.
    //
    .factory('Application', function (LocalStorage, UserService, Tracking, APP, Stopwatch, $log, loggingService,
                                      $ionicHistory, $ionicLoading, $ionicContentBanner, $translate, $timeout,
                                      $ionicScrollDelegate) {

      var init = function () {
        loggingService.log("Application#init", "start");

        UserService.init();
        Tracking.initUser(UserService.currentUser());

        loggingService.log("Application#init", "end");
      };

      var getStartPage = function () {
        var state = null;

        //
        // "initial page" logic - this determines the first page to be shown by the app.
        //
        // This way, we can guide the user through the onboarding process.
        //

        if (isInitialRun()) {
          state = 'app.intro';
        } else if (!isUserLoggedIn()) {
          state = 'login';
        } else {
          state = APP.routerDefaultState;
        }

        loggingService.log(
          "Application#getStartPage", "state = " + state);

        return {state: state, stateParams: null};
      };

      var gotoPage = function ($state, page, params, disableBackbutton, clearHistory) {

        // workaround for undesirable behavior when Ionic is showing the back button when we don't want it to
        if (disableBackbutton) {
          $ionicHistory.nextViewOptions({
            disableBack: true
          });
        }

        if (clearHistory) {
          $ionicHistory.clearHistory();
        }

        $state.go(page, params || {});
      };

      var gotoIntroPage = function ($state) {
        gotoPage($state, "app.intro", null, true);
      };

      var gotoStartPage = function ($state, clearHistory) {
        var page = getStartPage();

        // After redirecting the user to the start page we want to make sure we don't show a back-button.
        // This is why we preemptively clear the Ionic view history.
        gotoPage($state, page.state, page.stateParams, true, clearHistory);
      };

      var isInitialRun = function () {
        return LocalStorage.get("initialRun", "true") == "true";
      };

      var setInitialRun = function (initial) {
        LocalStorage.set("initialRun", initial ? "true" : "false");
      };

      var isUserLoggedIn = function () {
        return UserService.currentUser() !== null;
      };

      var showLoading = function (showBackdrop) {
        $ionicLoading.show({
          content: '',
          animation: 'fade-in',
          showBackdrop: showBackdrop,
          maxWidth: 200,
          showDelay: 0
        });
      };

      var hideLoading = function () {
        $ionicLoading.hide();
      };

      var resetForm = function (vm) {
        vm.form.$setPristine();
        vm.error = {};
      };

      var getLogger = function (context) {
        return $log.getLogger(context);
      };

      var contentBannerInit = function (vm, controllerScope) {
        vm.closeContentBanner = null;

        // before we leave the view then close/destroy the ionic-content-banner, if any
        controllerScope.$on('$ionicView.beforeLeave', function () {
          if (vm.closeContentBanner) {
            vm.closeContentBanner();
            vm.closeContentBanner = null;
          }
        });
      };

      var contentBannerShow = function (vm, keys, intervalMs, autoCloseMs, type, param) {
        var messageKeys;
        var messageParam;

        if (typeof keys === 'object' && !Array.isArray(keys)) {
          messageKeys = keys.keys;
          messageParam = keys.param;
        } else {
          messageKeys = Array.isArray(keys) ? keys : [keys];
          messageParam = param;
        }

        if (!type) {
          type = 'info';
        }

        // SCROLL TO THE TOP OF THE SCREEN, OTHERWISE THE CONTENT BANNER MIGHT NOT BE VISIBLE ! (because it gets shown
        // at the top of the Ionic View). Wrap it in a 'timeout' as per Stackoverflow:
        // stackoverflow.com/questions/29247556/ionic-scrolltop-cannot-read-property-scrollto-of-null-still-exists-in-1-0-0

        $timeout(function() {
          $ionicScrollDelegate.scrollTop();
        }, 0);

        if (!intervalMs) {
          intervalMs = 3000;
        }

        if (autoCloseMs === undefined) {
          autoCloseMs = intervalMs * messageKeys.length;
        }

        $translate(messageKeys, messageParam).then(function (translations) {

          var texts = [];

          Object.keys(translations).forEach(function (key) {
            texts.push(translations[key]);
          });

          vm.closeContentBanner = $ionicContentBanner.show({
            text: texts,
            autoClose: autoCloseMs,
            interval: intervalMs,
            type: type
          });
        });
      };

      var errorMessage = function (vm, key, vars) {
        $translate(key, vars || {}).then(function (translation) {
          vm.error.message = translation;
        });
      };

      var clearErrorMessage = function (vm) {
        vm.error.message = null;
      };

      var logStarted = function (context, message) {
        var stopwatch = new Stopwatch(context);
        stopwatch.start();

        var msg = context ? context + ' - ' : '';
        msg = msg + (message || 'STARTED');

        $log.info(msg);

        return stopwatch;
      };

      var logFinished = function (stopwatch, message) {
        logEnded($log.info, stopwatch, message);
      };

      var logError = function (stopwatch, message) {
        logEnded($log.error, stopwatch, message);
      };

      function logEnded(fn, stopwatch, message) {
        stopwatch.stop();

        var context = stopwatch.context;
        var msg = context ? context + ' - ' : '';
        msg = msg + (message || 'FINISHED');

        fn(msg + ' - DURATION: ' + stopwatch.fmtTime());
      }

      return {
        init: init,
        isInitialRun: isInitialRun,
        setInitialRun: setInitialRun,
        isUserLoggedIn: isUserLoggedIn,
        gotoPage: gotoPage,
        gotoStartPage: gotoStartPage,
        gotoIntroPage: gotoIntroPage,
        showLoading: showLoading,
        hideLoading: hideLoading,
        resetForm: resetForm,
        getLogger: getLogger,
        contentBannerInit: contentBannerInit,
        contentBannerShow: contentBannerShow,
        errorMessage: errorMessage,
        clearErrorMessage: clearErrorMessage,
        logStarted: logStarted,
        logFinished: logFinished,
        logError: logError
      };
    });
}());
