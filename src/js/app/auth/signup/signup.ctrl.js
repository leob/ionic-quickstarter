/*@ngInject*/
var SignupCtrl = function ($scope, $stateParams, $state, $log, $ionicPopup, Application, UserService) {

  // vm: the "Controller as vm" convention from: http://www.johnpapa.net/angularjss-controller-as-and-the-vm-variable/
  var vm = this;
  var log = $log.getLogger('SignupCtrl');

  $scope.$on('$ionicView.beforeEnter', function() {
    vm.user = {};
    vm.error = {};
  });

  vm.signup = function(form) {

    if(!form.$valid) {
      return;
    }

    Application.showLoading(true, 'Sign up ...');

    var user = {
      username: vm.user.email,
      password: vm.user.password,
      email: vm.user.email,
      fullName: vm.user.name
    };

    UserService.signup(user)
      .then(function (signedupUser) {
        Application.hideLoading();

        Application.setUserRegistered(true);

        log.info("User signed up successfully");

        // go to the login page, displaying a message asking the user to verify their email
        $state.go('login', {verifyEmail: true});
      })
      .catch(function (error) {
        Application.hideLoading();

        if (error == "invalid_email") {
          vm.error.message = 'The email address is not valid.';
        } else if (error == "already_registered") {
          vm.error.message = 'This email address is already registered.';
        } else {
          vm.error.message =
            'An unknown error occurred, please check if you have network connectivity!';
        }
      });
  };

  vm.intro = function () {
    Application.gotoIntroPage($state);
  };

  vm.login = function() {
    $state.go('login');
  };
};

angular.module('app.auth.signup').controller('SignupCtrl', SignupCtrl);
