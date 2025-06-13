const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Progress = sequelize.define('Progress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  playerId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  achievements: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
});

module.exports = Progress;