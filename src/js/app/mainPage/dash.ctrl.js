;(function() {
"use strict";

var DashCtrl = /*@ngInject*/function (Application, $scope) {
  // vm: the "Controller as vm" convention from: http://www.johnpapa.net/angularjss-controller-as-and-the-vm-variable/
  var vm = this;
  var log = Application.getLogger('MainPageDashCtrl');

  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    log.debug("beforeEnter");

    // do stuff here which you want to do anytime you switch to the tab managed by this controller

    log.debug("beforeEnter end");
  });

};

appModule('app.mainPage').controller('DashCtrl', DashCtrl);
}());
