angular.module('app.login')
  /*@ngInject*/
  .config(function ($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login?verifyEmail',
        templateUrl: 'js/app/login/login.html',
        controller: 'LoginCtrl as vm'
      })
      .state('loggedout', {
        url: '/loggedout',
        templateUrl: 'js/app/login/loggedout.html',
        controller: 'LogoutCtrl as vm'
      });
  });
