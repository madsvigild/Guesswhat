import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import globalStyles from '../Styles/globalStyles';
import RNPickerSelect from 'react-native-picker-select';
import { API_BASE_URL } from '../utils/api';
import axios from 'axios';

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

const socketRef = useRef(null);

useEffect(() => {
  // Initialize socket connection only once
  if (!socketRef.current) {
    socketRef.current = io(API_BASE_URL);
  }

  // Listen for updates to the player list
  socketRef.current.on('updatePlayers', (updatedPlayers) => {
    console.log('Updated player list:', updatedPlayers);
    setPlayers(updatedPlayers);
  });

  return () => {
    // Clean up the socket listener on component unmount
    socketRef.current.off('updatePlayers');
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
    alert('Please enter a nickname before hosting the game.');
    return;
  }

  try {
    // Create a new game on the backend using axios directly for better error handling
    const response = await axios.post(`${API_BASE_URL}/api/games`, {
      name: 'Hosted Game'
    });

    console.log('Game created successfully:', response.data);
    
    if (!response.data.id) {
      throw new Error('Game ID not received from backend.');
    }

    // Store the generated game code
    setGeneratedCode(response.data.id);
    setIsHosting(true);
    setIsHost(true); // Mark the user as the host

    // Join the game as the host
    socketRef.current.emit('joinGame', { gameId: response.data.id, nickname });

    // Add the host's nickname to the players list locally
    setPlayers([{ nickname }]);
    setHostNickname(nickname); // Set the host's nickname
  } catch (error) {
    console.error('Error creating game:', error.message);
    if (error.response) {
      console.error('Server response:', error.response.data);
    }
    alert('Failed to create game. Please try again.');
  }
};

  const handleStartGame = () => {
    // Emit the startGame event with the selected number of rounds
    socketRef.current.emit('startGame', { gameId: generatedCode, rounds });
  
    // Navigate to the game screen for the host
    navigation.navigate('PlayWithFriendsQuiz', {
      gameMode: 'multiplayer',
      gameCode: generatedCode,
      isHost: true,
      rounds, // Pass the number of rounds to the quiz screen
    });
  };

  const handleJoinGame = () => {
    setIsEnteringGameCode(true); // Prompt the user to enter a game ID
  };
  
  const handleGameCodeSubmit = () => {
    if (gameCode.trim() === '') {
      alert('Please enter a valid game code.');
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
        alert('Invalid game code. Please try again.');
        return;
      }
  
      // If the game code is valid, prompt for nickname
      setIsEnteringGameCode(false); // Exit game code input mode
      setIsEnteringNickname(true); // Enter nickname input mode
    });
  
    // Listen for errors
    socketRef.current.on('error', (error) => {
      console.log('Error received from backend:', error.message);
      alert(error.message);
    });
  };
  
  const handleNicknameSubmit = async () => {
    if (nickname.trim() === '') {
      alert('Please enter a nickname.');
      return;
    }
  
    if (actionType === 'host') {
      try {
        await handleHostGame(); // Ensure the game is created successfully
        setIsHosting(true); // Mark the user as hosting
        setIsEnteringNickname(false); // Exit nickname input mode
      } catch (error) {
        console.error('Error hosting game:', error);
        return;
      }
    } else if (actionType === 'join') {
      console.log(`Joining game with nickname: ${nickname}`);
      socketRef.current.emit('joinGame', { gameId: gameCode, nickname });
  
      // Remove any existing listeners to avoid duplication
      socketRef.current.off('joinedGame');
      socketRef.current.off('error');
  
      // Listen for successful join
      socketRef.current.on('joinedGame', ({ players, hostNickname }) => {
        console.log('Successfully joined game:', players);
        setPlayers(players);
        setHostNickname(hostNickname); // Store the host's nickname
        setIsJoining(true); // Mark the user as joining
        setIsEnteringNickname(false); // Exit nickname input mode
      });
  
      // Listen for errors
      socketRef.current.on('error', (error) => {
        console.log('Error received from backend:', error.message);
        alert(error.message);
      });
    }
  };

  return (
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
                {players.map((player, index) => (
                  <Text key={index} style={styles.playerName}>
                    {player.nickname}
                  </Text>
                ))}
  
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
                {players.map((player, index) => (
                  <Text key={index} style={styles.playerName}>
                    {player.nickname}
                  </Text>
                ))}
  
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
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
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