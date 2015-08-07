appModule('app.auth.signup')
  .config(function ($stateProvider) {
    $stateProvider
      .state('signup', {
        url: '/signup?firstUse',
        templateUrl: 'js/app/auth/signup/signup.html',
        controller: 'SignupCtrl as vm'
      });
  });
