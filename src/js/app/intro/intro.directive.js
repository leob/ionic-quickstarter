;(function () {
  "use strict";

  var IntroHeader = function () {
    return ({
      restrict: 'E',
      replace: true,
      scope: {
        img: '@'
      },
      templateUrl: 'js/app/intro/intro-header.html'
    });
  };

  appModule('app.intro').directive('introHeader', IntroHeader);
}());
