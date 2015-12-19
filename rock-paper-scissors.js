Players = new Mongo.Collection('player');

Meteor.startup(function(){
  Players.update(
    {"_id": "1"},
    {"_id": "1", "choice": ""},
    {upsert: true}
  );

  Players.update(
    {"_id": "2"},
    {"_id": "2", "choice": ""},
    {upsert: true}
  );
});

Router.route('/player1', function() {
  this.render('Player',
    {data: function() {
      return Players.findOne({"_id": "1"});
    }}
  );
});

Router.route('/player2', function() {
  this.render('Player',
    {data: function() {
      return Players.findOne({"_id": "2"});
    }}
  );
});

if (Meteor.isClient) {

  Template.result.helpers({
    text: function(){
      var players = Players.find({}).fetch();
      var player1 = players[0];
      var player2 = players[1];

      var choices = ["rock", "paper", "scissors"];
      var mapped = {};

      choices.forEach(function(choice, i) {
        mapped[choice] = {};
        mapped[choice][choice] = 0;
        mapped[choice][choices[(i+1)%3]] = 1;
        mapped[choice][choices[(i+2)%3]] = 2;
      });

      p1Choice = player1.choice;
      p2Choice = player2.choice;

      if (mapped[p1Choice][p2Choice] === 0) {
        return "It's a draw";
      } else if (mapped[p1Choice][p2Choice] === 1) {
        return "Player 2 wins";
      } else if (mapped[p1Choice][p2Choice] === 2){
        return "Player 1 wins";
      }
    }
  });

  Template.optionBtns.events({
    "click .shoot": function(e) {
      e.preventDefault();

      var choice = e.target.value;

      Players.update(
        this._id,
        {$set: {"choice": choice}},
        {upsert: true}
      );
    }
  });
};

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
