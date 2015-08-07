;(function() {
"use strict";

appModule('app.user')

  .service('UserServiceParseImpl', function ($q, $log, loggingService, ParseConfiguration, ParseUserAdapter) {

    var parseInitialized = false;
    var currentLoggedinUser = null;
    var currentParseUser = null;

    var setCurrentUser = function (parseUser) {
      currentParseUser = parseUser;
      currentLoggedinUser = ParseUserAdapter.getUserFromParseUser(parseUser);

      return currentLoggedinUser;
    };

    var getCurrentParseUser = function () {
      return currentParseUser;
    };

    var init = function () {

      if (parseInitialized === false) {
        $log.log("Parse init ...");

        Parse.serverURL = ParseConfiguration.serverURL;
        Parse.initialize(ParseConfiguration.applicationId, ParseConfiguration.javascriptKey);

        parseInitialized = true;

        $log.log("Parse init done");
      }

      setCurrentUser(Parse.User.current());

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

      var parseUser = ParseUserAdapter.createParseUser(new Parse.User(), {
        username: user.username,
        password: user.password,
        email: user.email
      });

      $log.debug("Signup start ...");

      parseUser.signUp().then(
        function (signedupParseUser) {
          $log.debug("Signup done");

          // note: we don't set/change the current user because the new user isn't logged in yet
          deferred.resolve(ParseUserAdapter.getUserFromParseUser(signedupParseUser));
        },
        function (error) {
          $log.debug("Error signing up user (" + error.code + "): " + error.message);

          if (error.code === 125) {
            error = 'invalid_email';
          } else if (error.code === 202) {
            error = "already_registered";
          } else {
            loggingService.log("Signup:", "Unknown error during signup (" + error.code + ") for user '" +
              user.email + "': " + error.message);

            error = "unknown_error";
          }

          deferred.reject(error);
        });

      return deferred.promise;
    };

    var login = function (username, password) {
      var deferred = $q.defer();

      logout();

      $log.debug("Login start ...");

      Parse.User.logIn(username, password).then(
        function (loggedinUser) {
          $log.debug("Login done");

          deferred.resolve(setCurrentUser(loggedinUser));
        },
        function (error) {
          $log.debug("Error logging in user (" + error.code + "): " + error.message);

          if (error.code === 101) {
            error = "invalid_credentials";
          } else {
            loggingService.log("Login:", "Unknown error during login (" + error.code + ") for user '" + username +
              "': " + error.message);

            error = "unknown_error";
          }

          deferred.reject(error);
        });

      return deferred.promise;
    };

    var logout = function () {
      // note: Parse.User.logOut() does not return a Promise
      Parse.User.logOut();
      setCurrentUser(null);
    };

    var resetPassword = function (email) {
      var deferred = $q.defer();

      logout();

      $log.debug("Password reset start ...");

      Parse.User.requestPasswordReset(email).then(
        function () {
          $log.debug("Password reset done");

          deferred.resolve();
        },
        function (error) {
          $log.debug("Error resetting password (" + error.code + "): " + error.message);

          if (error.code === 205) {
            error = "invalid_email";
          } else {
            loggingService.log("Password reset:", "Unknown error during pssword reset (" + error.code +
              ") for user '" + email + "': " + error.message);

            error = "unknown_error";
          }

          deferred.reject(error);
        });

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
