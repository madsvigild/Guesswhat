const { sequelize } = require('../config/db'); // Import sequelize
const Question = require('../models/Question');
const Player = require('../models/Players'); // Import the Player model

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    const Game = require('../models/Game'); // Import the Game model

    socket.on('joinGame', async ({ gameId, nickname }) => {
      try {
        if (!gameId || !nickname) {
          socket.emit('error', { message: 'Invalid game ID or nickname.' });
          return;
        }
    
        const game = await Game.findByPk(gameId);
        if (!game) {
          socket.emit('error', { message: 'Game not found. Please check the code and try again.' });
          return;
        }
    
        // Check if the player already exists in the game
        let player = await Player.findOne({ where: { gameId, playerName: nickname } });
        if (!player) {
          // Create a new player with the provided nickname
          player = await Player.create({ gameId, playerName: nickname, score: 0 });
        }
    
        // Add the player to the game room
        socket.join(gameId);
    
        // Fetch all players in the game
        const players = await Player.findAll({ where: { gameId } });
    
        // Broadcast the updated player list to all clients in the game
        io.to(gameId).emit('updatePlayers', players);
    
        // Emit confirmation to the joining player
        socket.emit('joinedGame', { playerId: player.id });
      } catch (error) {
        console.error('Error joining game:', error);
        socket.emit('error', { message: 'Failed to join the game. Please try again later.' });
      }
    });
    
    socket.on('startGame', async (gameId) => {
      try {
        console.log(`Starting game for gameId: ${gameId}`);
        
        const questions = await Question.findAll({
          order: sequelize.random(),
          limit: 10,
        });
    
        if (questions.length === 0) {
          io.to(gameId).emit('error', { message: 'No questions available for this game.' });
          return;
        }
    
        let currentQuestionIndex = 0;
    
        // Emit the first question
        console.log('Emitting first question:', questions[currentQuestionIndex]);
        io.to(gameId).emit('newQuestion', questions[currentQuestionIndex]);
    
        // Emit subsequent questions at intervals
        const questionInterval = setInterval(() => {
          currentQuestionIndex++;
          if (currentQuestionIndex < questions.length) {
            console.log('Emitting next question:', questions[currentQuestionIndex]);
            io.to(gameId).emit('newQuestion', questions[currentQuestionIndex]);
          } else {
            clearInterval(questionInterval);
            io.to(gameId).emit('gameEnded', { message: 'Game Over!' });
          }
        }, 10000);
      } catch (error) {
        console.error('Error starting game:', error);
        io.to(gameId).emit('error', { message: 'Failed to start the game.' });
      }
    });

    socket.on('submitAnswer', async ({ gameId, playerId, answer }) => {
      try {
        const question = await Question.findOne({ where: { gameId } }); // Fetch the current question
        const isCorrect = question.correctAnswer === answer;
    
        // Update the player's score
        const player = await Player.findByPk(playerId);
        if (isCorrect) {
          player.score += 10; // Example scoring logic
          await player.save();
        }
    
        // Broadcast the updated leaderboard
        const players = await Player.findAll({ where: { gameId }, order: [['score', 'DESC']] });
        io.to(gameId).emit('leaderboard', players);
      } catch (error) {
        console.error('Error processing answer:', error);
        io.to(gameId).emit('error', { message: 'Failed to process answer.' });
      }
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });

    socket.on('endGame', async (gameId) => {
      try {
        const players = await Player.findAll({ where: { gameId }, order: [['score', 'DESC']] });
        io.to(gameId).emit('gameEnded', { leaderboard: players });
      } catch (error) {
        console.error('Error ending game:', error);
        io.to(gameId).emit('error', { message: 'Failed to end the game.' });
      }
    });
  });
};

module.exports = { setupSocket };