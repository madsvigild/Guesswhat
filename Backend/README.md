# GuessWhat Trivia Backend

Backend API and socket service for the GuessWhat Trivia game application.

## Features

- REST API for trivia questions, categories, and game management
- Real-time multiplayer support with Socket.IO
- Daily challenge system
- Learning progression tracking

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables in `.env`:
   ```
   PORT=3000
   DATABASE_URL=your_postgres_connection_string
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Start the production server:
   ```
   npm start
   ```

## API Endpoints

- `/api/questions` - Trivia questions
- `/api/categories` - Question categories
- `/api/games` - Multiplayer games
- `/api/progress` - Learning progress

## Deployment

This application is deployed on Railway.app