import React from 'react';
import BaseQuizScreen from './BaseQuizScreen';

export default function DailyGameQuizScreen({ navigation, route }) {
  const { quizOptions, numQuestions } = route.params;

  const handleQuizComplete = (results) => {
    navigation.replace('ScoreScreen', {
      ...results,
      gameMode: 'daily',
    });
  };

  return (
    <BaseQuizScreen
      quizOptions={quizOptions}
      numQuestions={numQuestions}
      onQuizComplete={handleQuizComplete}
      navigation={navigation}
    />
  );
}