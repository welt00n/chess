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
- To be continued =D
