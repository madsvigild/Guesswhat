import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function GradientBackground({ children, style }) {
  return (
    <LinearGradient
      colors={['#004466', '#007B83']} // Gradient colors (dark blue to teal)
      style={[styles.container, style]} // Merge default styles with custom styles
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure it takes up the full screen
  },
});