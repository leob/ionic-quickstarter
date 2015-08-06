angular.module('app.user')

  //
  // Adapter between a User (model object) and a ParseUser
  //
  .factory('ParseUserAdapter', function (User) {

    var createParseUser = function(parseUser, data) {
      parseUser.set("username", data.username);
      parseUser.set("password", data.password);
      parseUser.set("email", data.email);

      return parseUser;
    };

    var getUserFromParseUser = function (parseUser) {
      if (!parseUser) {
        return null;
      }

      return User.build({
        userName: parseUser.getUsername(),
        emailVerified: parseUser.attributes.emailVerified
      });
    };

    return {
      createParseUser: createParseUser,
      getUserFromParseUser: getUserFromParseUser
    };
  })

;
