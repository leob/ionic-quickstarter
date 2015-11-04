;(function() {
"use strict";

appModule('app.user')

  .service('UserServiceParseImpl', function ($q, $log, loggingService, ParseConfiguration, ParseUserAdapter) {

    var parseInitialized = false;
    var currentLoggedinUser = null;

    function setCurrentUser(parseUser) {
      currentLoggedinUser = ParseUserAdapter.getUserFromParseUser(parseUser);

      return currentLoggedinUser;
    }

    function mapError(error, context) {

      if (!error || !error.code) {
        loggingService.log("UserServiceParseImpl - " + context,
          "Error (" + context + "): " + JSON.stringify(error));
        return "unknown_error";
      }

      var code = error.code;

      if (context === 'signup') {
        if (error.code === 125) {
          return 'invalid_email';
        }
        if (error.code === 202) {
          return "already_registered";
        }
      }

      if (context === 'login') {
        if (error.code === 101) {
          return "invalid_credentials";
        }
      }

      if (context === 'reset-password') {
        if (error.code === 205) {
          return "invalid_email";
        }
      }

      loggingService.log("UserServiceParseImpl - " + context,
        "Error (" + context + "): " + JSON.stringify(error));

      return "unknown_error";
    }

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

    var isUserLoggedIn = function () {
      return currentLoggedinUser !== null;
    };

    var currentUser = function () {
      return currentLoggedinUser;
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
          $log.debug("Error creating user: " + JSON.stringify(error));

          deferred.reject(mapError(error, "signup"));
        });

      return deferred.promise;
    };

    var login = function (username, password) {
      var deferred = $q.defer();

      logout();

      $log.debug("Login start ...");

      Parse.User.logIn(username, password).then(
        function (loggedinUser) {
          if (!loggedinUser.attributes.emailVerified) {
            $log.debug("Login: user not verified");
            deferred.reject("not_verified");
          } else {
            $log.debug("Login done");
            deferred.resolve(setCurrentUser(loggedinUser));
          }
        },
        function (error) {
          $log.debug("Login Failed: " + JSON.stringify(error));

          deferred.reject(mapError(error, "login"));
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
          $log.debug("Error resetting password for user (" + email + "): " + JSON.stringify(error));

          deferred.reject(mapError(error, "reset-password"));
        });

      return deferred.promise;
    };

    return {
      init: init,
      isUserLoggedIn: isUserLoggedIn,
      currentUser: currentUser,
      signup: signup,
      login: login,
      logout: logout,
      resetPassword: resetPassword
    };
  })
;
}());
