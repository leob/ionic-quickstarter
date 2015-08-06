/*@ngInject*/
var ForgotPasswordCtrl = function ($scope, $state, $log, Application, UserService) {
  // vm: the "Controller as vm" convention from: http://www.johnpapa.net/angularjss-controller-as-and-the-vm-variable/
  var vm = this;
  var log = $log.getLogger('ForgotPasswordCtrl');

  $scope.$on('$ionicView.beforeEnter', function () {
    vm.user = {};
    vm.error = {};
    vm.state = {
      success: false
    };
  });

  vm.reset = function (form) {
    if (!form.$valid) {
      return;
    }

    Application.showLoading(true, 'Processing ...');

    UserService.resetPassword(vm.user.email)
      .then(function () {
        Application.hideLoading();
        vm.state.success = true;

        log.info("Password reset successfully");
      })
      .catch(function (error) {
        Application.hideLoading();

        if (error == "invalid_email") {
          vm.error.message = 'This email address was not registered';
        } else {
          vm.error.message = 'An error occurred, please retry.';
        }
      });
  };

  vm.login = function () {
    $state.go('login');
  };
};

// controller and router
angular.module('app.auth.forgotPassword')
  .controller('ForgotPasswordCtrl', ForgotPasswordCtrl)
  /*@ngInject*/
  .config(function ($stateProvider) {
    $stateProvider
      .state('forgotPassword', {
        url: '/forgotPassword',
        templateUrl: 'js/app/auth/forgotPassword/forgotPassword.html',
        controller: 'ForgotPasswordCtrl as vm'
      });
  })
;
