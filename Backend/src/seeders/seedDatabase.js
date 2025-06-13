const { sequelize } = require('../config/db');
const Category = require('../models/Category');
const Question = require('../models/Question');

const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true }); // Reset the database

    // Create categories
    const categories = await Category.bulkCreate([
      { name: 'History' },
      { name: 'Science' },
      { name: 'General Knowledge' }
    ]);

    // Create questions for each category
    await Question.bulkCreate([
      {
        categoryId: categories[0].id,
        question: 'Who was the first president of the United States?',
        correctAnswer: 'George Washington',
        incorrectAnswers: ['Thomas Jefferson', 'Abraham Lincoln', 'John Adams'],
        difficulty: 'easy'
      },
      {
        categoryId: categories[1].id,
        question: 'What is the chemical symbol for water?',
        correctAnswer: 'H2O',
        incorrectAnswers: ['O2', 'CO2', 'H2'],
        difficulty: 'easy'
      },
      {
        categoryId: categories[2].id,
        question: 'What is the capital of France?',
        correctAnswer: 'Paris',
        incorrectAnswers: ['London', 'Berlin', 'Madrid'],
        difficulty: 'easy'
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();