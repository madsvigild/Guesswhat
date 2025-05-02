import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, Text, View, TouchableOpacity } from 'react-native';
import globalStyles from '../Styles/globalStyles';
import LoadingScreen from './LoadingScreen';
import { API_BASE_URL, questionService } from '../utils/api';

export default function BaseQuizScreen({ quizOptions, numQuestions, onQuizComplete, navigation }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timer, setTimer] = useState(0);
  const [showingFeedback, setShowingFeedback] = useState(false);
  const [questionBreakdown, setQuestionBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch questions using the question service
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { category, difficulty } = quizOptions || {};
        const params = {
          limit: numQuestions || 10,
          category: category || 'Any',
          difficulty: difficulty || 'Any',
        };

        console.log('Fetching questions with params:', params);
        const response = await questionService.getQuestions(params);
        
        if (!Array.isArray(response.data) || response.data.length === 0) {
          throw new Error('No questions available');
        }

        const shuffledQuestions = response.data.sort(() => Math.random() - 0.5);
        setQuestions(shuffledQuestions);
        setCurrentQuestionIndex(0);
        setTimer(0);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        alert('Failed to load questions. Please try again later.');
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [quizOptions, numQuestions]);

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Shuffle answers when the question changes
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];

      const allAnswers = [
        ...currentQuestion.incorrectAnswers.map((answer) => ({
          text: answer,
          isCorrect: false,
          isSelected: false,
          showFeedback: false,
        })),
        {
          text: currentQuestion.correctAnswer,
          isCorrect: true,
          isSelected: false,
          showFeedback: false,
        },
      ];
      setShuffledAnswers(allAnswers.sort(() => Math.random() - 0.5));
    }
  }, [currentQuestionIndex, questions]);

  const currentQuestion = questions[currentQuestionIndex] || null;

  if (loading || !currentQuestion) {
    return <LoadingScreen />;
  }

  const handleAnswer = (selectedText) => {
    if (selectedAnswer || showingFeedback) return;

    setSelectedAnswer(selectedText);

    // Show feedback immediately
    setShuffledAnswers((prevAnswers) =>
      prevAnswers.map((answer) => ({
        ...answer,
        isSelected: answer.text === selectedText,
        showFeedback: true,
      }))
    );

    // Update question breakdown
    const isCorrect = currentQuestion.correctAnswer === selectedText;
    const updatedBreakdown = [
      ...questionBreakdown,
      {
        text: currentQuestion.question,
        correct: isCorrect,
        correctAnswer: currentQuestion.correctAnswer,
      },
    ];
    setQuestionBreakdown(updatedBreakdown);

    // Wait 2 seconds before moving to the next question or ending the game
    setShowingFeedback(true);
    setTimeout(() => {
      if (currentQuestionIndex < numQuestions - 1) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setSelectedAnswer(null);
        setShowingFeedback(false);
      } else {
        const correctAnswers = updatedBreakdown.filter((q) => q.correct).length;
        const totalTime = formatTime(timer);

        // Call the callback with quiz results
        onQuizComplete({
          correctAnswers,
          totalQuestions: questions.length,
          questionBreakdown: updatedBreakdown,
          totalTime,
        });
      }
    }, 2000);
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={globalStyles.scrollViewContainer}>
        <View style={globalStyles.quizContentContainer}>
          <Text style={globalStyles.title}>Quiz</Text>

          <View style={globalStyles.questionBox}>
            <Text style={globalStyles.question}>{currentQuestion.question}</Text>
          </View>

          <View style={globalStyles.answersContainer}>
            {shuffledAnswers.map((answer, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  globalStyles.answerButton,
                  answer.isSelected && !answer.showFeedback && globalStyles.selectedAnswer,
                  answer.showFeedback && answer.isCorrect && globalStyles.correctAnswer,
                  answer.showFeedback && !answer.isCorrect && answer.isSelected && globalStyles.incorrectAnswer,
                ]}
                onPress={() => handleAnswer(answer.text)}
                disabled={!!selectedAnswer || showingFeedback}
              >
                <Text style={globalStyles.answerButtonText}>
                  {answer.text}{' '}
                  {answer.showFeedback &&
                    (answer.isCorrect ? '✔' : answer.isSelected ? '✘' : '')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={globalStyles.timer}>Time Elapsed: {formatTime(timer)}</Text>
          <Text style={globalStyles.progressTracker}>
            Question {currentQuestionIndex + 1}/{numQuestions}
          </Text>

          {/* Add Return to Main Menu Button */}
          <TouchableOpacity
            style={globalStyles.returnButton}
            onPress={() => navigation.navigate('MainMenu')}
          >
            <Text style={globalStyles.buttonText}>Return to Main Menu</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}