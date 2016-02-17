//
// Test the login/logout experience
//
'use strict';

describe('Log in and load pages', function () {

  var loginUtil = require('../lib/loginUtil.js');

  it('when logged in it should be able to log out and then to login again', function () {
    loginUtil.ensureLoggedIn();

    loginUtil.logoutAndGotoLoginPage();

    // perform a successful login
    loginUtil.login();
    loginUtil.checkSuccessfulLogin();
  });

  it('try login with incorrect credentials', function () {
    loginUtil.ensureLoggedIn();

    loginUtil.logoutAndGotoLoginPage();

    // check that login with incorrect credentials fails

    loginUtil.login({
      username: 'wronguser@gmail.com',
      password: 'wrongpassword'
    });

    loginUtil.checkFailedLogin();
  });

});
