const { sequelize } = require('../config/db'); // Import sequelize
const Question = require('../models/Question');
const Player = require('../models/Players'); // Import the Player model

// Game state management
const gameStates = new Map(); // Store game states by gameId
const questionTimers = new Map(); // Store timers for each game

// Question timer duration in milliseconds (15 seconds)
const QUESTION_DURATION = 15000;
const RESULTS_DISPLAY_DURATION = 3000;

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
    
        // Store the socket ID with the player for later reference
        socket.playerData = { gameId, playerId: player.id, nickname };
        
        // Add the player to the game room
        socket.join(gameId);
    
        // Fetch all players in the game
        const players = await Player.findAll({ where: { gameId } });
    
        // Broadcast the updated player list to all clients in the game
        io.to(gameId).emit('updatePlayers', players);
    
        // Emit confirmation to the joining player
        socket.emit('joinedGame', { playerId: player.id });
        
        // Send player list again after a short delay to ensure all clients get it
        setTimeout(async () => {
          const updatedPlayers = await Player.findAll({ where: { gameId } });
          io.to(gameId).emit('updatePlayers', updatedPlayers);
        }, 1000);
        
        // IMPORTANT: If the game is already in progress, send the current question to the reconnecting player
        const gameState = gameStates.get(gameId);
        if (gameState && gameState.questions && gameState.questions.length > 0) {
          console.log(`Re-sending current question to reconnected player ${nickname} in game ${gameId}`);
          const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
          
          // Calculate remaining time if a timer is active
          let remainingTime = QUESTION_DURATION;
          if (gameState.questionStartTime) {
            const elapsed = Date.now() - gameState.questionStartTime;
            remainingTime = Math.max(0, QUESTION_DURATION - elapsed);
          }
          
          // Send only to this socket, not to all players
          socket.emit('gameStarted', { 
            totalQuestions: gameState.questions.length,
            players: players
          });
          socket.emit('newQuestion', {
            ...currentQuestion,
            timeLimit: remainingTime / 1000 // Convert to seconds for the client
          });
        }
      } catch (error) {
        console.error('Error joining game:', error);
        socket.emit('error', { message: 'Failed to join the game. Please try again later.' });
      }
    });
    
    socket.on('validateGameCode', async ({ gameId }) => {
      try {
        const game = await Game.findByPk(gameId);
        socket.emit('gameCodeValid', !!game);
      } catch (error) {
        console.error('Error validating game code:', error);
        socket.emit('error', { message: 'Failed to validate game code.' });
      }
    });
    
    socket.on('startGame', async ({ gameId, rounds, categories }) => {
      try {
        // Debug the incoming parameters
        console.log(`Starting game with parameters:`, { 
          gameId: typeof gameId === 'object' ? JSON.stringify(gameId) : gameId, 
          rounds, 
          categories 
        });
        
        // Ensure gameId is a string, not an object
        const gameIdStr = typeof gameId === 'object' ? gameId.toString() : gameId;
        
        console.log(`Starting game for gameId: ${gameIdStr} with ${rounds} rounds`);
        
        // Define the query options based on whether categories were provided
        const queryOptions = {
          order: sequelize.literal('RANDOM()'),
          limit: parseInt(rounds, 10) || 10
        };
        
        // Add category filter if provided
        if (categories && categories.length > 0 && !categories.includes('Any')) {
          queryOptions.where = { categoryId: categories };
        }
        
        // Use raw: true to get plain JavaScript objects directly
        queryOptions.raw = true;
        
        const questions = await Question.findAll(queryOptions);
    
        if (questions.length === 0) {
          io.to(gameIdStr).emit('error', { message: 'No questions available for this game.' });
          return;
        }
        
        console.log(`Found ${questions.length} questions for game ${gameIdStr}`);
        
        // Convert incorrectAnswers to array if they're stored as strings
        const processedQuestions = questions.map(q => {
          // Make a copy to avoid modifying the original
          const processedQuestion = {...q};
          
          // Handle incorrectAnswers if it's a string
          if (typeof processedQuestion.incorrectAnswers === 'string') {
            try {
              processedQuestion.incorrectAnswers = JSON.parse(processedQuestion.incorrectAnswers);
            } catch (e) {
              console.error('Error parsing incorrectAnswers:', e);
              // Provide a fallback
              processedQuestion.incorrectAnswers = ['Error parsing answers'];
            }
          }
          
          return processedQuestion;
        });
        
        // Initialize game state with processed questions
        gameStates.set(gameIdStr, {
          questions: processedQuestions,
          currentQuestionIndex: 0,
          playerAnswers: {},
          leaderboard: [],
          questionStartTime: Date.now() // Track when the question starts
        });
        
        // Get players
        const players = await Player.findAll({ where: { gameId: gameIdStr } });
        
        // Start the game
        io.to(gameIdStr).emit('gameStarted', { 
          totalQuestions: processedQuestions.length,
          players: players,
          gameId: gameIdStr  // Add gameId to the event data
        });
        
        // Send first question with time limit
        const firstQuestion = processedQuestions[0];
        console.log('Sending first question to clients:', firstQuestion.question);
        
        io.to(gameIdStr).emit('newQuestion', {
          ...firstQuestion,
          timeLimit: QUESTION_DURATION / 1000 // Convert to seconds for the client
        });
        
        // Start the timer for this question
        startQuestionTimer(gameIdStr, io);
      } catch (error) {
        console.error('Error starting game:', error);
        io.to(typeof gameId === 'object' ? gameId.toString() : gameId).emit('error', { message: 'Failed to start the game.' });
      }
    });

    socket.on('submitAnswer', async ({ gameId, playerId, answer, time }) => {
      try {
        // Ensure gameId is a string
        const gameIdStr = typeof gameId === 'object' ? gameId.toString() : gameId;
        
        const gameState = gameStates.get(gameIdStr);
        if (!gameState) {
          socket.emit('error', { message: 'Game not found.' });
          return;
        }
        
        const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
        // Handle the TIMEOUT special answer value
        const isTimeout = answer === 'TIMEOUT';
        const isCorrect = isTimeout ? false : currentQuestion.correctAnswer === answer;
        
        // Get player info
        const player = await Player.findByPk(playerId);
        if (!player) {
          socket.emit('error', { message: 'Player not found.' });
          return;
        }
        
        // Record answer
        if (!gameState.playerAnswers[gameState.currentQuestionIndex]) {
          gameState.playerAnswers[gameState.currentQuestionIndex] = [];
        }
        
        // Check if player already answered this question
        const alreadyAnswered = gameState.playerAnswers[gameState.currentQuestionIndex]
          .some(a => a.playerId === playerId);
        
        if (alreadyAnswered) {
          console.log(`Player ${player.playerName} already answered this question`);
          return;
        }
        
        gameState.playerAnswers[gameState.currentQuestionIndex].push({
          playerId,
          playerName: player.playerName,
          answer: isTimeout ? 'No answer (timeout)' : answer,
          isCorrect,
          time
        });
        
        // Update player score
        if (isCorrect) {
          player.score += 10; // Base score
          // Add time bonus (faster answers get more points)
          const timeBonus = Math.max(0, Math.floor((15 - time) / 3));
          player.score += timeBonus;
          await player.save();
        }
        
        // Notify others that a player has answered
        socket.to(gameIdStr).emit('playerAnswered', {
          playerId,
          playerName: player.playerName
        });
        
        // Check if all players have answered - if so, we can end the question early
        const playerCount = await Player.count({ where: { gameId: gameIdStr } });
        if (gameState.playerAnswers[gameState.currentQuestionIndex].length >= playerCount) {
          // All players answered, end the question timer and show results immediately
          endQuestion(gameIdStr, io);
        }
      } catch (error) {
        console.error('Error processing answer:', error);
        socket.emit('error', { message: 'Failed to process answer.' });
      }
    });

    // Handle requestCurrentQuestion (unified handler)
    socket.on('requestCurrentQuestion', ({ gameId }) => {
      try {
        console.log(`Received request for current question for game ${gameId} from socket ${socket.id}`);
        const gameIdStr = typeof gameId === 'object' ? gameId.toString() : gameId;
        const gameState = gameStates.get(gameIdStr);
        
        if (gameState && gameState.questions && gameState.questions.length > 0) {
          const currentIndex = gameState.currentQuestionIndex || 0;
          const currentQuestion = gameState.questions[currentIndex];
          
          console.log(`Responding with current question directly to socket: ${socket.id}`);
          console.log(`Question: ${currentQuestion.question}`);
          console.log(`Full question data: ${JSON.stringify(currentQuestion)}`);
          
          // Important: First send the gameStarted event to make sure the client is ready
          socket.emit('gameStarted', { 
            totalQuestions: gameState.questions.length,
            players: []  // We'll fetch players later if needed
          });
          
          // Then send the current question directly to the requesting socket
          socket.emit('newQuestion', currentQuestion);
        } else {
          console.log(`No game state or questions found for game ${gameIdStr}`);
          socket.emit('error', { message: 'No current question available' });
        }
      } catch (error) {
        console.error('Error sending current question:', error);
        socket.emit('error', { message: 'Error retrieving current question' });
      }
    });

    // Handle timer expired event (force end question)
    socket.on('timerExpired', ({ gameId }) => {
      try {
        console.log(`Timer expired for game ${gameId}`);
        
        // Ensure gameId is a string for consistent Map lookup
        const gameIdStr = typeof gameId === 'object' ? gameId.toString() : gameId;
        
        // Verify game state exists before ending question
        const gameState = gameStates.get(gameIdStr);
        if (!gameState) {
          console.error(`Game state not found for ID: ${gameIdStr}`);
          return;
        }
        
        console.log(`Found game state, ending question for game ${gameIdStr}`);
        
        // Cancel any existing timer to prevent duplicate calls
        if (questionTimers.has(gameIdStr)) {
          clearTimeout(questionTimers.get(gameIdStr));
          questionTimers.delete(gameIdStr);
        }
        
        // Call the endQuestion function with verified game ID
        endQuestion(gameIdStr, io);
      } catch (error) {
        console.error('Error handling timer expiration:', error);
      }
    });

    // Add after the timerExpired handler
socket.on('forceNextQuestion', ({ gameId }) => {
  try {
    console.log(`Force next question requested for game ${gameId}`);
    
    // Ensure gameId is a string for consistent Map lookup
    const gameIdStr = typeof gameId === 'object' ? gameId.toString() : String(gameId);
    
    // Verify game state exists before proceeding
    const gameState = gameStates.get(gameIdStr);
    if (!gameState) {
      console.error(`Game state not found for ID: ${gameIdStr}`);
      return;
    }
    
    // Log current state
    console.log(`Current question index: ${gameState.currentQuestionIndex}, total questions: ${gameState.questions.length}`);
    
    // Force move to next question
    moveToNextQuestion(gameIdStr, io);
  } catch (error) {
    console.error('Error handling force next question:', error);
  }
});

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
      
      // If this socket had player data, handle the cleanup
      if (socket.playerData) {
        const { gameId, playerId } = socket.playerData;
        
        // Notify other players in the room about the disconnect
        socket.to(gameId).emit('playerDisconnected', socket.playerData);
        
        // Re-send the player list to ensure it stays updated
        setTimeout(async () => {
          try {
            const activePlayers = await Player.findAll({ where: { gameId } });
            if (activePlayers && activePlayers.length > 0) {
              io.to(gameId).emit('updatePlayers', activePlayers);
            } else {
              // If no players are left, clean up the game state
              console.log(`No players left in game ${gameId}, cleaning up game state`);
              gameStates.delete(gameId);
            }
          } catch (error) {
            console.error('Error updating player list after disconnect:', error);
          }
        }, 500);
        
        // Check if this is the host disconnecting - we can detect this by checking if this player joined first
        try {
          Player.findOne({
            where: { gameId },
            order: [['createdAt', 'ASC']]
          }).then(firstPlayer => {
            if (firstPlayer && firstPlayer.id === playerId) {
              console.log(`Host (${playerId}) disconnected from game ${gameId}, notifying other players`);
              io.to(gameId).emit('hostDisconnected');
              // Consider ending the game here if host disconnects
              gameStates.delete(gameId);
            }
          });
        } catch (error) {
          console.error('Error checking if disconnected player was host:', error);
        }
      }
    });

    socket.on('endGame', async (gameId) => {
      try {
        // Clean up game state
        gameStates.delete(gameId);
        
        // Get final leaderboard
        const players = await Player.findAll({ 
          where: { gameId }, 
          order: [['score', 'DESC']] 
        });
        
        io.to(gameId).emit('gameEnded', { leaderboard: players });
      } catch (error) {
        console.error('Error ending game:', error);
        io.to(gameId).emit('error', { message: 'Failed to end the game.' });
      }
    });
  });
};

// Start a timer for the current question
function startQuestionTimer(gameId, io) {
  // Clear any existing timer for this game
  if (questionTimers.has(gameId)) {
    clearTimeout(questionTimers.get(gameId));
  }
  
  // Create a new timer
  const timer = setTimeout(() => {
    console.log(`Question time expired for game ${gameId}`);
    endQuestion(gameId, io);
  }, QUESTION_DURATION);
  
  // Store the timer reference
  questionTimers.set(gameId, timer);
  
  // Update the game state with the start time
  const gameState = gameStates.get(gameId);
  if (gameState) {
    gameState.questionStartTime = Date.now();
  }
}

// End the current question, show results, and move to the next question
// End the current question, show results, and move to the next question
function endQuestion(gameId, io) {
  console.log(`Processing end of question for game ${gameId}`);
  
  // Clear the timer
  if (questionTimers.has(gameId)) {
    clearTimeout(questionTimers.get(gameId));
    questionTimers.delete(gameId);
  }
  
  const gameState = gameStates.get(gameId);
  if (!gameState) {
    console.error(`Game state not found for gameId: ${gameId}`);
    return;
  }
  
  // Log current state before moving to next question
  console.log(`Current question index: ${gameState.currentQuestionIndex}, total questions: ${gameState.questions.length}`);
  
  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
  
  // Make sure the playerAnswers array for this question exists
  if (!gameState.playerAnswers[gameState.currentQuestionIndex]) {
    gameState.playerAnswers[gameState.currentQuestionIndex] = [];
  }
  
  // Send question results to all clients
  io.to(gameId).emit('questionResult', {
    answerStats: gameState.playerAnswers[gameState.currentQuestionIndex],
    correctAnswer: currentQuestion.correctAnswer
  });
  
  // Move to next question after a VERY short display duration
  setTimeout(() => {
    console.log(`Moving to next question for game ${gameId} after timer expiration`);
    moveToNextQuestion(gameId, io);
  }, 500); // Reduced to 500ms for faster progression
}

// Helper function to move to next question
function moveToNextQuestion(gameId, io) {
  // Ensure gameId is a string, not an object
  const gameIdStr = typeof gameId === 'object' ? gameId.toString() : gameId;
  
  const gameState = gameStates.get(gameIdStr);
  if (!gameState) {
    console.log(`Game state not found for gameId: ${gameIdStr}`);
    return;
  }
  
  gameState.currentQuestionIndex++;
  
  if (gameState.currentQuestionIndex < gameState.questions.length) {
    // Send next question - already in plain object format
    const nextQuestion = gameState.questions[gameState.currentQuestionIndex];
    console.log('Sending next question to clients:', nextQuestion.question);
    
    // Send the question with time limit
    io.to(gameIdStr).emit('newQuestion', {
      ...nextQuestion,
      timeLimit: QUESTION_DURATION / 1000 // Convert to seconds for the client
    });
    
    // Start the timer for this question
    startQuestionTimer(gameIdStr, io);
  } else {
    // Game ended, calculate final scores
    Player.findAll({ 
      where: { gameId: gameIdStr }, 
      order: [['score', 'DESC']] 
    }).then(players => {
      gameState.leaderboard = players;
      io.to(gameIdStr).emit('gameEnded', { leaderboard: players });
      // Clean up game state and timers
      setTimeout(() => {
        gameStates.delete(gameIdStr);
        if (questionTimers.has(gameIdStr)) {
          clearTimeout(questionTimers.get(gameIdStr));
          questionTimers.delete(gameIdStr);
        }
      }, 5000);
    }).catch(error => {
      console.error('Error fetching final scores:', error);
    });
  }
}

module.exports = { setupSocket };