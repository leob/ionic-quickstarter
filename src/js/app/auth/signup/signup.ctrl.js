;(function() {
"use strict";

var SignupCtrl = /*@ngInject*/function ($scope, $state, Application, UserService) {
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

    // log in with the user's email address and a generated (temporary) password
    var email = ('' + vm.user.email).toLowerCase();
    var password = generatePassword();

    Application.showLoading(true);

    var userData = {
      userName: email,
      password: password,
      email: email,
      fullName: email
    };

    UserService.signup(userData).then(function (signedupUser) {
      log.info("User signed up successfully");

      // send a reset-password email with a (new) temporary password
      return UserService.resetPassword(email);
    })
    .then(function (signedupUser) {
      Application.hideLoading();

      Application.setEmail(email);

      log.info("User signed up successfully");

      // go to the change-password page, displaying a message asking the user to verify their email
      Application.setState('mode', 'onboarding');
      Application.gotoPage($state, 'changePassword', {mode: 'onboarding'}, true, true);
    })
    .catch(function (error) {
      Application.hideLoading();

      if (error === "invalid_email") {
        Application.errorMessage(vm, 'message.valid-email');
      } else if (error === "already_registered") {
        Application.errorMessage(vm, 'message.already-registered');
      } else {
        Application.errorMessage(vm, 'message.unknown-error');
      }
    });
  };

  //
  // Generate a temporary password.
  //
  // Taken from: http://andreasmcdermott.com/web/2014/02/05/Email-verification-with-Firebase/#comment-1277405896
  //
  function generatePassword () {
    var possibleChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?_-';
    var password = '';
    for(var i = 0; i < 16; i += 1) {
      password += possibleChars[ Math.floor(Math.random()*possibleChars.length)];
    }
    return password;
  }

  vm.intro = function () {
    Application.gotoIntroPage($state);
  };

  vm.login = function() {
    $state.go('login');
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

};

appModule('app.auth.signup').controller('SignupCtrl', SignupCtrl);
}());
