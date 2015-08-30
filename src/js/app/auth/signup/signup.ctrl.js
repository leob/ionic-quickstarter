;(function() {
"use strict";

var SignupCtrl = /*@ngInject*/function ($scope, $state, Application, UserService, $translate) {
  // vm: the "Controller as vm" convention from: http://www.johnpapa.net/angularjss-controller-as-and-the-vm-variable/
  var vm = this;
  var log = Application.getLogger('SignupCtrl');

  $scope.$on('$ionicView.beforeEnter', function() {
    Application.resetForm(vm);
    vm.user = {};
  });

  vm.signup = function(form) {

    if(!form.$valid) {
      return;
    }

    Application.showLoading(true);

    var user = {
      username: vm.user.email,
      password: vm.user.password,
      email: vm.user.email,
      fullName: vm.user.name
    };

    UserService.signup(user).then(function (signedupUser) {
        Application.hideLoading();
        Application.setUserRegistered(true);

        log.info("User signed up successfully");

        // go to the login page, optionally displaying a message asking the user to verify their email
        $state.go('login', !signedupUser.emailVerified ? {verifyEmail: 'verify'} : {});
      })
      .catch(function (error) {
        Application.hideLoading();

        if (error == "invalid_email") {
          vm.errorMessage('message.valid-email');
        } else if (error == "already_registered") {
          vm.errorMessage('message.already-registered');
        } else {
          vm.errorMessage('message.unknown-error');
        }
      });
  };

  vm.intro = function () {
    Application.gotoIntroPage($state);
  };

  vm.login = function() {
    $state.go('login');
  };

  vm.errorMessage = function (key, vars) {
    $translate(key, vars || {}).then(function (translation) {
      vm.error.message = translation;
    });
  };

};

appModule('app.auth.signup').controller('SignupCtrl', SignupCtrl);
}());
