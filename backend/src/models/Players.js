const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Game = require('./Game');

const Player = sequelize.define('Player', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  gameId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Game,
      key: 'id',
    },
  },
  playerName: {
    type: DataTypes.STRING,
    allowNull: false, // Ensure nickname is required
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Player;