Players = new Mongo.Collection('player');
var gameLogicMap = generateGameLogic();

Meteor.startup(function(){
  Meteor.call('resetGame');
});

Router.route('/player1', function() {
  this.render('player',
    {data: function() { return Players.findOne({"_id": "1"}); }}
  );
});

Router.route('/player2', function() {
  this.render('player',
    {data: function() { return Players.findOne({"_id": "2"}); }}
  );
});

if (Meteor.isClient) {

  Template.result.helpers({
    playerChoice: function() {
      return this.choice || "Choose a move";
    },
    opponentChoice: function() {
      var opponent = getOpponent(this);

      if (this.choice) {
        return opponent.choice || "waiting for opponent...";
      } else {
        return opponent.choice ? "hidden" : "waiting for opponent...";
      }
    },
    finalResult: function() {
      var opponent = getOpponent(this);
      var result = gameLogicMap[this.choice][opponent.choice];

      if (result === "draw") {
        return "It's a draw";
      } else if (result === "second wins") {
        return "You lose";
      } else if (result === "first wins"){
        return "You win";
      }
    },
    resultClasses: function() {
      var opponent = getOpponent(this);

      return this.choice && opponent.choice ? "finalResult" :
        "finalResult is-hidden";
    }
  });

  Template.optionBtns.events({
    "click .shoot button": function(e) {
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
    'click .reset': function(e) {
      e.preventDefault();
      Meteor.call('resetGame');
    }
  });

};

Meteor.methods({
  resetGame: function() {
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


if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}

function generateGameLogic() {
  var choices = ["rock", "paper", "scissors"];
  var map = {};

  choices.forEach(function(choice, i) {
    map[choice] = {};
    map[choice][choice] = "draw";
    map[choice][choices[(i+1)%3]] = "second wins";
    map[choice][choices[(i+2)%3]] = "first wins";
  });

  return map;
}

function getOpponent(thisPlayer) {
  var opponentId = thisPlayer._id === "1" ? "2" : "1";
  return Players.findOne({"_id": opponentId});
}
