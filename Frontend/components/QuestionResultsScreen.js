import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

function QuestionResultsScreen({ results = [], correctAnswer = '' }) {
  // Sort results by correct answers first, then by fastest time
  const sortedResults = [...results].sort((a, b) => {
    if (a.isCorrect !== b.isCorrect) {
      return a.isCorrect ? -1 : 1;
    }
    return parseFloat(a.time) - parseFloat(b.time);
  });

  return (
    <View style={styles.resultsContainer}>
      <Text style={styles.resultsTitle}>Question Results</Text>
      <Text style={styles.correctAnswerText}>
        Correct Answer: <Text style={styles.correctAnswerValue}>{correctAnswer}</Text>
      </Text>
      
      <FlatList
        data={sortedResults}
        keyExtractor={(item, index) => `${item.playerId}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.playerResultRow}>
            <Text style={styles.playerName} numberOfLines={1} ellipsizeMode="tail">
              {item.playerName}
            </Text>
            <View style={[
              styles.answerIndicator, 
              { backgroundColor: item.isCorrect ? '#8ac926' : '#ff595e' }
            ]}>
              <Text style={styles.indicatorText}>
                {item.isCorrect ? '✓' : '✗'}
              </Text>
            </View>
            <Text style={styles.answerTime}>{parseFloat(item.time).toFixed(1)}s</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyResultsText}>No results available</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  resultsContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginVertical: 10,
    width: '95%',
    alignSelf: 'center',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  correctAnswerText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 15,
  },
  correctAnswerValue: {
    fontWeight: 'bold',
    color: '#8ac926',
  },
  playerResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
  },
  playerName: {
    fontSize: 16,
    color: 'white',
    flex: 1,
  },
  answerIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  indicatorText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  answerTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    width: 50,
    textAlign: 'right',
  },
  emptyResultsText: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 20,
  }
});

export default QuestionResultsScreen;