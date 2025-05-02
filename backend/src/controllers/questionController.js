const Question = require('../models/Question');
const { sequelize, Sequelize } = require('../config/db'); // Import Sequelize

// Fetch all questions
const getQuestions = async (req, res) => {
  try {
    const { category, difficulty, limit } = req.query;

    console.log('Category filter:', category); // Log the category filter
    console.log('Difficulty filter:', difficulty); // Log the difficulty filter

    const whereClause = {};
    if (category && category !== 'Any') {
      whereClause.categoryId = category; // Filter by category UUID
    }
    if (difficulty && difficulty !== 'Any') {
      whereClause.difficulty = difficulty.toLowerCase(); // Convert to lowercase
    }

    const questions = await Question.findAll({
      where: whereClause,
      order: Sequelize.literal('RANDOM()'), // Use Sequelize.literal for random ordering
      limit: parseInt(limit, 10) || 10, // Default to 10 questions if no limit is provided
    });

    console.log('Questions fetched:', questions); // Log the fetched questions
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions.' });
  }
};

// Create a new question
const createQuestion = async (req, res) => {
  try {
    const { categoryId, question, correctAnswer, incorrectAnswers, difficulty } = req.body;
    const newQuestion = await Question.create({ categoryId, question, correctAnswer, incorrectAnswers, difficulty });
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question.' });
  }
};

// Update an existing question
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, question, correctAnswer, incorrectAnswers, difficulty } = req.body;

    const existingQuestion = await Question.findByPk(id);
    if (!existingQuestion) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    Object.assign(existingQuestion, { categoryId, question, correctAnswer, incorrectAnswers, difficulty });
    await existingQuestion.save();
    res.status(200).json(existingQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question.' });
  }
};

// Delete a question
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findByPk(id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    await question.destroy();
    res.status(200).json({ message: 'Question deleted successfully.' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question.' });
  }
};

module.exports = { getQuestions, createQuestion, updateQuestion, deleteQuestion };