const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
// Removed DailyGame import to avoid circular dependency - associations are handled in db.js

// Defines the DailyGameResult model, storing user scores for daily games.
const DailyGameResult = sequelize.define('DailyGameResult', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  dailyGameId: {
    type: DataTypes.UUID,
    allowNull: false,
    // Removed references object - foreign key constraints are handled by associations in db.js
    comment: 'The ID of the DailyGame this result belongs to',
  },
  userId: {
    type: DataTypes.STRING, // Using STRING for now for anonymous users (e.g., 'anon_UUID')
    allowNull: false,
    comment: 'Unique identifier for the user (anonymous UUID or authenticated user ID)',
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Display name of the user for the leaderboard',
  },
  correctAnswers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Number of questions answered correctly',
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Total number of questions in the daily game',
  },
  timeTaken: {
    type: DataTypes.INTEGER, // Time in seconds
    allowNull: false,
    comment: 'Time taken by the user to complete the quiz, in seconds',
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false, // Score calculated securely on the backend
    comment: 'Calculated score for the user in this daily game (e.g., percentage)',
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // Indicates if the user fully completed the quiz
    comment: 'Flag indicating if the user completed the daily game',
  },
  device: { // Added device field
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Information about the device used (e.g., platform, OS version)',
  }
}, {
  // Model options
  tableName: 'DailyGameResults', // Explicitly setting table name
  timestamps: true, // Adds createdAt and updatedAt columns
  indexes: [
    // Ensure uniqueness for a user playing a specific daily game
    {
      unique: true,
      fields: ['dailyGameId', 'userId'],
      name: 'unique_dailygame_user_result'
    },
    {
      fields: ['dailyGameId', 'score', 'timeTaken'],
      name: 'leaderboard_index'
    },
    {
      fields: ['userId'],
      name: 'user_results_index'
    }
  ]
});

module.exports = DailyGameResult;