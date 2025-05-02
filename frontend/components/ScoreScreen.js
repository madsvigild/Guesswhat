import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Ensure you have this installed
import globalStyles from '../Styles/globalStyles';

function ScoreScreen({ route, navigation }) {
  const {
    correctAnswers = 0,
    totalQuestions = 1,
    overallScore = 0,
    totalTime = '00:00',
  } = route.params || {};

  let badge = "Keep It Up!";
  if (overallScore >= 90) {
    badge = "Trivia Champion 🏆";
  } else if (totalTime <= "01:00") {
    badge = "Quick Thinker ⏱️";
  }

  return (
    <LinearGradient
      colors={['#004466', '#005580']}
      style={globalStyles.scoreScreenContainer}
    >
      <View style={globalStyles.header}>
        <Text style={globalStyles.headerText}>
          🎉 Congratulations on completing today's GuessWhat! 🎉
        </Text>
      </View>
      <View style={globalStyles.card}>
        <Text style={globalStyles.achievementBadge}>{badge}</Text>
        <Text style={globalStyles.scoreScreenText}>
          Correct Answers: {correctAnswers} / {totalQuestions}
        </Text>
        <Text style={globalStyles.scoreScreenText}>
          Total Time Taken: {totalTime}
        </Text>
        <Text style={globalStyles.overallScore}>
          Overall Score: {overallScore} / 100 🏆
        </Text>
        <Text style={globalStyles.comparisonStats}>
          You're faster than 99% of players today!{"\n"}
          You answered more questions correctly than 95% of players.
        </Text>
      </View>
      <View style={globalStyles.buttonGroup}>
        <TouchableOpacity style={globalStyles.shareButton}>
          <Text style={globalStyles.buttonText}>Share Your Score</Text>
        </TouchableOpacity>
        <TouchableOpacity style={globalStyles.challengeButton}>
          <Text style={globalStyles.buttonText}>Challenge a Friend</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={globalStyles.backButton}
          onPress={() => navigation.navigate('MainMenu')}
        >
          <Text style={globalStyles.buttonText}>Back to Main Menu</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

export default ScoreScreen;