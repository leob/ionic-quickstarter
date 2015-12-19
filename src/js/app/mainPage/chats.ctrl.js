;(function() {
"use strict";

var ChatsCtrl = /*@ngInject*/function (Application, $scope, Chats) {

  // vm: the "Controller as vm" convention from: http://www.johnpapa.net/angularjss-controller-as-and-the-vm-variable/
  var vm = this;
  var log = Application.getLogger('MainPageChatsCtrl');

  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    log.debug("beforeEnter");

    // do stuff here which you want to do anytime you switch to the tab managed by this controller
    vm.chats = Chats.all();
  
    log.debug("beforeEnter end");
  });

  vm.remove = function (chat) {
    Chats.remove(chat);
  };
};

appModule('app.mainPage').controller('ChatsCtrl', ChatsCtrl);
}());
