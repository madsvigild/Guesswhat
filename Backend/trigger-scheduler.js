require('dotenv').config();
const { connectDB } = require('./src/config/db');

async function triggerScheduler() {
  console.log('🔧 Manually triggering scheduler for testing...');
  
  try {
    // Connect to database first
    console.log('📡 Connecting to database...');
    const connected = await connectDB();
    if (!connected) {
      console.error('❌ Database connection failed');
      return;
    }
    console.log('✅ Database connected');

    // Import models after connection
    const DailyGame = require('./src/models/DailyGame');
    const Question = require('./src/models/Question');
    const Category = require('./src/models/Category');
    
    // Check current state
    console.log('\n📊 Checking current state...');
    
    const now = new Date();
    const activeGames = await DailyGame.findAll({
      where: { 
        isActive: true,
        releaseDate: { [require('./src/config/db').Op.lte]: now },
        expiryDate: { [require('./src/config/db').Op.gt]: now }
      }
    });
    
    const totalGames = await DailyGame.count();
    const totalQuestions = await Question.count();
    const totalCategories = await Category.count();
    
    console.log(`📈 Database stats:
      - Total Daily Games: ${totalGames}
      - Active Daily Games: ${activeGames.length}
      - Total Questions: ${totalQuestions}
      - Total Categories: ${totalCategories}`);
    
    if (activeGames.length > 0) {
      console.log('\n✅ Active games found:');
      activeGames.forEach(game => {
        console.log(`   - ${game.title} (${game.questionIds?.length || 0} questions)`);
      });
      console.log('\n💡 You can test the API with: npm run test-daily');
      return;
    }

    // Check if we have questions to work with
    if (totalQuestions === 0) {
      console.log('\n⚠️  No questions found in database!');
      console.log('💡 You may need to run your question generation script first');
      console.log('   Example: node scripts/generateQuestions.js');
      return;
    }

    console.log('\n🚀 No active games found, creating one for testing...');
    
    // Manually create a daily game for testing
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    
    // Get some random questions for the daily game
    const { sequelize } = require('./src/config/db');
    const randomQuestions = await Question.findAll({
      order: sequelize.literal('RANDOM()'),
      limit: 8
    });
    
    if (randomQuestions.length === 0) {
      console.log('❌ No questions available for daily game creation');
      return;
    }
    
    const questionIds = randomQuestions.map(q => q.id);
    
    // Create the daily game
    const newGame = await DailyGame.create({
      title: `Test Daily Challenge - ${new Date().toDateString()}`,
      theme: 'Testing Theme',
      releaseDate: new Date(), // Make it active immediately for testing
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      isActive: true,
      questionIds: questionIds
    });
    
    console.log('✅ Daily game created successfully!');
    console.log(`   - Game ID: ${newGame.id}`);
    console.log(`   - Title: ${newGame.title}`);
    console.log(`   - Questions: ${questionIds.length}`);
    console.log(`   - Active until: ${newGame.expiryDate}`);
    
    console.log('\n🎯 Ready for testing! Run: npm run test-daily');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.name === 'SequelizeConnectionError') {
      console.log('💡 Database connection issue. Check your DATABASE_URL or DB credentials.');
    } else if (error.name === 'SequelizeValidationError') {
      console.log('💡 Validation error:', error.errors?.map(e => e.message).join(', '));
    } else {
      console.log('💡 Full error:', error);
    }
  }
}

// Check environment first
if (!process.env.DATABASE_URL && !process.env.DB_NAME) {
  console.log('❌ Database environment variables not found!');
  console.log('💡 Make sure you have a .env file with DATABASE_URL or DB_* variables');
  process.exit(1);
}

triggerScheduler();
