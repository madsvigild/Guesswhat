import { StyleSheet } from 'react-native';

const globalStyles = StyleSheet.create({
  // General container style
  safeArea: {
    flex: 1,
    backgroundColor: '#004466',
  },
  scrollViewContainer: {
    flex: 1,
    backgroundColor: '#004466',
  },
  dailyGameContent: {
    padding: 20,
    alignItems: 'center',
    minHeight: '100%',
  },
  practiceContent: {
    padding: 20,
    alignItems: 'center',
    minHeight: '100%',
  },
  icon: {
    fontSize: 60, // Adjusted size for better visibility
    marginBottom: 10,
  },
  // Tagline Box
  taglineBox: {
    borderWidth: 2,
    borderColor: '#8ac926',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    width: '90%',
    alignItems: 'center',
  },
  taglineDaily: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  taglinePractice: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  // Countdown Timer
  countdown: {
    fontSize: 18,
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  // Streak Counter
  streak: {
    fontSize: 16,
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  // Leaderboard
  leaderboard: {
    width: '90%',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  leaderboardTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  leaderboardEntry: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
    textAlign: 'center',
  },
  // Buttons
  button: {
    backgroundColor: '#8ac926',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#8ac926',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginVertical: 10,
  },
  // Label styles
  label: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
    alignSelf: 'flex-start',
    marginLeft: 30,
    zIndex: 1,
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  // Answers container
  answersContainer: {
    marginVertical: 20,
    width: '80%',
  },
  // Answer button styles
  answerButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
  },
  answerButtonText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  // Timer styles
  timer: {
    fontSize: 14,
    color: 'white',
    marginTop: 15,
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Progress styles
  progressTracker: {
    fontSize: 14,
    color: 'white',
    marginTop: 10,
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Answer feedback styles
  incorrectAnswer: {
    backgroundColor: '#ffdddd',
  },
  correctAnswer: {
    backgroundColor: '#ddffdd',
  },
  // Quiz content container
  quizContentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    justifyContent: 'space-around',
  },
  // Question box style
  questionBox: {
    borderWidth: 2,
    borderColor: '#8ac926',
    backgroundColor: 'rgba(138, 201, 38, 0.1)', // Transparent green background
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    width: '90%',
    alignItems: 'center',
  },
  question: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
  // Dropdown styles
  dropdownButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    paddingVertical: 15,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  practiceScoreScreenContainer: {
    flex: 1,
    backgroundColor: '#004466',
    padding: 20,
    paddingTop: 40, // Added padding to move content down
  },
  practiceScoreCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  practiceEncouragementText: {
    fontSize: 18,
    color: '#8ac926',
    textAlign: 'center', // Align text in the center
    marginBottom: 20,
  },
  practiceBreakdownContainer: {
    flex: 1,
    backgroundColor: '#e0f7fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  practiceBreakdownItem: {
    marginBottom: 15,
  },
  practiceBreakdownQuestion: {
    fontSize: 14,
    color: '#333',
  },
  practiceCorrectAnswer: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  practiceIncorrectAnswer: {
    fontSize: 14,
    color: '#f44336',
    fontWeight: 'bold',
  },
  practiceCorrectAnswerText: {
    fontSize: 14,
    color: '#007BFF', // Blue color for correct answer
    fontStyle: 'italic', // Make it italic for differentiation
    marginTop: 5,
  },
  practiceOptionsButton: {
    backgroundColor: '#ff7043',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  practiceMenuButton: {
    backgroundColor: '#8ac926',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  dropdownButtonText: {
    fontSize: 18,
    color: '#333',
  },
  dropdownButtonIcon: {
    fontSize: 20,
    color: '#888',
  },
  container: {
    flex: 1,
    backgroundColor: '#004466', // Fallback color
    background: 'linear-gradient(180deg, #004466, #007B83)', // Gradient background
  },
  scrollContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 30, // Added more vertical padding
    paddingHorizontal: 20,
  },
  logoIcon: {
    fontSize: 50,
    color: '#FFF700',
    textShadowColor: 'rgba(255, 255, 0, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 36, // Slightly larger font size
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)', // Subtle shadow for premium look
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 20,
  },
  coreFeatures: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    marginBottom: 30, // Added more space below core features
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 1, // Subtle divider line
    borderTopColor: '#ffffff20', // Faint line color
  },
  footerButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    margin: 10,
  },
  footerText: {
    fontSize: 14,
    color: 'white',
  },
  scoreScreenContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#004466',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  achievementBadge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8ac926',
    marginBottom: 10,
    textAlign: 'center',
  },
  scoreScreenText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  overallScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8ac926',
    marginTop: 20,
    textAlign: 'center',
  },
  comparisonStats: {
    fontSize: 14,
    color: '#555',
    marginTop: 20,
    textAlign: 'center',
  },
  buttonGroup: {
    marginTop: 20,
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: '#4fc3f7',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 10, // Add spacing between buttons
    width: '80%', // Ensure consistent button width
    alignItems: 'center',
  },
  challengeButton: {
    backgroundColor: '#ffa500',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 10, // Add spacing between buttons
    width: '80%', // Ensure consistent button width
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    width: '80%', // Ensure consistent button width
    alignItems: 'center',
  },
  smallBackButton: {
    backgroundColor: '#6c757d', // Grey background
    paddingVertical: 10, // Smaller vertical padding
    paddingHorizontal: 20, // Smaller horizontal padding
    borderRadius: 5, // Rounded corners
    width: '30%', // Narrower width for the back button
    alignItems: 'center', // Center the text inside the button
    marginTop: 20, // Spacing from other elements
    alignSelf: 'center', // Center the button horizontally
  },
  buttonIcon: {
    fontSize: 20,
    marginBottom: 5,
    textAlign: 'center',
  },
  signInButton: {
    backgroundColor: '#FFD700', // Gold background
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Subtle shadow for premium feel
  },
  signInText: {
    color: '#333', // Darker text for contrast
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  coreButton: {
    backgroundColor: '#00BFA6', // Light teal for a brighter feel
    paddingVertical: 20,
    borderRadius: 12,
    margin: 15,
    alignItems: 'center',
    width: '40%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Subtle shadow for depth
    borderWidth: 1, // Thin border for definition
    borderColor: '#00897B', // Slightly darker teal border
  },
  wideButton: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: 15,
    backgroundColor: '#00BFA6', // Light teal for consistency
    borderWidth: 1,
    borderColor: '#00897B', // Slightly darker teal border
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  returnButton: {
    backgroundColor: '#8ac926', // Green background
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  selectedAnswer: {
    backgroundColor: 'rgba(128, 128, 128, 0.5)', // Transparent grey
  },
  correctAnswer: {
    backgroundColor: '#8ac926', // Brighter green
  },
  incorrectAnswer: {
    backgroundColor: '#ff4d4d', // Brighter red
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    width: '90%',
  },
});

export default globalStyles;
