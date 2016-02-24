module.exports = (function () {
  'use strict';

  var EC = protractor.ExpectedConditions;

  var WAIT_FOR_LOADER_TO_APPEAR = 1000;
  var WAIT_FOR_LOADER_TO_DISAPPEAR = 25000;
  var WAIT_FOR_PAGE = 8000;

  function waitForLoaderToDisappear(opts) {

    // wait for the loader to disappear
    browser.wait(EC.not(EC.presenceOf(element(by.css('.loading-container.visible.active')))),
          opts.waitForLoaderToDisappear || WAIT_FOR_LOADER_TO_DISAPPEAR).then(function () {

        expect(element(by.css('.loading-container.visible.active')).isPresent()).toBeFalsy('Loader hidden');
      });
  }

  var waitForLoader = function (options) {
    var opts = options || {};

    browser.wait(EC.presenceOf(element(by.css('.loading-container.visible.active'))),
        opts.waitForLoaderToAppear || WAIT_FOR_LOADER_TO_APPEAR).then(

      // Handle both the success and error conditions with the same call to "loginDone()", see explanation here:
      // http://stackoverflow.com/questions/34740129/protractor-wait-on-condition-should-not-fail-after-timeout
      function () {   // SUCCESS CALLBACK
        expect(element(by.css('.loading-container.visible.active')).isPresent()).toBeTruthy('Loader shown');

        waitForLoaderToDisappear(opts);
      },
      function () {   // ERROR CALLBACK
        waitForLoaderToDisappear(opts);
      });
  };

  var waitForPage = function (pageUrl, message, timeout) {
    browser.driver.wait(function () {
      return browser.driver.getCurrentUrl().then(function (url) {
        return new RegExp(pageUrl).test(url);
      });
    }, timeout || WAIT_FOR_PAGE).then(function () {
      expect(browser.getLocationAbsUrl()).toContain(pageUrl, message);
    });
  };

  return {
    waitForLoader: waitForLoader,
    waitForPage: waitForPage
  };
}());
