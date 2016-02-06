;(function() {
"use strict";

appModule('app.user')

  .factory('UserServiceFirebaseImpl', function ($q, $log, $rootScope, Stopwatch, AppHooks, User,
                                                fbutil, $firebaseAuth, $firebaseObject, $firebaseArray) {

    var service;
    var currentLoggedinUser = null;
    var userDataLoaded = false;
    var ref = fbutil.ref();
    var auth = $firebaseAuth(ref);

    // make a canonical user from a Firebase user object
    function createUser(fbUser) {
      if (!fbUser) {
        return null;
      }

      var user = User.build({
        userName: fbUser.password.email,
        id: fbUser.uid,
        verified: true   // we've not implemented email verification with Firebase yet so just set this to true
      });

      return user;
    }

    function setCurrentUser(userData) {

      // unload firebase objects for "old" user
      loadUnloadData(currentLoggedinUser, false);

      currentLoggedinUser = createUser(userData);

      if (currentLoggedinUser) {   // we have a logged in user, load their data
        loadUnloadData(currentLoggedinUser, true);
      }

      return currentLoggedinUser;
    }

    function mapError(w, error, context) {

      if (!error || !error.code) {
        logError(w, JSON.stringify(error));
        return "unknown_error";
      }

      var code = error.code;

      if (context === 'signup') {
        if (code === "EMAIL_TAKEN") {
          return "already_registered";
        }
      }

      if (context === 'login') {
        if (code === "INVALID_USER" || code === "INVALID_EMAIL" || code === "INVALID_PASSWORD") {
          return "invalid_credentials";
        }
      }

      if (context === 'reset-password') {
        if (code === "INVALID_USER" || code === "INVALID_PASSWORD") {
          return "invalid_email";
        }
      }

      if (context === 'change-password') {
        if (code === "INVALID_USER" || code === "INVALID_PASSWORD") {
          return "invalid_credentials";
        }
      }

      logError(w, JSON.stringify(error));

      return "unknown_error";
    }

    /////// BEGIN copied & pasted from application.service.js, to prevent circular dependency (AngularJS DI) ///////
    var logStarted = function (context, message) {
      var stopwatch = new Stopwatch(context);
      stopwatch.start();

      var msg = context ? context + ' - ' : '';
      msg = msg + (message || 'started');

      $log.info(msg);

      return stopwatch;
    };

    var logFinished = function (stopwatch, message) {
      logEnded($log.info, stopwatch, message);
    };

    var logError = function (stopwatch, message) {
      logEnded($log.error, stopwatch, message);
    };

    function logEnded(fn, stopwatch, message) {
      stopwatch.stop();

      var context = stopwatch.context;
      var msg = context ? context + ' - ' : '';
      msg = msg + (message || 'finished');

      fn(msg + ' - Duration: ' + stopwatch.fmtTime());
    }
    /////// END copied & pasted from application.service.js ///////

    var init = function () {
      $log.debug("UserServiceFirebaseImpl");

      var authData = auth.$getAuth();

      if (authData) {
        $log.info("UserServiceFirebaseImpl - INIT: logged in as: " + JSON.stringify(authData));

        setCurrentUser(authData);
      } else {
        $log.info("UserServiceFirebaseImpl - INIT: not logged in");
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

    var signup = function (userObj) {
      var deferred = $q.defer();

      var email = userObj.userName;
      var password = userObj.password;
      var userRole = userObj.userRole;

      var userData;

      logout();

      var w = logStarted('UserServiceFirebaseImpl#signup');

      auth.$createUser({
        email    : email,
        password : password

      }).then(function() {
        // authenticate so we have permission to write to Firebase
        return auth.$authWithPassword({email: email, password: password});

      }).then(function(user) {
        $log.info("Successfully created user account");

        // pick up the uid
        userData = {
          userName: email,
          verified: true, // we've not implemented email verification with Firebase yet so just set this to true
          id: user.uid
        };

        // create a user profile in our data store
        var ref = fbutil.ref('users', user.uid);

        return fbutil.handler(function(cb) {
          ref.set({email: email, userRole: userRole, createdAt: Firebase.ServerValue.TIMESTAMP}, cb);
        });

      }).then(function() {
        auth.$unauth();

        logFinished(w);
        deferred.resolve(User.build(userData));

      }, function(error) {
        auth.$unauth();
        deferred.reject(mapError(w, error, "signup"));
      });

      return deferred.promise;
    };

    var changePassword = function (email, passwordOld, passwordNew) {
      var deferred = $q.defer();

      logout();

      var w = logStarted('UserServiceFirebaseImpl#changePassword');

      auth.$changePassword({email: email, oldPassword: passwordOld, newPassword: passwordNew}).then(function() {
        $log.debug("Changed password successfully");

        logFinished(w);
        deferred.resolve();

      }, function(error) {
        logError(w, JSON.stringify(error));
        deferred.reject(mapError(w, error, "change-password"));
      });

      return deferred.promise;
    };

    var login = function (userName, password) {
      var deferred = $q.defer();

      logout();

      var w = logStarted('UserServiceFirebaseImpl#login');

      var userData = {
        userName: userName,
        password: password,
        verified: true
      };

      auth.$authWithPassword({
        email    : userData.userName,
        password : userData.password
      }).then(function(authData) {
        $log.debug("Authenticated successfully: " + JSON.stringify(authData));

        logFinished(w);

        deferred.resolve(setCurrentUser(authData));

      }, function(error) {
        logError(w, JSON.stringify(error));
        deferred.reject(mapError(w, error, "login"));
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

      var w = logStarted('UserServiceFirebaseImpl#resetPassword');

      auth.$resetPassword({
        email: email
      }).then(function() {
        logFinished(w);
        deferred.resolve();

      }, function(error) {
        logError(w, JSON.stringify(error));
        deferred.reject(mapError(w, error, "reset-password"));
      });

      return deferred.promise;
    };

    var saveUserProfile = function (user, data) {
      var deferred = $q.defer();

      $log.debug("Creating firebase object for user '" + user.id + "'");

      var fbObj = getUserData(user);
      fbObj = angular.extend(fbObj, data);

      // prevent the user data from being saved when the userRole property is not there (incomplete user data)
      if (!fbObj.userRole) {
        $log.warn("Error saving user object for '" + user.id + "': userRole missing or not loaded");

        deferred.reject('userRole_missing_or_not_loaded');

      } else {
        fbObj.$save().then(function (ref) {
          $log.debug("Saved firebase object for user '" + user.id + "' with key '" + ref.key() + "'");

          deferred.resolve(ref);
        })
        .catch(function (error) {
          $log.error("Error saving user object for '" + user.id + "': " + JSON.stringify(error));

          deferred.reject(error);
        });
      }

      return deferred.promise;
    };

    var loadUnload = function (user, prop, path, load, asArray, orderBy, fbRef, onSuccess, onError, limit) {
      var obj = user;

      // IMPORTANT: before loading a new $firebaseObject, call $destroy() on the old $firebaseObject; this is
      // important to ensure that memory is freed and event listeners are cancelled for the $firebaseObject
      if (obj[prop]) {
        obj[prop].$destroy();
        delete obj[prop];
      }

      if (load) {
        var ref;
        var key = currentLoggedinUser.id;

        if (fbRef) {
          ref = fbRef;
        } else if (orderBy) {
          ref = fbutil.ref(path).child(key).orderByChild(orderBy);
        } else {
          ref = fbutil.ref(path).child(key);
        }

        if (limit) {
          ref = ref.limitToLast(limit);
        }

        var fbObj = asArray ? $firebaseArray(ref) : $firebaseObject(ref);

        obj[prop] = fbObj;

        if (onSuccess || onError) {
          fbObj.$loaded().then(function (fbData) {
            $log.debug("Successfully loaded firebase object for '" + key + "'");

            if (onSuccess) {
              $rootScope.$broadcast(onSuccess, fbData);
            }
          })
          .catch(function (error) {
            $log.error("Error loading firebase object for '" + key + "': " + JSON.stringify(error));

            if (onError) {
              $rootScope.$broadcast(onError, error);
            }
          });
        }
      }
    };

    var loadUserDataSuccess = function () {
      return 'on.loadUserDataSuccess';
    };

    var loadUserDataError = function () {
      return 'on.loadUserDataError';
    };

    $rootScope.$on(loadUserDataSuccess(), function (event, userData) {
      $log.log('User data loaded, userRole: ' + userData.userRole);

      var userRole = userData.userRole;

      // this "cannot happen" but I've seen it more than once: user data was loaded but the userRole property EMPTY for
      // some reason ... in this case we set the userRole to "invalid" so that the user will then have to log in again
      if (!userRole) {
        $log.error('User data loaded, userRole: ' + userData.userRole +
          ' , $id: ' + userData.$id + ', setting userRole to invalid');

        // forcing re-login, hopefully the user data will then be fetched properly?
        userRole = 'invalid';

      } else {
        userDataLoaded = true;

        $log.log('Set userDataLoaded to true');
      }

      currentLoggedinUser.setUserRole(userRole);
    });

    $rootScope.$on(loadUserDataError(), function (event, error) {
      $log.error("Error loading user data: " + JSON.stringify(error));

      currentLoggedinUser.setUserRole('unknown');
    });

    var loadUnloadData = function (user, load) {
      if (!user) {
        return;
      }

      var userService = service;

      userDataLoaded = false;

      userService.loadUnload(user, 'data', 'users', load, false, null, null,
        loadUserDataSuccess(), loadUserDataError());

      // call hook functions, if any
      AppHooks.loadUnloadUser(userService, user, load);
    };

    var getUserProp = function (prop, user) {
      var theUser = user || currentLoggedinUser;

      if (!theUser) {
        return null;
      }

      return theUser[prop];
    };

    var getUserData = function (user) {
      return getUserProp('data', user);
    };

    var getUserRole = function (user) {
      var theUser = user || currentLoggedinUser;

      return theUser.getUserRole();
    };

    var setUserRole = function (role) {
      var theUser = currentLoggedinUser;

      theUser.setUserRole(role);
    };

    var disableUser = function (setToUserRole) {
      var deferred = $q.defer();

      $log.debug('UserServiceFirebaseImpl#disableUser START, setToUserRole: ' + setToUserRole);

      var ref = fbutil.ref('users', currentLoggedinUser.id);

      fbutil.handler(function(cb) {
        ref.update({userRole: setToUserRole}, cb);
      }).then(function() {
        $log.debug('UserServiceFirebaseImpl#disableUser FINISHED');

        deferred.resolve(null);
      }, function(error) {
        $log.error('UserServiceFirebaseImpl#disableUser ERROR ' + JSON.stringify(error));

        deferred.reject(error);
      });

      return deferred.promise;
    };

    var isUserDataLoaded = function () {
      return userDataLoaded;
    };

    var retrieveProfile = function () {
      var user = currentLoggedinUser;

      var defaultValues = {
        email: user.userName
      };

      var prof = angular.extend(defaultValues, getUserData());

      return prof;
    };

    var saveProfile = function (data) {
     var deferred = $q.defer();
      var user = currentLoggedinUser;

      $log.debug("Creating firebase object for user '" + user.id + "'");

      var fbObj = getUserData(user);
      fbObj = angular.extend(fbObj, data);

      // prevent the user data from being saved when the userRole property is not there (incomplete user data)
      if (!fbObj.userRole) {
        $log.warn("Error saving user object for '" + user.id + "': userRole missing or not loaded");

        deferred.reject('userRole_missing_or_not_loaded');

      } else {
        fbObj.$save().then(function (ref) {
          $log.debug("Saved firebase object for user '" + user.id + "' with key '" + ref.key() + "'");

          deferred.resolve(ref);
        })
        .catch(function (error) {
          $log.error("Error saving user object for '" + user.id + "': " + JSON.stringify(error));

          deferred.reject(error);
        });
      }

      return deferred.promise;
    };

    service = {
      init: init,
      loadUnload: loadUnload,
      loadUnloadData: loadUnloadData,
      loadUserDataSuccess: loadUserDataSuccess,
      loadUserDataError: loadUserDataError,
      isUserLoggedIn: isUserLoggedIn,
      currentUser: currentUser,
      getUserProp: getUserProp,
      getUserData: getUserData,
      getUserRole: getUserRole,
      setUserRole: setUserRole,
      signup: signup,
      login: login,
      logout: logout,
      changePassword: changePassword,
      resetPassword: resetPassword,
      saveUserProfile: saveUserProfile,
      disableUser: disableUser,
      isUserDataLoaded: isUserDataLoaded,
      retrieveProfile: retrieveProfile,
      saveProfile: saveProfile
    };

    return service;
  })
;
}());
