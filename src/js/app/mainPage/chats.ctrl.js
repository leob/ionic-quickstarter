/*@ngInject*/
var MainPageChatsCtrl = function (Chats) {

  // vm: the "Controller as vm" convention from: http://www.johnpapa.net/angularjss-controller-as-and-the-vm-variable/
  var vm = this;

  vm.chats = Chats.all();

  vm.remove = function (chat) {
    Chats.remove(chat);
  };
};

angular.module('app.mainPage').controller('ChatsCtrl', MainPageChatsCtrl);
