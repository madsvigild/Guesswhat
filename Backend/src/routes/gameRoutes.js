const express = require('express');
const { createGame, getGames, joinGame } = require('../controllers/gameController'); // Import gameController functions

const router = express.Router();

// Define routes
router.get('/', getGames);    // Fetch all games
router.post('/', createGame); // Create a new game
router.post('/:gameId/join', joinGame); // Join an existing game

module.exports = router;