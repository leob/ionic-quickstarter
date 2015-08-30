;(function() {
"use strict";

var ForgotPasswordCtrl = /*@ngInject*/function ($scope, $state, $translate, Application, UserService) {
  // vm: the "Controller as vm" convention from: http://www.johnpapa.net/angularjss-controller-as-and-the-vm-variable/
  var vm = this;
  var log = Application.getLogger('ForgotPasswordCtrl');

  $scope.$on('$ionicView.beforeEnter', function () {
    Application.resetForm(vm);
    vm.user = {};
  });

  vm.reset = function (form) {
    if (!form.$valid) {
      return;
    }

    Application.showLoading(true);

    UserService.resetPassword(vm.user.email).then(function () {
        Application.hideLoading();

        log.info("Password reset successfully");

        // go to the login page, displaying a message asking the user to verify their email
        $state.go('login', {verifyEmail: 'verify'});
      })
      .catch(function (error) {
        Application.hideLoading();

        if (error == "invalid_email") {
          vm.errorMessage('message.not-registered');
        } else {
          vm.errorMessage('message.unknown-error');
        }
      });
  };

  vm.login = function () {
    $state.go('login');
  };

  vm.errorMessage = function (key, vars) {
    $translate(key, vars || {}).then(function (translation) {
      vm.error.message = translation;
    });
  };

};

// controller and router
appModule('app.auth.forgotPassword')
  .controller('ForgotPasswordCtrl', ForgotPasswordCtrl)
  .config(function ($stateProvider) {
    $stateProvider
      .state('forgotPassword', {
        url: '/forgotPassword',
        templateUrl: 'js/app/auth/forgotPassword/forgotPassword.html',
        controller: 'ForgotPasswordCtrl as vm'
      });
  })
;
}());
