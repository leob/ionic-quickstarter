module.exports = (function () {
  'use strict';

  var SideMenu = function () {
  };

  SideMenu.prototype = Object.create({}, {
    menu: {
      get: function () {
        return element(by.tagName('ion-side-menu'));
      }
    },
    logout: {
      get: function () {
        return this.menu.element(by.name('logout'))
      }
    },
    clickLogout: {
      value: function () {
        return this.logout.click();
      }
    }
  });

  return SideMenu;
}());