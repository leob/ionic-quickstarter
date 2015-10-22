;(function () {
  "use strict";

  //
  // Prevent the user from losing data by checking the from's "dirty" status before navigating away from the page.
  //
  // Adapted from:
  //
  // http://csharperimage.jeremylikness.com/2015/05/angularjs-project-essentials.html
  //
  // KNOWN BUG: the directive does not work properly when the user navigates away by selecting another Tab (ion-tabs)
  //

  appModule('app.util').directive('formDirtyCheck', function ($rootScope, $state, $ionicPopup, $translate) {
      var popupTemplate = null;
      var popupTexts = null;
      var key = 'leave-page-popup.';

      function getTranslations() {
        $translate(key + 'text', {you: $rootScope._y}).then(function (translation) {
          $translate([key + 'title', key + 'ok-button', key + 'cancel-button']).then(function (translations) {
            popupTemplate = translation;
            popupTexts = translations;
          });
        });
      }

      // on directive init, get and cache the translations for the confirmation popup
      getTranslations();

      return {
        restrict: 'E',
        replace: true,
        template: '<span></span>',
        scope: {
          dirty: '='
        },
        link: function (scope) {
          var cleanUpFn = angular.noop, unwatch, checkScope = function () {

            if (scope.dirty) {

              cleanUpFn = $rootScope.$on('$stateChangeStart',

                function(event, toState, toParams, fromState, fromParams) {
                  // we start by immediately preventing the state/page switch, otherwise we are too late (because the
                  // "$ionicPopup.confirm()" call below works asynchronously so doesn't wait/block the default action)
                  event.preventDefault();

                  $ionicPopup.confirm({
                    title: popupTexts[key + 'title'],
                    template: popupTemplate,
                    cssClass: 'info-popup',
                    cancelText: popupTexts[key + 'cancel-button'],
                    okText: popupTexts[key + 'ok-button']

                  }).then(function(res) {

                    if (!res) {    // user confirmed
                      // cleanup the event hook so that we do not ask for confirmation again when switching the state
                      cleanUpFn();
                      cleanUpFn = angular.noop;

                      // now re-do the state switch
                      $state.go(toState, toParams);
                    }
                  });
                });

            } else {
              cleanUpFn();
              cleanUpFn = angular.noop;
            }
          };

          unwatch = scope.$watch('dirty', checkScope);

          scope.$on('$destroy', function () {
            cleanUpFn();
            unwatch();
          });
        }
      };
    }
  );

}());