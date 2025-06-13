import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import globalStyles from '../Styles/globalStyles'; // Ensure the globalStyles file is correctly imported
import GradientBackground from './GradientBackground'; // Import GradientBackground

function PracticeScoreScreen({ route, navigation }) {
  const { correctAnswers, totalQuestions, questionBreakdown = [] } = route.params;

  return (
    <GradientBackground>
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center', // Center content horizontally
          paddingBottom: 20,
        }}
      >
        {/* Header */}
        <View style={[globalStyles.header, { paddingTop: 40 }]}>
          <Text style={globalStyles.headerText}>👏 Great Job Practicing! 👏</Text>
        </View>

        {/* Score Summary */}
        <View
          style={[
            globalStyles.practiceScoreCard,
            { marginTop: 10, width: '90%' }, // Set width to 90%
          ]}
        >
          <Text style={[globalStyles.scoreScreenText, { textAlign: 'center' }]}>
            Correct Answers: {correctAnswers} / {totalQuestions}
          </Text>
          <Text style={[globalStyles.practiceEncouragementText, { textAlign: 'center' }]}>
            Keep it up! Practice makes perfect. 🧠
          </Text>
        </View>

        {/* Question Breakdown */}
        {questionBreakdown.length > 0 ? (
          <View
            style={[
              globalStyles.practiceBreakdownContainer,
              {
                marginTop: 20,
                width: '90%', // Set width to 90%
                maxHeight: 350, // Limit height to around 4 question breakdowns
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 10,
                overflow: 'hidden', // Ensure content stays within the box
              },
            ]}
          >
            <ScrollView>
              {questionBreakdown.map((question, index) => (
                <View
                  key={index}
                  style={[
                    globalStyles.practiceBreakdownItem,
                    { padding: 10, borderBottomWidth: index < questionBreakdown.length - 1 ? 1 : 0, borderColor: '#ddd' },
                  ]}
                >
                  <Text style={globalStyles.practiceBreakdownQuestion}>
                    {index + 1}. {question.text}
                  </Text>
                  <Text
                    style={
                      question.correct
                        ? globalStyles.practiceCorrectAnswer
                        : globalStyles.practiceIncorrectAnswer
                    }
                  >
                    {question.correct ? '✔ Correct' : '✘ Incorrect'}
                  </Text>
                  <Text style={globalStyles.practiceCorrectAnswerText}>
                    Correct Answer: {question.correctAnswer}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : (
          <Text style={globalStyles.noQuestionBreakdownText}>
            No question breakdown available.
          </Text>
        )}

        {/* Buttons */}
        <TouchableOpacity
          style={[globalStyles.practiceOptionsButton, { marginTop: 20 }]}
          onPress={() => navigation.navigate('Practice')}
        >
          <Text style={globalStyles.buttonText}>Return to Practice Options</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={globalStyles.practiceMenuButton}
          onPress={() => navigation.navigate('MainMenu')}
        >
          <Text style={globalStyles.buttonText}>Back to Main Menu</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
    </GradientBackground>
  );
}

export default PracticeScoreScreen;