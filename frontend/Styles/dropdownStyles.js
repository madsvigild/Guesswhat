import { StyleSheet } from 'react-native';

const dropdownStyles = StyleSheet.create({
  dropdownContainer: {
    marginBottom: 20,
    width: '90%', // Match the width of the tagline box
    alignSelf: 'center',
  },
  dropdownHeader: {
    backgroundColor: '#8ac926', // Green background for the header
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 10,
  },
  dropdownHeaderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownButton: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownButtonIcon: {
    fontSize: 16,
    color: '#888',
  },
  dropdownStyle: {
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  dropdownRowIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  dropdownRowText: {
    fontSize: 16,
    color: '#333',
  },
});

export default dropdownStyles;