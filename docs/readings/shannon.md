# Programming a Computer for Playing Chess1. CLAUDE E. SHANNON

## 1 - Introduction
- The aim is work on the problem of constructing a computer program to play chess. It is of theorical interest to explore this problem because a satisfactory solution of this problem will act as a wedge in attacking other problems of a similar nature and of greater significance
- He even lists some possible applications for the immediate future
- He lists some reasons why chess is a nice start point, one of them is quite interesting:

Chess is generally considered to require "thinking" for skilful play; a solution of this problem will force us: either to admit the possibility of a mechanized thinking or to further restrict our concept of 'thinking'

- He also mentions there have been some research on the topic already, some non satisfactory but working solutions to play chess againt some sort of computer which makes it super worth to be explored in modern computers

## 2 - General considerations
- A Chess position may be defined using some data:
	- A statement of the positions of all pieces on the board
	- A statement of which side, White or Black has the move.
	- A statement as to wheter the king and rooks have moved. This is important since by moving a rook, for example, the right to castle of that side if forfeited.
	- A statement of last move. This will determine whether a possible en passant capture is legal, since this privilege is forfeited after one move.
	- A statement of the number of moves made since the last pawn move or capture. This is important because of the 50 move drawing rule.
	- For simplicity, in this paper we will ignore the rule of draw after three repetitions of a position. ( I shall implement of course)

### Chance
Chess has no chance element despite the first or second player to move. Also, all players have all information all the time. Information being the list of moves played from the start position. Citing Von Neumann and Morgenstern, 1944 the concludes:
A given position will be either one of the following:

	(1) A won position for White. That is, White can force a win, however Black defends. 

	(2) A draw position. White can force at least a draw, however Black plays, and likewise Black can force at least a draw, however White plays. If both sides play correctly the game will end in a draw.

	(3) A won position for Black. Black can force a win, however White plays.

Ain't no practical method to determine the category of a position. If there were, would chess be so interesting? If there were a solution, considering the first position as a draw, then every game would end in a draw

If black could pass, it can be proven that white can at least draw with proper play. It means that if white was a tempo up, black could only win if white messed up. A tempo is very very important.

### Evaluation function
A simple evaluation function f(P) -> category of the position
He claims that if such a function could be found it would be easy to design a machine that would never lose a won position, never lose a drawn position and could capitalize on opponents mistakes to convert positions.


Suppose:
	
	f(P) = +1 for a won position
	f(P) = 0 for a drawn position
	f(P) = -1 for a lost position

At each turn, the machine would calculate f(P) for the various positions obtained from the present position after every possible move that can be made. In fact, in some clearly won end game positions this could be achieved since the evaluation function would return ~1. It would be interesting to check a set of positions to which there is a solution, this solutions is a path of ~1s evaluation results.

In *principle* it would be possible to play a perfect game. From the starting position, calculate all possible positions after all possible moves, then calculates the opponen's next possible moves, then, for each of the possible responses, calculate all of the possible responses. At the end of the game, go back to find an optimnal tree for a force win. Following sone lines of thougth and some nice data (average number of moves in a game, number of possible positions to the second move *10^3*) he gets to a nice conclusion:

	There are ~10^120 variations to be calculated for the first move of this perfect game to be played.

All positions, if they could all be calculated, could be hash as a dict, I simply find the position and the best move. The estimation: 64!/32!(8!)^2(2!)^6 = ~10^43 possible positions. Unfeasible.

The problem, then, is not to build a computer to play perfect chess, nor is it to play legal chess (which is quite trivial, right?). We shall look for a solution that can play good skillful chess. To some level. Can it play like a kid? Can it play like Magnus as a kid?

### Strategies

A strategy is the process of choosing a move given a position. In theory of games, a pure strategy is a strategy that for a given position the move is aways the same. If there are statical elements in it, the result is not always the same, which gives us a 'mixed' strategy, e.g.if I use some standard procedure to get a list of moves and always chose the first element of the list, we get  a pure strategy, however, if I get a random move out of the possible moves we get a mixed strategy.

Both are quite bad strategies, we need to find a tolerably good strategy for selecting the move to be made.

## Approximate Evaluating Functions

We can`t find a perfect evaluation function but we do evaluate positions all the time as players. The better the player the better the evaluation the player does.

*Assertions* on positions can be used as maxims and principles. What are these assertions? 
- Relative values between the pices, Q, R, B, K, P are 9, 5, 3, 3, 1.
- Rooks should be on open files, this is a 'mobility' score, if other things are equal, the side with more mobility should be stronger
- Backward, isolated and doubled pawns are weak
- An exposed king is a weakness ( what is an exposed king? ) 

These assertions are only generalizations on *empirical evidence of numerous games*, they only have some kind of statistical validity. Things can get messy in chess.

Example evaluation function: 


f(P) = 200(K-K') + 9(Q-Q') + 5(R-R') + 3(B-B'+N-N') + (P-P') - 0.5(D-D'+S-S'+I-I') + 0.1(M-M') +...

- K,Q,R,B,B,P are the number of White kings, queens, rooks, bishops, knights
 and pawns on the board
- D,S,I are doubled, backward and isolated White pawns
- M= White mobility (measured, say, as the number of legal moves available to
 White).
- Primed letters are the similar quantities for Black

The coefficients 0.5 and 0.1 are an estimate of ours as is everything else. Many more terms may be included.
There is an interesting aspect of having f(P) being more or less continuous. For 'perfect' players with perfect evaluation functions there are only three possible results {-1, 0, 1}. This can somehow indicate how big the advantage may be for any side.

For perfect evaluators the game goes one of three ways:
- (1)Mr. A says, "I resign" or
- (2)Mr. B says, "I resign" or
- (3)Mr. A says, "I offer a draw," and Mr. B replies, "I accept."

## STRATEGY BASED ON AN EVALUATION FUNCTION

The evaluation in itself can't help us much, we need an stratey. Consider the following: 

A queen capture will make me a queen up, however, the opponent will capture my queen after I capture its. Evaluating a single position is not enough. At least not enough with such an imperfect evaluation function.

This exists with as humans playing. We have variations. We investigate move by move on some chains of moves that make sense for us and we somehow choose the best variation we can find. We shall describe mathematically.
Lets define a *strategy of play* based on f(P).

How to go one step deeper?
Let M1, M2, M3, ... Ms be the moves that can beb made in position P. M1P, M2P, ... denote simbolically the resulting positions when M1, M2, ... are applied to P. One chooses Mm which maximizes f(MmP)

If Mi be the move chosen my White, then, black will play a move based on this move. Black has Mi1, Mi2, ..., Mis possible answers for Mi, Black plays to minimize f(P).
Mi is played by White, then Mij is played by Black such that f(MijMiP) is a minimum.

min f(Mij MiP) 
Mij

White has to play to maximize on Mi the quantity min(f(MijMiP)) that comes as the response of black.
So, maximize so that a minimum is less low. How crazy is that.

Similarly we can go for a two-move strategy

max	min	max	min	f(Mijkl Mijk Mij MiP)
Mi	Mij	Mijk  	Mijkl

This represents what to maximize and what to minimize.
We maximize M1P f(MiP), then minimize f(MijMiP), 
then maximize f(MijkMijMiP), then minimize f(MijklMijkMijMiP)
This order is important since the choices of moves occur in definite order. (What is a definite order?)


This will be called type A strategy and we shall study how to program it next.


## 5. PROGRAMMING A GENERAL PURPOSE COMPUTER FOR A TYPE A STRATEGY

Properties of the digital computer:
He describes how a computer should work, having a memory to store say 10 digit numbers, operations such addition and multiplication between numbers stored in these locations and if conditions to control flow of operations.
Our problem is to represent chess as numbers and operations on number so that we can reduce the strategy to a sequence of computer orders. He will not carry the implementation in detail, only outline the program, what is great for me.

He says it would be ideal to have a chess computer, one that works for chess, but since it may be quite expensive, we shall work witht he ones that are being constructed, it is, the general purpose computers. Cool, this ideal chess computer, isn't this what a neural network is? a computer?

A game of chess has phases, early, middle and endgame. The early game has a focus on developing pieces to good positions and lasts about 10 moves. The middle game has tactics and combinations and lasts until most of the pieces are exchanged, a few pawns and one or two pieces left on each side. The end game is mainly about pawn promotion , timing, zugzweang, stalemates, etc... Resulting, we should have different programs for different phases of the game. Here, we shall be chiefly concerned with the middle game and will leave the end game. 

A square can be occupied in  13 different ways, 0 for empty, 6 for white and 6 for black pieces.
64 squares and need to represent a  board, a total of 256 bits. It is not the best encoding but it is good for calculation.
There shall be one more number (lambda) for representing if it the current move is Black's or White's. More memory could be used to store casting privileges(where thie or black kings and rooks have moved) and en passant captures (statement of the last move). These will be neglected by now.

This notation gives us this starting position:
4, 2, 3, 5, 6, 3, 2, 4; 
1, 1, 1, 1, 1, 1, 1, 1; 
0, 0, 0, 0, 0, 0, 0, 0;
0, 0, 0, 0, 0, 0, 0, 0; 
0, 0, 0, 0, 0, 0, 0, 0; 
0, 0, 0, 0, 0, 0, 0, 0;
-1, -1, -1, -1, -1, -1, -1, -1;
-4, -2, -3, -5, -6, -3, -2, -4;
+1 (=lambda)

Normal moves can be specified with initial and final squared. e4 is 1,4;3,4. Pawn promotion one more digit for the piece that the pawn becomes. Castlings uses two symbols, when kings moves two/three squares. A move hence is a triple (a, b, c), a, b initial and final positions and c is a piece to get from a promotion.

Now, let's define some subprograms. He defines 10 subprograms:
- T0 = Makes move (a, b, c) in position P to obtain the resulting position.
- T1 = Makes a list of the possible moves of a pawn at square (x, y) in position P.
- T2, ..., T6 = Similarly for other types of pieces: knight, bishop, rook, queen and
 king.
- T7 = Makes list of all possible moves in a given position.
- T8 = Calculates the evaluating function f(P) for a given position P.
- T9 = Master program; performs maximizing and minimizing calculation to
 determine proper move.


T0: This is basically how to perform the move operation in a position.

(1) The square corresponding to number a in the position is located in the position
 memory.

(2) The number in this square x is extracted and replaced by 0 (empty).

(3) If x=1, and the first co-ordinate of a is 6 (White pawn being promoted) or if x=
1 and the first co-ordinate of a is 1 (Black pawn being promoted), the number c
 is placed in square b (replacing whatever was there).
 If x=6 and a-b=2 (White castles, king side) 0 is placed in squares 04 and 07 and
 6 and 4 in squares 06 and 05, respectively. Similarly for the cases x=6, b-a=2
 (White castles, queen side) and x=-6, a-b=+-2 (Black castles, king or queen
 side).
 In all other cases, x is placed in square b.

(4) The sign of lambda is changed.


Each piece type will have its program to determine its possible moves. Let's check T3, the example of a bishop.

T3: The bishop's moves

(1) Construct (x+1,y+1) and read the contents u of this square in the position P. 

(2) If u=0 (empty) list the move (x, y), (x+1,y+1) and start over with (x+2,y+2)
 instead of (x+1,y+1).

If lambda*u is positive (own piece in the square) continue to 3.

If lambda*u is negative (opponent's piece in the square) list the move and continue to 3.

If the square does not exist continue to 3.

(3) Construct (x+1,y-1) and perform similar calculation.

(4) Similarly with (x-1,y+1).

(5) Similarly with (x-1,y-1).


This example is cool, but there is lots to improve. One example is using combinations, he basically say we can break possible moves in groups of moves. A queen could use the moves of a rook + the moves of a bishop. The goal probably of making calculations simpler.

## T7: Making a list of possible moves

- (1) Start at square 1,1 and extract contents x.

- (2) If lambda*x is positive start corresponding piece program Tx and when
 complete return to (1) adding 1 to square number. If lambda8x is zero or
 negative, return to 1 to square number.

- (3) Test each of the listed moves for legality and discard those which are illegal.
 This is done by making each of the moves in the position P (by program T0) and
 examining whether it leaves the king in check.

This makes random play viable, but it's bad.

## T8: 
