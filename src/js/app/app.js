angular.module('app.config', []);

angular.module('app.logging', []);
angular.module('app.forms', []);
angular.module('app.storage', []);

angular.module('app.user', []);
angular.module('app.tracking', []);

angular.module('app.intro', []);
angular.module('app.signup', []);
angular.module('app.login', []);
angular.module('app.forgotPassword', []);
angular.module('app.mainPage', []);

angular.module('app', [
  // libraries
  'ionic',  'ionic.service.core', 'ionic.service.analytics',  // IONIC.IO (Alpha software - disable for production?)
  'ngCordova', 'ngMessages',
  // config
  'app.config',
  // generic services
  'app.logging', 'app.forms', 'app.storage',
  // app services
  'app.user', 'app.tracking', 'app.chats',
  // controllers and routers
  'app.intro', 'app.signup', 'app.login', 'app.forgotPassword', 'app.mainPage',
  // ANGULAR-TEMPLATECACHE
  'templates'
])

  /*@ngInject*/
  .config(function ($stateProvider) {

    // top level routes (all other routes are defined within their own module)
    $stateProvider

      .state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "js/app/menu/menu.html"
      })

      // all children of 'app.auth' need a valid user
      .state('app.auth', {
        url: "/auth",
        abstract: true,
        template: '<ion-view/>',
        resolve: {
          user: function (UserService) {
            return UserService.checkUser();
          }
        }
      });
  })

  /*@ngInject*/
  .config(function ($ionicConfigProvider) {

    // http://forum.ionicframework.com/t/change-hide-ion-nav-back-button-text/5260/14
    // remove back button text, use unicode em space characters to increase touch target area size of back button
    $ionicConfigProvider.backButton.previousTitleText(false).text('&emsp;&emsp;');
  })

  /*@ngInject*/
  .config(function ($logProvider, APP) {

    // switch off debug logging in production
    $logProvider.debugEnabled(APP.devMode); // default is true
  })

  /*@ngInject*/
  .config(function ($compileProvider, APP) {

    // switch off AngularJS debug info in production for better performance
    $compileProvider.debugInfoEnabled(APP.devMode);
  })

  /*@ngInject*/
  .config(function ($ionicAppProvider, ionicIO) {
    $ionicAppProvider.identify({
      app_id: ionicIO.appId,
      api_key: ionicIO.apiKey
    });
  })

  /*@ngInject*/
  .factory('$exceptionHandler', function ($log) {

    // global AngularJS exception handler, see:
    // http://blog.pdsullivan.com/posts/2015/02/19/ionicframework-googleanalytics-log-errors.html
    return function (exception, cause) {
      exception.message += ' (caused by "' + cause + ')", stack: ' + exception.stack;
      $log.error("error: " + exception);
    };
  })

  /*@ngInject*/
  .run(function ($ionicPlatform, $ionicPopup, $ionicSideMenuDelegate, $state, $rootScope, $log, loggingDecorator,
                 Application, APP, Tracking) {

    loggingDecorator.decorate($log);

    $rootScope.$on('$stateChangeError',
      function (event, toState, toParams, fromState, fromParams, error) {

        $log.debug('$stateChangeError, to: ' + JSON.stringify(toState) + ' error: ' + JSON.stringify(error));

        // if the error is "noUser" then go to login state
        if (error && error.error === "noUser") {

          // event.preventDefault(): this is necessary to keep Ionic from loading the login page TWICE. See:
          // http://stackoverflow.com/questions/22936865/handling-error-in-ui-routers-resolve-function-aka-statechangeerror-passing-d
          event.preventDefault();

          $state.go('login');
        }
      });

    $ionicPlatform.ready(function () {

      // tracking/analytics (Ionic.io)
      Tracking.init({
        // SET TO FALSE TO ENABLE IONIC.IO TRACKING
        dryRun: APP.noTracking
      });

      // hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
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

      // prevent the Android hardware back button from exiting the app 'unvoluntarily' - ask the user to confirm; see:
      // http://www.gajotres.net/ionic-framework-handling-android-back-button-like-a-pro/
      $ionicPlatform.registerBackButtonAction(function(event) {
        if ($ionicHistory.backView() === null) {  // no more previous screen in the history stack, so "back" would exit
          $ionicPopup.confirm({
            title: 'Plase confirm',
            template: 'Are you sure you want to exit the app?'
          }).then(function(res) {
            if (res) {
              ionic.Platform.exitApp();
            }
          })
        }
      }, 100);  // 100 = previous view

      Application.init();
      Application.gotoStartPage($state);
    });
  });
