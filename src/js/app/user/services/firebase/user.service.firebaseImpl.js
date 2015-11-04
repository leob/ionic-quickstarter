;(function() {
  "use strict";

  appModule('app.user')

    .service('UserServiceFirebaseImpl', function ($q, $log, loggingService, User, fbutil, $firebaseAuth) {

      var currentLoggedinUser = null;
      var auth = $firebaseAuth(fbutil.ref());

      // make a canonical user from a Firebase user object
      function createUser(fbUser) {
        if (!fbUser) {
          return null;
        }

        return User.build({
          userName: fbUser.password.email,
          id: fbUser.uid,
          emailVerified: true   // we've not implemented email verification with Firebase yet so just set this to true
        });
      }

      function setCurrentUser(userData) {
        currentLoggedinUser = createUser(userData);

        return currentLoggedinUser;
      }

      function mapError(error, context) {

        if (!error || !error.code) {
          loggingService.log("UserServiceFirebaseImpl - " + context,
            "Error (" + context + "): " + JSON.stringify(error));
          return "unknown_error";
        }

        var code = error.code;

        if (context === 'signup') {
          if (code === "EMAIL_TAKEN") {
            return "already_registered";
          }
        }

        if (context === 'login') {
          if (code === "INVALID_USER" || code === "INVALID_PASSWORD") {
            return "invalid_credentials";
          }
        }

        if (context === 'reset-password') {
          if (code === "INVALID_USER" || code === "INVALID_PASSWORD") {
            return "invalid_email";
          }
        }

        loggingService.log("UserServiceFirebaseImpl - " + context,
          "Error (" + context + "): " + JSON.stringify(error));

        return "unknown_error";
      }

      var init = function () {
        $log.debug("UserServiceFirebaseImpl");

        var authData = auth.$getAuth();

        if (authData) {
          $log.debug("INIT: logged in as: ", JSON.stringify(authData));

          setCurrentUser(authData);
        } else {
          $log.debug("INIT: not logged in");
          setCurrentUser(null);
        }

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

        $log.debug("Signup start ...");

        var userData = {
          userName: user.username,
          password: user.password,
          emailVerified: true  // we've not implemented email verification with Firebase yet so just set this to true
        };

        auth.$createUser({
          email    : userData.userName,
          password : userData.password
        }).then(function(data) {
          $log.info("Successfully created user account: " + JSON.stringify(data));

          userData.id = data.uid;
          deferred.resolve(User.build(userData));
        }, function(error) {
          $log.debug("Error creating user: " + JSON.stringify(error));

          deferred.reject(mapError(error, "signup"));
        });

        return deferred.promise;
      };

      var login = function (username, password) {
        var deferred = $q.defer();

        logout();

        $log.debug("Login start ...");

        var userData = {
          userName: username,
          password: password,
          emailVerified: true
        };

        auth.$authWithPassword({
          email    : userData.userName,
          password : userData.password
        }).then(function(authData) {
          $log.debug("Authenticated successfully with payload: " + JSON.stringify(authData));

          deferred.resolve(setCurrentUser(authData));
        }, function(error) {
          $log.debug("Login Failed: " + JSON.stringify(error));

          deferred.reject(mapError(error, "login"));
        });

        return deferred.promise;
      };

      var logout = function () {
        auth.$unauth();
        setCurrentUser(null);
      };

      var resetPassword = function (email) {
        var deferred = $q.defer();

        logout();

        $log.debug("Password reset start ...");

        auth.$resetPassword({
          email: email
        }).then(function() {
          $log.debug("Password reset done");

          deferred.resolve();
        }, function(error) {
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
