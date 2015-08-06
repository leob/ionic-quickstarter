angular.module('app.auth.signup')
  /*@ngInject*/
  .config(function ($stateProvider) {
    $stateProvider
      .state('signup', {
        url: '/signup?firstUse',
        templateUrl: 'js/app/auth/signup/signup.html',
        controller: 'SignupCtrl as vm'
      });
  });
