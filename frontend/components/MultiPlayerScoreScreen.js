import React from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import globalStyles from '../Styles/globalStyles';

export default function MultiplayerScoreScreen({ route, navigation }) {
  const { leaderboard } = route.params;

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
        <Text style={globalStyles.title}>Final Leaderboard</Text>

        <View style={globalStyles.leaderboard}>
          {leaderboard.map((player, index) => (
            <Text key={player.id} style={globalStyles.leaderboardEntry}>
              {index + 1}. {player.name}: {player.score} pts
            </Text>
          ))}
        </View>

        <TouchableOpacity
          style={globalStyles.button}
          onPress={() => navigation.navigate('MainMenu')}
        >
          <Text style={globalStyles.buttonText}>Back to Main Menu</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}