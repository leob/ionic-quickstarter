var LogoutCtrl = /*@ngInject*/function ($state, Application) {
  var vm = this;

  vm.intro = function () {
    Application.gotoIntroPage($state);
  };
};

module('app.auth.login').controller('LogoutCtrl', LogoutCtrl);
