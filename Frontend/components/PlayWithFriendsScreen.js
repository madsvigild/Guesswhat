import React, { useState, useEffect, useRef } from 'react';
import { getSocket, API_BASE_URL } from '../utils/api';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import globalStyles from '../Styles/globalStyles';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import GradientBackground from './GradientBackground'; // Import GradientBackground

export default function PlayWithFriendsScreen({ navigation }) {
  const [isHosting, setIsHosting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isEnteringNickname, setIsEnteringNickname] = useState(false);
  const [gameCode, setGameCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [actionType, setActionType] = useState('');
  const [players, setPlayers] = useState([]); // List of players who have joined
  const [rounds, setRounds] = useState(5); // Default number of rounds
  const [isHost, setIsHost] = useState(false); // Track if the user is the host
  const [hostNickname, setHostNickname] = useState(''); // Store the host's nickname
  const [isEnteringGameCode, setIsEnteringGameCode] = useState(false); // Track if entering game ID
  const [playerId, setPlayerId] = useState(null); // Store player ID for later use
  
  const socketRef = useRef(null);

useEffect(() => {
  // Initialize socket connection only once
  if (!socketRef.current) {
    console.log('Initializing socket in PlayWithFriendsScreen');
    socketRef.current = getSocket();
  }

  // Listen for updates to the player list
  socketRef.current.on('updatePlayers', (updatedPlayers) => {
    console.log('Updated player list:', updatedPlayers);
    setPlayers(updatedPlayers);
  });
  
  // Listen for joined game events
  socketRef.current.on('joinedGame', (data) => {
    console.log('Joined game event received in PlayWithFriendsScreen:', data);
    if (data && data.playerId) {
      console.log('Setting player ID:', data.playerId);
      setPlayerId(data.playerId);
    }
  });
  
  // Listen for game started event - this is important for non-host players
  socketRef.current.on('gameStarted', (data) => {
    console.log('Game started event received:', data);
    if (data && data.gameId && !isHost) {
      console.log('Non-host player navigating to game screen');
      // Navigate to the quiz screen for non-host players
      setTimeout(() => {
        navigation.navigate('PlayWithFriendsQuiz', {
          gameMode: 'multiplayer',
          gameCode: data.gameId,
          isHost: false,
          rounds: data.totalQuestions || 5,
          playerId: playerId,
          nickname: nickname,
        });
      }, 500);
    }
  });

  return () => {
    // Clean up the socket listener on component unmount
    socketRef.current.off('updatePlayers');
    socketRef.current.off('joinedGame');
    // Don't disconnect as other components might use it
  };
}, []);

// Insert the new useEffect here
useEffect(() => {
  if (isHosting || isJoining) {
    // No need to navigate, as the lobby is already conditionally rendered
    console.log('Navigating to lobby within the same screen.');
  }
}, [isHosting, isJoining]);

const handleHostGame = async () => {
  if (nickname.trim() === '') {
    Alert.alert('Error', 'Please enter a nickname before hosting the game.');
    return;
  }

  try {
    console.log('Creating new game with host:', nickname);
    // Create a new game on the backend using axios directly for better error handling
    const response = await axios.post(`${API_BASE_URL}/api/games`, {
      name: 'Hosted Game'
    });

    console.log('Game created successfully:', response.data);
    
    if (!response.data.id) {
      throw new Error('Game ID not received from backend.');
    }

    // Store the generated game code
    const newGameCode = response.data.id;
    setGeneratedCode(newGameCode);
    setIsHosting(true);
    setIsHost(true); // Mark the user as the host
    setHostNickname(nickname);
    setIsEnteringNickname(false); // Exit nickname input mode after successful hosting

    // Join the game as the host
    console.log('Joining game as host with gameID:', newGameCode, 'nickname:', nickname);
    socketRef.current.emit('joinGame', { gameId: newGameCode, nickname });
  } catch (error) {
    console.error('Error creating game:', error.message);
    if (error.response) {
      console.error('Server response:', error.response.data);
    }
    Alert.alert('Error', 'Failed to create game. Please try again.');
  }
};

  const handleStartGame = () => {
    // Check if there are at least 2 players
    if (players.length < 2) {
      Alert.alert(
        "Not enough players",
        "Please wait for at least one more player to join before starting the game.",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }]
      );
      return;
    }
    
    // Emit the startGame event with the selected number of rounds
    console.log('Starting game with ID:', generatedCode, 'and rounds:', rounds);
    socketRef.current.emit('startGame', { gameId: generatedCode, rounds });
    
    // Add a short delay before navigation to ensure the socket event is processed
    setTimeout(() => {
      // Navigate to the game screen for the host
      navigation.navigate('PlayWithFriendsQuiz', {
        gameMode: 'multiplayer',
        gameCode: generatedCode,
        isHost: true,
        rounds: rounds, // Pass the number of rounds to the quiz screen
        playerId: playerId, // Pass the player ID
        nickname: nickname, // Pass the player's nickname to maintain identity
      });
    }, 800); // Increased delay to ensure socket message is processed
  };

  const handleJoinGame = () => {
    setIsEnteringGameCode(true); // Prompt the user to enter a game ID
  };
  
  const handleGameCodeSubmit = () => {
    if (gameCode.trim() === '') {
      Alert.alert('Error', 'Please enter a valid game code.');
      return;
    }
  
    console.log(`Attempting to validate game code: ${gameCode}`);
    socketRef.current.emit('validateGameCode', { gameId: gameCode });
  
    // Remove any existing listeners to avoid duplication
    socketRef.current.off('gameCodeValid');
    socketRef.current.off('error');
  
    // Listen for validation response
    socketRef.current.on('gameCodeValid', (isValid) => {
      if (!isValid) {
        Alert.alert('Error', 'Invalid game code. Please try again.');
        return;
      }
  
      // If the game code is valid, prompt for nickname
      setIsEnteringGameCode(false); // Exit game code input mode
      setIsEnteringNickname(true); // Enter nickname input mode
      setActionType('join');
    });
  
    // Listen for errors
    socketRef.current.on('error', (error) => {
      console.log('Error received from backend:', error.message);
      Alert.alert('Error', error.message || 'An error occurred.');
    });
  };
  
  const handleNicknameSubmit = async () => {
    if (nickname.trim() === '') {
      Alert.alert('Error', 'Please enter a nickname.');
      return;
    }
  
    if (actionType === 'host') {
      try {
        await handleHostGame(); // Ensure the game is created successfully
      } catch (error) {
        console.error('Error hosting game:', error);
        return;
      }
    } else if (actionType === 'join') {
      console.log(`Joining game with code: ${gameCode}, nickname: ${nickname}`);
      socketRef.current.emit('joinGame', { gameId: gameCode, nickname });
  
      // Remove any existing listeners to avoid duplication
      socketRef.current.off('joinedGame');
      socketRef.current.off('error');
  
      // Listen for successful join
      socketRef.current.on('joinedGame', ({ playerId }) => {
        console.log('Successfully joined game with player ID:', playerId);
        setPlayerId(playerId);
        setIsJoining(true); // Mark the user as joining
        setIsEnteringNickname(false); // Exit nickname input mode
      });
  
      // Listen for errors
      socketRef.current.on('error', (error) => {
        console.log('Error received from backend:', error.message);
        if (Platform.OS === 'web') {
          // For web, use window.alert instead of Alert.alert
          window.alert(error.message || 'An error occurred.');
        } else {
          Alert.alert('Error', error.message || 'An error occurred.');
        }
      });
    }
  };

  return (
    <GradientBackground>
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView
        style={globalStyles.scrollViewContainer}
        contentContainerStyle={styles.container}
      >
        {/* Header */}
        {!isHosting && !isJoining && !isEnteringNickname && !isEnteringGameCode && (
          <Text style={globalStyles.title}>Play With Friends</Text>
        )}
  
        {/* Tagline */}
        {!isHosting && !isJoining && !isEnteringNickname && !isEnteringGameCode && (
          <View style={globalStyles.taglineBox}>
            <Text style={globalStyles.taglineDaily}>
              Create or join a game to play trivia with your friends!
            </Text>
          </View>
        )}
  
        {/* Enter Game ID */}
        {isEnteringGameCode ? (
          <View style={styles.nicknameContainer}>
            <Text style={globalStyles.title}>Enter Game ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter game ID"
              placeholderTextColor="#888"
              value={gameCode}
              onChangeText={setGameCode}
            />
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleGameCodeSubmit}
            >
              <Text style={globalStyles.buttonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setIsEnteringGameCode(false); // Exit game code input mode
                setActionType(''); // Reset action type
                setGameCode(''); // Clear game code
              }}
            >
              <Text style={globalStyles.buttonText}>Back</Text>
            </TouchableOpacity>
          </View>
        ) : isEnteringNickname ? (
          <View style={styles.nicknameContainer}>
            <Text style={globalStyles.title}>Enter Nickname</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your nickname"
              placeholderTextColor="#888"
              value={nickname}
              onChangeText={setNickname}
            />
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleNicknameSubmit}
            >
              <Text style={globalStyles.buttonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setIsEnteringNickname(false); // Exit nickname input mode
                setActionType(''); // Reset action type
                setNickname(''); // Clear nickname
              }}
            >
              <Text style={globalStyles.buttonText}>Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Host/Join options */}
            {!isHosting && !isJoining && (
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => {
                    setActionType('host');
                    setIsEnteringNickname(true);
                  }}
                >
                  <Text style={globalStyles.buttonText}>Host Game</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={handleJoinGame}
                >
                  <Text style={globalStyles.buttonText}>Join Game</Text>
                </TouchableOpacity>
              </View>
            )}
  
            {/* Hosting a Game */}
            {isHosting && (
              <View style={styles.hostContainer}>
                <Text style={globalStyles.title}>Game Code</Text>
                <View style={globalStyles.taglineBox}>
                  <Text style={globalStyles.taglineDaily}>
                    Share this code with your friends:
                  </Text>
                </View>
                <Text style={styles.gameCode}>{generatedCode}</Text>
                <Text style={styles.lobbyTitle}>Players Joined:</Text>
                {players && players.length > 0 ? (
                  players.map((player, index) => (
                    <Text key={player.id || index} style={styles.playerName}>
                      {player.playerName || player.nickname} {isHost && player.id === playerId ? "(You - Host)" : ""}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.waitingText}>Waiting for players to join...</Text>
                )}
  
                {/* Round Selection */}
                <Text style={styles.roundsTitle}>Select Number of Rounds:</Text>
                <View style={styles.pickerContainer}>
                  <RNPickerSelect
                    onValueChange={(value) => setRounds(parseInt(value, 10))}
                    items={[
                      { label: '5 Rounds', value: '5' },
                      { label: '10 Rounds', value: '10' },
                      { label: '15 Rounds', value: '15' },
                    ]}
                    placeholder={{}}
                    value={rounds.toString()}
                    useNativeAndroidPickerStyle={false}
                    style={{
                      inputIOS: {
                        ...styles.picker,
                        paddingRight: 30,
                      },
                      inputAndroid: {
                        ...styles.picker,
                        paddingRight: 30,
                      },
                      iconContainer: {
                        top: 10,
                        right: 10,
                      },
                    }}
                    Icon={() => (
                      <Text style={styles.dropdownButtonIcon}>▼</Text>
                    )}
                  />
                </View>
  
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={handleStartGame}
                >
                  <Text style={globalStyles.buttonText}>Start Game</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setIsHosting(false)}
                >
                  <Text style={globalStyles.buttonText}>Back</Text>
                </TouchableOpacity>
              </View>
            )}
  
            {/* Lobby Screen */}
            {isJoining && (
              <View style={styles.joinContainer}>
                <Text style={styles.lobbyTitle}>Players Joined:</Text>
                {players && players.length > 0 ? (
                  players.map((player, index) => (
                    <Text key={player.id || index} style={styles.playerName}>
                      {player.playerName || player.nickname} {isHost && player.id === playerId ? "(You - Host)" : ""}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.waitingText}>Waiting for players to join...</Text>
                )}
  
                {isHost ? (
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={handleStartGame}
                  >
                    <Text style={globalStyles.buttonText}>Start Game</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.waitingText}>
                    Waiting for {hostNickname} to start the game
                  </Text>
                )}
  
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setIsJoining(false)}
                >
                  <Text style={globalStyles.buttonText}>Back</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  nicknameContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 20,
  },
  optionButton: {
    backgroundColor: '#00BFA6',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  hostContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  joinContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  instructionText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  gameCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginVertical: 20,
    textAlign: 'center',
  },
  lobbyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 10,
  },
  playerName: {
    fontSize: 16,
    color: 'white',
    marginVertical: 5,
  },
  roundsTitle: {
    fontSize: 16,
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: 150,
    color: 'white',
    backgroundColor: '#333',
    borderRadius: 8,
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    width: '80%',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  startButton: {
    backgroundColor: '#8ac926',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: '#8ac926',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  picker: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    width: '100%',
    color: '#333',
  },
  dropdownButtonIcon: {
    fontSize: 20,
    color: '#888',
  },
  waitingText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
});