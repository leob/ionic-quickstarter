;(function() {
  "use strict";

  appModule('app.manage')

    .factory('UserProfileService', function ($q, $log, Application, LocalStorage) {

      var retrieveProfile = function () {
        return LocalStorage.getObject('userProfile');
      };

      var saveProfile = function (data) {
        LocalStorage.setObject('userProfile', data);
      };

      return {
        retrieveProfile: retrieveProfile,
        saveProfile: saveProfile
      };
    })
  ;
}());
