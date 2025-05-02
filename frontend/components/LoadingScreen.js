import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      {/* Spinning Animation */}
      <ActivityIndicator size="large" color="#8ac926" style={styles.spinner} />
      {/* Loading Text */}
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d3557', // Dark blue to match your app's branding
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