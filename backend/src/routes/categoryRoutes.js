const express = require('express');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');

const router = express.Router();

// Define routes
router.get('/', getCategories); // Fetch all categories
router.post('/', createCategory); // Create a new category
router.put('/:id', updateCategory); // Update an existing category
router.delete('/:id', deleteCategory); // Delete a category

module.exports = router;