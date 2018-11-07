# Perdon
Game application of a variation of the well-known "Sorry!" game
Gameplay Overview
Describes how the user(s) will interact with the game.
Players will randomly be assigned to one of four colors. The player that is assigned blue will go first, then a clockwise rotation will control who’s turn it is. 
Each player begins with 4 pawns with their respective colors. A player picks a card from the deck and the card determines the amount of moves his pawn can make.
A pawn can start moving only when the player picks either 1 or 2 from the card deck.
If a pawn lands on someone else’s pawn in a spot other than safe spot, the pawn initially at the spot should return to their respective start state and has to start the game over .

What is the goal of the game?
To legally move all four pawns into their respective home spot first.

How will the users achieve that goal?
Users must draw cards and move their pawns strategically to maneuver all four of their pawns across the board to their respective home spot before all other players.

Concept Demonstrated
What Theory of Computation concept(s) does this game demonstrate?

The Theory of Computation concept demonstrated is a non-deterministic finite automata. Every state transition is not determined by input (input being the cards drawn). There are state transitions that are determined by other factors (e.g. if a space one pawn occupies is landed on by another pawn, the first pawn must return home).


How does it do that?
There are only six states that any pawn can be at any given time.
Inert State: The state where the pawn initially resides.
Motion State: The state where the pawn begins moving.
Home State: The state where the pawn is aiming to be in to end the game.
Safe State: The states before entering the home state where no other players can step on/kill a pawn.
Slide State: The states where a player can choose to slide his pawn by either 0, 1, 2, or 3 number of moves.
Normal State: The state that doesn’t belong to any of the states mentioned above.

When a player non-deterministically draws a card from the deck, a pawn of his choice transitions from one state to other. A pawn always starts from the Inert State, the start state, and aims to finish at the home state, the final state. The pawn can no longer accept any input once it reaches the home state.


Design Sketch
What language, game framework, etc. are you using?
Language: Python

What are the major code processes/workflows that will control gameplay?
Environment initialization which will establish the initial state of the game board and shuffling the card deck.
Deciding how many players will play the game (up to 4). Then the players will be assigned to one of four colors (blue will always go first) with a clockwise rotation relative to the board.
Every player’s turn will have a set of actions that are triggered in an order: 
Player draws the top card to determine the amount of steps
Player chooses a piece to move for the amount in the card previously drawn
Player must draw either 1 or 2 to exit start spot and will move the 
Piece is moved from one spot to the new spot on the board
If another piece existed there, then that piece is sent back to start (if not in the piece owners safe zone)
Otherwise the turn ends there
Player ends turn and turn is passed to the next in the queue.
Determine if any player has won the game.

A description of major objects in the design
Game Board Spots -> These are the spaces where a piece can be moved to. There are multiple types of spots in the game.
Game Board -> The game board is composed of game board spots and will hold the state of the game, which will determine if a player wins or not.
Player Piece -> A piece that moves around the game board to represent a players position on the board
Game Card -> A single card is used to represent the amount of moves a player can make, once the card is drawn.
Card Deck -> A stack of cards supplied for the players to draw from, in order to determine the amount of moves the player can make.
Players -> All participants that perform actions that change the game state each turn