;(function() {
"use strict";

appModule('app.auth.signup')
  .config(function ($stateProvider) {
    $stateProvider
      .state('signup', {
        url: '/signup',
        templateUrl: 'js/app/auth/signup/signup.html',
        controller: 'SignupCtrl as vm'
      });
  });
}());
