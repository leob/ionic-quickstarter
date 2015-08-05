//
// localStorage.js
//
// Wrapper service for local storage.
//
// This could be overridden/reimplemented to use another storage mechanism e.g. SQLite or PouchDB.
//

angular.module('app.storage')

  .factory('$localStorage', function ($window) {
    return {
      set: function (key, value) {
        $window.localStorage[key] = value;
      },
      get: function (key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      },
      setObject: function (key, value) {
        $window.localStorage[key] = JSON.stringify(value);
      },
      getObject: function (key) {
        return JSON.parse($window.localStorage[key] || '{}');
      }
    };
  });
