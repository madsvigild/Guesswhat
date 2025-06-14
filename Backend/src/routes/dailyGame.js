const express = require('express');
const rateLimit = require('express-rate-limit'); // NEW: Import rateLimit
const router = express.Router();
const DailyGame = require('../models/DailyGame'); // Direct import
const DailyGameResult = require('../models/DailyGameResult'); // Direct import
const Question = require('../models/Question'); // Direct import
const Category = require('../models/Category'); // Direct import (needed for leaderboard with category filter, though not currently used)
const { Op, sequelize, Sequelize } = require('../config/db'); // Keep Op, sequelize, Sequelize from db config

// --- Rate Limiting ---
const dailyGameLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1, // Only 1 submission per day per IP
  message: { 
    error: 'Rate limit exceeded',
    message: 'Only one daily game submission allowed per day per IP address',
    retryAfter: 24 * 60 * 60 // seconds until reset
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Fix the key generator to be more robust
  keyGenerator: (req) => {
    // Use userId from body if available, otherwise fall back to IP
    const userId = req.body?.userId;
    // Ensure userId is a string to prevent issues with non-string values
    return userId && typeof userId === 'string' ? `user_${userId}` : `ip_${req.ip}`;
  },
  // Add skip function to handle cases where we want to allow retries for legitimate errors
  skip: (req) => {
    // Skip rate limiting for admin routes
    return req.path.includes('/admin/');
  }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Apply general rate limiting to all routes
router.use(generalLimiter);

// --- Enhanced Validation Middleware ---
const validateDailyGameResult = (req, res, next) => {
  const { dailyGameId, userId, username, correctAnswers, totalQuestions, timeTaken } = req.body;
  
  // Check required fields
  if (!dailyGameId || !userId || !username || correctAnswers === undefined || totalQuestions === undefined || timeTaken === undefined) {
    return res.status(400).json({ 
      message: 'Missing required fields',
      required: ['dailyGameId', 'userId', 'username', 'correctAnswers', 'totalQuestions', 'timeTaken']
    });
  }
  
  // Validate UUID format for dailyGameId
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(dailyGameId)) {
    return res.status(400).json({ message: 'Invalid dailyGameId format' });
  }
  
  // Validate data types
  if (!Number.isInteger(correctAnswers) || !Number.isInteger(totalQuestions) || !Number.isInteger(timeTaken)) {
    return res.status(400).json({ message: 'correctAnswers, totalQuestions, and timeTaken must be integers' });
  }
  
  // Validate score ranges
  if (correctAnswers < 0 || correctAnswers > totalQuestions) {
    return res.status(400).json({ message: 'correctAnswers must be between 0 and totalQuestions' });
  }
  
  // Validate reasonable question count (between 1 and 50 - adjust as per your daily game question count)
  // Current daily game generates 10 questions (5 LLM, 5 DB). Max 50 is fine.
  if (totalQuestions < 1 || totalQuestions > 50) { 
    return res.status(400).json({ message: 'totalQuestions must be between 1 and 50' });
  }
  
  // Validate reasonable time bounds (minimum 1 second, maximum 30 minutes)
  if (timeTaken < 1 || timeTaken > 1800) {
    return res.status(400).json({ message: 'timeTaken must be between 1 and 1800 seconds (30 minutes)' });
  }
  
  // Validate username length and characters
  if (typeof username !== 'string' || username.length < 1 || username.length > 50) {
    return res.status(400).json({ message: 'Username must be a string between 1-50 characters' });
  }
  
  // Validate username contains only allowed characters (letters, numbers, spaces, basic punctuation)
  const usernameRegex = /^[a-zA-Z0-9\s\-_\.]+$/; // Allows letters, numbers, space, hyphen, underscore, dot
  if (!usernameRegex.test(username)) {
    return res.status(400).json({ message: 'Username contains invalid characters. Only letters, numbers, spaces, hyphens, underscores, and dots are allowed.' });
  }
  
  next();
};

// --- Get current active daily game ---
router.get('/current', async (req, res) => {
  try {
    const now = new Date();
    const activeGame = await DailyGame.findOne({
      where: {
        releaseDate: { [Op.lte]: now },
        expiryDate: { [Op.gt]: now },
        isActive: true
      },
      order: [['releaseDate', 'DESC']] // Order to get the most recent active game if multiple somehow exist
    });

    if (!activeGame) {
      return res.status(404).json({ message: 'No active daily game found' });
    }

    // Fetch the actual question details
    // Ensure that `correctAnswer` and `incorrectAnswers` are selected
    const questions = await Question.findAll({
      where: { id: { [Op.in]: activeGame.questionIds } },
      attributes: ['id', 'question', 'correctAnswer', 'incorrectAnswers', 'difficulty'] // Explicitly include these
    });

    res.json({
      game: {
        id: activeGame.id,
        title: activeGame.title,
        theme: activeGame.theme,
        releaseDate: activeGame.releaseDate,
        expiryDate: activeGame.expiryDate,
        totalQuestions: activeGame.questionIds.length
      },
      questions: questions
    });
  } catch (error) {
    console.error('Error fetching current daily game:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- Get leaderboard for current daily game (no gameId) ---
router.get('/leaderboard', async (req, res) => {
  try {
    const now = new Date();
    const activeGame = await DailyGame.findOne({
      where: {
        releaseDate: { [Op.lte]: now },
        expiryDate: { [Op.gt]: now },
        isActive: true
      },
      order: [['releaseDate', 'DESC']]
    });
    
    if (!activeGame) {
      return res.status(404).json({ message: 'No active daily game found' });
    }

    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    // Validate limit bounds
    if (limit < 1 || limit > 100) {
      return res.status(400).json({ message: 'Limit must be between 1 and 100' });
    }
    if (offset < 0) { // Ensure offset is not negative
        return res.status(400).json({ message: 'Offset cannot be negative' });
    }

    const results = await DailyGameResult.findAll({
      where: { dailyGameId: activeGame.id },
      order: [
        ['score', 'DESC'],
        ['timeTaken', 'ASC']
      ],
      limit: limit,
      offset: offset,
      attributes: ['username', 'score', 'correctAnswers', 'totalQuestions', 'timeTaken', 'createdAt']
    });

    const totalCount = await DailyGameResult.count({
      where: { dailyGameId: activeGame.id }
    });

    const leaderboard = results.map((result, index) => ({
      rank: offset + index + 1,
      username: result.username,
      score: result.score,
      correctAnswers: result.correctAnswers,
      totalQuestions: result.totalQuestions,
      timeTaken: result.timeTaken,
      completedAt: result.createdAt
    }));

    res.json({
      gameId: activeGame.id,
      leaderboard: leaderboard,
      pagination: {
        total: totalCount,
        limit: limit,
        offset: offset,
        hasMore: offset + limit < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- Get leaderboard for specific daily game ---
router.get('/leaderboard/:gameId', async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    // Validate limit bounds
    if (limit < 1 || limit > 100) {
      return res.status(400).json({ message: 'Limit must be between 1 and 100' });
    }
    if (offset < 0) { // Ensure offset is not negative
        return res.status(400).json({ message: 'Offset cannot be negative' });
    }

    const results = await DailyGameResult.findAll({
      where: { dailyGameId: gameId },
      order: [
        ['score', 'DESC'],
        ['timeTaken', 'ASC']
      ],
      limit: limit,
      offset: offset,
      attributes: ['username', 'score', 'correctAnswers', 'totalQuestions', 'timeTaken', 'createdAt']
    });

    // Get total count for pagination
    const totalCount = await DailyGameResult.count({
      where: { dailyGameId: gameId }
    });

    // Add ranking
    const leaderboard = results.map((result, index) => ({
      rank: offset + index + 1,
      username: result.username,
      score: result.score,
      correctAnswers: result.correctAnswers,
      totalQuestions: result.totalQuestions,
      timeTaken: result.timeTaken,
      completedAt: result.createdAt
    }));

    res.json({
      gameId: gameId,
      leaderboard: leaderboard,
      pagination: {
        total: totalCount,
        limit: limit,
        offset: offset,
        hasMore: offset + limit < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- Submit a result for daily game ---
router.post('/result', dailyGameLimiter, validateDailyGameResult, async (req, res) => {
  // A transaction is good practice for multiple database operations that need to be atomic
  const transaction = await sequelize.transaction();
  
  try {
    const { dailyGameId, userId, username, correctAnswers, totalQuestions, timeTaken, device } = req.body;

    // Verify the daily game exists and is active within the transaction
    const dailyGame = await DailyGame.findByPk(dailyGameId, { transaction });
    if (!dailyGame) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Daily game not found' });
    }

    const now = new Date();
    if (now < dailyGame.releaseDate || now > dailyGame.expiryDate || !dailyGame.isActive) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Daily game is not currently active' });
    }

    // Verify totalQuestions matches the game's actual number of questions
    if (totalQuestions !== dailyGame.questionIds.length) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'Total questions submitted does not match the actual number of questions in the daily game.',
        expected: dailyGame.questionIds.length,
        received: totalQuestions
      });
    }

    // Check if user already submitted a result for this game within the transaction
    const existingResult = await DailyGameResult.findOne({
      where: { dailyGameId, userId },
      transaction
    });

    if (existingResult) {
      await transaction.rollback();
      return res.status(409).json({ message: 'Result already submitted for this daily game' });
    }

    // Calculate score (percentage) securely on the server side
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Create the result within the transaction
    const result = await DailyGameResult.create({
      dailyGameId,
      userId,
      username: username.trim(), // Trim whitespace from username
      correctAnswers,
      totalQuestions,
      timeTaken,
      score, // Use the server-calculated score
      completed: true, // Assuming submission means completion
      device: device || null // Store device info, default to null if not provided
    }, { transaction });

    await transaction.commit(); // Commit the transaction if all operations succeed

    // Calculate user's percentile and rank (after transaction for accurate counts)
    // Query without transaction to get latest committed results
    const totalResults = await DailyGameResult.count({
      where: { dailyGameId, completed: true }
    });

    const betterResults = await DailyGameResult.count({
      where: {
        dailyGameId,
        completed: true,
        [Op.or]: [
          { score: { [Op.gt]: score } }, // Higher score
          { // Same score, but faster time
            score: score,
            timeTaken: { [Op.lt]: timeTaken }
          }
        ]
      }
    });

    const userRank = betterResults + 1; // Your rank is the count of better results + 1
    const percentile = totalResults > 0 ? Math.round(((totalResults - userRank) / totalResults) * 100) : 100; // Correct percentile formula

    res.status(201).json({
      message: 'Result submitted successfully',
      result: {
        id: result.id,
        score: result.score,
        correctAnswers: result.correctAnswers,
        totalQuestions: result.totalQuestions,
        timeTaken: result.timeTaken,
        percentile: percentile,
        rank: userRank,
        totalParticipants: totalResults
      }
    });
  } catch (error) {
    // Rollback transaction if any error occurs
    if (transaction.finished !== 'committed' && transaction.finished !== 'rolled back') {
      await transaction.rollback();
    }
    console.error('Error submitting daily game result:', error);
    
    // Provide specific error messages for known issues
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ message: 'Result already submitted for this daily game.' });
    } else if (error.name === 'SequelizeValidationError') {
      res.status(400).json({ message: 'Validation error: ' + error.message });
    } else {
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
});

// --- Admin Authentication Middleware ---
const adminAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or missing API key' });
  }
  next();
};

// --- Admin Routes ---
router.post('/admin/create', adminAuth, async (req, res) => {
  try {
    const { title, theme, releaseDate, expiryDate, questionIds } = req.body;
    
    // Validation
    if (!title || !releaseDate || !expiryDate || !questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ message: 'Missing required fields for daily game creation.' });
    }

    // Verify questions exist by checking their count
    const existingQuestionsCount = await Question.count({
      where: { id: { [Op.in]: questionIds } }
    });

    if (existingQuestionsCount !== questionIds.length) {
      return res.status(400).json({ message: 'One or more provided question IDs do not exist.' });
    }

    const dailyGame = await DailyGame.create({
      title,
      theme,
      releaseDate: new Date(releaseDate), // Ensure dates are Date objects
      expiryDate: new Date(expiryDate),
      questionIds,
      isActive: true // Default to true for new games
    });

    res.status(201).json({
      message: 'Daily game created successfully',
      game: dailyGame
    });
  } catch (error) {
    console.error('Error creating daily game:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(409).json({ message: 'A daily game already exists for the specified date.' });
    } else if (error.name === 'SequelizeValidationError') {
        res.status(400).json({ message: 'Validation error: ' + error.message });
    } else {
        res.status(500).json({ message: 'Internal server error' });
    }
  }
});

router.put('/admin/update/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const dailyGame = await DailyGame.findByPk(id);
    if (!dailyGame) {
      return res.status(404).json({ message: 'Daily game not found' });
    }

    // Handle questionIds update: if provided, validate them
    if (updates.questionIds && Array.isArray(updates.questionIds)) {
        const existingQuestionsCount = await Question.count({
            where: { id: { [Op.in]: updates.questionIds } }
        });
        if (existingQuestionsCount !== updates.questionIds.length) {
            return res.status(400).json({ message: 'One or more provided new question IDs do not exist.' });
        }
    }
    // Ensure dates are converted if provided
    if (updates.releaseDate) updates.releaseDate = new Date(updates.releaseDate);
    if (updates.expiryDate) updates.expiryDate = new Date(updates.expiryDate);


    await dailyGame.update(updates);

    res.json({
      message: 'Daily game updated successfully',
      game: dailyGame
    });
  } catch (error) {
    console.error('Error updating daily game:', error);
    if (error.name === 'SequelizeValidationError') {
        res.status(400).json({ message: 'Validation error: ' + error.message });
    } else {
        res.status(500).json({ message: 'Internal server error' });
    }
  }
});

router.delete('/admin/delete/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const dailyGame = await DailyGame.findByPk(id);
    if (!dailyGame) {
      return res.status(404).json({ message: 'Daily game not found' });
    }

    await dailyGame.destroy();

    res.json({ message: 'Daily game deleted successfully' });
  } catch (error) {
    console.error('Error deleting daily game:', error);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        res.status(400).json({ message: 'Cannot delete daily game because associated results exist. Delete results first.' });
    } else {
        res.status(500).json({ message: 'Internal server error' });
    }
  }
});

// Error handling middleware (app-level or router-level depending on placement)
// This should ideally be the last middleware mounted in your Express app.
// If placed here, it only catches errors within dailyGame routes.
const errorHandler = (error, req, res, next) => {
  console.error('Daily Game Route Error:', error);
  
  // Handle specific Sequelize errors
  if (error.name === 'SequelizeConnectionError') {
    return res.status(503).json({ 
      message: 'Database connection failed',
      error: 'Service temporarily unavailable'
    });
  }
  
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      details: error.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }
  
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      message: 'Invalid reference to related data'
    });
  }
  
  // Default error
  res.status(500).json({ 
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message }) // Show error message in dev
  });
};

// Apply error handler to this router
router.use(errorHandler);

module.exports = router;
