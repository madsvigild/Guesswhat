import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import MainMenuScreen from '../components/MainMenuScreen';
import PracticeScreen from '../components/PracticeScreen';
import DailyGameScreen from '../components/DailyGameScreen';
import ScoreScreen from '../components/ScoreScreen';
import PracticeScoreScreen from '../components/PracticeScoreScreen';
import ChallengeFriendScreen from '../components/ChallengeFriendScreen';
import LearningPathScreen from '../components/LearningPathScreen';
import PlayWithFriendsScreen from '../components/PlayWithFriendsScreen'; // Import the screen
import MultiplayerScoreScreen from '../components/MultiPlayerScoreScreen'; // Import MultiplayerScoreScreen
import DailyGameQuizScreen from '../components/DailyGameQuizScreen';
import PracticeQuizScreen from '../components/PracticeQuizScreen';
import PlayWithFriendsQuizScreen from '../components/PlayWithFriendsQuizScreen'; // Import PlayWithFriendsQuizScreen
import SchoolOfTriviaQuizScreen from '../components/SchoolOfTriviaQuizScreen'; // Import SchoolOfTriviaQuizScreen
import BaseQuizScreen from '../components/BaseQuizScreen'; // Import BaseQuizScreen

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainMenu" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainMenu" component={MainMenuScreen} />
        <Stack.Screen name="Practice" component={PracticeScreen} />
        <Stack.Screen name="DailyGame" component={DailyGameScreen} />
        <Stack.Screen name="ScoreScreen" component={ScoreScreen} />
        <Stack.Screen name="PracticeScoreScreen" component={PracticeScoreScreen} />
        <Stack.Screen name="ChallengeFriend" component={ChallengeFriendScreen} />
        <Stack.Screen name="LearningPath" component={LearningPathScreen} />
        <Stack.Screen name="PlayWithFriends" component={PlayWithFriendsScreen} />
        <Stack.Screen name="MultiplayerScoreScreen" component={MultiplayerScoreScreen} />
        <Stack.Screen name="DailyGameQuiz" component={DailyGameQuizScreen} />
        <Stack.Screen name="PracticeQuiz" component={PracticeQuizScreen} />
        <Stack.Screen name="PlayWithFriendsQuiz" component={PlayWithFriendsQuizScreen} />
        <Stack.Screen name="SchoolOfTriviaQuiz" component={SchoolOfTriviaQuizScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}