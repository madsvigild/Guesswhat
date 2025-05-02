import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import globalStyles from '../Styles/globalStyles';

function LearningPathScreen({ navigation }) {
  // State for levels, categories, and user progress
  const [levels, setLevels] = useState([
    {
      id: 1,
      name: 'Level 1: Basics',
      unlocked: true,
      categories: [
        { id: 1, name: 'General Knowledge', points: 0, unlocked: true },
        { id: 2, name: 'Sports', points: 0, unlocked: false },
        { id: 3, name: 'History', points: 0, unlocked: false },
        { id: 4, name: 'Technology', points: 0, unlocked: false },
      ],
    },
    {
      id: 2,
      name: 'Level 2: Intermediate',
      unlocked: false,
      categories: [
        { id: 5, name: 'Science', points: 0, unlocked: false },
        { id: 6, name: 'Geography', points: 0, unlocked: false },
        { id: 7, name: 'Literature', points: 0, unlocked: false },
        { id: 8, name: 'Entertainment', points: 0, unlocked: false },
        { id: 9, name: 'General Knowledge (Harder)', points: 0, unlocked: false },
        { id: 10, name: 'Sports (Harder)', points: 0, unlocked: false },
        { id: 11, name: 'History (Harder)', points: 0, unlocked: false },
        { id: 12, name: 'Technology (Harder)', points: 0, unlocked: false },
      ],
    },
    {
      id: 3,
      name: 'Level 3: Advanced',
      unlocked: false,
      categories: [
        { id: 13, name: 'Philosophy', points: 0, unlocked: false },
        { id: 14, name: 'Mythology', points: 0, unlocked: false },
        { id: 15, name: 'Art', points: 0, unlocked: false },
        { id: 16, name: 'World History', points: 0, unlocked: false },
        { id: 17, name: 'General Knowledge (Expert)', points: 0, unlocked: false },
        { id: 18, name: 'Sports (Expert)', points: 0, unlocked: false },
        { id: 19, name: 'History (Expert)', points: 0, unlocked: false },
        { id: 20, name: 'Technology (Expert)', points: 0, unlocked: false },
        { id: 21, name: 'Science (Expert)', points: 0, unlocked: false },
        { id: 22, name: 'Geography (Expert)', points: 0, unlocked: false },
        { id: 23, name: 'Literature (Expert)', points: 0, unlocked: false },
        { id: 24, name: 'Entertainment (Expert)', points: 0, unlocked: false },
      ],
    },
  ]);
  const [totalPoints, setTotalPoints] = useState(0); // Total points tracker

  // Handle category completion
  const handleCompleteCategory = (levelId, categoryId) => {
    const updatedLevels = levels.map((level) => {
      if (level.id === levelId) {
        const updatedCategories = level.categories.map((category) => {
          if (category.id === categoryId) {
            const newPoints = category.points + 10; // Add 10 points
            setTotalPoints((prevPoints) => prevPoints + 10); // Update total points
            return { ...category, points: newPoints };
          }
          if (category.id === categoryId + 1 && levels[levelId - 1].categories[categoryId - 1].points >= 10) {
            return { ...category, unlocked: true }; // Unlock the next category
          }
          return category;
        });
        return { ...level, categories: updatedCategories };
      }
      return level;
    });

    setLevels(updatedLevels);

    // Check if the next level should unlock
    if (
      levelId < levels.length &&
      updatedLevels[levelId - 1].categories.every((cat) => cat.points >= 10)
    ) {
      setLevels((prevLevels) =>
        prevLevels.map((level) =>
          level.id === levelId + 1 ? { ...level, unlocked: true } : level
        )
      );
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Points Tracker */}
        <Text style={styles.pointsTracker}>Total Points: {totalPoints}</Text>

        {/* Render the levels */}
        {levels.map((level) => (
          <View key={level.id} style={styles.levelContainer}>
            {/* Level Headline */}
            <Text style={styles.levelHeadline}>{level.name}</Text>

            {/* Render categories */}
            {level.categories.map((category, index) => (
              <View key={category.id} style={styles.categoryContainer}>
                {/* Category Button */}
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: category.unlocked ? '#00BFA6' : '#ccc',
                      borderColor: category.points > 0 ? '#FFD700' : '#00897B', // Gold border if points > 0
                    },
                  ]}
                  onPress={() =>
                    category.unlocked &&
                    navigation.navigate('SchoolOfTriviaQuiz', {
                      categoryId: category.id,
                      onComplete: () => handleCompleteCategory(level.id, category.id),
                    })
                  }
                  disabled={!category.unlocked}
                >
                  <Text style={styles.categoryText}>
                    {category.name} ({category.points} pts)
                  </Text>
                </TouchableOpacity>

                {/* Arrow pointing down */}
                {index < level.categories.length - 1 && (
                  <Text style={styles.arrow}>↓</Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  pointsTracker: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: 'white', // White text for the points tracker
  },
  levelContainer: {
    marginVertical: 20,
    width: '90%',
    alignItems: 'center', // Center the buttons
  },
  levelHeadline: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white', // White text for level headlines
    textAlign: 'center',
  },
  categoryContainer: {
    alignItems: 'center', // Center the buttons
    marginVertical: 10,
  },
  arrow: {
    fontSize: 18,
    marginVertical: 5,
    color: 'white', // White arrows
  },
  categoryButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    width: '80%', // Centralize the button width
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default LearningPathScreen;