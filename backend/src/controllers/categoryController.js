const Category = require('../models/Category');
const Question = require('../models/Question'); // Import the Question model

// Fetch all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
};

// Create a new category
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category.' });
  }
};

// Update an existing category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    category.name = name;
    await category.save();
    res.status(200).json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category.' });
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find the category by ID
      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found.' });
      }
  
      // Delete related questions
      await Question.destroy({ where: { categoryId: id } });
  
      // Delete the category
      await category.destroy();
      res.status(200).json({ message: 'Category deleted successfully.' });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ error: 'Failed to delete category.' });
    }
  };

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };