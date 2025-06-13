import axios from 'axios';
import { io } from 'socket.io-client';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Railway production URL - use your actual deployed URL
const RAILWAY_URL = 'postgresql://postgres:QbdHbHphrBGSQiQnYToHYxHBdipNxFOX@yamabiko.proxy.rlwy.net:36275/railway';

// Use your computer's local IP address for development
const YOUR_MACHINE_IP = '192.168.8.101'; // Update this to your actual IP

// Choose API URL based on environment
export const API_BASE_URL = __DEV__ 
  ? `http://${YOUR_MACHINE_IP}:3000`  // Use local server during development
  : RAILWAY_URL;                      // Use Railway in production

console.log('Using API URL:', API_BASE_URL); // Debug log

// Configure axios with proper timeout and error handling
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Reduced timeout for better user experience
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.message);
    console.error('Request details:', {
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL
    });
    return Promise.reject(error);
  }
);

// Socket management
let socket = null;

// In utils/api.js - update the initializeSocket function
export const initializeSocket = () => {
  if (!socket) {
    console.log('🔌 Creating new socket connection to:', API_BASE_URL);
    
    // More robust socket configuration
    socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],  // Try websocket first, fallback to polling
      reconnectionAttempts: 5,               // Try to reconnect 5 times
      reconnectionDelay: 1000,               // Wait 1 second between attempts
      timeout: 20000,                        // Increase connection timeout
      forceNew: true                         // Force a new connection
    });
    
    // Enhanced debugging and error handling
    socket.on('connect', () => {
      console.log('🟢 Socket CONNECTED with ID:', socket.id);
    });
    
    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      // Try to reconnect with polling if websocket fails
      if (socket.io.opts.transports.indexOf('polling') === -1) {
        console.log('Falling back to polling transport');
        socket.io.opts.transports = ['polling'];
        socket.connect();
      }
    });
    
    socket.on('disconnect', (reason) => {
      console.log('🔴 Socket DISCONNECTED, reason:', reason);
    });
  }
  return socket;
};

// Rest of your API code
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

// API services with better error handling
export const categoryService = {
  getAll: async () => {
    try {
      console.log('Fetching categories from:', `${API_BASE_URL}/api/categories`);
      return await api.get('/api/categories');
    } catch (error) {
      console.error('Error in categoryService.getAll:', error.message);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      return await api.get(`/api/categories/${id}`);
    } catch (error) {
      console.error(`Error in categoryService.getById(${id}):`, error.message);
      throw error;
    }
  },
};

export const questionService = {
  getQuestions: async (params) => {
    try {
      console.log('Fetching questions with params:', params);
      return await api.get('/api/questions', { params });
    } catch (error) {
      console.error('Error in questionService.getQuestions:', error.message);
      throw error;
    }
  },
};

export default api;