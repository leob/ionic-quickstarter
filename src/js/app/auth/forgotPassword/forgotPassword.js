;(function() {
"use strict";

var ForgotPasswordCtrl = /*@ngInject*/function ($scope, $state, $translate, Application, UserService) {
  // vm: the "Controller as vm" convention from: http://www.johnpapa.net/angularjss-controller-as-and-the-vm-variable/
  var vm = this;
  var log = Application.getLogger('ForgotPasswordCtrl');

  $scope.$on('$ionicView.beforeEnter', function () {
    Application.resetForm(vm);

    vm.user = {
      email: Application.getEmail()
    };
  });

  vm.reset = function (form) {
    if (!form.$valid) {
      return;
    }

    Application.showLoading(true);

    UserService.resetPassword(('' + vm.user.email).toLowerCase()).then(function () {
      Application.hideLoading();

      log.info("Password reset successfully");

      // go to the change-password page, displaying a message asking the user to verify their email
      Application.setState('mode', 'reset-password');
      $state.go('changePassword', {mode: 'reset-password'});
    })
    .catch(function (error) {
      Application.hideLoading();

      if (error === "invalid_email") {
        Application.errorMessage(vm, 'message.not-registered');
      } else {
        Application.errorMessage(vm, 'message.unknown-error');
      }
    });
};

  vm.login = function () {
    $state.go('login');
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
