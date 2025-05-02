import React from 'react';
import BaseQuizScreen from './BaseQuizScreen';

export default function PracticeQuizScreen({ navigation, route }) {
  const { quizOptions, numQuestions } = route.params;

  const handleQuizComplete = (results) => {
    navigation.replace('PracticeScoreScreen', {
      ...results,
    });
  };

  return (
    <BaseQuizScreen
      quizOptions={quizOptions}
      numQuestions={numQuestions}
      onQuizComplete={handleQuizComplete}
      navigation={navigation} // Pass navigation prop
    />
  );
}