Card Set Game Javascript(Test)

To play the game Set click start a new game on the menu page. Make sure you read the rules and understand how it works.

If you can't find a set use hint button to find two out of three in a set for you. This will subtract -0.5 points however. 
If you do find a set it will add 15 seconds to the time to give you more play time. If low on time maybe pressing hint will help.

You can also restart game with restart button and go back to menu in case you need to reread rules. Clicking these buttons will reset
the game state of cards dealt. 

The bot will automatically find sets after every twenty second interval. This interval time can be configured in the variable gameState.interval if needed.
Time to start with is 60 as in gameState.time. Changing gameState.time to a higher value can give you more time to play the game if needed.

Functionality - Description of methods:

createElement(card) will create a html div element for a card class object.
url(card) will create the card file url out of card object.
id(card) will make an id out of card object
parse(id) will make a card object out of id

drawCards(n) will return an array of n cards from gameState.deck.
randomizeDeck() will shuffle gameState.deck array.
hasSet(cardList) will check array cardList if it has a set or not and return true or false condition.
isSet(cardTriplet) will check array of three cards if it is a set or not and return true or false condition.

timerHandler functions -
activateBot() will search for a set and remove it, adding one to Bot's Score.
countDown() will subtract one second and check for 0 time game end condition.

eventHandler functions-
hint(event) will find two out of three cards in a set that exists in table and select them for player. 
onClickHandler() will make the current element selected in gameState.selectedCards and this will turn it red outline. 
If three are selected then it will check if it is a set and deselect all three cards.

commitTable() will update the html table in game.html to current gameState table. 
checkTable() will check current table for sets and if none found, draws 3 more and adds a column.
