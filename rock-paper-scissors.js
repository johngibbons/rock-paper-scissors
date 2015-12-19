Players = new Mongo.Collection('player');

var choices = ["rock", "paper", "scissors"];
var mapped = {};

choices.forEach(function(choice, i) {
  mapped[choice] = {};
  mapped[choice][choice] = 0;
  mapped[choice][choices[(i+1)%3]] = 1;
  mapped[choice][choices[(i+2)%3]] = 2;
});

Meteor.startup(function(){
  Players.update(
    {"_id": "1"},
    {"_id": "1"},
    {upsert: true}
  );

  Players.update(
    {"_id": "2"},
    {"_id": "2"},
    {upsert: true}
  );
});

Router.route('/player1', function() {
  this.render('player',
    {data: function() {
      return Players.findOne({"_id": "1"});
    }}
  );
});

Router.route('/player2', function() {
  this.render('player',
    {data: function() {
      return Players.findOne({"_id": "2"});
    }}
  );
});

if (Meteor.isClient) {

  Template.result.helpers({
    ownChoice: function() {
      return this.choice || "Choose a move";
    },
    opponentChoice: function() {
      var otherId = this._id === "1" ? "2" : "1";
      var otherPlayer = Players.findOne({"_id": otherId});
      if (this.choice) {
        return otherPlayer.choice || "waiting for opponent...";
      } else {
        if (otherPlayer.choice) {
          return "hidden";
        } else {
          return "waiting for opponent...";
        }
      }
    },
    finalResult: function() {
      var currPlayer = Players.findOne({"_id": this._id});
      var otherId = this._id === "1" ? "2" : "1";
      var otherPlayer = Players.findOne({"_id": otherId});

      var currChoice = currPlayer.choice;
      var otherChoice = otherPlayer.choice;

      if (mapped[currChoice][otherChoice] === 0) {
        return "It's a draw";
      } else if (mapped[currChoice][otherChoice] === 1) {
        return "You lose";
      } else if (mapped[currChoice][otherChoice] === 2){
        return "You win";
      }
    },
    resultClasses: function() {
      var otherId = this._id === "1" ? "2" : "1";
      var otherPlayer = Players.findOne({"_id": otherId});
      return this.choice && otherPlayer.choice ? "finalResult" :
        "finalResult is-hidden";
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

  Template.result.events({
    "click .reset": function(e) {
      e.preventDefault();

      Players.update(
        {"_id": "1"},
        {"_id": "1"},
        {upsert: true}
      );

      Players.update(
        {"_id": "2"},
        {"_id": "2"},
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
