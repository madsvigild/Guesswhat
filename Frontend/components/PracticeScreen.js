import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Image 
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import styles from '../Styles/globalStyles';
import dropdownStyles from '../Styles/dropdownStyles';
import GradientBackground from './GradientBackground'; // Import GradientBackground
import { API_BASE_URL, categoryService } from '../utils/api'; // Import from API
import categoryIcon from '../assets/practicescreen/category-icon.png';
import difficultyIcon from '../assets/practicescreen/difficulty-icon.png';
import numberOfQuestionsIcon from '../assets/practicescreen/number-of-questions-icon.png';
import practiceHeaderIcon from '../assets/practicescreen/practice-header-icon.png';

function PracticeScreen({ navigation }) {
  const [categories, setCategories] = useState([]); // Start with an empty array
  const [selectedCategory, setSelectedCategory] = useState('Any');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Easy');
  const [numQuestions, setNumQuestions] = useState('5');
  const [loadingCategories, setLoadingCategories] = useState(true); // Add a loading state
  const [error, setError] = useState(null); // Track error state

  const questionOptions = [
    { label: '5', value: '5' },
    { label: '10', value: '10' },
    { label: '15', value: '15' },
  ];

  const difficultyOptions = [
    { label: 'Easy 😊', value: 'Easy' },
    { label: 'Medium 😐', value: 'Medium' },
    { label: 'Hard 😰', value: 'Hard' },
  ];

  // Fetch categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        setError(null);
        const response = await categoryService.getAll();
        setCategories([{ id: 'Any', name: 'Any' }, ...response.data].map((cat) => ({
          label: cat.name,
          value: cat.id,
        })));
      } catch (error) {
        setError(`Failed to load categories: ${error.message}`);
        setCategories([
          { label: 'Any', value: 'Any' },
          { label: 'General Knowledge', value: '1' },
          { label: 'History', value: '2' },
          { label: 'Science', value: '3' },
        ]);
        Alert.alert('Connection Error', 'Using offline categories.', [{ text: 'OK' }]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleStartPractice = () => {
    navigation.replace('PracticeQuiz', {
      quizOptions: {
        category: selectedCategory,
        difficulty: selectedDifficulty,
        numQuestions: parseInt(numQuestions, 10),
      },
      startTime: Date.now(),
      gameMode: 'practice',
    });
    console.log('Selected Number of Questions:', numQuestions);
  };

  return (
  <GradientBackground>
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.practiceContent}>
        <View style={{ paddingTop: 40, alignItems: 'center' }}>
          <Image source={practiceHeaderIcon} style={styles.headerIcon} />
          <Text style={styles.title}>Practice Mode</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchCategories()}>
              <Text style={styles.buttonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Category Dropdown */}
        <View style={dropdownStyles.dropdownContainer}>
          <View style={dropdownStyles.dropdownHeader}>
            <Image source={categoryIcon} style={dropdownStyles.headerIcon} />
            <Text style={dropdownStyles.dropdownHeaderText}>Category</Text>
          </View>
          <Dropdown
            style={dropdownStyles.dropdown}
            placeholderStyle={dropdownStyles.placeholderStyle}
            selectedTextStyle={dropdownStyles.selectedTextStyle}
            data={categories}
            labelField="label"
            valueField="value"
            placeholder="Select Category"
            value={selectedCategory}
            onChange={(item) => setSelectedCategory(item.value)}
          />
        </View>

        {/* Difficulty Dropdown */}
        <View style={dropdownStyles.dropdownContainer}>
          <View style={dropdownStyles.dropdownHeader}>
            <Image source={difficultyIcon} style={dropdownStyles.headerIcon} />
            <Text style={dropdownStyles.dropdownHeaderText}>Difficulty</Text>
          </View>
          <Dropdown
            style={dropdownStyles.dropdown}
            placeholderStyle={dropdownStyles.placeholderStyle}
            selectedTextStyle={dropdownStyles.selectedTextStyle}
            data={difficultyOptions}
            labelField="label"
            valueField="value"
            placeholder="Select Difficulty"
            value={selectedDifficulty}
            onChange={(item) => setSelectedDifficulty(item.value)}
          />
        </View>

        {/* Number of Questions Dropdown */}
        <View style={dropdownStyles.dropdownContainer}>
          <View style={dropdownStyles.dropdownHeader}>
            <Image source={numberOfQuestionsIcon} style={dropdownStyles.headerIcon} />
            <Text style={dropdownStyles.dropdownHeaderText}>Number of Questions</Text>
          </View>
          <Dropdown
            style={dropdownStyles.dropdown}
            placeholderStyle={dropdownStyles.placeholderStyle}
            selectedTextStyle={dropdownStyles.selectedTextStyle}
            data={questionOptions}
            labelField="label"
            valueField="value"
            placeholder="Select Number of Questions"
            value={numQuestions}
            onChange={(item) => setNumQuestions(item.value)}
          />
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartPractice}
          disabled={loadingCategories}
        >
          <Text style={styles.buttonText}>Start Practice</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  </GradientBackground>
);
}

export default PracticeScreen;