;(function() {
"use strict";

appModule('app.user')

  .factory('UserServiceFirebaseImpl', function ($q, $log, $rootScope, Stopwatch, AppHooks, User, fbutil, $firebaseAuth,
                                                $firebaseObject, $firebaseArray, oauthHelper,
                                                TwitterReauthentication) {

    var FIREBASE_PASSWORD_PROVIDER = 'password';
    var FIREBASE_TWITTER_PROVIDER = 'twitter';

    var ADMIN_ROLE = 'admin';

    var service;
    var currentLoggedinUser = null;
    var userDataLoaded = false;
    var ref = fbutil.ref();
    var auth = $firebaseAuth(ref);

    // make a canonical user from a Firebase auth object
    function createUser(fbAuth) {
      if (!fbAuth) {
        return null;
      }

      var user = User.build({
        provider: fbAuth.provider,
        userName: getUserName(fbAuth),
        id: fbAuth.uid
      });

      return user;
    }

    function getAuthProvider(provider) {
      return authProviders[provider];
    }

    function getUserName(fbAuth) {
      var provider = getAuthProvider(fbAuth.provider);

      return provider ? provider.getUserName(fbAuth) : 'unknown';
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
      var userRole = ADMIN_ROLE;

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
          provider: FIREBASE_PASSWORD_PROVIDER,
          userName: email,
          id: user.uid
        };

        // create a user profile in our data store
        var ref = fbutil.ref('users', user.uid);

        return fbutil.handler(function(cb) {
          ref.set({provider: userData.provider, userName: userData.userName, userRole: userRole,
                  createdAt: Firebase.ServerValue.TIMESTAMP}, cb);
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
        provider: FIREBASE_PASSWORD_PROVIDER,
        userName: userName,
        password: password,
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

    var loginWithTwitter = function() {
      var deferred = $q.defer();

      logout();

      var w = logStarted('UserServiceFirebaseImpl#loginWithTwitter');

      var authMethod = 'twitter';
      var authUser = null;
      var userRole = ADMIN_ROLE;

      auth.$authWithOAuthPopup(authMethod).then(function(authData) {
        $log.debug("Authenticated successfully: " + JSON.stringify(authData));

        authUser = authData;

        // pick up the uid etc.
        var userData = {
          provider: FIREBASE_TWITTER_PROVIDER,
          userName: authUser.twitter.username,
          id: authUser.uid
        };

        var profileImage = authUser.twitter.profileImageURL;

        // create/update user profile in our data store; for simplicity we perform an update every time the user signs
        // in via Twitter; this way, for Twitter login, we don't have to distinguish between "signup" (initial, first
        // time) and "login" (recurring) - login and signup are (for Twitter) one and the same thing - on every login
        // the user's profile is updated
        var ref = fbutil.ref('users', authUser.uid);

        return fbutil.handler(function(cb) {
          ref.update({provider: userData.provider, userName: userData.userName, userRole: userRole,
            profileImage: profileImage, updatedAt: Firebase.ServerValue.TIMESTAMP}, cb);
        });

      }).then(function () {

        logFinished(w);

        deferred.resolve(setCurrentUser(authUser));
      }).catch(function(error) {
        logError(w, JSON.stringify(error));
        deferred.reject(mapError(w, error, "login"));
      });

      return deferred.promise;
    };

    function logout() {
      auth.$unauth();
      setCurrentUser(null);
    }

    function logoutDefault() {
      var deferred = $q.defer();

      logout();
      // nothing more to do, just return a resolved promise
      deferred.resolve();

      return deferred.promise;
    }

    var logoutApp = function () {
      var provider = currentLoggedinUser ? getAuthProvider(currentLoggedinUser.provider) : null;

      if (provider) {
        return provider.logout();
      }

      // everything else, just do a "default logout"
      return logoutDefault();
    };

    var logoutEmail = function() {
      // currently the same as a "default logout"
      return logoutDefault();
    };

    var logoutTwitter = function() {

      //
      // Reauthentication hack: the Twitter API does not really offer a "logout" function, so what we do is we simply
      // start an auth attempt with "force_login=true" (see code of the "oauthHelper" service)
      //
      // NOTE: reauthentication can be switched on or off through the 'TwitterReauthentication.useReauthenticationHack'
      // flag. A reason not to use reauthentication could be that, for secirity reasons, you do not want to have the
      // Twitter API keys (the consumer key and the consumer secret) in the app's source code (which is a necessity for
      // this method to work).

      if (TwitterReauthentication.useReauthenticationHack !== 'true') {
        // not using the hack, just do a "default logout"
        return logoutDefault();
      }

      //
      // Apply the reauthentication hack.
      //
      // NOTE: if TwitterReauthentication.useReauthenticationHack === 'false' then you can leave the 'consumerKey' and
      // the 'consumerSecretKey' properties of the "TwitterReauthentication" config section empty/blank.
      //
      // If TwitterReauthentication.useReauthenticationHack === 'true' then you will need to configure values for the
      // 'consumerKey' and 'consumerSecretKey' properties, and these values have to be IDENTICAL to the Twitter API
      // keys which you configured in the Firebase dashboard for your Firebase application.
      //

      var deferred = $q.defer();

      var w = logStarted('UserServiceFirebaseImpl#logoutTwitter');

      logout();

      var consumerKey = TwitterReauthentication.consumerKey;
      var consumerSecretKey = TwitterReauthentication.consumerSecretKey;

      oauthHelper.twitter(consumerKey, consumerSecretKey).then(function (result) {
        $log.warn("Authenticated successfully");

        logFinished(w);

        deferred.resolve();
      }, function (error) {
        logError(w, "THERE WAS AN ERROR: " +
          JSON.stringify(error));
        deferred.reject();
      });

      return deferred.promise;
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

      if (currentLoggedinUser) {
        currentLoggedinUser.setUserRole('unknown');
      }
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

    var isUserDataLoaded = function () {
      return userDataLoaded;
    };

    var retrieveProfile = function () {
      var user = currentLoggedinUser;

      var defaultValues = {
        userName: user.userName
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

    var canLoginWithTwitter = function () {
      return true;
    };

    var canEditProfileImage = function () {
      var provider = currentLoggedinUser ? getAuthProvider(currentLoggedinUser.provider) : null;

      return provider ? provider.canEditProfileImage : true;
    };

    // Configure the Firebase authentication providers
    var authProviders = {
      password: {
        getUserName: function (fbAuth) {
          return fbAuth.password.email;
        },
        logout: logoutEmail,
        canEditProfileImage: true
      },
      twitter: {
        getUserName: function (fbAuth) {
          return fbAuth.twitter.username;
        },
        logout: logoutTwitter,
        canEditProfileImage: false    // The profile image is loaded automatically from the user's Twitter profile,
                                      // hence it can not be edited via the user's profile page
      }
    };

    service = {
      init: init,
      loadUnload: loadUnload,
      loadUnloadData: loadUnloadData,
      loadUserDataSuccess: loadUserDataSuccess,
      loadUserDataError: loadUserDataError,
      isUserDataLoaded: isUserDataLoaded,
      isUserLoggedIn: isUserLoggedIn,
      currentUser: currentUser,
      getUserProp: getUserProp,
      getUserData: getUserData,
      getUserRole: getUserRole,
      setUserRole: setUserRole,
      signup: signup,
      login: login,
      loginWithTwitter: loginWithTwitter,
      logoutApp: logoutApp,
      changePassword: changePassword,
      resetPassword: resetPassword,
      retrieveProfile: retrieveProfile,
      saveProfile: saveProfile,
      canLoginWithTwitter: canLoginWithTwitter,
      canEditProfileImage: canEditProfileImage
    };

    return service;
  })
;
}());
