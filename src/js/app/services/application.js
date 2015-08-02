angular.module('app')

  .factory('Application', function ($localStorage, UserService, Tracking, APP, $log, loggingService, $ionicHistory,
                                    $ionicLoading, $q) {

    var init = function () {
      loggingService.log("Application#init", "start");

      UserService.init();
      Tracking.initUser(UserService.currentUser());

      loggingService.log("Application#init", "end");
    };

    var getStartPage = function () {
      var state = null;
      var stateParams = null;

      //
      // "initial page" logic - this determines the first page to be shown by the app.
      //
      // This way, we can guide the user through the onboarding process.
      //

      if (isInitialRun()) {
        state = 'app.intro';
      } else if (!isUserRegistered()) {
        state = 'signup';
        stateParams = {firstUse: true};
      } else if (!isUserLoggedIn()) {
        state = 'login';
      } else {
        state = APP.routerDefaultState;
      }

      loggingService.log(
        "Application#getStartPage", "state = " + state + " hasStateParams = " + (stateParams !== null));

      return {state: state, stateParams: stateParams};
    };

    var gotoPage = function ($state, page, params, disableBackbutton, clearHistory) {

      // workaround for undesirable behavior when Ionic is showing the back button when we don't want it to
      if (disableBackbutton) {
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
      }

      if (clearHistory) {
        $ionicHistory.clearHistory();
      }

      $state.go(page, params || {});
    };

    var gotoIntroPage = function ($state) {
      gotoPage($state, "app.intro", null, true);
    };

    var gotoStartPage = function ($state, clearHistory) {
      var page = getStartPage();

      // After redirecting the user to the start page we want to make sure we don't show a back-button.
      // This is why we preemptively clear the Ionic view history.
      gotoPage($state, page.state, page.stateParams, true, clearHistory);
    };

    var isInitialRun = function () {
      return $localStorage.get("initialRun", "true") == "true";
    };

    var setInitialRun = function (initial) {
      $localStorage.set("initialRun", initial ? "true" : "false");
    };

    var isUserRegistered = function () {
      return $localStorage.get("userRegistered", "false") == "true";
    };

    var setUserRegistered = function (registered) {
      $localStorage.set("userRegistered", registered ? "true" : "false");
    };

    var isUserLoggedIn = function () {
      return UserService.currentUser() !== null;
    };

    var isValidUser = function () {
      return UserService.currentUser() !== null && UserService.currentUser().emailVerified;
    };

    var showLoading = function (showBackdrop, text) {
      $ionicLoading.show({
        content: text || 'Loading ...',
        animation: 'fade-in',
        showBackdrop: showBackdrop,
        maxWidth: 200,
        showDelay: 0
      });
    };

    var hideLoading = function () {
      $ionicLoading.hide();
    };

    var handleLoadUserFailure = function (error) {
      hideLoading();

      $log.log("Fetch user failed, error: " + error);

      if (error == "email_not_verified") {
        $state.go('login', {verifyEmail: true});
      } else {
        $state.go('login');
      }
    };

    var exec = function (execFunc, source) {
      var deferred = $q.defer();

      showLoading(true);

      execFunc().then(function (data) {
        hideLoading();
        deferred.resolve(data);
      }).catch(function (error) {
        handleFailure(error, source);
        deferred.reject(error);
      });

      return deferred.promise;
    };

    var handleFailure = function (error, source) {
      hideLoading();

      $log.log((source ? (source + " - error: ") : "Error: ") + error);
    };

    return {
      init: init,
      isInitialRun: isInitialRun,
      setInitialRun: setInitialRun,
      isUserRegistered: isUserRegistered,
      setUserRegistered: setUserRegistered,
      isValidUser: isValidUser,
      isUserLoggedIn: isUserLoggedIn,
      gotoPage: gotoPage,
      gotoStartPage: gotoStartPage,
      gotoIntroPage: gotoIntroPage,
      showLoading: showLoading,
      hideLoading: hideLoading,
      handleLoadUserFailure: handleLoadUserFailure,
      exec: exec,
      handleFailure: handleFailure
    };
  });
