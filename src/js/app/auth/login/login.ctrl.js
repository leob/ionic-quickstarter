;(function () {
  "use strict";

  var LoginCtrl = /*@ngInject*/function ($scope, $state, $stateParams, Application, UserService, $translate,
                                         $ionicContentBanner) {
    var vm = this;

    $scope.$on('$ionicView.beforeEnter', function () {
      // enforce/ensure no logged in user at this point
      UserService.logout();

      Application.resetForm(vm);

      vm.user = {
        username: null,
        password: null
      };
    });

    var closeContentBanner = null;

      // the ionic-content-banner needs to be displayed in the 'enter' event because it will only work if the view
      // is displayed completely
      $scope.$on('$ionicView.enter', function () {

        if ($stateParams.verifyEmail) {
          var messageKey;
          var messageParams;

          if ($stateParams.verifyEmail === 'verify') {
            messageKey = 'message.check-your-email';
          } else {    // $stateParams.verifyEmail === 'notVerified'
            messageKey = 'message.email-not-verified';
          }

          $translate(messageKey).then(function (translation) {
            closeContentBanner = $ionicContentBanner.show({text: [translation]});
          });
        }
    });

    // before we leave the view then close/destroy the ionic-content-banner, if any
    $scope.$on('$ionicView.beforeLeave', function () {
      if (closeContentBanner) {
        closeContentBanner();
      }
    });

    vm.login = function (form) {
      if (!form.$valid) {
        return;
      }

      Application.showLoading(true);

      UserService.login(('' + vm.user.username).toLowerCase(), vm.user.password).then(function (loggedinUser) {
        Application.hideLoading();
        Application.gotoStartPage($state);
      })
        .catch(function (error) {
          Application.hideLoading();

          // login failed, check error to see why
          if (error == "invalid_credentials") {
            vm.errorMessage('message.invalid-credentials');
          } else if (error == "not_verified") {
            vm.errorMessage('message.email-not-verified');
          } else {
            vm.errorMessage('message.unknown-error');
          }
        });
    };

    vm.forgot = function () {
      $state.go('forgotPassword');
    };

    vm.signup = function () {
      $state.go('signup');
    };

    vm.intro = function () {
      Application.gotoIntroPage($state);
    };

    vm.errorMessage = function (key, vars) {
      $translate(key, vars || {}).then(function (translation) {
        vm.error.message = translation;
      });
    };

  };

  appModule('app.auth.login').controller('LoginCtrl', LoginCtrl);
}());
