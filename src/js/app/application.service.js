;(function () {
  "use strict";

  angular.module('app')

    //
    // This service provides a set of convenience/utility methods that you can use throughout your app.
    //
    .factory('Application', function (StorageService, UserService, APP, Stopwatch, $log, $ionicPlatform, $ionicHistory,
                                      $ionicLoading, $ionicContentBanner, $translate, $timeout, $ionicScrollDelegate,
                                      $rootScope, $ionicPopup, $cordovaToast) {


      var deviceReady = false;
      var ionicPlatformReady = false;

      var appMessage = null;
      var appState = {};

      var init = function () {
        var w = logStarted('Application#init');

        UserService.init();

        logFinished(w);
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

        $log.info("Application#getStartPage - state = " + state);

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

      var gotoUserProfilePage = function ($state, onboarding) {
        gotoPage($state, 'app.auth.userProfile', onboarding ? {mode: 'onboarding'} : {}, true, true);
      };

      var gotoStartPage = function ($state, clearHistory) {
        var page = getStartPage();

        // After redirecting the user to the start page we want to make sure we don't show a back-button.
        // This is why we preemptively clear the Ionic view history.
        gotoPage($state, page.state, page.stateParams, true, clearHistory);
      };

      var isInitialRun = function () {
        return StorageService.get("initialRun", "true") == "true";
      };

      var setInitialRun = function (initial) {
        StorageService.set("initialRun", initial ? "true" : "false");
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
        vm.form.parent = vm;
        vm.error = {};
      };

      var getLogger = function (context) {
        return $log.getLogger(context);
      };

      var setMessage = function (message) {
        appMessage = message;
      };

      var getMessage = function () {
        var message = appMessage;
        appMessage = null;

        return message;
      };

      var setState = function (key, value) {
        appState[key] = value;
      };

      var getState = function (key) {
        var value = appState[key];

        return value;
      };

      var getAndClearState = function (key) {
        var value = appState[key];
        delete appState[key];

        return value;
      };

      var isObjectEmpty = function (object) {
        if (!object) {
          return true;
        }

        for (var key in object) {
          if (object.hasOwnProperty(key)) {
            return false;
          }
        }
        return true;
      };

      var isObjectNotEmpty = function (object) {
        return !isObjectEmpty(object);
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

      var getEmail = function () {
        return StorageService.get("email", null);
      };

      var setEmail = function (value) {
        StorageService.set("email", value);
      };

      var isDeviceReady = function () {
        return deviceReady;
      };

      var setDeviceReady = function (ready) {
        deviceReady = ready;
      };

      var isIonicPlatformReady = function () {
        return ionicPlatformReady;
      };

      var setIonicPlatformReady = function (ready) {
        ionicPlatformReady = ready;
      };

      var deregisterBackbuttonHandler = null;

      var registerBackbuttonHandler = function () {

        unregisterBackbuttonHandler();

        // Prevent the Android hardware back button from exiting the app 'unvoluntarily' - ask the user to confirm; see:
        //
        // http://www.gajotres.net/ionic-framework-handling-android-back-button-like-a-pro/
        // http://forum.ionicframework.com/t/handling-the-hardware-back-buttons/1505/23
        //
        // If more flexibility is needed then one can implement something along these lines:
        //
        // https://gist.github.com/kyletns/93a510465e433c1981e1
        //
        deregisterBackbuttonHandler = $ionicPlatform.registerBackButtonAction(function (event) {

          if ($ionicHistory.backView() === null) {  // no more previous screen in the history stack, so "back" would exit
            var key = 'exit-popup.';

            $translate(key + 'text', {you: $rootScope._y}).then(function (translation) {

              $translate([key + 'title', key + 'ok-button', key + 'cancel-button']).then(function (translations) {

                $ionicPopup.confirm({
                  title: translations[key + 'title'],
                  template: translation,
                  cssClass: 'info-popup',
                  cancelText: translations[key + 'cancel-button'],
                  okText: translations[key + 'ok-button']
                }).then(function (res) {
                  if (res) {
                    ionic.Platform.exitApp();
                  }
                });

              });
            });

          } else {
            $ionicHistory.goBack();
          }
        }, 100);  // 100 = previous view

        return deregisterBackbuttonHandler;
      };

      var unregisterBackbuttonHandler = function () {
        if (deregisterBackbuttonHandler) {
          deregisterBackbuttonHandler();
          deregisterBackbuttonHandler = null;
        }
      };

      function doShowToast(message, displayLongOrShort) {
        if (window.cordova) {
          if (displayLongOrShort === 'short') {
            $cordovaToast.showShortCenter(message).then(function (success) {
              $log.debug("Success: showToastShort('" + message + "')");
            }, function (error) {
              $log.error("Error: showToastShort('" + message + "'), error: " + JSON.stringify(error));
            });
          } else {
            $cordovaToast.showLongCenter(message).then(function (success) {
              $log.debug("Success: showToastLong('" + message + "')");
            }, function (error) {
              $log.error("Error: showToastLong('" + message + "'), error: " + JSON.stringify(error));
            });
          }
        } else {
          $log.warn("NOTE - not running on device: showToast('" + message + "')");
        }
      }

      var showToast = function (messageOrKey, translateMessage, displayLongOrShort) {

        if (translateMessage) {

          $translate(messageOrKey).then(function (translation) {
            doShowToast(translation, displayLongOrShort);
          });

        } else {
          doShowToast(messageOrKey, displayLongOrShort);
        }
      };

      return {
        init: init,
        isInitialRun: isInitialRun,
        setInitialRun: setInitialRun,
        isUserLoggedIn: isUserLoggedIn,
        isDeviceReady: isDeviceReady,
        setDeviceReady: setDeviceReady,
        isIonicPlatformReady: isIonicPlatformReady,
        setIonicPlatformReady: setIonicPlatformReady,
        registerBackbuttonHandler: registerBackbuttonHandler,
        unregisterBackbuttonHandler: unregisterBackbuttonHandler,
        gotoPage: gotoPage,
        gotoStartPage: gotoStartPage,
        gotoIntroPage: gotoIntroPage,
        gotoUserProfilePage: gotoUserProfilePage,
        showLoading: showLoading,
        hideLoading: hideLoading,
        resetForm: resetForm,
        getLogger: getLogger,
        setMessage: setMessage,
        getMessage: getMessage,
        setState: setState,
        getState: getState,
        getAndClearState: getAndClearState,
        isObjectEmpty: isObjectEmpty,
        isObjectNotEmpty: isObjectNotEmpty,
        contentBannerInit: contentBannerInit,
        contentBannerShow: contentBannerShow,
        errorMessage: errorMessage,
        clearErrorMessage: clearErrorMessage,
        logStarted: logStarted,
        logFinished: logFinished,
        logError: logError,
        getEmail: getEmail,
        setEmail: setEmail,
        showToast: showToast
      };
    });
}());
