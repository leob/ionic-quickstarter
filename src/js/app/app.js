;(function () {
  "use strict";

//
// app.js
//
// Main application sript
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
    'ionic', //'ionic.service.core', 'ionic.service.analytics',  // IONIC.IO (Alpha software - disable for production?)
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
    'app.util', 'app.firebase',
    // app services
    'app.user', 'app.image',
    // controllers and routers
    'app.intro', 'app.auth.signup', 'app.auth.login', 'app.auth.forgotPassword', 'app.mainPage', 'app.manage',
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

  //.config(function ($ionicAppProvider, ionicIO) {
  //  $ionicAppProvider.identify({
  //    app_id: ionicIO.appId,
  //    api_key: ionicIO.apiKey
  //  });
  //})

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
      exception.message += ' (caused by "' + cause + ')", stack: ' + exception.stack;
      $log.error("error: " + exception);
    };
  })

  .run(function ($ionicPlatform, $ionicPopup, $ionicSideMenuDelegate, $ionicHistory, $state, $rootScope, $translate,
                 $log, loggingDecorator, Application, APP, UserService, FirebaseConfiguration) {

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

    $ionicPlatform.ready(function () {

      //// tracking/analytics (Ionic.io)
      //Tracking.init({
      //  // SET TO FALSE TO ENABLE IONIC.IO TRACKING, IF SET TO TRUE THEN THE IONIC ANALYTICS LIB DOES NOTHING
      //  dryRun: APP.noTracking
      //});

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

      // Prevent the Android hardware back button from exiting the app 'unvoluntarily' - ask the user to confirm; see:
      //
      // http://www.gajotres.net/ionic-framework-handling-android-back-button-like-a-pro/
      // http://forum.ionicframework.com/t/handling-the-hardware-back-buttons/1505/23
      //
      // If more flexibility is needed then one can implement something along these lines:
      //
      // https://gist.github.com/kyletns/93a510465e433c1981e1
      //
      $ionicPlatform.registerBackButtonAction(function (event) {

        if ($ionicHistory.backView() === null) {  // no more previous screen in the history stack, so "back" would exit
          var key = 'exit-popup.';

          $translate([key + 'title', key + 'text', key + 'ok-button', key + 'cancel-button']).then(function (translations) {

            $ionicPopup.confirm({
              title: translations[key + 'title'],
              template: translation,
              cancelText: translations[key + 'cancel-button'],
              okText: translations[key + 'ok-button']
            }).then(function (res) {
              if (res) {
                ionic.Platform.exitApp();
              }
            });

          });

        } else {
          $ionicHistory.goBack();
        }
      }, 100);  // 100 = previous view

      Application.init();
      Application.gotoStartPage($state);
    });
  });
}());
