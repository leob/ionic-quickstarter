;(function() {
  "use strict";

  appModule('app.util').directive('formErrors', function() {
    return {
      restrict: 'E',
      replace: true,
      template: '<div class="text-center form-errors" ng-show="vm.error.message">' +
                    '<div class="padding badge badge-royal">' +
                      '{{vm.error.message}}' +
                    '</div>' +
                '</div>'
    };
  });
}());