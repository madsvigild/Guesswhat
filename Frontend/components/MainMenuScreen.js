import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Image, View } from 'react-native';
import GradientBackground from './GradientBackground'; // Import the GradientBackground component

// Import the new icons
import playWithFriendsIcon from '../assets/frontpage/play-with-friends-icon.png';
import dailyGameIcon from '../assets/frontpage/daily-game-icon.png';
import practiceIcon from '../assets/frontpage/practice-icon.png';

export default function MainMenuScreen({ navigation }) {
  const handlePlayWithFriendsPress = () => {
    navigation.navigate('PlayWithFriends');
  };

  const handleDailyGamePress = () => {
    navigation.navigate('DailyGame');
  };

  const handlePracticePress = () => {
    navigation.navigate('Practice');
  };

  return (
    <GradientBackground style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* Lightbulb Icon */}
      <Image
        source={require('../assets/frontpage/quiz-game.png')} // Update path to your actual lightbulb icon
        style={styles.lightbulbIcon}
      />
      <Text style={styles.title}>GuessWhat?</Text>

      {/* Buttons */}
      <TouchableOpacity style={styles.button} onPress={handlePlayWithFriendsPress}>
        <View style={styles.buttonContent}>
          <Image source={playWithFriendsIcon} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Play With Friends</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleDailyGamePress}>
        <View style={styles.buttonContent}>
          <Image source={dailyGameIcon} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Daily Game</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handlePracticePress}>
        <View style={styles.buttonContent}>
          <Image source={practiceIcon} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Practice</Text>
        </View>
      </TouchableOpacity>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  lightbulbIcon: {
    width: 80,
    height: 80,
    marginBottom: 40,
    resizeMode: 'contain',    
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
    fontFamily: 'Nunito-Bold',
    textAlign: 'center', // Center the title
    paddingHorizontal: 20, // Add horizontal padding for better spacing
  },
  button: {
    backgroundColor: '#8ac926', // Existing lime green
    paddingVertical: 18,
    paddingHorizontal: 20, // Adjusted for better spacing
    borderRadius: 8,
    marginVertical: 10, // Space between buttons
    width: '80%', // Make buttons the same width
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    width: 30, // Adjust size as needed
    height: 30,
    marginRight: 10, // Space between icon and text
    resizeMode: 'contain',
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Nunito-Regular',
    textAlign: 'center', // Center the text
    flex: 1, // Allow text to take available space
  },
});