# GuessWhat Trivia Game 
 
A multiplayer trivia game with React Native frontend and Node.js backend. 
 
## Project Structure 
 
This repository is organized as a monorepo containing both frontend and backend code: 
 
- **frontend/**: React Native application built with Expo 
- **backend/**: Node.js server with Express and PostgreSQL database 
 
## Setup Instructions 
 
### Backend 
 
1. Navigate to the backend directory: `cd backend` 
2. Install dependencies: `npm install` 
3. Create a `.env` file with your PostgreSQL credentials: 
 
   ```env 
   PORT=3000 
   DB_NAME=your_database_name 
   DB_USER=your_database_user 
   DB_PASSWORD=your_database_password 
   DB_HOST=localhost 
   ``` 
 
4. Populate the database: `node src/seeders/populateDatabase.js` 
5. Start the server: `npm start` 
 
### Frontend 
 
1. Navigate to the frontend directory: `cd frontend` 
2. Install dependencies: `npm install` 
3. Update the API_BASE_URL in `utils/api.js` to point to your backend server 
4. Start the Expo development server: `npm start` 
 
## Features 
 
- Daily trivia challenges 
- Practice mode with customizable categories and difficulty levels 
- Multiplayer mode to play with friends 
- Learning path for continuous improvement 
