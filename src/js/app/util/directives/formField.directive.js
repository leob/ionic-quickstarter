/*jshint sub:true*/
;(function() {
  "use strict";

  //
  // A directive that can be used on a 'label' element to indicate the form field associated with the label.
  // This is then used to highlight the field (using CSS classes) when the field becomes 'valid' or 'invalid'.
  //
  // The design of this directive was inspired by the fus-messages directive: github.com/fusionalliance/fus-messages
  //

  appModule('app.util').directive('formField', formField);

  function formField() {
    return {
      restrict: 'A',
      require: ['^form'],
      scope: true,
      link: function (scope, element, attrs, ctrls, transclude) {
        scope.inputModel = scope.$eval(attrs['formField']);
        scope.$watchCollection(getFieldStatus, changeCssClasses);

        // get the field status depending on whether the input is dirty or when the form has been submitted, etc.
        function getFieldStatus () {
          var formController = ctrls[0];
          if (formController.$submitted || scope.inputModel.$dirty) {
            if (scope.inputModel.$invalid) {
              return 'I';
            }
            if (scope.inputModel.$valid) {
              return 'V';
            }
          }

          return undefined;
        }

        function changeCssClasses(state) {
          if (state == 'I') {
            element.addClass('has-error');
            element.removeClass('valid-lr');
          } else if (state == 'V') {
            element.removeClass('has-error');
            element.addClass('valid-lr');
          } else {
            element.removeClass('has-error');
            element.removeClass('valid-lr');
          }
        }

      }
    };
  }

}());