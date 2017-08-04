angular.module('cardcast.main', [])

// Set up main controller for Sender.
.controller('MainCtrl', function($scope, $timeout, $location, Service, user, deck) {
  $scope.deckInfo = deck.deckInfo;
  // Set Service var 'deckId' so that all controllers have access to the current deck
  Service.set($scope.deckInfo._id);
  // Set $scope.deck with info received from deck resolve
  $scope.deck = deck.cards;
  $scope.currentCard = {};

  //toggles popup warning using 'ng-show' in main.html
  $scope.showWarning = false;
  $scope.showDelete = false;
  $scope.showNote = false;
  $scope.username = user;
  $scope.showNoteAlternate = false;

  // First checks for a session and sees if anyone else is currently casting.
  // Casts the card that invoked it as long as no one else is casting,
  // otherwise triggers the popup warning.


  $scope.renderNote = function(card) {
    $scope.currentCard = card;
    $scope.showNote = true;
  };

  $scope.renderAlternate = function(card) {
    $scope.currentCard = card;
    $scope.showNoteAlternate = true;
    var notes = document.querySelector('#note-popup-notes');
    var card = document.querySelector('#note-popup-card');
    var altnotes = document.querySelector('#altnote-popup-notes');
    var altcard = document.querySelector('#alt-note-popup-card');
    notes.classList.add('scroll');
    card.classList.add('scroll');
    altnotes.classList.add('scroll');
    altcard.classList.add('scroll');
  };

  $scope.cancelNote = function() {
    $scope.showNote = false;
    $scope.showNoteAlternate = false;
  };


  $scope.showPopup = function(card) {

    // if there is an active session and no one is casting, cast the card
    if (session && !isCasting) {
      console.log(session.status);
      $scope.castCard(card);

      //show popup of casted card with note
      $scope.renderNote(card);
    // if there is an active session and someone else is casting show popup
    } else if (session && isCasting) {
      $scope.showWarning = true;
      $scope.currentCard = card;

     // $scope.showStopButton = true;
    } else if (chrome.cast) {

    // if there is no active session request one
      chrome.cast.requestSession(function(currentSession) {
        sessionListener.call(null, currentSession);

        // Provides extra time for the reciever to respond
        $timeout(function() {
          if (!isCasting) {
            $scope.currentCard = card;
            $scope.castCard(card);
            // show popup of casted card with note
            $scope.renderNote(card);
            //$scope.showStopButton = true;

          } else {
            $scope.showWarning = true;
            $scope.currentCard = card;
            //$scope.showStopButton = false;
          }
        }, 100);

      }, console.log.bind(null, 'onError: '));
    }
  };

  // clears popup warning if user cancels the cast
  $scope.cancelCast = function() {
    $scope.showWarning = false;
  };

  // Sends cast using the card that invoked showPopup. The username tracks who is currently casting
  // Passing the 'clear' parameter stops the current cast and reverts everything to default state.
  $scope.castCard = function(card, clear = false) {
    var message = {
      username: clear ? null : user,
      userDisplay: clear ? null : '<div class="material-icons userDisplay" id="userDisplay">perm_identity</div>  ' + user,
      card: clear ? '<h2>Welcome to CardCast!</h2><br/>Nothing has been casted yet...' : card.card,
      cardId: clear ? null : card._id,
      color: clear ? null : card.color,
      font: clear ? null : card.font
    };
    $scope.showWarning = false;
    session.sendMessage(namespace, JSON.stringify(message), console.log.bind(null, 'onSuccess: ', 'Message was sent: ' + message), console.log.bind(null, 'onError: '));
  };

  // Deletes selected card from the database
  $scope.deleteCard = function(card) {
    Service.deleteCard(card)
      .then(function(resp) {
        var index = $scope.deck.indexOf(card);
        $scope.deck.splice(index, 1);
        $scope.showDelete = false;
      });
  };

  $scope.warnDelete = function(card) {
    $scope.showDelete = true;
    $scope.currentCard = card;
  };

  $scope.cancelDelete = function() {
    $scope.showDelete = false;
  };
});
