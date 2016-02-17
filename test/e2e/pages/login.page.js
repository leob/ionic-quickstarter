module.exports = (function () {
  'use strict';

  var loginPath = 'login';
  var loggedInPath = 'app/';

  var LoginPage = function () {

    this.isLoggedIn = function () {
      var defer = protractor.promise.defer();

      browser.getLocationAbsUrl().then(function (url) {
        defer.fulfill({loggedIn: url.match('\/' + loggedInPath), url: url});
      });

      return defer.promise;
    };

    this.load = function () {

      // load the login page if it's not already loaded
      browser.getLocationAbsUrl().then(function (url) {
        if (!url.match('\/' + loginPath + '\/*$')) {
          browser.get('/#/' + loginPath);
        }
      });
    };
  };

  LoginPage.prototype = Object.create({}, {
    url: {
      get: function () {
        return '/' + loginPath;
      }
    },
    loggedinUrl: {
      get: function () {
        return '/' + loggedInPath;
      }
    },
    username: {
      get: function () {
        return element(by.name('email'));
      }
    },
    setUsername: {
      value: function (keys) {
        return this.username.sendKeys(keys);
      }
    },
    setPassword: {
      value: function (keys) {
        return element(by.name('password')).sendKeys(keys);
      }
    },
    login: {
      value: function () {
        element(by.name('login')).click();
      }
    }
  });

  return LoginPage;
}());