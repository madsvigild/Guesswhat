import axios from 'axios';
import { io } from 'socket.io-client';
import { Platform } from 'react-native';

// Use your actual computer's local IP address
const YOUR_MACHINE_IP = '192.168.8.101'; // Your actual IP address

// Use different URLs based on environment or platform
export const API_BASE_URL = Platform.OS === 'android'
  ? `http://10.0.2.2:3000` // Android emulator special IP for localhost
  : `http://${YOUR_MACHINE_IP}:3000`; // iOS devices need your actual machine IP

// Increase timeout to 30 seconds for development
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for development
  headers: {
    'Content-Type': 'application/json',
  },
});

// Socket management
let socket = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(API_BASE_URL);
    console.log('Socket initialized');
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected');
  }
};

// API services
export const categoryService = {
  getAll: () => api.get('/api/categories'),
  getById: (id) => api.get(`/api/categories/${id}`),
};

export const questionService = {
  getQuestions: (params) => api.get('/api/questions', { params }),
};

export default api;