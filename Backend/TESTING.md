# Daily Game Testing Guide

## 🚀 Quick Start Testing

Follow these steps to test your Daily Game implementation:

### Step 1: Environment Check
```bash
npm run check-env
```
This will verify all your environment variables and dependencies are properly set up.

### Step 2: Start the Server
```bash
npm start
```
The server should start on port 3000 (or your configured PORT).

### Step 3: Create a Test Daily Game
In a new terminal:
```bash
npm run trigger-scheduler
```
This will create a daily game if none exists, using questions from your database.

### Step 4: Test the API
```bash
npm run test-daily
```
This will run comprehensive tests on all daily game endpoints.

## 🧪 What the Tests Cover

### 1. Health Check
- Verifies server is running
- Checks database connectivity

### 2. Daily Game Retrieval
- Gets current active daily game
- Validates game structure and questions

### 3. Result Submission
- Submits a test score
- Validates server-side score calculation
- Checks response format

### 4. Leaderboard
- Retrieves leaderboard data
- Validates ranking and pagination

### 5. Rate Limiting
- Tests duplicate submission prevention
- Validates rate limiting works

### 6. Admin Routes (if configured)
- Tests admin authentication
- Validates admin functionality

## 📊 Expected Output

### Successful Test Run:
```
🧪 Testing Daily Game API...

1. Testing health check...
✅ Health check: { status: 'healthy', timestamp: '...', database: 'connected' }

2. Testing get current daily game...
✅ Current daily game found: { id: '...', title: 'Test Daily Challenge', questionCount: 8 }

3. Testing submit result...
✅ Submit result success: { score: 75, rank: 1, percentile: 100 }

4. Testing leaderboard...
✅ Leaderboard retrieved: { totalParticipants: 1, topEntries: [...] }

5. Testing duplicate submission (should fail)...
✅ Duplicate submission correctly rejected: Only one daily game submission allowed per day

🎉 Daily Game API tests completed!
```

## 🔧 Troubleshooting

### Server Won't Start
- Check environment variables with `npm run check-env`
- Verify database connection
- Check for port conflicts

### No Daily Game Found
- Run `npm run trigger-scheduler` to create one
- Check if you have questions in your database
- Verify scheduler is working

### Database Errors
- Verify DATABASE_URL or DB_* variables
- Check database is accessible
- Run database migrations if needed

### API Test Failures
- Ensure server is running on correct port
- Check network connectivity
- Verify API routes are properly configured

## 📝 Test Data

The test script creates:
- Random test user IDs
- Sample scores (random between 1 and total questions)
- Random completion times
- Test device information

## 🔍 Monitoring

Check these locations for logs and debugging:
- Console output (server logs)
- `logs/daily-game.log` (Winston logs)
- Database for created records

## 🎯 Next Steps

After successful testing:
1. Set up production environment variables
2. Configure proper admin API keys
3. Set up automated daily scheduling
4. Deploy to production
5. Monitor logs and performance

## 🛠️ Manual Testing

You can also test manually using tools like:
- Postman
- curl commands
- Browser for GET endpoints

Example curl command:
```bash
curl -X GET http://localhost:3000/api/daily-games/current
```
