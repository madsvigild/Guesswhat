import React, { useRef, useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, Share, Platform } from 'react-native';
import globalStyles from '../Styles/globalStyles';
import ConfettiCannon from 'react-native-confetti-cannon';

export default function MultiplayerScoreScreen({ route, navigation }) {
  // Add default empty array to prevent the "map of undefined" error
  const { leaderboard = [] } = route.params || {};
  const confettiRef = useRef(null);
  const [showStatistics, setShowStatistics] = useState(false);
  
  // Fire confetti for winners when component mounts
  useEffect(() => {
    // Only fire confetti if there are players
    if (leaderboard && leaderboard.length > 0) {
      setTimeout(() => {
        if (confettiRef.current) {
          confettiRef.current.start();
        }
      }, 500);
    }
  }, []);
  
  // Calculate some interesting statistics
  const stats = React.useMemo(() => {
    if (!leaderboard || leaderboard.length === 0) return null;
    
    // Find highest score
    const highestScore = Math.max(...leaderboard.map(player => player.score || 0));
    
    // Find the winner(s) - could be multiple in case of a tie
    const winners = leaderboard.filter(player => player.score === highestScore);
    
    // Calculate score distribution
    const totalScore = leaderboard.reduce((sum, player) => sum + (player.score || 0), 0);
    const averageScore = totalScore / leaderboard.length;
    
    return {
      winners,
      highestScore,
      totalPlayers: leaderboard.length,
      averageScore: Math.round(averageScore),
    };
  }, [leaderboard]);

  // Share result function
  const handleShare = async () => {
    try {
      const message = `I just finished a GuessWhat Trivia game! ${
        stats?.winners?.length === 1 
          ? `${stats.winners[0].playerName || stats.winners[0].name} won with ${stats.highestScore} points!` 
          : `${stats?.winners?.map(w => w.playerName || w.name).join(' and ')} tied for first place!`
      } Join me for the next round!`;
      
      await Share.share({
        message,
        title: 'GuessWhat Trivia Results',
      });
    } catch (error) {
      console.error('Error sharing results:', error);
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView contentContainerStyle={globalStyles.scrollContainer}>
        <Text style={globalStyles.title}>Final Leaderboard</Text>

        {/* Confetti for winners! */}
        {leaderboard && leaderboard.length > 0 && (
          <ConfettiCannon
            ref={confettiRef}
            count={100}
            origin={{ x: -10, y: 0 }}
            fadeOut={true}
            autoStartDelay={500}
          />
        )}

        {leaderboard && leaderboard.length > 0 ? (
          <>
            <View style={styles.leaderboardContainer}>
              {leaderboard.map((player, index) => (
                <View 
                  key={player.id || index} 
                  style={[
                    styles.playerRow,
                    index === 0 && styles.firstPlace,
                    index === 1 && styles.secondPlace,
                    index === 2 && styles.thirdPlace
                  ]}
                >
                  <Text style={styles.placement}>{index + 1}</Text>
                  <Text style={styles.playerName}>{player.playerName || player.name}</Text>
                  <Text style={styles.playerScore}>{player.score} pts</Text>
                  {index === 0 && <Text style={styles.crown}>👑</Text>}
                </View>
              ))}
            </View>
            
            {/* Toggle statistics section */}
            <TouchableOpacity
              style={styles.statsToggle}
              onPress={() => setShowStatistics(!showStatistics)}
            >
              <Text style={styles.statsToggleText}>
                {showStatistics ? 'Hide Statistics' : 'Show Statistics'}
              </Text>
            </TouchableOpacity>
            
            {/* Statistics section */}
            {showStatistics && stats && (
              <View style={styles.statsContainer}>
                <Text style={styles.statsTitle}>Game Statistics</Text>
                <Text style={styles.statItem}>
                  Winner: {stats.winners.length > 1 
                    ? 'Tie between ' + stats.winners.map(w => w.playerName || w.name).join(', ')
                    : stats.winners[0].playerName || stats.winners[0].name}
                </Text>
                <Text style={styles.statItem}>Highest Score: {stats.highestScore} points</Text>
                <Text style={styles.statItem}>Average Score: {stats.averageScore} points</Text>
                <Text style={styles.statItem}>Total Players: {stats.totalPlayers}</Text>
              </View>
            )}
            
            {/* Share Button */}
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
            >
              <Text style={styles.shareButtonText}>📱 Share Results</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={[globalStyles.leaderboardEntry, { textAlign: 'center' }]}>
            No results available
          </Text>
        )}

        {/* Back to Main Menu button */}
        <TouchableOpacity
          style={globalStyles.button}
          onPress={() => navigation.navigate('MainMenu')}
        >
          <Text style={globalStyles.buttonText}>Back to Main Menu</Text>
        </TouchableOpacity>
        
        {/* Play Again button */}
        <TouchableOpacity
          style={[globalStyles.button, { marginTop: 10, backgroundColor: '#8ac926' }]}
          onPress={() => navigation.navigate('PlayWithFriends')}
        >
          <Text style={globalStyles.buttonText}>Play Again</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  leaderboardContainer: {
    width: '90%',
    marginVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 10,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
  },
  firstPlace: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)', // Gold
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  secondPlace: {
    backgroundColor: 'rgba(192, 192, 192, 0.3)', // Silver
    borderWidth: 1,
    borderColor: '#C0C0C0',
  },
  thirdPlace: {
    backgroundColor: 'rgba(205, 127, 50, 0.3)', // Bronze
    borderWidth: 1,
    borderColor: '#CD7F32',
  },
  placement: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    width: 30,
    textAlign: 'center',
  },
  playerName: {
    fontSize: 16,
    color: 'white',
    flex: 1,
    marginLeft: 10,
  },
  playerScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8ac926',
  },
  crown: {
    fontSize: 20,
    marginLeft: 10,
  },
  shareButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginVertical: 15,
    width: '80%',
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsToggle: {
    marginTop: 10,
    marginBottom: 5,
    padding: 10,
  },
  statsToggleText: {
    color: '#00BFA6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    width: '90%',
    marginVertical: 10,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  statItem: {
    fontSize: 14,
    color: 'white',
    marginVertical: 5,
  },
});