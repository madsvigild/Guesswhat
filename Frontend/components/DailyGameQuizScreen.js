import React from 'react';
import BaseQuizScreen from './BaseQuizScreen';
import GradientBackground from './GradientBackground'; // Import GradientBackground

export default function DailyGameQuizScreen({ navigation, route }) {
  const { quizOptions, numQuestions } = route.params;

  const handleQuizComplete = (results) => {
    navigation.replace('ScoreScreen', {
      ...results,
      gameMode: 'daily',
    });
  };

  return (
    <GradientBackground>
      <BaseQuizScreen
        quizOptions={quizOptions}
        numQuestions={numQuestions}
        onQuizComplete={handleQuizComplete}
        navigation={navigation}
      />
    </GradientBackground>
  );
}