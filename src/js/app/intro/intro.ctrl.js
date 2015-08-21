;(function() {
"use strict";

var IntroCtrl = /*@ngInject*/function ($scope, $state, $ionicSlideBoxDelegate, $ionicScrollDelegate, Application) {
  // vm: the "Controller as vm" convention from: http://www.johnpapa.net/angularjss-controller-as-and-the-vm-variable/
  var vm = this;

  // when entering the view, always go to the first slide (instead of just showing whichever slide was shown last when
  // you left the view)
  $scope.$on('$ionicView.beforeEnter', function () {
    vm.slideIndex = 0;
    $ionicSlideBoxDelegate.slide(0);
    $ionicScrollDelegate.scrollTop();
  });

  vm.startApp = function () {
    // user has viewed (all or part of) the intro, set 'initialRun' to false so that next time when opening the app the
    // intro doesn't show up again automatically (it can always be opened manually from the menu)
    Application.setInitialRun(false);

    // go to the start page (after 'initialRun' has been set to false)
    Application.gotoStartPage($state);
  };
  vm.next = function () {
    $ionicSlideBoxDelegate.next();
    $ionicScrollDelegate.scrollTop();
  };
  vm.previous = function () {
    $ionicSlideBoxDelegate.previous();
    $ionicScrollDelegate.scrollTop();
  };

  vm.slideChanged = function (index) {
    vm.slideIndex = index;
  };
};

appModule('app.intro').controller('IntroCtrl', IntroCtrl);
}());
