;(function() {
"use strict";

appModule('app.user')

  .service('UserServiceMockImpl', function ($q, $log, $rootScope, User, AppHooks, StorageService) {

    var service;
    var currentLoggedinUser = null;
    var userDataLoaded = false;

    var userData = {
      provider: 'password',
      userName: 'ad@min.com',
      password: 'password',
      userRole: 'admin'   // hard-coded
    };

    function setCurrentUser(userData) {
      currentLoggedinUser = User.build(userData);

      if (currentLoggedinUser) {   // we have a logged in user, load their data
        loadUnloadData(currentLoggedinUser, true);
      }

      return currentLoggedinUser;
    }

    var init = function () {

      setCurrentUser(userData);     // set logged in user at app startup
      // comment out the line above and uncomment the next line to require login at startup
      //setCurrentUser(null);     // no valid user at application init, forcing login at start up

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

      //if (user.password == userData.password) {
        $log.debug("Signup done");

        // note: we don't set/change the current user because the new user isn't logged in yet
        deferred.resolve(User.build(userData));
      //} else {
      //  deferred.reject("unknown_error");
      //}

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

    function logout() {
      setCurrentUser(null);
    }

    var logoutApp = function () {
      var deferred = $q.defer();

      logout();
      deferred.resolve();

      return deferred.promise;
    };

    var changePassword = function (email, passwordOld, passwordNew) {
      var deferred = $q.defer();

      logout();


      $log.debug("Password change start ...");
      $log.debug("Password change done");

      deferred.resolve();

      return deferred.promise;
    };

    var resetPassword = function (email) {
      var deferred = $q.defer();

      logout();

      $log.debug("Password reset start ...");
      $log.debug("Password reset done");

      deferred.resolve();

      return deferred.promise;
    };

    function loadUserData(user) {
      // create "fake" user data
      var defaultValues = {
        email: user.userName,
        userRole: user.userRole
      };

      var loadedValues = StorageService.getObject('userProfile');

      return angular.extend(defaultValues, loadedValues);
    }

    var loadUnload = function (user, prop, load, onSuccess, data) {
      var obj = user;

      if (load) {
        obj[prop] = data;

        if (onSuccess) {
          $rootScope.$broadcast(onSuccess, data);
        }
      } else {
        delete obj[prop];
      }
    };

    var loadUnloadData = function (user, load) {
      if (!user) {
        return;
      }

      var userService = service;
      userDataLoaded = false;

      userService.loadUnload(user, 'data', load, loadUserDataSuccess(), loadUserData(userData));

      userDataLoaded = true;

      // call hook functions, if any
      AppHooks.loadUnloadUser(userService, user, load);
    };

    var loadUserDataSuccess = function () {
      return 'on.loadUserDataSuccess';
    };

    var loadUserDataError = function () {
      return 'on.loadUserDataError';
    };

    var getUserProp = function (prop, user) {
      var theUser = user || currentLoggedinUser;

      if (!theUser) {
        return null;
      }

      return theUser[prop];
    };

    var setUserProp = function (prop, user, value) {
      var theUser = user || currentLoggedinUser;

      if (theUser) {
        theUser[prop] = value;
      }
    };

    var getUserData = function (user) {
      return getUserProp('data', user);
    };

    var setUserData = function (user, value) {
      setUserProp('data', user, value);
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
        email: user.userName
      };

      var prof = angular.extend(defaultValues, getUserData());

      return prof;
    };

    var saveProfile = function (data) {
      var deferred = $q.defer();

      setUserData(null, angular.extend(getUserData(), data));
      StorageService.setObject('userProfile', data);

      deferred.resolve();

      return deferred.promise;
    };

    var canLoginWithTwitter = function () {
      return false;
    };

    var canEditProfileImage = function () {
      return true;
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
      setUserProp: setUserProp,
      getUserData: getUserData,
      setUserData: setUserData,
      getUserRole: getUserRole,
      setUserRole: setUserRole,
      signup: signup,
      login: login,
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
