angular.module('app.signup')
  /*@ngInject*/
  .config(function ($stateProvider) {
    $stateProvider
      .state('signup', {
        url: '/signup?firstUse',
        templateUrl: 'js/app/signup/signup.html',
        controller: 'SignupCtrl as vm'
      });
  });
