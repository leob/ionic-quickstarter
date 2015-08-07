;(function() {
"use strict";

appModule('app.user')

  .service('UserServiceMockImpl', function ($q, $log, loggingService, User) {

    var currentLoggedinUser = null;

    var userData = {
      userName: 'ad@min.com',
      emailVerified: true,
      password: 'password'
    };

    var setCurrentUser = function (userData) {
      currentLoggedinUser = userData === null ? null : User.build(userData);

      return currentLoggedinUser;
    };

    var init = function () {

      setCurrentUser(User.build(userData));     // set logged in user at app startup
      // comment out the line above and uncomment the next line to require login at startup
      //setCurrentUser(null);     // no valid user at application init, forcing login at start up

      return currentLoggedinUser;
    };

    var currentUser = function () {
      return currentLoggedinUser;
    };

    // 'checked' version of 'currentLoggedinUser()' returning a promise
    var checkUser = function () {
      if (currentLoggedinUser) {
        return $q.when(currentLoggedinUser);
      } else {
        return $q.reject({error: "noUser"});
      }
    };

    var signup = function (user) {
      var deferred = $q.defer();

      logout();

      $log.debug("Signup start ...");

      if (user.password == userData.password) {
        $log.debug("Signup done");

        // note: we don't set/change the current user because the new user isn't logged in yet
        deferred.resolve(User.build(userData));
      } else {
        deferred.reject("unknown_error");
      }

      return deferred.promise;
    };

    var login = function (username, password) {
      var deferred = $q.defer();

      logout();

      $log.debug("Login start ...");

      if (password == userData.password) {
        $log.debug("Login done");

        deferred.resolve(setCurrentUser(userData));
      } else {
        deferred.reject("invalid_credentials");
      }

      return deferred.promise;
    };

    var logout = function () {
      setCurrentUser(null);
    };

    var resetPassword = function (email) {
      var deferred = $q.defer();

      logout();

      $log.debug("Password reset start ...");
      $log.debug("Password reset done");

      deferred.resolve();

      return deferred.promise;
    };

    return {
      init: init,
      currentUser: currentUser,
      checkUser: checkUser,
      signup: signup,
      login: login,
      logout: logout,
      resetPassword: resetPassword
    };
  })
;
}());
