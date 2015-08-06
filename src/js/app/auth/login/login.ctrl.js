/*@ngInject*/
var LoginCtrl = function ($scope, $state, $stateParams, Application, UserService) {
  var vm = this;

  $scope.$on('$ionicView.beforeEnter', function () {
    // enforce/ensure no logged in user at this point
    UserService.logout();

    if ($stateParams.verifyEmail) {
      vm.showVerifyEmail = true;
    }

    vm.user = {
      username: null,
      password: null
    };

    vm.error = {};
  });

  vm.login = function (form) {
    if (!form.$valid) {
      return;
    }

    Application.showLoading(true, 'Login ...');

    UserService.login(('' + vm.user.username).toLowerCase(), vm.user.password)
      .then(function (loggedinUser) {
        Application.hideLoading();

        // if there's a "logged in user" but the user's email address isn't verified we consider the user not logged in
        if (!loggedinUser.emailVerified) {
          vm.error.message = 'Your email address is not verified yet';
          vm.showVerifyEmail = true;

        } else {
          // user logged in implies the user is registered
          Application.setUserRegistered(true);

          Application.gotoStartPage($state);
        }
      })
      .catch(function (error) {
        Application.hideLoading();

        // login failed, check error to see why
        if (error == "invalid_credentials") {
          vm.error.message = 'Invalid user name or password, please try again.';
        } else {
          vm.error.message =
            'An unknown error occurred, please check if you have network connectivity!';
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
};

angular.module('app.auth.login').controller('LoginCtrl', LoginCtrl);
