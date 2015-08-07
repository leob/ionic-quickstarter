;(function() {
"use strict";

appModule('app.mainPage')
  .config(function ($stateProvider) {
    $stateProvider
      .state('app.auth.main', {
        url: "/main",
        abstract: true,
        views: {
          'menuContent@app': {
            templateUrl: "js/app/mainPage/tabs.html"
          }
        }
      })
      // Note: each tab has its own nav history stack
      .state('app.auth.main.dash', {
        url: '/dash',
        views: {
          'main-dash': {
            templateUrl: 'js/app/mainPage/dash.html',
            controller: 'DashCtrl as vm'
          }
        }
      })
      .state('app.auth.main.chats', {
        url: '/chats',
        views: {
          'main-chats': {
            templateUrl: 'js/app/mainPage/chats.html',
            controller: 'ChatsCtrl as vm'
          }
        }
      })
      .state('app.auth.main.chat-detail', {
        url: '/chats/:chatId',
        views: {
          'main-chats': {
            templateUrl: 'js/app/mainPage/chatDetail.html',
            controller: 'ChatDetailCtrl as vm'
          }
        }
      })
      .state('app.auth.main.account', {
        url: '/account',
        views: {
          'main-account': {
            templateUrl: 'js/app/mainPage/account.html',
            controller: 'AccountCtrl as vm'
          }
        }
      });
  })
;
}());
