Let's have fun with a stack similar to that I'm going to find in Meli.

The goal is to implement a web app that will allow me to study chess positions by playing games controlling both sides and getting evaluations on the positions getting the best possible moves so that the user can analyse them to improve.
There will be a history of games so that we can visit older games as well as traverse games moves. A nice feature would be branching games so that we can make new games out of a position.

The frontend is a NextJs app that will get the history of games and evaluations from Go API's and send events of new positions and moves to a Kafka Server. This Kafka server will have topics being consumed by the evaluation and game services that will populate a Redis Service to store a cache of evaluations and a PostgreSQL database to store a history of games. Even though we can reconstruct games using the KafkaEvents, it's interesting to have Postgresql to serve data for the web server.  A non-relational database could be used as well, but the data is well structured, Postgresql is just enough.

It will all work from a docker-compose.yml file. I usually build stuff in the Ubuntu directly but I want to practice containerization since all be working in the cloud.


