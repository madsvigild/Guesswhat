import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import GradientBackground from './GradientBackground'; // Import GradientBackground

const LoadingScreen = () => {
  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Spinning Animation */}
        <ActivityIndicator size="large" color="#8ac926" style={styles.spinner} />
        {/* Loading Text */}
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    marginBottom: 20, // Space between spinner and text
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1faee', // Light text color for contrast
    textAlign: 'center',
  },
});

export default LoadingScreen;