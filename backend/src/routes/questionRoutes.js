const express = require('express');
const { getQuestions, createQuestion, updateQuestion, deleteQuestion } = require('../controllers/questionController');

const router = express.Router();

// Define routes
router.get('/', getQuestions); // Fetch questions
router.post('/', createQuestion); // Create a new question
router.put('/:id', updateQuestion); // Update an existing question
router.delete('/:id', deleteQuestion); // Delete a question

module.exports = router;