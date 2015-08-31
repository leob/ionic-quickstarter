;(function() {
  "use strict";

  appModule('app.user')

    //
    // A simple model object.
    //
    // Inspired by: https://medium.com/opinionated-angularjs/angular-model-objects-with-javascript-classes-2e6a067c73bc
    //

    .factory('User', function () {

      /**
       * Constructor, with class name
       */
      function User(userName, createdAt, emailVerified, id) {
        // Public properties, assigned to the instance ('this')
        this.userName = userName;
        this.createdAt = createdAt;
        this.emailVerified = emailVerified;
        this.id = id;
      }

      /**
       * Public method, assigned to prototype
       */
      User.prototype.getLoggedInDuration = function () {
        return (new Date()).getTime() - this.createdAt.getTime();
      };

      /**
       * Static method, assigned to class
       * Instance ('this') is not available in static context
       */
      User.build = function (data) {
        if (!data) {
          return null;
        }

        return new User(
          data.userName,
          new Date(),
          data.emailVerified,
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
