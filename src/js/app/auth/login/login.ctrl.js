;(function () {
  "use strict";

  var LoginCtrl = /*@ngInject*/function ($scope, $state, $stateParams, Application, UserService) {
    var vm = this;
    var log = Application.getLogger('LoginCtrl');

    $scope.$on('$ionicView.beforeEnter', function () {
      // enforce/ensure no logged in user at this point
      UserService.logoutApp();

      Application.resetForm(vm);

      vm.user = {
        username: null,
        password: null
      };
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
          Application.errorMessage(vm, 'message.invalid-credentials');
        } else {
          Application.errorMessage(vm, 'message.unknown-error');
        }
      });
    };

    vm.loginWithTwitter = function () {
      Application.showLoading(true);

      UserService.loginWithTwitter().then(function (loggedinUser) {
        Application.hideLoading();
        Application.gotoStartPage($state);
      })
      .catch(function (error) {
        Application.hideLoading();

        // login failed, check error to see why
        if (error == "invalid_credentials") {
          Application.errorMessage(vm, 'message.invalid-credentials');
        } else {
          Application.errorMessage(vm, 'message.unknown-error');
        }
      });
    };

    vm.canLoginWithTwitter = function () {
      return UserService.canLoginWithTwitter();
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

  };

  appModule('app.auth.login').controller('LoginCtrl', LoginCtrl);
}());
