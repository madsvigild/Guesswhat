import React, { useEffect, useState, useRef } from 'react';
import BaseQuizScreen from './BaseQuizScreen';
import { getSocket, API_BASE_URL } from '../utils/api';
import QuestionResultsScreen from './QuestionResultsScreen';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Animated } from 'react-native';
import LoadingScreen from './LoadingScreen';

export default function PlayWithFriendsQuizScreen({ navigation, route }) {
  const { gameCode, isHost, rounds = 10 } = route.params || {};
  const [currentResults, setCurrentResults] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(rounds);
  const socketRef = useRef(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  
  // New state for tracking player progress
  const [players, setPlayers] = useState([]);
  const [playerAnswers, setPlayerAnswers] = useState({});
  const [recentAnswerer, setRecentAnswerer] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // New state for timer
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);
  const showResultsTimeoutRef = useRef(null);
  const [showingFeedback, setShowingFeedback] = useState(false); // Add missing state variable
  
  // Add a reference to track whether timerExpired was sent
  const timerExpiredSent = useRef(false);

  // Initialize socket and setup event listeners
  useEffect(() => {
    console.log('PlayWithFriendsQuizScreen mounted, gameCode:', gameCode);
    
    if (!gameCode) {
      setError("No game code provided. Please go back and try again.");
      setLoading(false);
      return;
    }
    
    // Use the shared socket instance from api.js 
    socketRef.current = getSocket();
    console.log('Using shared socket instance in PlayWithFriendsQuizScreen');
    
    // CRITICAL: Remove all listeners to ensure we don't have duplicate handlers
    socketRef.current.off('newQuestion');
    socketRef.current.off('gameStarted');
    socketRef.current.off('joinedGame');
    socketRef.current.off('questionResult');
    socketRef.current.off('gameEnded');
    socketRef.current.off('error');
    socketRef.current.off('playerAnswered');
    socketRef.current.off('updatePlayers');
    
    // Listen for game started event
    socketRef.current.on('gameStarted', (data) => {
      console.log('Game started event received:', data);
      setTotalQuestions(data.totalQuestions || rounds);
      setGameStarted(true);
      
      // Reset player answers for the new game
      setPlayerAnswers({});
      
      // If players were included in the game started event, update the players list
      if (data.players && Array.isArray(data.players)) {
        setPlayers(data.players);
      }
    });

    // Listen for new questions - CRITICAL FIX
    socketRef.current.on('newQuestion', (question) => {
      console.log('🔄 Question transition - cleaning up previous state');
      
      // Reset timer expiration flag
      timerExpiredSent.current = false;
      
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Reset answer state
      setPlayerAnswers({});
      setSelectedAnswer(null);
      setShowingFeedback(false); // Also reset feedback state
      
      // Skip processing if this is a duplicate event for the same question
      if (questions.some(q => q.question === question.question)) {
        const existingIndex = questions.findIndex(q => q.question === question.question);
        if (existingIndex === currentQuestionIndex) {
          console.log('Ignoring duplicate question event');
          return; // Skip processing duplicate events
        }
      }
      
      console.log('New question received:', question.question);
      console.log('Time limit for question:', question.timeLimit || '15 seconds (default)');
      
      // Check if the question has the expected structure
      if (!question || !question.question) {
        console.error('Received invalid question object');
        setError('Invalid question data received from server');
        setLoading(false);
        return;
      }
      
      // Ensure incorrectAnswers is properly parsed if it's a string
      let processedQuestion = {...question};
      if (typeof processedQuestion.incorrectAnswers === 'string') {
        try {
          processedQuestion.incorrectAnswers = JSON.parse(processedQuestion.incorrectAnswers);
        } catch (error) {
          console.error('Error parsing incorrectAnswers:', error);
          setError('Error processing question data');
          setLoading(false);
          return;
        }
      }
      
      console.log('Successfully processed question, updating state now');
      
      // Force UI update with a COMPLETELY SEPARATE update pattern
      // First, immediately turn off loading and enable game state
      setLoading(false);
      setGameStarted(true);
      
      // Reset player answers for the new question
      setPlayerAnswers({});
      setRecentAnswerer(null);
      
      // Reset selected answer for new question
      setSelectedAnswer(null);
      
      // Update the questions array instead of replacing it
      // This allows us to maintain the sequence of questions
      setQuestions(prevQuestions => {
        // Check if this appears to be a new question
        const questionExists = prevQuestions.some(q => q.question === processedQuestion.question);
        
        if (questionExists) {
          // Question already in our array, just ensure we have the right index
          const questionIndex = prevQuestions.findIndex(q => q.question === processedQuestion.question);
          if (questionIndex >= 0) {
            console.log(`Found existing question at index ${questionIndex}, updating index`);
            // Update the current question index in a separate update to avoid re-renders
            setTimeout(() => setCurrentQuestionIndex(questionIndex), 0);
          }
          return prevQuestions;
        } else {
          // Add the new question to our array
          const newQuestions = [...prevQuestions, processedQuestion];
          // Update our index to point to the last item in the array
          const newIndex = newQuestions.length - 1;
          console.log(`Adding new question at index ${newIndex}`);
          setTimeout(() => setCurrentQuestionIndex(newIndex), 0);
          return newQuestions;
        }
      });
      
      // Start timer based on the timeLimit from the server (or default to 15)
      const newTimeLimit = Math.floor(question.timeLimit || 15);
      console.log('Setting timer to:', newTimeLimit, 'seconds');
      setTimeLeft(newTimeLimit);
      startTimer(newTimeLimit);
      
      console.log('Question state updated to show:', processedQuestion.question);
    });

    // Listen for question results
    socketRef.current.on('questionResult', ({ answerStats, correctAnswer }) => {
      console.log('💡 Question results received:', { 
        answerStats, 
        correctAnswer,
        currentTime: new Date().toISOString()
      });
      
      // Log game state
      console.log('📊 Game state when results received:', {
        currentQuestionIndex,
        totalQuestions,
        questionsCount: questions.length,
        hasSelectedAnswer: !!selectedAnswer
      });
      
      // Stop the timer when results are received
      stopTimer();
      
      // Force any pending animations to complete
      fadeAnim.setValue(0);
      
      // Clear player answers for the next question
      setPlayerAnswers({});
      
      // Reset UI state
      setSelectedAnswer(null);
      setShowingFeedback(false);
      
      console.log('✅ Preparing for next question - clearing answer state');
      
      // Add a specific fallback that will DEFINITELY force the game to move forward
      setTimeout(() => {
        console.log('⚠️ Checking if we need to request the current question');
        // Try to get the next question
        socketRef.current.emit('requestCurrentQuestion', { gameId: gameCode });
      }, 2000);
    });

    // Listen for game ended
    socketRef.current.on('gameEnded', ({ leaderboard }) => {
      console.log('Game ended, navigating to score screen');
      // Stop any active timer
      stopTimer();
      navigation.replace('MultiplayerScoreScreen', { leaderboard });
    });

    // Listen for errors
    socketRef.current.on('error', (errorData) => {
      console.error('Socket error:', errorData);
      setError(errorData.message || 'An error occurred');
      setLoading(false);
    });
    
    // Listen for joinedGame to get player ID
    socketRef.current.on('joinedGame', (data) => {
      console.log('Joined game event received in PlayWithFriendsQuizScreen:', data);
      if (data && data.playerId) {
        console.log('Setting player ID:', data.playerId);
        setPlayerId(data.playerId);

        // Immediately request the current question after joining
        console.log('Requesting current question after joining');
        socketRef.current.emit('requestCurrentQuestion', { gameId: gameCode });
      }
    });

    // Enhanced player answered handler - now with visual feedback
    socketRef.current.on('playerAnswered', (data) => {
      console.log('Player answered:', data);
      
      // Store the player who recently answered
      setRecentAnswerer(data);
      
      // Update player answers tracking
      setPlayerAnswers(prev => {
        const updated = {...prev};
        updated[data.playerId] = true;
        return updated;
      });
      
      // Animate the notification
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.delay(1500),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true
        })
      ]).start();
    });
    
    // Listen for player list updates
    socketRef.current.on('updatePlayers', (updatedPlayers) => {
      console.log('Received updated player list:', updatedPlayers);
      setPlayers(updatedPlayers || []);
    });
    
    // NOW, after all event listeners are set up, join the game
    // Ensure socket is connected
    if (!socketRef.current.connected) {
      console.log('Socket not connected, attempting to connect');
      socketRef.current.connect();
    }
    
    // Use the nickname passed from the previous screen, or fallback to a generic name
    const userNickname = route.params?.nickname || 'Player';
    console.log('Using nickname for socket connection:', userNickname);
    
    // Re-join the game room to ensure we receive game events
    socketRef.current.emit('joinGame', { 
      gameId: gameCode, 
      nickname: userNickname
    });
    console.log('Re-joined game room with ID:', gameCode, 'as', userNickname);
    
    // If we're still loading after 3 seconds, try requesting the question again
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('Still loading after timeout - requesting question again');
        socketRef.current.emit('requestCurrentQuestion', { gameId: gameCode });
      }
    }, 3000);

    // Clean up when component unmounts
    return () => {
      clearTimeout(timeoutId);
      stopTimer(); // Stop any active timer
      if (socketRef.current) {
        socketRef.current.off('gameStarted');
        socketRef.current.off('newQuestion');
        socketRef.current.off('questionResult');
        socketRef.current.off('gameEnded');
        socketRef.current.off('error');
        socketRef.current.off('playerAnswered');
        socketRef.current.off('joinedGame');
        socketRef.current.off('updatePlayers');
      }
    };
  }, [gameCode, navigation]);

  // Timer functions
  const startTimer = (duration) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setTimeLeft(duration);
    setTimerActive(true);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newValue = prev - 1;
        if (newValue <= 0) {
          // Time's up, stop the timer
          stopTimer();
          
          // If we haven't already submitted an answer, send a timeout notification to the server
          if (socketRef.current && playerId && !selectedAnswer) {
            console.log('Timer expired, notifying server of timeout');
            socketRef.current.emit('submitAnswer', {
              gameId: gameCode,
              playerId,
              answer: 'TIMEOUT',
              time: 15
            });
            
            // Update our local tracking for timeout
            setPlayerAnswers(prev => {
              const updated = {...prev};
              updated[playerId] = true;
              return updated;
            });
          }
          
          // CRITICAL FIX: If this is the host, notify once and only once when time expires
          if (isHost && !timerExpiredSent.current) {
            console.log('⏰ Host: Timer expired, notifying server');
            // Use setTimeout to add a slight delay after state updates
            setTimeout(() => {
              const gameIdString = typeof gameCode === 'object' ? String(gameCode) : gameCode;
              timerExpiredSent.current = true;
              socketRef.current.emit('timerExpired', { gameId: gameIdString });
            }, 100);
          }
          
          return 0;
        }
        return newValue;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerActive(false);
    
    // Only emit timerExpired ONCE when the timer reaches zero
    // AND only do it if we're the host
    if (isHost && timeLeft <= 0) {
      console.log('⏰ Host notifying server that timer has expired for game:', gameCode);
      
      // CRITICAL FIX: Ensure gameId is sent as a simple string, not an object
      const gameIdString = typeof gameCode === 'object' ? JSON.stringify(gameCode) : String(gameCode);
      
      console.log('Emitting timerExpired with gameId:', gameIdString);
      
      // CRITICAL FIX: Force emit with delay and ensure it fires only once
      if (!timerExpiredSent.current) {
        timerExpiredSent.current = true;
        socketRef.current.emit('timerExpired', { gameId: gameIdString });
        
        // Add backup question request after 3 seconds
        setTimeout(() => {
          console.log('⚠️ Backup: Checking if game has advanced...');
          socketRef.current.emit('forceNextQuestion', { gameId: gameIdString });
        }, 3000);
      }
    }
  };

  // Handle quiz completion
  const handleQuizComplete = (results) => {
    navigation.replace('MultiplayerScoreScreen', {
      ...results,
    });
  };

  // Handle answer submission
  const handleAnswerSubmit = (answer, time) => {
    console.log('Submitting answer:', answer, 'Time:', time, 'Player ID:', playerId);
    
    // Store the selected answer locally
    setSelectedAnswer(answer);
    
    if (socketRef.current && playerId) {
      console.log('Sending answer to server with game ID:', gameCode);
      
      socketRef.current.emit('submitAnswer', {
        gameId: gameCode,
        playerId,
        answer,
        time
      });
      
      // Update our local tracking of who has answered
      setPlayerAnswers(prev => {
        const updated = {...prev};
        updated[playerId] = true;
        return updated;
      });
      
      // Show feedback immediately in the UI
      setShowingFeedback(true);
    } else {
      console.error('Cannot submit answer: socket or player ID not available', { 
        socket: !!socketRef.current, 
        playerId 
      });
      Alert.alert('Error', 'Unable to submit answer. Please try again.');
    }
  };

  // Show loading screen if we don't have questions yet
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFA6" />
        <Text style={styles.loadingText}>
          {gameStarted ? 'Loading question...' : 'Waiting for game to start...'}
        </Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  // Show error screen if there's an error
  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Get current question
  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFA6" />
        <Text style={styles.loadingText}>Waiting for next question...</Text>
      </View>
    );
  }

  // Get updated player counts and percentages
// CRITICAL FIX: Filter out the "ghost" player named "Player"
const realPlayers = players.filter(p => p.playerName !== "Player");
const playerAnsweredCount = Object.keys(playerAnswers).length;
const totalPlayerCount = realPlayers.length || 1; // Ensure at least 1

const playerProgressText = `${playerAnsweredCount}/${totalPlayerCount} players answered`;
const answerProgressPercent = Math.min(
  (playerAnsweredCount / totalPlayerCount) * 100, 
  100
);

  return (
    <>
      {/* Player answered notification */}
      <Animated.View 
        style={[
          styles.playerAnsweredNotification,
          { opacity: fadeAnim }
        ]}
      >
        {recentAnswerer && (
          <Text style={styles.playerAnsweredText}>
            {recentAnswerer.playerName} answered!
          </Text>
        )}
      </Animated.View>
    
      {/* Player progress indicator */}
      <View style={styles.playerProgressContainer}>
        <Text style={styles.playerProgressText}>
          {playerProgressText}
        </Text>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${answerProgressPercent}%` }
            ]} 
          />
        </View>
      </View>
      
      <BaseQuizScreen
        quizOptions={{
          gameMode: 'multiplayer',
          numQuestions: totalQuestions,
        }}
        numQuestions={totalQuestions}
        currentQuestion={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        onAnswerSubmit={handleAnswerSubmit}
        onQuizComplete={handleQuizComplete}
        navigation={navigation}
        gameCode={gameCode}
        isMultiplayer={true}
        selectedAnswer={selectedAnswer}
        timeLeft={timeLeft} /* Pass timeLeft to BaseQuizScreen */
      />
      
      {/* Single Timer Display - Positioned between progress tracker and answers */}
      <View style={styles.timerContainerMiddle}>
        <Text style={[
          styles.timerText,
          timeLeft <= 5 && styles.timerWarning,
          timeLeft <= 2 && styles.timerCritical
        ]}>
          Time Left: {timeLeft}s
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  resultsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#004466',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    maxWidth: '80%',
  },
  playerProgressContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 5,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  playerProgressText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  progressBarContainer: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8ac926',
  },
  playerAnsweredNotification: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    zIndex: 5,
  },
  playerAnsweredText: {
    color: '#8ac926',
    fontWeight: 'bold',
    fontSize: 16,
  },
  timerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  timerWarning: {
    color: '#ffcc00',
  },
  timerCritical: {
    color: '#ff4d4d',
  },
  timerContainerMiddle: {
    position: 'absolute',
    bottom: 235, // Position it between the progress tracker and answers
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10, // Higher z-index to ensure it shows above other elements
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'center',
    width: 'auto',
    maxWidth: 150,
  },
});