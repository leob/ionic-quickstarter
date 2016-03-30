;(function () {
  "use strict";

//
// app.js
//
// Main application script
//

// Declare the 'app.config' module, this is because config.js is generated and doesn't the app.config module itself
  angular.module('app.config', []);

//
// Declare the main 'app' module and state its dependencies. All of the other modules will "declare themselves".
//
// NOTE: looked at gulp-angular-modules (https://github.com/yagoferrer/gulp-angular-modules) which should make it
// possible to get rid of manually managing the list of dependencies. However, I couldn't get this to work.
//
  angular.module('app', [
    // libraries
    'ionic',
    "firebase",
    'ngCordova', 'ngMessages', 'fusionMessages',
    // angular-translate
    'pascalprecht.translate',
    // ionic-content-banner
    'jett.ionic.content.banner',
    // iblank/ngImgCrop
    'ngImgCrop',
    // config
    'app.config',
    // generic services
    'app.util', 'app.firebase', 'app.hooks', 'app.user', 'app.oauthUtil', 'app.image',
    // controllers and routers
    'app.intro', 'app.auth.signup', 'app.auth.login', 'app.auth.forgotPassword', 'app.auth.changePassword',
    'app.mainPage', 'app.manage',
    // ANGULAR-TEMPLATECACHE
    'templates'
  ])
  .config(function ($stateProvider) {

    // top level routes (all other routes are defined within their own module)
    $stateProvider

      .state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "js/app/menu/menu.html"
      })

      .state('app.auth', {
        url: "/auth",
        abstract: true,
        template: '<ion-view/>'
      });
  })

  .config(function ($ionicConfigProvider) {

    // http://forum.ionicframework.com/t/change-hide-ion-nav-back-button-text/5260/14
    // remove back button text, use unicode em space characters to increase touch target area size of back button
    $ionicConfigProvider.backButton.previousTitleText(false).text('&emsp;&emsp;');

    // NOTE: we put the tabs at the top for both Android and iOS
    $ionicConfigProvider.tabs.position("top");

    //$ionicConfigProvider.navBar.alignTitle('center');
    //
    //$ionicConfigProvider.navBar.positionPrimaryButtons('left');
    //$ionicConfigProvider.navBar.positionSecondaryButtons('right');
  })

  .config(function ($logProvider, APP) {

    // switch off debug logging in production
    $logProvider.debugEnabled(APP.devMode); // default is true
  })

  .config(function ($compileProvider, APP) {

    // switch off AngularJS debug info in production for better performance
    $compileProvider.debugInfoEnabled(APP.devMode);
  })

  .config(function ($translateProvider) {
    $translateProvider
      .useStaticFilesLoader({
        prefix: 'js/locales/',
        suffix: '.json'
      })
      .registerAvailableLanguageKeys(['en'], {
        'en': 'en', 'en_GB': 'en', 'en_US': 'en'
      })
      .preferredLanguage('en')
      .fallbackLanguage('en')
      .useSanitizeValueStrategy('escapeParameters');
  })

  .factory('$exceptionHandler', function ($log) {

    // global AngularJS exception handler, see:
    // http://blog.pdsullivan.com/posts/2015/02/19/ionicframework-googleanalytics-log-errors.html
    return function (exception, cause) {
      $log.error("error: " + exception + ', caused by "' + cause + '", stack: ' + exception.stack);
    };
  })

  .run(function ($ionicPlatform, $ionicPopup, $ionicSideMenuDelegate, $ionicHistory, $state, $rootScope, $translate,
                 $log, $timeout, $cordovaDevice, loggingDecorator, Application, APP, UserService,
                 FirebaseConfiguration) {

    loggingDecorator.decorate($log);

    if (FirebaseConfiguration.debug === true) {
      Firebase.enableLogging(function (logMessage) {
        //$log.log(new Date().toISOString() + ': ' + logMessage);
        $log.log('FB: ' + logMessage);
      });
    }

    $rootScope.$on('$stateChangeError',
      function (event, toState, toParams, fromState, fromParams, error) {

        $log.debug('$stateChangeError, to: ' + JSON.stringify(toState) + ' error: ' + JSON.stringify(error));
      });

    function isValidUser() {
      if (!UserService.isUserLoggedIn()) {
        return false;
      }

      //
      // TO DO: we might check for the user role here, e.g:
      //
      // var userRole = UserService.getUserRole();
      //
      // Then if the page we want to go to requires a specific role (e.g. "admin") then we might block access (by
      // returning 'false' if the user does not have that role, see this page which explains the technique:
      //
      // www.jvandemo.com/how-to-use-areas-and-border-states-to-control-access-in-an-angular-application-with-ui-router
      //

      //
      // Sample code to illustrate this (commented out for now):
      //

      //var userType = UserService.getUserType();
      //
      //// if the userType is not known (not specified, or user data not loaded yet), then say that the user is 'valid'
      //if (!userType) {
      //  $log.log('User type not yet known');
      //  return true;
      //}
      //
      //// userType should start with "admin"
      //var userTypeValid = userType.match(/admin/);
      //
      //$log.log("userType = '" + userType + "' userTypeValid = " + userTypeValid);
      //
      //return userTypeValid;

      return true;
    }

    function checkValidUser() {

      if (!isValidUser()) {
        $log.debug('APP - no valid user, redirect to login');

        // redirect to login page
        $timeout(function () {
          $state.go('login', {});
        }, 0);

        return false;
      }

      return true;
    }

    // www.jvandemo.com/how-to-use-areas-and-border-states-to-control-access-in-an-angular-application-with-ui-router/
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      // when state name matches 'app.auth.*' then login is required
      if (toState.name && toState.name.match(/^app\.auth\./)) {

        if (!isValidUser()) {

          // cancel state change
          event.preventDefault();

          // redirect to login page
          return $state.go('login', {});
        }
      }
    });

    $rootScope.$on(UserService.loadUserDataSuccess(), function (event, userData) {
      $log.info('APP - user data loaded, userRole: ' + userData.userRole);

      // store the userRole back into the user object
      UserService.setUserRole(userData.userRole);

      // check valid user now that the user data has been loaded (so the user's role is know)
      checkValidUser();
    });

    $rootScope.$on(UserService.loadUserDataError(), function (event, error) {
      $log.error("APP - error loading user data");

      // check valid user now that the user data has been loaded (so the user's role is know)
      checkValidUser();
    });

    $ionicPlatform.ready(function () {
      $log.info('IONIC PLATFORM READY');

      Application.setIonicPlatformReady(true);

      // hide or show the accessory bar by default (set the value to false to show the accessory bar above the keyboard
      // for form inputs - see: https://github.com/driftyco/ionic-plugin-keyboard/issues/97 and
      // http://forum.ionicframework.com/t/ionic-select-is-missing-the-top-confirm-part-in-ios/30538
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      }
      if (window.StatusBar) {   // org.apache.cordova.statusbar required
        StatusBar.styleLightContent();   //StatusBar.styleDefault();   // ?
      }

      // Add the ability to close the side menu by swiping to te right, see:
      // http://forum.ionicframework.com/t/bug-ionic-beta-14-cant-close-sidemenu-with-swipe/14236/17
      document.addEventListener('touchstart', function (event) {
        if ($ionicSideMenuDelegate.isOpenLeft()) {
          event.preventDefault();
        }
      });

      Application.registerBackbuttonHandler();
      Application.init();

      checkDeviceReady();

      Application.gotoStartPage($state);
    });

    function checkDeviceReady() {

      if (window.cordova) {
        document.addEventListener("deviceready", function () {
          $log.info("checkDeviceReady: device is ready");

          Application.setDeviceReady(true);

          var device = $cordovaDevice.getDevice();
          $log.info("DEVICE: " + JSON.stringify(device));

          //if (device && device.uuid) {
          //  loggingService.setDeviceId(device.uuid);
          //}
        }, false);
      }
    }

  });
}());
