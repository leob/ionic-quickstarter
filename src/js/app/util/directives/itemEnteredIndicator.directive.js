/*jshint sub:true*/
;(function() {
  "use strict";

  //
  // A directive that displays an indicator to alert the user to the fact that a certain item has not ben entered yet.
  //

  appModule('app.util').directive('itemEnteredIndicator', function () {
    return {
      restrict: 'E',
      replace: false,
      template: '<span class="italic note brand-secondary" ng-show="isVisible" translate>prompt.not-entered-yet</span>',
      scope: true,
      link: function (scope, element, attrs, ctrls, transclude) {
        scope.isVisible = false;

        var unwatch = scope.$watchCollection(showMessage, toggleVisible);

        scope.$on('$destroy', function () {
          unwatch();
        });

        function showMessage () {
          return scope.$eval(attrs['field']) === false;
        }

        function toggleVisible(isVisible) {
          scope.isVisible = isVisible;
        }
      }
    };
  });

}());