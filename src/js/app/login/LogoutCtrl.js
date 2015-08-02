/*@ngInject*/
var LogoutCtrl = function ($state, Application) {
  var vm = this;

  vm.intro = function () {
    Application.gotoIntroPage($state);
  };
};

angular.module('app.login').controller('LogoutCtrl', LogoutCtrl);
