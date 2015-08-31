;(function() {
"use strict";

appModule('app.user')

  // Conditional DI, technique taken from:
  // http://phonegap-tips.com/articles/conditional-dependency-injection-with-angularjs.html

  .factory('UserService', function ($injector, APP) {
    if (APP.devMode) {
      return $injector.get('UserServiceMockImpl');
    } else {
      //
      // PRODUCTION MODE - use a Parse.com or a Firebase implementation (uncomment the one you want).
      //
      // Right now the Parse.com implementation is the 'default' one because a few things are missing from the Firebase
      // implementation (email verification, reset/change password functionality).
      //

      // Firebase implementation:
      //return $injector.get('UserServiceFirebaseImpl');

      // Parse.com implementation:
      return $injector.get('UserServiceParseImpl');
    }
  });
}());
