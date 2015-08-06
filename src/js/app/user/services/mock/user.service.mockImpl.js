angular.module('app.user')

  .service('UserServiceMockImpl', function ($q, $log, loggingService, User) {

    var currentUser = null;

    var userData = {
      userName: 'ad@min.com',
      emailVerified: true,
      password: 'password'
    };

    var setCurrentUser = function (userData) {
      currentUser = userData === null ? null : User.build(userData);

      return currentUser;
    };

    return {

      init: function () {

        setCurrentUser(User.build(userData));     // set logged in user at app startup
        // comment out the line above and uncomment the next line to require login at startup
        //setCurrentUser(null);     // no valid user at application init, forcing login at start up

        return currentUser;
      },

      currentUser: function () {
        return currentUser;
      },

      // 'checked' version of 'currentUser()' returning a promise
      checkUser: function () {
        if (currentUser) {
          return $q.when(currentUser);
        } else {
          return $q.reject({error: "noUser"});
        }
      },

      signup: function (user) {
        var deferred = $q.defer();

        this.logout();

        $log.debug("Signup start ...");

        if (user.password == userData.password) {
          $log.debug("Signup done");

          // note: we don't set/change the current user because the new user isn't logged in yet
          deferred.resolve(User.build(userData));
        } else {
          deferred.reject("unknown_error");
        }

        return deferred.promise;
      },

      login: function (username, password) {
        var deferred = $q.defer();

        this.logout();

        $log.debug("Login start ...");

        if (password == userData.password) {
          $log.debug("Login done");

          deferred.resolve(setCurrentUser(userData));
        } else {
          deferred.reject("invalid_credentials");
        }

        return deferred.promise;
      },

      logout: function () {
        setCurrentUser(null);
      },

      resetPassword: function (email) {
        var deferred = $q.defer();

        this.logout();

        $log.debug("Password reset start ...");
        $log.debug("Password reset done");

        deferred.resolve();

        return deferred.promise;
      }

    };
  })
;
