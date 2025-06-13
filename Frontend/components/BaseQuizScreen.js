import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native'; // Reverted from Alert to alert()
import globalStyles from '../Styles/globalStyles'; // Only import globalStyles as default
import LoadingScreen from './LoadingScreen';
import { questionService } from '../utils/api'; // Ensure questionService is correctly imported
import GradientBackground from './GradientBackground'; // Import GradientBackground
import { ProgressBar } from 'react-native-paper'; // Import ProgressBar for progress tracker
import { AnimatedCircularProgress } from 'react-native-circular-progress'; // Import Circular Timer

export default function BaseQuizScreen({ 
  quizOptions, 
  numQuestions = 10, // Default for robustness, but prop from PracticeQuizScreen is preferred
  onQuizComplete,
  onAnswerSubmit, // For multiplayer answer submission
  navigation,
  gameCode, // For multiplayer
  isMultiplayer = false,
  currentQuestion: multiplayerCurrentQuestion = null, // Renamed to avoid conflict
  currentQuestionIndex: multiplayerCurrentQuestionIndex = 0, // Renamed to avoid conflict
  selectedAnswer: multiplayerSelectedAnswer = null, // Renamed to avoid conflict
  timeLeft = null // Add timeLeft parameter
}) {
  const [questions, setQuestions] = useState([]);
  const [localCurrentQuestionIndex, setLocalCurrentQuestionIndex] = useState(0);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [localSelectedAnswer, setLocalSelectedAnswer] = useState(null); // Used for singleplayer only
  const [timer, setTimer] = useState(0); // Total time spent on quiz
  const [answerTime, setAnswerTime] = useState(0); // Time spent on current question
  const [showingFeedback, setShowingFeedback] = useState(false);
  const [questionBreakdown, setQuestionBreakdown] = useState([]); // For score screen
  const [loading, setLoading] = useState(true);
  const lastQuestionRef = useRef(''); // Add ref to track the last question for multiplayer

  // Determine which question and answer state to use (local for single, props for multiplayer)
  const actualCurrentQuestion = isMultiplayer 
    ? multiplayerCurrentQuestion 
    : (questions.length > 0 && localCurrentQuestionIndex < questions.length ? questions[localCurrentQuestionIndex] : null);
    
  const actualCurrentQuestionIndex = isMultiplayer 
    ? multiplayerCurrentQuestionIndex 
    : localCurrentQuestionIndex;

  const effectiveSelectedAnswer = isMultiplayer 
    ? multiplayerSelectedAnswer 
    : localSelectedAnswer;

  // Log for debugging component rendering with key props
  useEffect(() => {
    console.log("BaseQuizScreen rendering with:", { 
      isMultiplayer, 
      hasActualCurrentQuestion: !!actualCurrentQuestion,
      actualCurrentQuestionIndex,
      effectiveSelectedAnswer,
      loading,
      showingFeedback
    });
  }, [isMultiplayer, actualCurrentQuestionIndex, !!actualCurrentQuestion, effectiveSelectedAnswer, loading, showingFeedback]);

  // Effect for fetching questions for non-multiplayer games
  useEffect(() => {
    if (!isMultiplayer) {
      const fetchQuestions = async () => {
        setLoading(true); // Start loading
        try {
          const { category, difficulty } = quizOptions || {};
          const params = {
            limit: numQuestions, // Correctly use the passed numQuestions prop
            category: category || 'Any',
            difficulty: difficulty || 'Any',
          };

          console.log('Singleplayer: Fetching questions with params:', params);
          const response = await questionService.getQuestions(params);

          if (!Array.isArray(response.data) || response.data.length === 0) {
            throw new Error('No questions available for selected criteria. Please try again with different options.');
          }

          const shuffledQuestions = response.data.sort(() => Math.random() - 0.5);
          setQuestions(shuffledQuestions);
          setLocalCurrentQuestionIndex(0);
          setTimer(0); // Reset overall quiz timer
          setAnswerTime(0); // Reset current question timer
          setLoading(false);
        } catch (error) {
          console.error('Error fetching questions for singleplayer:', error);
          alert('Failed to load questions. Please try again later.'); // Reverted to alert()
          setLoading(false);
          // Potentially navigate back if no questions can be loaded
          navigation.goBack(); 
        }
      };
      fetchQuestions();
    } else {
      // In multiplayer mode, the question comes from props
      if (multiplayerCurrentQuestion) {
        // Only log when the question actually changes in multiplayer
        if (lastQuestionRef.current !== multiplayerCurrentQuestion.question) {
          console.log('Multiplayer mode - new question received:', multiplayerCurrentQuestion.question);
          lastQuestionRef.current = multiplayerCurrentQuestion.question;
        }
        setLoading(false); // No need to fetch, just set loading to false if question is present
        setShowingFeedback(false); // Reset feedback for new multiplayer question
        setAnswerTime(0); // Reset answer time for new multiplayer question
      }
    }
  }, [quizOptions, numQuestions, isMultiplayer, multiplayerCurrentQuestion?.id]); // Depend on multiplayerCurrentQuestion.id for changes

  // Effect for updating shuffled answers when actualCurrentQuestion changes
  useEffect(() => {
    if (actualCurrentQuestion) {
      console.log('Shuffling answers for question:', actualCurrentQuestion.question);
      
      let incorrectAnswersArray = actualCurrentQuestion.incorrectAnswers;
      
      // Handle incorrectAnswers if it's a string (JSON format from DB)
      if (typeof incorrectAnswersArray === 'string') {
        try {
          incorrectAnswersArray = JSON.parse(incorrectAnswersArray);
        } catch (e) {
          console.error('Error parsing incorrectAnswers string:', e);
          incorrectAnswersArray = []; // Default to empty array on parse error
        }
      }
      
      if (!Array.isArray(incorrectAnswersArray)) {
        console.error('incorrectAnswers is not an array after processing:', incorrectAnswersArray);
        incorrectAnswersArray = []; // Ensure it's an array for consistency
      }
      
      const allAnswers = [
        ...incorrectAnswersArray.map((answer) => ({
          text: answer,
          isCorrect: false,
        })),
        {
          text: actualCurrentQuestion.correctAnswer,
          isCorrect: true,
        },
      ];
      
      // Always shuffle when a new question loads, unless an answer is already selected (multiplayer re-render)
      if (!effectiveSelectedAnswer || (isMultiplayer && !multiplayerCurrentQuestion)) { // Re-shuffle only if no answer selected or if a new multiplayer game starts without prior selection
        setShuffledAnswers(allAnswers.sort(() => Math.random() - 0.5));
      } else {
        // If an answer is selected (e.g., multiplayer feedback), just update feedback state on existing order
        setShuffledAnswers(prevAnswers => 
          prevAnswers.map(answer => ({
            ...answer,
            isSelected: answer.text === effectiveSelectedAnswer,
            showFeedback: !!effectiveSelectedAnswer // Show feedback if an answer is selected
          }))
        );
      }
    }
  }, [actualCurrentQuestion, effectiveSelectedAnswer, isMultiplayer, multiplayerCurrentQuestion]); // Add isMultiplayer and multiplayerCurrentQuestion to dependencies

  // Timer logic for both overall quiz time and current question answer time
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1); // Overall quiz timer
      if (!effectiveSelectedAnswer && !showingFeedback) {
        setAnswerTime(prevTime => prevTime + 1); // Current question timer
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [effectiveSelectedAnswer, showingFeedback]);

  // Clear local selected answer when the parent's selectedAnswer (multiplayer) changes
  useEffect(() => {
    if (isMultiplayer) {
      if (multiplayerSelectedAnswer === null && showingFeedback) {
        setShowingFeedback(false);
      }
      // Additionally, if the question changes in multiplayer, clear local state
      if (multiplayerCurrentQuestion?.id !== lastQuestionRef.current) {
        setLocalSelectedAnswer(null); // Clear local selection for new multiplayer question
      }
    }
  }, [isMultiplayer, multiplayerSelectedAnswer, showingFeedback, multiplayerCurrentQuestion?.id]);

  // Show loading state if questions are being fetched or not yet available
  if (loading || !actualCurrentQuestion) {
    console.log("Showing loading screen because:", { loading, hasActualQuestion: !!actualCurrentQuestion });
    return <LoadingScreen />;
  }

  // Handle user answer submission (singleplayer or calling multiplayer callback)
  const handleAnswer = (selectedText) => {
    // Prevent multiple answers or answering during feedback
    if (effectiveSelectedAnswer || showingFeedback) return;

    const currentTime = answerTime;

    // For multiplayer games, use the callback to submit answer
    if (isMultiplayer && onAnswerSubmit) {
      console.log('Submitting answer in multiplayer mode:', selectedText, 'Time:', currentTime);
      // In multiplayer, the parent component (PlayWithFriendsQuizScreen) will handle
      // updating game state and propogating selectedAnswer back to BaseQuizScreen
      onAnswerSubmit(selectedText, currentTime);
      setShowingFeedback(true); // Locally show feedback immediately after submission
    } else {
      // For single player games, manage local state
      setLocalSelectedAnswer(selectedText);
      
      // Show feedback immediately in singleplayer
      setShuffledAnswers((prevAnswers) =>
        prevAnswers.map((answer) => ({
          ...answer,
          isSelected: answer.text === selectedText,
          showFeedback: true,
        }))
      );

      // Update question breakdown for singleplayer score screen
      const isCorrect = actualCurrentQuestion.correctAnswer === selectedText;
      const updatedBreakdown = [
        ...questionBreakdown,
        {
          text: actualCurrentQuestion.question,
          correct: isCorrect,
          correctAnswer: actualCurrentQuestion.correctAnswer,
        },
      ];
      setQuestionBreakdown(updatedBreakdown);

      // Wait 2 seconds before moving to the next question or ending the game
      setShowingFeedback(true);
      setTimeout(() => {
        const nextIndex = localCurrentQuestionIndex + 1;
        // Check if there are more questions both based on requested limit and available questions
        if (nextIndex < numQuestions && nextIndex < questions.length) {
          setLocalCurrentQuestionIndex(nextIndex);
          setLocalSelectedAnswer(null); // Clear selection for next question
          setShowingFeedback(false); // Hide feedback for next question
          setAnswerTime(0); // Reset answer time for next question
        } else {
          // Quiz complete
          const correctAnswers = updatedBreakdown.filter((q) => q.correct).length;
          const totalTimeFormatted = formatTime(timer); // Format overall quiz time

          // Call the callback with quiz results
          onQuizComplete({
            correctAnswers,
            totalQuestions: questions.length, // Total questions loaded
            questionBreakdown: updatedBreakdown,
            totalTime: totalTimeFormatted, // Pass formatted total time
          });
        }
      }, 2000);
    }
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <GradientBackground>
      <SafeAreaView style={globalStyles.safeArea}>
        <ScrollView style={globalStyles.scrollViewContainer}>
          <View style={globalStyles.quizContentContainer}>
            <Text style={globalStyles.title}>
              {isMultiplayer ? 'Multiplayer Quiz' : 'Quiz'}
            </Text>

            {/* Timer - Only show for singleplayer or if timeLeft is provided by multiplayer */}
            {(!isMultiplayer || (isMultiplayer && timeLeft !== null)) && (
              <View style={globalStyles.timerContainer}>
                <AnimatedCircularProgress
                  size={80}
                  width={8}
                  fill={isMultiplayer && timeLeft !== null ? (timeLeft / 60) * 100 : (timer / (numQuestions * 60)) * 100} // Use timeLeft for multiplayer, local timer for singleplayer
                  tintColor="#8ac926" // Reverted to hardcoded hex
                  backgroundColor="#ddd" // Reverted to hardcoded hex
                >
                  {(fill) => (
                    <Text style={globalStyles.timerText}>
                      {isMultiplayer && timeLeft !== null ? formatTime(timeLeft) : formatTime(timer)}
                    </Text>
                  )}
                </AnimatedCircularProgress>
              </View>
            )}

            {/* Progress Tracker */}
            <View style={globalStyles.progressTrackerContainer}>
              <Text style={globalStyles.progressTrackerText}>
                Question {actualCurrentQuestionIndex + 1}/{numQuestions}
              </Text>
              <ProgressBar
                progress={(actualCurrentQuestionIndex + 1) / numQuestions}
                color="#8ac926" // Reverted to hardcoded hex
                style={globalStyles.progressBar}
              />
            </View>

            <View style={globalStyles.questionBox}>
              <Text style={globalStyles.question}>{actualCurrentQuestion.question}</Text>
            </View>

            <View style={globalStyles.answersContainer}>
              {shuffledAnswers.map((answer, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    globalStyles.answerButton,
                    // Style for selected answer before feedback
                    answer.isSelected && !answer.showFeedback && globalStyles.selectedAnswer,
                    // Style for correct answer (during feedback)
                    answer.showFeedback && answer.isCorrect && globalStyles.correctAnswer,
                    // Style for incorrect selected answer (during feedback)
                    answer.showFeedback && !answer.isCorrect && answer.isSelected && globalStyles.incorrectAnswer,
                  ]}
                  onPress={() => handleAnswer(answer.text)}
                  disabled={!!effectiveSelectedAnswer || showingFeedback} // Disable if any answer is selected or feedback is showing
                >
                  <Text style={globalStyles.answerButtonText}>
                    {answer.text}{' '}
                    {/* Display check/cross only when feedback is showing */}
                    {answer.showFeedback &&
                      (answer.isCorrect ? '✓' : answer.isSelected ? '✗' : '')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={globalStyles.returnButton}
              onPress={() => navigation.navigate('MainMenu')}
            >
              <Text style={globalStyles.buttonText}>Return to Main Menu</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
