const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Defines the DailyGame model, representing a single daily quiz instance.
const DailyGame = sequelize.define('DailyGame', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Title of the daily game (e.g., Daily Challenge - June 14, 2025)',
  },
  theme: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Optional theme for the daily game (e.g., Science Sunday, Current Events)',
  },
  releaseDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'The date and time when this daily game becomes active (usually midnight UTC)',
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'The date and time when this daily game expires (usually midnight UTC the next day)',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // Can be set to false if a game is manually deactivated
    comment: 'Flag to indicate if the daily game is currently active',
  },
  questionIds: {
    type: DataTypes.JSONB, // Using JSONB for better performance with array of UUIDs
    allowNull: false,
    comment: 'An array of UUIDs (strings) of the questions included in this daily game',
  }
}, {
  // Model options
  tableName: 'DailyGames', // Explicitly setting table name
  timestamps: true, // Adds createdAt and updatedAt columns
});

module.exports = DailyGame;