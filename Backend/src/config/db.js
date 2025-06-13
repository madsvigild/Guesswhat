const { Sequelize } = require('sequelize');
require('dotenv').config();

// Log environment variables for debugging
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (value hidden for security)' : 'not set');

let sequelize;

// Check for DATABASE_URL (provided by Railway)
if (process.env.DATABASE_URL) {
  console.log('Connecting to database using connection string from Railway');
  
  // Extract host from DATABASE_URL for logging (without exposing credentials)
  try {
    const dbUrlObj = new URL(process.env.DATABASE_URL);
    console.log(`Database host: ${dbUrlObj.hostname}, port: ${dbUrlObj.port}`);
  } catch (e) {
    console.log('Invalid DATABASE_URL format');
  }
  
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,  // Changed to true for public connections
        rejectUnauthorized: false
      }
    },
    logging: false
  });
} else {
  // Local development database
  console.log('Connecting to database with the following details:');
  console.log({
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ? '***hidden***' : 'undefined',
    host: process.env.DB_HOST,
  });

  sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
  });
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Sync models with the database
    await sequelize.sync({ alter: true });
    console.log('Database synchronized.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    
    // Enhanced error logging
    if (error.parent) {
      console.error('Parent error:', {
        code: error.parent.code,
        errno: error.parent.errno,
        syscall: error.parent.syscall,
        hostname: error.parent.hostname,
      });
    }
    
    return false;
  }
};

module.exports = { sequelize, Sequelize, connectDB };