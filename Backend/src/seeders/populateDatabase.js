const { sequelize } = require('../config/db');
const Category = require('../models/Category');
const Question = require('../models/Question');

const populateDatabase = async () => {
  try {
    // Define categories and their questions
    const data = [
      {
        name: 'Philosophy',
        questions: [
          {
            question: 'Who is considered the father of Western philosophy?',
            correctAnswer: 'Socrates',
            incorrectAnswers: ['Plato', 'Aristotle', 'Descartes'],
            difficulty: 'medium',
          },
          {
            question: 'What is the main focus of existentialism?',
            correctAnswer: 'Individual freedom and choice',
            incorrectAnswers: ['Logic', 'Ethics', 'Metaphysics'],
            difficulty: 'medium',
          },
          {
            question: 'Which philosopher is known for the statement "I think, therefore I am"?',
            correctAnswer: 'René Descartes',
            incorrectAnswers: ['Immanuel Kant', 'John Locke', 'David Hume'],
            difficulty: 'medium',
          },
          {
            question: 'What is the term for the study of being and existence?',
            correctAnswer: 'Ontology',
            incorrectAnswers: ['Epistemology', 'Ethics', 'Aesthetics'],
            difficulty: 'medium',
          },
          {
            question: 'Who wrote "Thus Spoke Zarathustra"?',
            correctAnswer: 'Friedrich Nietzsche',
            incorrectAnswers: ['Arthur Schopenhauer', 'Jean-Paul Sartre', 'Søren Kierkegaard'],
            difficulty: 'hard',
          },
          {
            question: 'What is the central idea of utilitarianism?',
            correctAnswer: 'The greatest happiness for the greatest number',
            incorrectAnswers: ['The categorical imperative', 'The social contract', 'The will to power'],
            difficulty: 'medium',
          },
          {
            question: 'Who is known for the allegory of the cave?',
            correctAnswer: 'Plato',
            incorrectAnswers: ['Aristotle', 'Socrates', 'Epicurus'],
            difficulty: 'medium',
          },
        ],
      },
      {
        name: 'Mythology',
        questions: [
          {
            question: 'Who is the king of the Greek gods?',
            correctAnswer: 'Zeus',
            incorrectAnswers: ['Poseidon', 'Hades', 'Apollo'],
            difficulty: 'easy',
          },
          {
            question: 'What is the Norse equivalent of heaven?',
            correctAnswer: 'Valhalla',
            incorrectAnswers: ['Asgard', 'Midgard', 'Helheim'],
            difficulty: 'medium',
          },
          {
            question: 'Who is the Egyptian god of the underworld?',
            correctAnswer: 'Osiris',
            incorrectAnswers: ['Anubis', 'Ra', 'Horus'],
            difficulty: 'medium',
          },
          {
            question: 'What is the Roman name for the Greek god Hermes?',
            correctAnswer: 'Mercury',
            incorrectAnswers: ['Mars', 'Apollo', 'Vulcan'],
            difficulty: 'easy',
          },
          {
            question: 'Who is the Hindu god of destruction?',
            correctAnswer: 'Shiva',
            incorrectAnswers: ['Vishnu', 'Brahma', 'Indra'],
            difficulty: 'medium',
          },
          {
            question: 'What is the name of Thor’s hammer in Norse mythology?',
            correctAnswer: 'Mjolnir',
            incorrectAnswers: ['Gungnir', 'Gram', 'Skofnung'],
            difficulty: 'medium',
          },
          {
            question: 'Who is the Greek goddess of wisdom and warfare?',
            correctAnswer: 'Athena',
            incorrectAnswers: ['Aphrodite', 'Hera', 'Artemis'],
            difficulty: 'easy',
          },
        ],
      },
      {
        name: 'Art',
        questions: [
          {
            question: 'Who painted the Mona Lisa?',
            correctAnswer: 'Leonardo da Vinci',
            incorrectAnswers: ['Michelangelo', 'Raphael', 'Van Gogh'],
            difficulty: 'easy',
          },
          {
            question: 'What is the art movement associated with Salvador Dalí?',
            correctAnswer: 'Surrealism',
            incorrectAnswers: ['Cubism', 'Impressionism', 'Realism'],
            difficulty: 'medium',
          },
          {
            question: 'Which artist is known for the painting "Starry Night"?',
            correctAnswer: 'Vincent van Gogh',
            incorrectAnswers: ['Monet', 'Picasso', 'Rembrandt'],
            difficulty: 'easy',
          },
          {
            question: 'What is the term for a painting done on wet plaster?',
            correctAnswer: 'Fresco',
            incorrectAnswers: ['Mosaic', 'Oil Painting', 'Watercolor'],
            difficulty: 'medium',
          },
          {
            question: 'Who sculpted "David"?',
            correctAnswer: 'Michelangelo',
            incorrectAnswers: ['Donatello', 'Bernini', 'Rodin'],
            difficulty: 'medium',
          },
        ],
      },
      {
        name: 'World History',
        questions: [
          {
            question: 'Who was the first emperor of Rome?',
            correctAnswer: 'Augustus',
            incorrectAnswers: ['Julius Caesar', 'Nero', 'Caligula'],
            difficulty: 'medium',
          },
          {
            question: 'What year did World War II end?',
            correctAnswer: '1945',
            incorrectAnswers: ['1944', '1946', '1947'],
            difficulty: 'easy',
          },
          {
            question: 'What was the name of the ship that carried the Pilgrims to America?',
            correctAnswer: 'Mayflower',
            incorrectAnswers: ['Santa Maria', 'Titanic', 'Beagle'],
            difficulty: 'medium',
          },
          {
            question: 'Who was the leader of the Soviet Union during World War II?',
            correctAnswer: 'Joseph Stalin',
            incorrectAnswers: ['Vladimir Lenin', 'Nikita Khrushchev', 'Leon Trotsky'],
            difficulty: 'medium',
          },
          {
            question: 'What was the name of the treaty that ended World War I?',
            correctAnswer: 'Treaty of Versailles',
            incorrectAnswers: ['Treaty of Paris', 'Treaty of Ghent', 'Treaty of Tordesillas'],
            difficulty: 'medium',
          },
        ],
      },
      {
        name: 'Sports',
        questions: [
          {
            question: 'How many players are on a soccer team on the field?',
            correctAnswer: '11',
            incorrectAnswers: ['10', '12', '13'],
            difficulty: 'easy',
          },
          {
            question: 'What is the national sport of Japan?',
            correctAnswer: 'Sumo Wrestling',
            incorrectAnswers: ['Baseball', 'Judo', 'Karate'],
            difficulty: 'medium',
          },
          {
            question: 'Who has won the most Grand Slam titles in tennis?',
            correctAnswer: 'Novak Djokovic',
            incorrectAnswers: ['Roger Federer', 'Rafael Nadal', 'Pete Sampras'],
            difficulty: 'hard',
          },
          {
            question: 'What is the term for three strikes in a row in bowling?',
            correctAnswer: 'Turkey',
            incorrectAnswers: ['Hat Trick', 'Triple', 'Strikeout'],
            difficulty: 'easy',
          },
          {
            question: 'In which sport would you perform a slam dunk?',
            correctAnswer: 'Basketball',
            incorrectAnswers: ['Volleyball', 'Tennis', 'Baseball'],
            difficulty: 'easy',
          },
          {
            question: 'What is the national sport of Canada?',
            correctAnswer: 'Lacrosse',
            incorrectAnswers: ['Ice Hockey', 'Baseball', 'Soccer'],
            difficulty: 'easy',
          },
          {
            question: 'What color flag is waved in motor racing to indicate the winner?',
            correctAnswer: 'Checkered',
            incorrectAnswers: ['Red', 'Yellow', 'Green'],
            difficulty: 'easy',
          },
          {
            question: 'Which sport is known as "the beautiful game"?',
            correctAnswer: 'Soccer',
            incorrectAnswers: ['Basketball', 'Tennis', 'Cricket'],
            difficulty: 'easy',
          },
          {
            question: 'What is the maximum score in a single frame of bowling?',
            correctAnswer: '30',
            incorrectAnswers: ['20', '40', '50'],
            difficulty: 'easy',
          },
          {
            question: 'What sport uses a net, a shuttlecock, and rackets?',
            correctAnswer: 'Badminton',
            incorrectAnswers: ['Tennis', 'Volleyball', 'Squash'],
            difficulty: 'easy',
          },
          {
            question: 'In which sport would you find a pommel horse?',
            correctAnswer: 'Gymnastics',
            incorrectAnswers: ['Equestrian', 'Wrestling', 'Fencing'],
            difficulty: 'easy',
          },
          {
            question: 'What is the name of the area where baseball pitchers stand?',
            correctAnswer: 'Pitcher’s mound',
            incorrectAnswers: ['Home plate', 'Outfield', 'Dugout'],
            difficulty: 'easy',
          },
        ],
      },
      {
        name: 'History',
        questions: [
          {
            question: 'Who discovered America in 1492?',
            correctAnswer: 'Christopher Columbus',
            incorrectAnswers: ['Ferdinand Magellan', 'Vasco da Gama', 'Amerigo Vespucci'],
            difficulty: 'easy',
          },
          {
            question: 'What was the name of the ship Charles Darwin sailed on?',
            correctAnswer: 'HMS Beagle',
            incorrectAnswers: ['HMS Victory', 'HMS Endeavour', 'HMS Discovery'],
            difficulty: 'medium',
          },
          {
            question: 'Who was the first President of the United States?',
            correctAnswer: 'George Washington',
            incorrectAnswers: ['John Adams', 'Thomas Jefferson', 'James Madison'],
            difficulty: 'easy',
          },
          {
            question: 'What year did the Berlin Wall fall?',
            correctAnswer: '1989',
            incorrectAnswers: ['1988', '1990', '1991'],
            difficulty: 'medium',
          },
          {
            question: 'What was the name of the first manned mission to land on the moon?',
            correctAnswer: 'Apollo 11',
            incorrectAnswers: ['Apollo 10', 'Apollo 12', 'Apollo 13'],
            difficulty: 'medium',
          },
        ],
      },
      {
        name: 'Technology',
        questions: [
          {
            question: 'Who is known as the father of the computer?',
            correctAnswer: 'Charles Babbage',
            incorrectAnswers: ['Alan Turing', 'John von Neumann', 'Steve Jobs'],
            difficulty: 'medium',
          },
          {
            question: 'What does "HTTP" stand for?',
            correctAnswer: 'HyperText Transfer Protocol',
            incorrectAnswers: ['HyperText Transmission Protocol', 'HyperText Transfer Process', 'HyperText Transfer Path'],
            difficulty: 'easy',
          },
          {
            question: 'What year was the first iPhone released?',
            correctAnswer: '2007',
            incorrectAnswers: ['2006', '2008', '2009'],
            difficulty: 'medium',
          },
          {
            question: 'What is the name of the first programmable computer?',
            correctAnswer: 'ENIAC',
            incorrectAnswers: ['UNIVAC', 'Z3', 'Colossus'],
            difficulty: 'hard',
          },
          {
            question: 'What does "CPU" stand for?',
            correctAnswer: 'Central Processing Unit',
            incorrectAnswers: ['Central Programming Unit', 'Computer Processing Unit', 'Core Processing Unit'],
            difficulty: 'easy',
          },
        ],
      },
      {
        name: 'General Knowledge',
        questions: [
          {
            question: 'What is the capital of Australia?',
            correctAnswer: 'Canberra',
            incorrectAnswers: ['Sydney', 'Melbourne', 'Brisbane'],
            difficulty: 'easy',
          },
          {
            question: 'What is the largest planet in our solar system?',
            correctAnswer: 'Jupiter',
            incorrectAnswers: ['Saturn', 'Earth', 'Neptune'],
            difficulty: 'easy',
          },
          {
            question: 'Who wrote "Romeo and Juliet"?',
            correctAnswer: 'William Shakespeare',
            incorrectAnswers: ['Charles Dickens', 'Jane Austen', 'Mark Twain'],
            difficulty: 'medium',
          },
          {
            question: 'What is the chemical symbol for gold?',
            correctAnswer: 'Au',
            incorrectAnswers: ['Ag', 'Fe', 'Pb'],
            difficulty: 'medium',
          },
          {
            question: 'What is the hardest natural substance on Earth?',
            correctAnswer: 'Diamond',
            incorrectAnswers: ['Graphite', 'Quartz', 'Steel'],
            difficulty: 'easy',
          },
        ],
      },
      {
        name: 'Science',
        questions: [
          {
            question: 'What is the chemical symbol for water?',
            correctAnswer: 'H2O',
            incorrectAnswers: ['O2', 'CO2', 'H2'],
            difficulty: 'easy',
          },
          {
            question: 'What planet is known as the Red Planet?',
            correctAnswer: 'Mars',
            incorrectAnswers: ['Venus', 'Jupiter', 'Saturn'],
            difficulty: 'easy',
          },
          {
            question: 'What is the powerhouse of the cell?',
            correctAnswer: 'Mitochondria',
            incorrectAnswers: ['Nucleus', 'Ribosome', 'Golgi Apparatus'],
            difficulty: 'medium',
          },
          {
            question: 'What is the speed of light?',
            correctAnswer: '299,792 km/s',
            incorrectAnswers: ['150,000 km/s', '1,000,000 km/s', '500,000 km/s'],
            difficulty: 'hard',
          },
          {
            question: 'Who developed the theory of relativity?',
            correctAnswer: 'Albert Einstein',
            incorrectAnswers: ['Isaac Newton', 'Galileo Galilei', 'Nikola Tesla'],
            difficulty: 'medium',
          },
        ],
      },
      {
        name: 'Geography',
        questions: [
          {
            question: 'What is the largest desert in the world?',
            correctAnswer: 'Arctic Desert',
            incorrectAnswers: ['Gobi Desert', 'Kalahari Desert', 'Sahara Desert'],
            difficulty: 'medium',
          },
          {
            question: 'What is the capital of Canada?',
            correctAnswer: 'Ottawa',
            incorrectAnswers: ['Toronto', 'Vancouver', 'Montreal'],
            difficulty: 'easy',
          },
          {
            question: 'What is the longest river in the world?',
            correctAnswer: 'Nile River',
            incorrectAnswers: ['Amazon River', 'Yangtze River', 'Mississippi River'],
            difficulty: 'medium',
          },
          {
            question: 'What country has the most islands?',
            correctAnswer: 'Sweden',
            incorrectAnswers: ['Indonesia', 'Philippines', 'Canada'],
            difficulty: 'medium',
          },
          {
            question: 'What is the smallest country in the world?',
            correctAnswer: 'Vatican City',
            incorrectAnswers: ['Monaco', 'San Marino', 'Liechtenstein'],
            difficulty: 'easy',
          },
        ],
      },
      {
        name: 'Literature',
        questions: [
          {
            question: 'Who wrote "Pride and Prejudice"?',
            correctAnswer: 'Jane Austen',
            incorrectAnswers: ['Charlotte Brontë', 'Emily Brontë', 'Mary Shelley'],
            difficulty: 'medium',
          },
          {
            question: 'What is the name of the wizarding school in "Harry Potter"?',
            correctAnswer: 'Hogwarts',
            incorrectAnswers: ['Durmstrang', 'Beauxbatons', 'Ilvermorny'],
            difficulty: 'easy',
          },
          {
            question: 'Who wrote "The Great Gatsby"?',
            correctAnswer: 'F. Scott Fitzgerald',
            incorrectAnswers: ['Ernest Hemingway', 'John Steinbeck', 'Mark Twain'],
            difficulty: 'medium',
          },
          {
            question: 'What is the first book of the Bible?',
            correctAnswer: 'Genesis',
            incorrectAnswers: ['Exodus', 'Leviticus', 'Numbers'],
            difficulty: 'easy',
          },
          {
            question: 'Who wrote "Moby-Dick"?',
            correctAnswer: 'Herman Melville',
            incorrectAnswers: ['Nathaniel Hawthorne', 'Edgar Allan Poe', 'Jack London'],
            difficulty: 'medium',
          },
        ],
      },
      {
        name: 'Entertainment',
        questions: [
          {
            question: 'Who directed "Titanic"?',
            correctAnswer: 'James Cameron',
            incorrectAnswers: ['Steven Spielberg', 'Christopher Nolan', 'Ridley Scott'],
            difficulty: 'medium',
          },
          {
            question: 'What is the highest-grossing movie of all time?',
            correctAnswer: 'Avatar',
            incorrectAnswers: ['Avengers: Endgame', 'Titanic', 'Star Wars: The Force Awakens'],
            difficulty: 'medium',
          },
          {
            question: 'Who played Iron Man in the Marvel Cinematic Universe?',
            correctAnswer: 'Robert Downey Jr.',
            incorrectAnswers: ['Chris Evans', 'Chris Hemsworth', 'Mark Ruffalo'],
            difficulty: 'easy',
          },
          {
            question: 'What is the name of the fictional continent in "Game of Thrones"?',
            correctAnswer: 'Westeros',
            incorrectAnswers: ['Essos', 'Middle-earth', 'Narnia'],
            difficulty: 'medium',
          },
          {
            question: 'Who is the voice of Woody in "Toy Story"?',
            correctAnswer: 'Tom Hanks',
            incorrectAnswers: ['Tim Allen', 'Billy Crystal', 'Robin Williams'],
            difficulty: 'easy',
          },
        ],
      },
    ];

    // Insert categories and questions into the database
    for (const categoryData of data) {
      const category = await Category.create({ name: categoryData.name });
      console.log(`Category created: ${category.name} (ID: ${category.id})`);
    
      for (const questionData of categoryData.questions) {
        const question = await Question.create({
          categoryId: category.id,
          ...questionData,
        });
        console.log(
          `Question created: "${question.question}" (Category: ${category.name}, Difficulty: ${question.difficulty})`
        );
      }
    }

    console.log('Database populated successfully!');
    return true;
  } catch (error) {
    console.error('Error populating database:', error);
    return false;
  }
};

// Run directly if this script is executed
if (require.main === module) {
  // Reset the database when run directly
  sequelize.sync({ force: true })
    .then(() => populateDatabase())
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error running populateDatabase directly:', error);
      process.exit(1);
    });
}

module.exports = { populateDatabase };