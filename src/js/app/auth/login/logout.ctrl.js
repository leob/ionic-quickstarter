;(function() {
"use strict";

var LogoutCtrl = /*@ngInject*/function ($state, Application) {
  var vm = this;

  vm.intro = function () {
    Application.gotoIntroPage($state);
  };
};

appModule('app.auth.login').controller('LogoutCtrl', LogoutCtrl);
}());
