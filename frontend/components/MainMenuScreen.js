import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import globalStyles from '../Styles/globalStyles'; // Correctly imported styles

function MainMenuScreen({ navigation }) {
  return (
    <SafeAreaView style={globalStyles.container}>
      <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
        {/* Top Section */}
        <View style={globalStyles.header}>
          <Text style={globalStyles.logoIcon}>💡</Text>
          <Text style={globalStyles.title}>GuessWhat?</Text>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          style={[globalStyles.signInButton, { backgroundColor: '#FFD966' }]} // Soft gold button
          onPress={() => alert('Sign In coming soon!')}>
          <Text style={[globalStyles.signInText, { color: '#333' }]}>
            🔓 Sign In
          </Text>
        </TouchableOpacity>

        {/* Play With Friends Button */}
        <TouchableOpacity
          style={[globalStyles.coreButton, globalStyles.wideButton]} // Updated styles
          onPress={() => navigation.navigate('PlayWithFriends')}>
          <Text style={globalStyles.buttonText}>👥 Play With Friends</Text>
        </TouchableOpacity>

        {/* School of Trivia Button */}
        <TouchableOpacity
          style={[globalStyles.coreButton, globalStyles.wideButton]} // Updated styles
          onPress={() => navigation.navigate('LearningPath')} // Navigate to LearningPathScreen
        >
          <Text style={globalStyles.buttonText}>🎓 School of Trivia</Text>
        </TouchableOpacity>

        {/* Middle Section: Core Features */}
        <View style={globalStyles.coreFeatures}>
          {/* Daily Game Button */}
          <TouchableOpacity
            style={[globalStyles.coreButton, { backgroundColor: '#00BFA6' }]} // Light teal button
            onPress={() => navigation.navigate('DailyGame')}>
            <View style={globalStyles.buttonContent}>
              <Text style={[globalStyles.buttonIcon, { color: '#FFD966' }]}>
                📅
              </Text>
              <Text style={[globalStyles.buttonText, { fontSize: 16 }]}>
                Daily Game
              </Text>
            </View>
          </TouchableOpacity>

          {/* Practice Button */}
          <TouchableOpacity
            style={[globalStyles.coreButton, { backgroundColor: '#00BFA6' }]} // Light teal button
            onPress={() => navigation.navigate('Practice')}>
            <View style={globalStyles.buttonContent}>
              <Text style={[globalStyles.buttonIcon, { color: '#FFD966' }]}>
                🧠
              </Text>
              <Text style={[globalStyles.buttonText, { fontSize: 16 }]}>
                Practice
              </Text>
            </View>
          </TouchableOpacity>

          {/* Leaderboards Button */}
          <TouchableOpacity
            style={[globalStyles.coreButton, { backgroundColor: '#00BFA6' }]} // Light teal button
            onPress={() => alert('Leaderboards coming soon!')}>
            <Text style={[globalStyles.buttonText, { fontSize: 16 }]}>
              🏅 Leaderboards
            </Text>
          </TouchableOpacity>

          {/* Achievements Button */}
          <TouchableOpacity
            style={[globalStyles.coreButton, { backgroundColor: '#00BFA6' }]} // Light teal button
            onPress={() => alert('Achievements coming soon!')}>
            <Text style={[globalStyles.buttonText, { fontSize: 16 }]}>
              🎖 Achievements
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Section */}
        <View style={globalStyles.footer}>
          <TouchableOpacity
            style={globalStyles.footerButton}
            onPress={() => alert('Settings coming soon!')}>
            <Text style={globalStyles.footerText}>⚙️ Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={globalStyles.footerButton}
            onPress={() => alert('Help/About coming soon!')}>
            <Text style={globalStyles.footerText}>❓ Help/About</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={globalStyles.footerButton}
            onPress={() => alert('Dark mode toggle coming soon!')}>
            <Text style={globalStyles.footerText}>🌙 Dark Mode</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default MainMenuScreen;
