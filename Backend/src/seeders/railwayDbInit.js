const { sequelize } = require('../config/db');
const Category = require('../models/Category');
const Question = require('../models/Question');
const { populateDatabase } = require('./populateDatabase');

const railwayDbInit = async () => {
  try {
    console.log('Starting Railway database initialization...');
    
    // Test the connection
    await sequelize.authenticate();
    console.log('Railway PostgreSQL connection successful');
    
    // Sync models (alter: true is safer than force: true for production)
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized');
    
    // Check if data already exists
    const categoryCount = await Category.count();
    if (categoryCount > 0) {
      console.log(`Database already contains ${categoryCount} categories. Skipping population.`);
      return;
    }
    
    // Populate the database with seed data
    console.log('Populating Railway database with initial data...');
    await populateDatabase();
    console.log('Railway database populated successfully!');
  } catch (error) {
    console.error('Error initializing Railway database:', error);
    process.exit(1);
  }
};

// Run directly if this script is executed
if (require.main === module) {
  railwayDbInit()
    .then(() => {
      console.log('Railway database initialization complete');
      process.exit(0);
    })
    .catch(err => {
      console.error('Railway database initialization failed:', err);
      process.exit(1);
    });
}