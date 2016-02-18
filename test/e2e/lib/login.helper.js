module.exports = (function () {
  'use strict';

  var EC = protractor.ExpectedConditions;

  var LoginPage = require('../pages/login.page.js');
  var loginPage = new LoginPage();

  var SideMenu = require('../pages/sideMenu.page.js');
  var sideMenu = new SideMenu();

  var LogoutPage = require('../pages/logout.page.js');
  var logoutPage = new LogoutPage();

  var login = function(options) {
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

    // Wait max. 1 second for the loader to appear, in some cases the loader is shown so briefly that the browser.wait
    // function cannot pick it up (especially when running with a mock auth implementation), in that case browser.wait
    // invokes the error callback but we do not want to treat this as a failure, in both cases we want to continue.

    browser.wait(EC.presenceOf(element(by.css('.loading-container.visible.active'))), 1000).then(

    // Handle both the success and error conditions with the same call to "loginDone()", see explanation here:
    // http://stackoverflow.com/questions/34740129/protractor-wait-on-condition-should-not-fail-after-timeout
    function () {   // SUCCESS CALLBACK
      expect(element(by.css('.loading-container.visible.active')).isPresent()).toBeTruthy('Loader shown');

      loginDone();
    },
    function () {   // ERROR CALLBACK
      loginDone();
    });
  };

  function loginDone() {

    // wait for the loader to disappear
    browser.wait(EC.not(EC.presenceOf(element(by.css('.loading-container.visible.active')))), 10000).then(function () {
      expect(element(by.css('.loading-container.visible.active')).isPresent()).toBeFalsy('Loader hidden');
    });
  }

  var ensureLoggedIn = function (gotoPage) {

    browser.get('/#' + (gotoPage || '/'));

    loginPage.isLoggedIn().then(function (result) {
      if (result.loggedIn) {
        console.log("URL: '" + result.url + "', already logged in");
      } else {
        console.log("URL: '" + result.url + "', logging in now");

        loginPage.load();
        login();

        checkSuccessfulLogin();
      }

      if (gotoPage) {
        browser.setLocation(gotoPage);
      }
    });
  };

  var logout = function() {
    expect(sideMenu.logout.isPresent()).toBeTruthy('Logout option shown');

    sideMenu.clickLogout();
    expect(browser.getLocationAbsUrl()).toContain(logoutPage.url, 'Logged out');
  };

  var logoutAndGotoLoginPage = function () {
    logout();

    // click the login link on the "logged out" page
    logoutPage.clickLogin();

    // check that we are now in the login page
    expect(browser.getLocationAbsUrl()).toContain(loginPage.url, 'Login page loaded');
  };

  var checkSuccessfulLogin = function () {
    // After a successful login we expect the URL to start with "/app/" (if login was unsuccessful then the URL remains
    // '/login')
    var urlAfterLogin = loginPage.loggedinUrl;

    expect(browser.getLocationAbsUrl()).toContain(urlAfterLogin, 'Logged in successfully');
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
