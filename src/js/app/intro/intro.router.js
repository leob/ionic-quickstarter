;(function() {
"use strict";

appModule('app.intro')
  .config(function ($stateProvider) {
    $stateProvider
      .state('app.intro', {
        url: '/intro',
        views: {
          'menuContent@app': {
            templateUrl: 'js/app/intro/intro.html',
            controller: 'IntroCtrl as vm'
          }
        }
      });
  });
}());
