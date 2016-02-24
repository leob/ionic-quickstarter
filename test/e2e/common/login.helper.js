module.exports = (function () {
  'use strict';

  var WAIT_FOR_PAGE = 5000;

  var utils = require('../common/utils.js');

  var LoginPage = require('../pages/login.page.js');
  var loginPage = new LoginPage();

  var SideMenu = require('../pages/sideMenu.page.js');
  var sideMenu = new SideMenu();

  var LogoutPage = require('../pages/logout.page.js');
  var logoutPage = new LogoutPage();

  var login = function (options) {
    var opts = options || {};
    var loginOpts = browser.params.login || {};

    // http://stackoverflow.com/questions/23135649/how-can-i-use-command-line-arguments-in-angularjs-protractor
    var username = opts.username || loginOpts.user;
    username = username || 'tester@test.com';

    var password = opts.password || loginOpts.password;
    password = password || 'password';

    loginPage.setUsername(username);
    loginPage.setPassword(password);
    loginPage.login();

    utils.waitForLoader();
  };

  var ensureLoggedIn = function (gotoPage) {

    browser.get('/#' + (gotoPage || '/'));

    sideMenu.logout.isDisplayed().then(function (displayed) {

      if (displayed) {
        console.log("Already logged in");
      } else {
        console.log("Not logged in, logging in now");

        loginPage.load();
        login();

        checkSuccessfulLogin();
      }

      if (gotoPage) {
        browser.setLocation(gotoPage);
        // necessary ?
        //utils.waitForPage(gotoPage, 'Loaded ' + goto);
      }
    });
  };

  var logout = function () {
    expect(sideMenu.logout.isPresent()).toBeTruthy('Logout option shown');

    sideMenu.clickLogout();

    waitForLogoutPage();
  };

  function waitForLogoutPage() {
    utils.waitForPage(logoutPage.url, 'Logged out');
  }

  var logoutAndGotoLoginPage = function () {
    logout();

    // click the login link on the "logged out" page
    logoutPage.clickLogin();

    // check that we are now in the login page
    expect(browser.getLocationAbsUrl()).toContain(loginPage.url, 'Login page loaded');
  };

  var checkSuccessfulLogin = function () {
    expect(sideMenu.logout.isPresent()).toBeTruthy('Logout option shown');
  };

  var checkFailedLogin = function () {
    // After a failed login the URL remains '/login'
    var urlAfterLogin = loginPage.url;

    expect(browser.getLocationAbsUrl()).toContain(urlAfterLogin, 'Login failed as expected');
  };

  return {
    ensureLoggedIn: ensureLoggedIn,
    login: login,
    logout: logout,
    logoutAndGotoLoginPage: logoutAndGotoLoginPage,
    checkSuccessfulLogin: checkSuccessfulLogin,
    checkFailedLogin: checkFailedLogin
  };
}());
