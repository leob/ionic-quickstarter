module.exports = (function () {
  'use strict';

  var page = 'loggedout';

  var LogoutPage = function () {
  };

  LogoutPage.prototype = Object.create({}, {
    url: {
      get: function () {
        return '/' + page;
      }
    },
    clickLogin: {
      value: function () {
        element(by.name('loginPanel')).click();
      }
    }
  });

  return LogoutPage;
}());