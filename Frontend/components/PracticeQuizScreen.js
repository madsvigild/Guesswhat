import React from 'react';
import BaseQuizScreen from './BaseQuizScreen';

export default function PracticeQuizScreen({ navigation, route }) {
  const { quizOptions } = route.params;

  const handleQuizComplete = (results) => {
    navigation.replace('PracticeScoreScreen', {
      ...results,
    });
  };

  console.log('Number of Questions in PracticeQuiz:', quizOptions.numQuestions);
  return (
    <BaseQuizScreen
      quizOptions={quizOptions}
      numQuestions={quizOptions.numQuestions} // Pass the correct number of questions
      onQuizComplete={handleQuizComplete}
      navigation={navigation} // Pass navigation prop
    />
  );
}