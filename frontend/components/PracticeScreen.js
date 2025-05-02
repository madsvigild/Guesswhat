import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, Text, View, TouchableOpacity } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import styles from '../Styles/globalStyles';
import dropdownStyles from '../Styles/dropdownStyles';
import { API_BASE_URL, categoryService } from '../utils/api'; // Import from API

function PracticeScreen({ navigation }) {
  const [categories, setCategories] = useState([]); // Start with an empty array
  const [selectedCategory, setSelectedCategory] = useState('Any');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Easy');
  const [numQuestions, setNumQuestions] = useState('5');
  const [loadingCategories, setLoadingCategories] = useState(true); // Add a loading state

  const difficultyIcons = {
    Easy: '😊',
    Medium: '😐',
    Hard: '😰',
  };

  const questionOptions = ['5', '10', '15'];

  // Fetch categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        // Use the categoryService instead of direct fetch
        const response = await categoryService.getAll();
        setCategories([{ id: 'Any', name: 'Any' }, ...response.data]); // Include "Any" as the first option
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
  
    fetchCategories();
  }, []); // Empty dependency array ensures this runs only once

  const handleStartPractice = () => {
    const quizOptions = {
      category: selectedCategory, // Pass the UUID
      difficulty: selectedDifficulty,
      numQuestions: parseInt(numQuestions, 10),
    };
  
    navigation.replace('PracticeQuiz', {
      quizOptions: {
        category: selectedCategory,
        difficulty: selectedDifficulty,
        numQuestions: parseInt(numQuestions, 10),
      },
      startTime: Date.now(),
      gameMode: 'practice',
      numQuestions: parseInt(numQuestions, 10),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollViewContainer}
        contentContainerStyle={styles.practiceContent}
      >
        <Text style={styles.title}>Practice Mode</Text>
        <View style={styles.taglineBox}>
          <Text style={styles.taglinePractice}>
            GuessWhat? You're in practice mode! Please choose a category,
            difficulty and number of questions, and let's get practicing!
          </Text>
        </View>

        {/* Category Dropdown */}
        <View style={dropdownStyles.dropdownContainer}>
          <View style={dropdownStyles.dropdownHeader}>
            <Text style={dropdownStyles.dropdownHeaderText}>Category</Text>
          </View>
          {loadingCategories ? (
            <Text>Loading categories...</Text> // Show a loading message
          ) : (
            <RNPickerSelect
              onValueChange={(value) => setSelectedCategory(value)}
              items={categories
                .filter((category, index) => categories.findIndex((c) => c.id === category.id) === index) // Remove duplicates by UUID
                .map((category) => ({
                  label: category.name, // Use the category name as the label
                  value: category.id,   // Use the category UUID as the value
                }))}
              placeholder={{ label: 'Any', value: 'Any' }} // Add "Any" as the default option
              value={selectedCategory} // Bind the selected value
              useNativeAndroidPickerStyle={false} // Make the whole container clickable
              style={{
                inputIOS: {
                  ...styles.dropdownButton,
                  paddingRight: 30, // Add padding for the arrow
                },
                inputAndroid: {
                  ...styles.dropdownButton,
                  paddingRight: 30, // Add padding for the arrow
                },
                iconContainer: {
                  top: 10,
                  right: 20, // Move the arrow to the left
                },
              }}
              Icon={() => (
                <Text style={styles.dropdownButtonIcon}>▼</Text> // Add the arrow back
              )}
            />
          )}
        </View>

        {/* Difficulty Dropdown */}
        <View style={dropdownStyles.dropdownContainer}>
          <View style={dropdownStyles.dropdownHeader}>
            <Text style={dropdownStyles.dropdownHeaderText}>Difficulty</Text>
          </View>
          <RNPickerSelect
            onValueChange={(value) => setSelectedDifficulty(value)}
            items={[
              { label: 'Easy 😊', value: 'Easy' },
              { label: 'Medium 😐', value: 'Medium' },
              { label: 'Hard 😰', value: 'Hard' },
            ]}
            placeholder={{}} // No placeholder, default to the first option
            value={selectedDifficulty} // Bind the selected value
            useNativeAndroidPickerStyle={false} // Make the whole container clickable
            style={{
              inputIOS: {
                ...styles.dropdownButton,
                paddingRight: 30, // Add padding for the arrow
              },
              inputAndroid: {
                ...styles.dropdownButton,
                paddingRight: 30, // Add padding for the arrow
              },
              iconContainer: {
                top: 10,
                right: 20, // Move the arrow to the left
              },
            }}
            Icon={() => (
              <Text style={styles.dropdownButtonIcon}>▼</Text> // Add the arrow back
            )}
          />
        </View>

        {/* Number of Questions Dropdown */}
        <View style={dropdownStyles.dropdownContainer}>
          <View style={dropdownStyles.dropdownHeader}>
            <Text style={dropdownStyles.dropdownHeaderText}>Number of Questions</Text>
          </View>
          <RNPickerSelect
            onValueChange={(value) => setNumQuestions(value)}
            items={questionOptions.map((option) => ({ label: option, value: option }))}
            placeholder={{}} // No placeholder, default to the first option
            value={numQuestions} // Bind the selected value
            useNativeAndroidPickerStyle={false} // Make the whole container clickable
            style={{
              inputIOS: {
                ...styles.dropdownButton,
                paddingRight: 30, // Add padding for the arrow
              },
              inputAndroid: {
                ...styles.dropdownButton,
                paddingRight: 30, // Add padding for the arrow
              },
              iconContainer: {
                top: 10,
                right: 20, // Move the arrow to the left
              },
            }}
            Icon={() => (
              <Text style={styles.dropdownButtonIcon}>▼</Text> // Add the arrow back
            )}
          />
        </View>

        {/* Start Button */}
        <TouchableOpacity style={styles.startButton} onPress={handleStartPractice}>
          <Text style={styles.buttonText}>Start Practice</Text>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.smallBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export default PracticeScreen;