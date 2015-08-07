describe('AccountCtrl', function() {
  beforeEach(module('ui.router'));
  beforeEach(module('app.mainPage'));

  beforeEach(inject(function($controller) {
    ctrl = $controller('AccountCtrl', {user: null});
  }));

  it('should have enabled friends to be true', function(){
    expect(ctrl.settings.enableFriends).toEqual(true);
  });
});