//
// Test the login/logout experience
//
'use strict';

describe('Log in and log out', function () {

  var loginHelper = require('../../common/login.helper.js');

  it('when logged in it should be able to log out and then to login again', function () {
    loginHelper.ensureLoggedIn();

    loginHelper.logoutAndGotoLoginPage();

    // perform a successful login
    loginHelper.login();
    loginHelper.checkSuccessfulLogin();
  });

  it('try login with incorrect credentials', function () {
    loginHelper.ensureLoggedIn();

    loginHelper.logoutAndGotoLoginPage();

    // check that login with incorrect credentials fails

    loginHelper.login({
      username: 'wronguser@gmail.com',
      password: 'wrongpassword'
    });

    loginHelper.checkFailedLogin();
  });

});
