;(function() {
  "use strict";

  appModule('app.user')

    //
    // A simple model object.
    //
    // Inspired by: https://medium.com/opinionated-angularjs/angular-model-objects-with-javascript-classes-2e6a067c73bc
    //

    .factory('User', function () {

      // Constructor, with class name
      function User(provider, userName, createdAt, id) {
        // Public properties, assigned to the instance ('this')
        this.provider = provider;
        this.userName = userName;
        this.createdAt = createdAt;
        this.id = id;
        // user type is initially null (not determined)
        this.userRole = null;
      }

      /**
       * Public method, assigned to prototype
       */
      User.prototype.getLoggedInDuration = function () {
        return (new Date()).getTime() - this.createdAt.getTime();
      };

      User.prototype.getUserRole = function () {
        return this.userRole;
      };

      User.prototype.setUserRole = function (value) {
        this.userRole = value;
      };

      User.prototype.isAdminUser = function () {
        return this.getUserRole() === 'admin';
      };

      // Static method, assigned to class; instance ('this') is not available in static context
      User.build = function (data) {
        if (!data) {
          return null;
        }

        return new User(
          data.provider,
          data.userName,
          new Date(),
          data.id
        );
      };

      /**
       * Return the constructor function ('class')
       */
      return User;
    })

  ;
}());
