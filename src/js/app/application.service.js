;(function () {
  "use strict";

  angular.module('app')

    .factory('Application', function (LocalStorage, UserService, Tracking, APP, $log, loggingService, $ionicHistory,
                                      $ionicLoading, $q, $ionicPopup, $translate) {

      var init = function () {
        loggingService.log("Application#init", "start");

        UserService.init();
        Tracking.initUser(UserService.currentUser());

        loggingService.log("Application#init", "end");
      };

      var getStartPage = function () {
        var state = null;

        //
        // "initial page" logic - this determines the first page to be shown by the app.
        //
        // This way, we can guide the user through the onboarding process.
        //

        if (isInitialRun()) {
          state = 'app.intro';
        } else if (!isUserRegistered()) {
          state = 'signup';
        } else if (!isUserLoggedIn()) {
          state = 'login';
        } else {
          state = APP.routerDefaultState;
        }

        loggingService.log(
          "Application#getStartPage", "state = " + state);

        return {state: state, stateParams: null};
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
        return LocalStorage.get("initialRun", "true") == "true";
      };

      var setInitialRun = function (initial) {
        LocalStorage.set("initialRun", initial ? "true" : "false");
      };

      var isUserRegistered = function () {
        return LocalStorage.get("userRegistered", "false") == "true";
      };

      var setUserRegistered = function (registered) {
        LocalStorage.set("userRegistered", registered ? "true" : "false");
      };

      var isUserLoggedIn = function () {
        return UserService.currentUser() !== null;
      };

      var isValidUser = function () {
        return UserService.currentUser() !== null && UserService.currentUser().emailVerified;
      };

      var showLoading = function (showBackdrop) {
        $ionicLoading.show({
          content: '',
          animation: 'fade-in',
          showBackdrop: showBackdrop,
          maxWidth: 200,
          showDelay: 0
        });
      };

      var hideLoading = function () {
        $ionicLoading.hide();
      };

      var resetForm = function (vm) {
        vm.form.$setPristine();
        vm.error = {};
      };

      var showErrorPopup = function() {
        var key = 'error-popup.';

        $translate([key + 'title', key + 'text', key + 'ok-button']).then(function(translations) {

            $ionicPopup.alert({
              title: translations[key + 'title'],
              template: translations[key + 'text'],
              cssClass: 'info-popup',
              buttons: [
                {
                  text: translations[key + 'ok-button'],
                  type: 'button-primary'
                }
              ]
            });

          });
      };

      var handleFailure = function (error, source, showPopup) {
        hideLoading();

        $log.log((source ? (source + " - error: ") : "Error: ") + error);

        if (showPopup) {
          showErrorPopup();
        }
      };

      var exec = function (execFunc, source, showPopup) {
        var deferred = $q.defer();

        showLoading(true);

        execFunc().then(function (data) {
          hideLoading();
          deferred.resolve(data);
        }).catch(function (error) {
          handleFailure(error, source, showPopup);
          deferred.reject(error);
        });

        return deferred.promise;
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
        resetForm: resetForm,
        exec: exec
      };
    });
}());
