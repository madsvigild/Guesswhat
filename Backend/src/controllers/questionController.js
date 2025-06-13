const Question = require('../models/Question');
const { sequelize, Sequelize } = require('../config/db'); // Ensure Sequelize is imported

// Fetch all questions
const getQuestions = async (req, res) => {
  try {
    const { category, difficulty, limit } = req.query;

    console.log('Backend: Received question fetch request with params:', { category, difficulty, limit }); // Full incoming params

    const whereClause = {};
    if (category && category !== 'Any') {
      whereClause.categoryId = category; // Filter by category UUID
    }
    
    // --- CORRECTED FIX for Case-Insensitive Difficulty Comparison ---
    if (difficulty && difficulty !== 'Any') {
      // Correctly applies LOWER function to the database column for case-insensitive comparison
      whereClause.difficulty = Sequelize.where(
        Sequelize.fn('LOWER', Sequelize.col('difficulty')),
        difficulty.toLowerCase()
      );
    }
    // --- END CORRECTED FIX ---

    // --- CRUCIAL DEBUGGING LOGS ADDED HERE ---
    console.log('Backend: Constructed whereClause:', whereClause);

    // This tells us how many questions MATCH THE FILTERS before any limit or random order is applied.
    const count = await Question.count({ where: whereClause });
    console.log(`Backend: Found ${count} questions matching the filters before applying limit/random.`);
    // --- END CRUCIAL DEBUGGING LOGS ---

    const questions = await Question.findAll({
      where: whereClause,
      order: Sequelize.literal('RANDOM()'),
      limit: parseInt(limit, 10) || 10,
    });

    // --- MORE CRUCIAL DEBUGGING LOGS ADDED HERE ---
    // This tells us how many questions were actually returned to the frontend.
    console.log('Backend: Questions fetched (count):', questions.length);
    // This tells us the IDs of the questions that were returned.
    console.log('Backend: IDs of fetched questions:', questions.map(q => q.id)); 
    // console.log('Backend: Full fetched questions:', questions); // Uncomment if you need full objects again
    // --- END MORE CRUCIAL DEBUGGING LOGS ---

    res.status(200).json(questions);
  } catch (error) {
    console.error('Backend: Error fetching questions:', error);
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