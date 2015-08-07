;(function() {
"use strict";

appModule('app.auth.login')
  .config(function ($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login?verifyEmail',
        templateUrl: 'js/app/auth/login/login.html',
        controller: 'LoginCtrl as vm'
      })
      .state('loggedout', {
        url: '/loggedout',
        templateUrl: 'js/app/auth/login/loggedout.html',
        controller: 'LogoutCtrl as vm'
      });
  });
}());
