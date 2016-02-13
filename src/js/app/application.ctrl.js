;(function() {
"use strict";

angular.module('app')

  //
  // This is the global top-level parent controller specified on the "body" tag in index.html, it wraps all other
  // controllers and can be used e.g. for shared callbacks/event handlers on any page; for explanation see:
  //
  // http://www.clearlyinnovative.com/ionic-framework-tabs-go-home-view/
  //
  .controller('ApplicationCtrl', function ($state, Application, UserService) {

    // UTILITY FUNCTIONS

    this.logout = function() {
      UserService.logoutApp().then(function() {
        $state.go('loggedout');
      });
    };

    this.login = function() {
      $state.go('login');
    };

    this.isLoggedIn = function() {
      return Application.isUserLoggedIn();
    };

    this.goUserProfile = function() {
      Application.gotoUserProfilePage($state, true);
    };

    this.goHome = function() {
      Application.gotoStartPage($state, false);
    };

  })
;
}());
