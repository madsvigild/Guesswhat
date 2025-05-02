import React, { useEffect } from 'react';
import BaseQuizScreen from './BaseQuizScreen';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../utils/api';

export default function PlayWithFriendsQuizScreen({ navigation, route }) {
  const { quizOptions, numQuestions } = route.params;

  useEffect(() => {
    const socket = io(API_BASE_URL);

    socket.on('gameEnded', ({ leaderboard }) => {
      navigation.replace('MultiplayerScoreScreen', { leaderboard });
    });

    return () => {
      socket.off('gameEnded');
      socket.disconnect();
    };
  }, [navigation]);

  const handleQuizComplete = (results) => {
    navigation.replace('MultiplayerScoreScreen', {
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