/*@ngInject*/
var MainPageAccountCtrl = function (user) {  // user is injected through UI-router resolve on the abstract state 'auth'

  // vm: the "Controller as vm" convention from: http://www.johnpapa.net/angularjss-controller-as-and-the-vm-variable/
  var vm = this;

  vm.settings = {
    enableFriends: true
  };

  function formatNumber(num) {
    return ("00" + num).substr(-2, 2);
  }

  vm.loginDuration = function () {

    // call the model object's "getLoggedInDuration" method
    var duration = user.getLoggedInDuration() / 1000;

    var seconds = parseInt(duration % 60),
        minutes = parseInt(duration / 60 % 60),
        hours = parseInt(duration / (60*60));

    return formatNumber(hours) + ':' + formatNumber(minutes) + ':' + formatNumber(seconds);
  };
};

angular.module('app.mainPage').controller('MainPageAccountCtrl', MainPageAccountCtrl);
