const Game = require('../models/Game');
const Player = require('../models/Players'); // Correct file name

const createGame = async (req, res) => {
  try {
    const { name } = req.body; // Only require the 'name' field
    if (!name) {
      return res.status(400).json({ error: 'Invalid request. Missing name.' });
    }

    // Create a new game with an auto-generated id
    const game = await Game.create({ name, state: {} });
    res.status(201).json(game);
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Failed to create game.' });
  }
};

const getGames = async (req, res) => {
  try {
    console.log('Fetching games from the database...');
    const games = await Game.findAll();
    console.log('Games fetched successfully:', games);
    res.status(200).json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games.' });
  }
};

const joinGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { playerName } = req.body;

    if (!playerName) {
      return res.status(400).json({ error: 'Player name is required.' });
    }

    // Create a new player with the provided nickname
    const player = await Player.create({ gameId, playerName });

    // Fetch all players in the game
    const players = await Player.findAll({ where: { gameId } });

    // Broadcast the updated player list to all clients in the game
    const io = req.app.get('io'); // Access the Socket.IO instance
    io.to(gameId).emit('updatePlayers', players);

    res.status(201).json(player);
  } catch (error) {
    console.error('Error joining game:', error);
    res.status(500).json({ error: 'Failed to join game.' });
  }
};

module.exports = { createGame, getGames, joinGame };