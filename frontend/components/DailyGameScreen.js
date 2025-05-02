import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, Text, View, TouchableOpacity } from 'react-native';
import globalStyles from '../Styles/globalStyles';

export default function DailyGameScreen({ navigation }) {
  const [countdown, setCountdown] = useState("");
  const [streak, setStreak] = useState(3); // Placeholder streak value
  const leaderboardData = [
    { name: "MadsTheSnack", score: 10 },
    { name: "ThorbenTheTank", score: 9 },
    { name: "JakobDitzolo", score: 8 },
  ];

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextReset = new Date();
      nextReset.setHours(24, 0, 0, 0); // Midnight
      const diff = nextReset - now;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    };

    const timer = setInterval(updateCountdown, 1000);
    updateCountdown(); // Initialize immediately
    return () => clearInterval(timer);
  }, []);

  const handleStartDailyGame = () => {
    // Navigate directly to the Quiz screen
    navigation.replace('DailyGameQuiz', {
      quizOptions: {
        numQuestions: 10,
        category: 'Any',
        difficulty: 'Any',
      },
      startTime: Date.now(),
      gameMode: 'daily',
    });
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView
        style={globalStyles.scrollViewContainer}
        contentContainerStyle={globalStyles.dailyGameContent}
      >
        {/* Brain Emoji Above Title */}
        <Text style={globalStyles.icon}>🧠</Text>

        {/* Title */}
        <Text style={globalStyles.title}>Daily Game</Text>
        
        {/* Tagline */}
        <View style={globalStyles.taglineBox}>
          <Text style={globalStyles.taglineDaily}>
            GuessWhat? It's the Daily Game! Compete with friends and see how you score today! 🏆
          </Text>
        </View>

        {/* Countdown Timer */}
        <Text style={globalStyles.countdown}>
          ⏳ Daily Game resets in: {countdown}
        </Text>

        {/* Streak Counter */}
        <Text style={globalStyles.streak}>
          🔥 Streak: {streak} days
        </Text>

        {/* Leaderboard */}
        <View style={globalStyles.leaderboard}>
          <Text style={globalStyles.leaderboardTitle}>🏅 Leaderboard</Text>
          {leaderboardData.map((entry, index) => (
            <Text key={index} style={globalStyles.leaderboardEntry}>
              {index + 1}. {entry.name} - {entry.score}/10
            </Text>
          ))}
        </View>

        {/* Start Game Button */}
        <TouchableOpacity style={globalStyles.startButton} onPress={handleStartDailyGame}>
          <Text style={globalStyles.buttonText}>Start Daily Game</Text>
        </TouchableOpacity>

        {/* Adjusted Back Button */}
        <TouchableOpacity
          style={globalStyles.smallBackButton} // Use the smaller back button style
          onPress={() => navigation.goBack()}
        >
          <Text style={globalStyles.buttonText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}