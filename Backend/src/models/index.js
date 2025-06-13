// filepath: c:\Users\madsv\guesswhat-trivia-backend\src\models\index.js
const Category = require('./Category');
const Question = require('./Question');

// Define associations
Category.hasMany(Question, { foreignKey: 'categoryId' });
Question.belongsTo(Category, { foreignKey: 'categoryId' });

module.exports = { Category, Question };