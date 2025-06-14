const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testDailyGameAPI() {
  console.log('🧪 Testing Daily Game API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);

    // Test 2: Get current daily game
    console.log('\n2. Testing get current daily game...');
    try {
      const currentGameResponse = await axios.get(`${BASE_URL}/api/daily-games/current`);
      console.log('✅ Current daily game found:', {
        id: currentGameResponse.data.game?.id || currentGameResponse.data.id,
        title: currentGameResponse.data.game?.title || currentGameResponse.data.title,
        questionCount: currentGameResponse.data.questions?.length || 'Unknown'
      });

      const gameData = currentGameResponse.data.game || currentGameResponse.data;
      const questions = currentGameResponse.data.questions || [];

      // Test 3: Submit a result
      console.log('\n3. Testing submit result...');
      const testResult = {
        dailyGameId: gameData.id,
        userId: `test_user_${Date.now()}`,
        username: 'TestUser',
        correctAnswers: Math.floor(Math.random() * questions.length) + 1, // Random score
        totalQuestions: questions.length || gameData.totalQuestions || 5,
        timeTaken: Math.floor(Math.random() * 300) + 60, // Random time between 1-5 minutes
        device: 'test-script'
      };

      console.log('📤 Submitting test result:', testResult);
      const submitResponse = await axios.post(`${BASE_URL}/api/daily-games/result`, testResult);
      console.log('✅ Submit result success:', {
        score: submitResponse.data.result?.score,
        rank: submitResponse.data.result?.rank,
        percentile: submitResponse.data.result?.percentile
      });

      // Test 4: Get leaderboard
      console.log('\n4. Testing leaderboard...');
      const leaderboardResponse = await axios.get(`${BASE_URL}/api/daily-games/leaderboard`);
      console.log('✅ Leaderboard retrieved:', {
        totalParticipants: leaderboardResponse.data.pagination?.total || leaderboardResponse.data.length,
        topEntries: leaderboardResponse.data.leaderboard?.slice(0, 3) || leaderboardResponse.data.slice(0, 3)
      });

      // Test 5: Try to submit duplicate (should fail)
      console.log('\n5. Testing duplicate submission (should fail)...');
      try {
        await axios.post(`${BASE_URL}/api/daily-games/result`, testResult);
        console.log('❌ Duplicate submission should have failed!');
      } catch (duplicateError) {
        if (duplicateError.response?.status === 409 || duplicateError.response?.status === 429) {
          console.log('✅ Duplicate submission correctly rejected:', duplicateError.response.data.message);
        } else {
          console.log('⚠️  Unexpected error on duplicate:', duplicateError.response?.data || duplicateError.message);
        }
      }

    } catch (error) {
      if (error.response?.status === 404) {
        console.log('ℹ️  No active daily game found - this is expected if scheduler hasn\'t run yet');
        console.log('   Try running: npm run trigger-scheduler');
      } else {
        throw error;
      }
    }

    // Test 6: Test admin endpoint (if API key available)
    if (process.env.ADMIN_API_KEY) {
      console.log('\n6. Testing admin endpoints...');
      try {
        const adminHeaders = { 'x-api-key': process.env.ADMIN_API_KEY };
        
        // Try to create a test daily game
        const testGame = {
          title: 'Test Daily Game',
          theme: 'Testing',
          releaseDate: new Date(),
          expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          questionIds: [] // We'll need some question IDs here in real scenario
        };
        
        console.log('📝 Testing admin create (may fail if no questions available)...');
        // This might fail if no questions exist, which is fine for testing
        
      } catch (adminError) {
        console.log('ℹ️  Admin test skipped:', adminError.response?.data?.message || 'No admin access');
      }
    } else {
      console.log('\n6. Admin tests skipped (no ADMIN_API_KEY in environment)');
    }

    console.log('\n🎉 Daily Game API tests completed!');

  } catch (error) {
    console.error('\n❌ Test failed:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the server is running: npm start');
    }
  }
}

// Check if axios is available
try {
  require('axios');
} catch (e) {
  console.log('❌ axios not installed. Run: npm install axios --save-dev');
  process.exit(1);
}

// Run the test
testDailyGameAPI();
