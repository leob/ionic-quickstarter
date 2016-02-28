;(function () {
"use strict";

var ChangePasswordCtrl = /*@ngInject*/function ($scope, $state, $stateParams, $translate, Application, UserService) {

  var vm = this;
  var onboarding = false;

  $scope.$on('$ionicView.beforeEnter', function () {

    var mode = Application.getState('mode');
    onboarding = (mode === 'onboarding');

    Application.contentBannerInit(vm, $scope);

    // enforce/ensure no logged in user at this point
    UserService.logoutApp();

    Application.resetForm(vm);

    vm.user = {
      userName: Application.getEmail(),
      passwordOld: null,
      passwordNew: null
    };

    var key = onboarding ? 'auth.changePassword-onboarding-title' : 'auth.changePassword-title';

    $translate(key).then(function (translation) {
      vm.title = translation;
    });

  });

  // the ionic-content-banner needs to be displayed in the 'enter' event because it will only work if the view
  // is displayed completely
  $scope.$on('$ionicView.enter', function () {
    var keys = ['message.check-your-email1', 'message.check-your-email2'];

    Application.contentBannerShow(vm, keys, null, null, 'error');
  });

  vm.changePassword = function (form) {
    if (!form.$valid) {
      return;
    }

    var email = ('' + vm.user.userName).toLowerCase();

    Application.showLoading(true);

    UserService.changePassword(email, vm.user.passwordOld, vm.user.passwordNew).then(function () {

        return UserService.login(email, vm.user.passwordNew);

    }).then(function () {
      Application.hideLoading();

      var key = onboarding ? 'auth.changePassword-onboarding-success' : 'auth.changePassword-success';

      $translate(key).then(function (translation) {
        Application.showToast(translation);

        if (onboarding) {
          Application.gotoUserProfilePage($state, true);
        } else {
          Application.gotoStartPage($state);
        }
      });
    }).catch(function (error) {
      Application.hideLoading();

      // login failed, check error to see why
      if (error === "invalid_credentials") {
        Application.errorMessage(vm, 'message.invalid-credentials');
      } else {
        Application.errorMessage(vm, 'message.unknown-error');
      }
    });

  };

  vm.login = function () {
    $state.go('login');
  };
};

appModule('app.auth.changePassword').controller('ChangePasswordCtrl', ChangePasswordCtrl);
}());
