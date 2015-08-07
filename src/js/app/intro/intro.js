var IntroCtrl = /*@ngInject*/function ($scope, $state, $ionicSlideBoxDelegate, Application) {
  // vm: the "Controller as vm" convention from: http://www.johnpapa.net/angularjss-controller-as-and-the-vm-variable/
  var vm = this;

  // when entering the view, always go to the first slide (instead of just showing whichever slide was shown last when
  // you left the view)
  $scope.$on('$ionicView.beforeEnter', function () {
    $ionicSlideBoxDelegate.slide(0);
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
  };
  vm.previous = function () {
    $ionicSlideBoxDelegate.previous();
  };

  vm.slideChanged = function (index) {
    this.slideIndex = index;
  };
};

// controller and router
appModule('app.intro')
  .controller('IntroCtrl', IntroCtrl)
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

