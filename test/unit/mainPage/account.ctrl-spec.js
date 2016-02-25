describe('AccountCtrl', function() {
  var $controller;

  beforeEach(module('ui.router'));
  beforeEach(module('app.mainPage'));

  beforeEach(inject(function($rootScope, $log, _$controller_) {
    var $scope = $rootScope.$new();

    var ApplicationServiceMock = {
      getLogger: function() {
        return $log;
      }
    };

    var UserServiceMock = {
      currentUser: function() {
        return null;
      }
    };

    $controller = _$controller_('AccountCtrl', {
      '$scope': $scope,
      'Application': ApplicationServiceMock,
      'UserService': UserServiceMock
    });
  }));

  it('should have enabled friends to be true', function(){
    expect($controller.settings.enableFriends).toEqual(true);
  });
});