const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); // Import cors
const gameRoutes = require('./routes/gameRoutes');
const progressRoutes = require('./routes/progressRoutes');
const categoryRoutes = require('./routes/categoryRoutes'); // New route for categories
const questionRoutes = require('./routes/questionRoutes'); // New route for questions
const { setupSocket } = require('./utils/socket');
const { connectDB } = require('./config/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Apply middleware
app.use(express.json());

// Routes
app.use('/api/games', gameRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/questions', questionRoutes);

// Socket.IO setup
setupSocket(io);

// Debugging logs
console.log('Starting server...');

app.use(cors({
  origin: '*', // Allow all origins temporarily for debugging
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
  credentials: true, // Allow cookies if needed
}));

// Connect to the database
const PORT = process.env.PORT || 3000;
connectDB()
  .then(() => {
    console.log('Database connected successfully.');
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
  });

  app.get('/', (req, res) => {
    res.send('Welcome to the GuessWhat Trivia Backend!');
  });