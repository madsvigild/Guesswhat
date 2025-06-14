require('dotenv').config();

console.log('🔍 Environment Check for Daily Game Backend\n');
console.log('='.repeat(50));

const requiredVars = [
  { name: 'DATABASE_URL', description: 'Database connection string (Railway/PostgreSQL)' },
  { name: 'GEMINI_API_KEY', description: 'Google Gemini API key for question generation' }
];

const optionalVars = [
  { name: 'ADMIN_API_KEY', description: 'API key for admin routes' },
  { name: 'PORT', description: 'Server port (defaults to 3000)' },
  { name: 'NODE_ENV', description: 'Environment (development/production)' }
];

const alternativeDbVars = [
  { name: 'DB_NAME', description: 'Database name' },
  { name: 'DB_USER', description: 'Database username' },
  { name: 'DB_PASSWORD', description: 'Database password' },
  { name: 'DB_HOST', description: 'Database host' }
];

console.log('\n📋 Required Variables:');
let missingRequired = [];

requiredVars.forEach(variable => {
  const value = process.env[variable.name];
  const status = value ? '✅ Set' : '❌ Missing';
  console.log(`   ${variable.name}: ${status}`);
  if (value) {
    console.log(`      └─ ${variable.description}`);
  } else {
    missingRequired.push(variable.name);
  }
});

// Special check for database config
console.log('\n🗄️  Database Configuration:');
const hasDatabaseUrl = !!process.env.DATABASE_URL;
const hasIndividualDbVars = process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_HOST;

if (hasDatabaseUrl) {
  console.log('   ✅ DATABASE_URL is configured');
} else if (hasIndividualDbVars) {
  console.log('   ✅ Individual DB variables are configured');
  alternativeDbVars.forEach(variable => {
    const value = process.env[variable.name];
    const status = value ? '✅ Set' : '❌ Missing';
    console.log(`      ${variable.name}: ${status}`);
  });
} else {
  console.log('   ❌ No database configuration found!');
  console.log('      You need either DATABASE_URL OR all individual DB_* variables');
  missingRequired.push('Database Configuration');
}

console.log('\n🔧 Optional Variables:');
optionalVars.forEach(variable => {
  const value = process.env[variable.name];
  const status = value ? '✅ Set' : '⚠️  Not set';
  const displayValue = variable.name === 'ADMIN_API_KEY' && value ? '[HIDDEN]' : (value || 'undefined');
  console.log(`   ${variable.name}: ${status} ${value ? `(${displayValue})` : ''}`);
  console.log(`      └─ ${variable.description}`);
});

console.log('\n📁 File System Check:');
const fs = require('fs');
const path = require('path');

const importantPaths = [
  { path: './src/app.js', description: 'Main application file' },
  { path: './src/config/db.js', description: 'Database configuration' },
  { path: './src/routes/dailyGame.js', description: 'Daily game routes' },
  { path: './src/schedulers/dailyGameScheduler.js', description: 'Daily game scheduler' },
  { path: './logs', description: 'Logs directory', isDirectory: true },
  { path: './.env', description: 'Environment variables file' }
];

importantPaths.forEach(item => {
  try {
    const fullPath = path.resolve(item.path);
    const exists = fs.existsSync(fullPath);
    if (exists) {
      if (item.isDirectory) {
        console.log(`   ✅ ${item.path}/ - ${item.description}`);
      } else {
        const stats = fs.statSync(fullPath);
        console.log(`   ✅ ${item.path} - ${item.description} (${Math.round(stats.size / 1024)}KB)`);
      }
    } else {
      console.log(`   ❌ ${item.path} - ${item.description} (missing)`);
    }
  } catch (error) {
    console.log(`   ⚠️  ${item.path} - Error checking: ${error.message}`);
  }
});

console.log('\n📦 Dependencies Check:');
try {
  const packageJson = require('./package.json');
  const requiredDeps = [
    'express',
    'sequelize',
    'pg',
    'cors',
    'dotenv',
    'node-cron',
    '@google/generative-ai',
    'express-rate-limit',
    'winston',
    'express-request-id'
  ];

  const devDeps = ['axios']; // For testing

  console.log('   Production dependencies:');
  requiredDeps.forEach(dep => {
    const hasMainDep = packageJson.dependencies && packageJson.dependencies[dep];
    const hasDevDep = packageJson.devDependencies && packageJson.devDependencies[dep];
    const status = (hasMainDep || hasDevDep) ? '✅' : '❌';
    console.log(`      ${dep}: ${status}`);
  });

  console.log('   Development dependencies:');
  devDeps.forEach(dep => {
    const hasDep = packageJson.devDependencies && packageJson.devDependencies[dep];
    const status = hasDep ? '✅' : '⚠️';
    console.log(`      ${dep}: ${status} ${!hasDep ? '(install with: npm install ' + dep + ' --save-dev)' : ''}`);
  });

} catch (error) {
  console.log('   ❌ Could not read package.json');
}

console.log('\n' + '='.repeat(50));

if (missingRequired.length > 0) {
  console.log('❌ Setup Issues Found:');
  missingRequired.forEach(item => {
    console.log(`   - ${item} is required`);
  });
  console.log('\n💡 Fix these issues before running the server');
} else {
  console.log('✅ Environment looks good!');
  console.log('\n🚀 Ready to run:');
  console.log('   1. npm start                  (start the server)');
  console.log('   2. npm run trigger-scheduler  (create test daily game)');
  console.log('   3. npm run test-daily         (test the API)');
}

console.log('='.repeat(50));
