import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import MainMenuScreen from '../components/MainMenuScreen';
import PracticeScreen from '../components/PracticeScreen';
import DailyGameScreen from '../components/DailyGameScreen';
import ScoreScreen from '../components/ScoreScreen'; // Keep for Practice/Daily Game scores
import PracticeScoreScreen from '../components/PracticeScoreScreen'; // Keep for Practice scores
import PlayWithFriendsScreen from '../components/PlayWithFriendsScreen'; // Keep for V1
import DailyGameQuizScreen from '../components/DailyGameQuizScreen'; // Keep for V1
import PracticeQuizScreen from '../components/PracticeQuizScreen'; // Keep for V1
import MultiplayerScoreScreen from '../components/MultiPlayerScoreScreen'; // KEEP this for V1 as requested
import PlayWithFriendsQuizScreen from '../components/PlayWithFriendsQuizScreen'; // Keep for V1
import BaseQuizScreen from '../components/BaseQuizScreen'; // Keep as it's a base for others

// Moved to Frontend/components/futureFeatures for later re-addition
// The following imports are commented out using JS comments //
// import ChallengeFriendScreen from '../components/futureFeatures/ChallengeFriendScreen'; // Corrected path
// import LearningPathScreen from '../components/futureFeatures/LearningPathScreen'; // Corrected path
// import SchoolOfTriviaQuizScreen from '../components/futureFeatures/SchoolOfTriviaQuizScreen'; // Corrected path

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
        <Stack.Screen name="PlayWithFriends" component={PlayWithFriendsScreen} />
        <Stack.Screen name="DailyGameQuiz" component={DailyGameQuizScreen} />
        <Stack.Screen name="PracticeQuiz" component={PracticeQuizScreen} />
        <Stack.Screen name="PlayWithFriendsQuiz" component={PlayWithFriendsQuizScreen} />
        <Stack.Screen name="MultiplayerScoreScreen" component={MultiplayerScoreScreen} />
        <Stack.Screen name="BaseQuiz" component={BaseQuizScreen} />

        {/* Non-V1 Features - Temporarily removed using JSX comments */}
        {/* <Stack.Screen name="ChallengeFriend" component={ChallengeFriendScreen} /> */}
        {/* <Stack.Screen name="LearningPath" component={LearningPathScreen} /> */}
        {/* <Stack.Screen name="SchoolOfTriviaQuiz" component={SchoolOfTriviaQuizScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}