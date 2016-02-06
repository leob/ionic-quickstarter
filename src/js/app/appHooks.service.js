;(function() {
"use strict";

//
// A service exposing methods which function as app-specific "hooks" (callbacks) to customize the behavior of generic
// services for that app. The "hook" methods are called from generic services.
//

appModule('app.hooks')

  // Conditional DI, technique taken from:
  // http://phonegap-tips.com/articles/conditional-dependency-injection-with-angularjs.html

  .factory('AppHooks', function ($injector, APP) {
    if (APP.devMode) {
      return $injector.get('AppHooksMockImpl');
    } else {
      // Firebase implementation
      return $injector.get('AppHooksFirebaseImpl');
    }
  });
;
}());
