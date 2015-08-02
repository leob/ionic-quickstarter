/*@ngInject*/
var MainPageChatDetailCtrl = function ($stateParams, Chats) {

  // vm: the "Controller as vm" convention from: http://www.johnpapa.net/angularjss-controller-as-and-the-vm-variable/
  var vm = this;

  vm.chat = Chats.get($stateParams.chatId);
};

angular.module('app.mainPage').controller('MainPageChatDetailCtrl', MainPageChatDetailCtrl);
