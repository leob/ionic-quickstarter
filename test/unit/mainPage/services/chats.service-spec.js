describe('Chats', function() {
  var Chats;

  beforeEach(module('ui.router'));
  beforeEach(module('app.mainPage'));

  beforeEach(inject(function (_Chats_) {
    Chats = _Chats_;
  }));

  it('can get an instance of my factory', function() {
    expect(Chats).toBeDefined();
  });

  it('has 5 chats', function() {
    expect(Chats.all().length).toEqual(5);
  });

  it('has Max as friend with id 1', function() {
    var oneFriend = {
      id: 1,
      name: 'Max Lynx',
      notes: 'Odd obsession with everything',
      face: 'https://avatars3.githubusercontent.com/u/11214?v=3&amp;s=460'
    };

    expect(Chats.get(1).name).toEqual(oneFriend.name);
  });
});