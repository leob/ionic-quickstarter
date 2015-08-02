describe('Config', function() {
  beforeEach(module('app.config'));

  it('has expected value for APP.routerDefaultState', inject(function(APP) {
    expect(APP.routerDefaultState).toEqual('app.auth.main.dash');
  }));
});