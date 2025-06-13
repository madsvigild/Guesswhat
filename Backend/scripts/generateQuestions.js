// Backend/scripts/generateQuestions.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') }); 

console.log('GEMINI_API_KEY (first 5 chars):', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 5) + '...' : 'Not loaded');

const { connectDB, sequelize } = require('../src/config/db');
const Question = require('../src/models/Question');
const Category = require('../src/models/Category'); 
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Create cache directory if it doesn't exist
const CACHE_DIR = path.join(__dirname, 'cache');
const ensureCacheDir = async () => {
  try {
    await fs.access(CACHE_DIR);
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  }
};

// Configuration for themed question generation
const CATEGORIES_CONFIG = {
  'Philosophy': {
    themes: [
      'Ancient Greek Philosophy',
      'Modern Western Philosophy', 
      'Eastern Philosophy and Buddhism',
      'Ethics and Moral Philosophy',
      'Logic and Reasoning',
      'Existentialism and Phenomenology',
      'Political Philosophy',
      'Philosophy of Mind and Consciousness'
    ],
    guidelines: `
      - Cover major philosophical movements and thinkers
      - Include both Western and Eastern philosophical traditions
      - Mix theoretical concepts with practical applications
      - Make complex ideas accessible for different difficulty levels
    `
  },
  'Mythology': {
    themes: [
      'Greek and Roman Mythology',
      'Norse Mythology',
      'Egyptian Mythology',
      'Celtic and Germanic Myths',
      'Asian Mythology (Chinese, Japanese, Hindu)',
      'Native American and Indigenous Myths',
      'African and Middle Eastern Mythology',
      'Modern Mythology and Urban Legends'
    ],
    guidelines: `
      - Cover mythologies from diverse cultures worldwide
      - Include gods, heroes, creatures, and creation stories
      - Mix well-known myths with lesser-known but interesting ones
      - Connect mythological themes to modern culture
    `
  },
  'Art': {
    themes: [
      'Renaissance Art and Masters',
      'Modern and Contemporary Art',
      'Impressionism and Post-Impressionism',
      'Sculpture and Three-Dimensional Art',
      'Art Movements and Styles',
      'Famous Artists and Their Works',
      'Art Techniques and Materials',
      'Architecture and Design'
    ],
    guidelines: `
      - Cover different art periods, styles, and movements
      - Include various art forms: painting, sculpture, architecture
      - Mix famous masterpieces with interesting art facts
      - Include both traditional and contemporary art
    `
  },
  'World History': {
    themes: [
      'Ancient Civilizations Worldwide',
      'Medieval Period Across Cultures',
      'Age of Exploration and Colonization',
      '20th Century Global Events',
      'Revolutions and Social Movements',
      'World Wars and International Conflicts',
      'Cultural Exchange and Trade Routes',
      'Historical Figures and Leaders'
    ],
    guidelines: `
      - Focus on global historical events and figures
      - Include perspectives from different continents
      - Cover major historical turning points
      - Balance political, social, and cultural history
    `
  },
  'Sports': {
    themes: [
      'Olympic Games and Records',
      'Professional Team Sports',
      'Individual Sports and Athletes',
      'Sports History and Legendary Moments',
      'International Competitions',
      'Extreme and Adventure Sports',
      'Sports Rules and Regulations',
      'Sports Statistics and Records'
    ],
    guidelines: `
      - Cover major sports from around the world
      - Include both team and individual sports
      - Mix current athletes with sports legends
      - Add interesting sports trivia and records
    `
  },
  'Technology': {
    themes: [
      'Computer Science and Programming',
      'Internet and Digital Revolution',
      'Mobile Technology and Apps',
      'Artificial Intelligence and Robotics',
      'Historical Inventions and Innovations',
      'Modern Tech Companies and Founders',
      'Emerging Technologies',
      'Technology in Daily Life'
    ],
    guidelines: `
      - Cover both historical and cutting-edge technology
      - Include hardware, software, and digital concepts
      - Mix technical knowledge with accessible facts
      - Include impact of technology on society
    `
  },
  'General Knowledge': {
    themes: [
      'Random Facts and Trivia',
      'Common Knowledge and Everyday Facts',
      'World Records and Achievements',
      'Language and Communication',
      'Holidays and Traditions',
      'Money, Economics, and Business',
      'Transportation and Travel',
      'Miscellaneous Interesting Facts'
    ],
    guidelines: `
      - Cover diverse topics that don't fit other categories
      - Include everyday knowledge and common facts
      - Mix serious topics with fun, quirky trivia
      - Ensure broad appeal across different interests
    `
  },
  'Science': {
    themes: [
      'Space and Astronomy',
      'Human Biology and Medicine',
      'Physics and Chemistry Fundamentals',
      'Environmental Science and Climate',
      'Technology and Innovation',
      'Famous Scientists and Discoveries',
      'Nature and Animal Kingdom',
      'Medical Breakthroughs and Health'
    ],
    guidelines: `
      - Balance physics, chemistry, biology, astronomy, and technology
      - Include both theoretical concepts and practical applications
      - Mix historical discoveries with current research
      - Avoid overly technical jargon for Easy/Medium questions
    `
  },
  'Geography': {
    themes: [
      'Countries and Capitals',
      'Physical Geography and Landmarks',
      'Rivers, Mountains, and Natural Features',
      'Climate and Weather Patterns',
      'Cultural Geography and Demographics',
      'Cities and Urban Planning',
      'Natural Disasters and Phenomena',
      'Maps and Cartography'
    ],
    guidelines: `
      - Mix physical geography, countries, capitals, and landmarks
      - Include cultural geography and demographics
      - Cover all continents proportionally
      - Add interesting geographical phenomena
    `
  },
  'Literature': {
    themes: [
      'Classic Literature and Authors',
      'Modern and Contemporary Literature',
      'Poetry and Poets',
      'Novels and Novelists',
      'Plays and Playwrights',
      'Literary Movements and Genres',
      'Book Awards and Recognition',
      'Characters and Plot Elements'
    ],
    guidelines: `
      - Cover literature from different time periods and cultures
      - Include various genres: fiction, poetry, drama
      - Mix well-known classics with contemporary works
      - Include both authors and their famous works
    `
  },
  'Entertainment': {
    themes: [
      'Classic Hollywood Movies (1930s-1970s)',
      'Modern Blockbusters and Franchises',
      'Television and Streaming Series',
      'Music Across Genres and Decades',
      'Celebrity Culture and Awards',
      'Video Games and Gaming Culture',
      'Theater and Broadway',
      'Animation and Animated Films'
    ],
    guidelines: `
      - Mix movies, TV, music, books, gaming, and celebrities
      - Include both mainstream and cult classics
      - Cover different genres and eras
      - Add some behind-the-scenes trivia
    `
  }
};

const BATCH_SIZE = 25; // Optimal batch size for cost efficiency
const MAX_RETRIES = 3;

// Utility functions
function getCategorySpecificGuidelines(categoryName) {
  const config = CATEGORIES_CONFIG[categoryName];
  return config ? config.guidelines : '';
}

function calculateSimilarity(str1, str2) {
  const words1 = new Set(str1.toLowerCase().split(/\s+/));
  const words2 = new Set(str2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size; // Jaccard similarity
}

function generateQuestionHash(question) {
  return crypto.createHash('md5')
    .update(question.toLowerCase().replace(/[^\w]/g, ''))
    .digest('hex');
}

async function checkForDuplicates(newQuestions) {
  const existingQuestions = await Question.findAll({
    attributes: ['question', 'correctAnswer']
  });
  
  const existingHashes = new Set(
    existingQuestions.map(q => generateQuestionHash(q.question))
  );
  
  return newQuestions.filter(newQ => {
    const hash = generateQuestionHash(newQ.question);
    
    if (existingHashes.has(hash)) {
      console.log(`Duplicate detected: ${newQ.question}`);
      return false;
    }
    
    existingHashes.add(hash);
    return true;
  });
}

async function filterSimilarQuestions(questions, threshold = 0.7) {
  const filtered = [];
  
  for (const question of questions) {
    const isSimilar = filtered.some(existing => 
      calculateSimilarity(question.question, existing.question) > threshold
    );
    
    if (!isSimilar) {
      filtered.push(question);
    } else {
      console.log(`Similar question filtered: ${question.question}`);
    }
  }
  
  return filtered;
}

function validateQuestionQuality(questions) {
  const validated = [];
  const rejected = [];
  
  for (const q of questions) {
    const issues = [];
    
    // Check for required fields
    if (!q.question || !q.correctAnswer || !q.incorrectAnswers || !Array.isArray(q.incorrectAnswers)) {
      issues.push('Missing required fields');
    }
    
    // Check for exactly 3 incorrect answers
    if (q.incorrectAnswers && q.incorrectAnswers.length !== 3) {
      issues.push('Must have exactly 3 incorrect answers');
    }
    
    // Check answer uniqueness
    if (q.correctAnswer && q.incorrectAnswers) {
      const allAnswers = [q.correctAnswer, ...q.incorrectAnswers];
      if (new Set(allAnswers).size !== allAnswers.length) {
        issues.push('Duplicate answers');
      }
    }
    
    // Check question length (not too short/long)
    if (q.question && (q.question.length < 10 || q.question.length > 300)) {
      issues.push('Question length inappropriate');
    }
    
    // Check for valid difficulty
    if (!['Easy', 'Medium', 'Hard'].includes(q.difficulty)) {
      issues.push('Invalid difficulty level');
    }
    
    // Check for empty answers
    if (q.correctAnswer && q.incorrectAnswers) {
      const allAnswers = [q.correctAnswer, ...q.incorrectAnswers];
      if (allAnswers.some(answer => !answer || answer.trim().length === 0)) {
        issues.push('Empty or whitespace-only answers');
      }
    }
    
    if (issues.length === 0) {
      validated.push(q);
    } else {
      rejected.push({ question: q, issues });
      console.log(`❌ Rejected: ${q.question || 'Unknown question'} - Issues: ${issues.join(', ')}`);
    }
  }
  
  console.log(`✅ Validated: ${validated.length}, ❌ Rejected: ${rejected.length}`);
  return validated;
}

async function generateThemedBatch(categoryName, theme, count = BATCH_SIZE) {
  console.log(`  🎯 Generating ${count} questions for theme: ${theme}`);
  
  const difficultyDistribution = {
    Easy: Math.floor(count * 0.4),
    Medium: Math.floor(count * 0.4),
    Hard: Math.floor(count * 0.2)
  };
  
  // Adjust for rounding
  const remaining = count - (difficultyDistribution.Easy + difficultyDistribution.Medium + difficultyDistribution.Hard);
  difficultyDistribution.Medium += remaining;
  
  const themedPrompt = `
    You are an expert trivia writer creating engaging, diverse questions for a competitive quiz app.
    
    Generate ${count} unique trivia questions specifically about: "${theme}"
    Category: ${categoryName}
    
    DISTRIBUTION REQUIREMENTS:
    - ${difficultyDistribution.Easy} Easy questions (basic knowledge, widely known facts)
    - ${difficultyDistribution.Medium} Medium questions (moderate knowledge, some thinking required)
    - ${difficultyDistribution.Hard} Hard questions (specialized knowledge, challenging but fair)
    
    THEME FOCUS:
    Focus entirely on "${theme}" while maintaining variety within this theme.
    Make questions engaging and cover different aspects of the theme.
    
    QUALITY REQUIREMENTS:
    - Answers must be unambiguous and factually accurate
    - Incorrect answers should be plausible but clearly wrong
    - Questions should be interesting and engaging, not just memorization
    - Avoid overly obscure knowledge unless marked "Hard"
    - Each question should test different knowledge within the theme
    
    AVOID:
    - Generic or boring questions
    - Questions that could have multiple correct interpretations
    - Answers that are too similar to each other
    - Outdated information (unless historically relevant)
    - Questions that are too easy for their difficulty level
    - Questions that are impossibly hard
    
    ${getCategorySpecificGuidelines(categoryName)}
    
    STRICT FORMAT REQUIREMENTS:
    - Return ONLY a JSON array with no markdown formatting
    - Each question object must have exactly these fields: question, correctAnswer, incorrectAnswers, difficulty, categoryName
    - incorrectAnswers must be an array of exactly 3 strings
    - difficulty must be exactly "Easy", "Medium", or "Hard"
    - categoryName must be exactly "${categoryName}"
    
    JSON Structure:
    [
      {
        "question": "Your engaging question here?",
        "correctAnswer": "The correct answer",
        "incorrectAnswers": ["Wrong answer 1", "Wrong answer 2", "Wrong answer 3"],
        "difficulty": "Easy",
        "categoryName": "${categoryName}"
      }
    ]
  `;
  
  let retryCount = 0;
  
  while (retryCount < MAX_RETRIES) {
    try {
      const result = await model.generateContent(themedPrompt);
      const response = await result.response;
      let text = response.text();
      
      // Extract JSON from markdown if present
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        text = jsonMatch[1];
      }
      
      // Try to parse JSON
      let questionsData;
      try {
        questionsData = JSON.parse(text);
        if (!Array.isArray(questionsData)) {
          throw new Error("Response was not an array.");
        }
      } catch (jsonError) {
        console.error(`❌ JSON Parse Error (attempt ${retryCount + 1}):`, jsonError.message);
        if (retryCount === MAX_RETRIES - 1) {
          console.error("Raw response:", text.substring(0, 500) + "...");
          throw jsonError;
        }
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      
      // Validate and filter questions
      const validatedQuestions = validateQuestionQuality(questionsData);
      const uniqueQuestions = await checkForDuplicates(validatedQuestions);
      const filteredQuestions = await filterSimilarQuestions(uniqueQuestions);
      
      if (filteredQuestions.length === 0) {
        console.log(`⚠️  No valid questions generated for theme: ${theme}. Retrying...`);
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      
      // Cache the successful generation
      await ensureCacheDir();
      const cacheFile = path.join(CACHE_DIR, `${categoryName}_${theme.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.json`);
      try {
        await fs.writeFile(cacheFile, JSON.stringify(filteredQuestions, null, 2));
        console.log(`  💾 Cached ${filteredQuestions.length} questions to: ${path.basename(cacheFile)}`);
      } catch (cacheError) {
        console.warn('  ⚠️  Failed to cache questions:', cacheError.message);
      }
      
      return filteredQuestions;
      
    } catch (error) {
      retryCount++;
      console.error(`❌ Generation error (attempt ${retryCount}):`, error.message);
      
      if (retryCount === MAX_RETRIES) {
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, retryCount) * 1000;
      console.log(`  ⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function insertQuestionsToDatabase(questions) {
  let insertedCount = 0;
  
  for (const qData of questions) {
    try {
      // Find or Create Category
      const [category, created] = await Category.findOrCreate({
        where: { name: qData.categoryName },
        defaults: { name: qData.categoryName },
      });
      
      if (created) {
        console.log(`  ➕ Created new category: ${qData.categoryName}`);
      }
      
      // Insert Question
      await Question.create({
        categoryId: category.id,
        question: qData.question,
        correctAnswer: qData.correctAnswer,
        incorrectAnswers: qData.incorrectAnswers,
        difficulty: qData.difficulty,
      });
      
      insertedCount++;
      
    } catch (error) {
      console.error(`❌ Failed to insert question: "${qData.question}" - ${error.message}`);
    }
  }
  
  console.log(`  ✅ Inserted ${insertedCount} questions to database`);
  return insertedCount;
}

async function generateWithThemes() {
  console.log('\n🚀 Starting themed question generation...\n');
  
  let totalGenerated = 0;
  let totalInserted = 0;
  
  for (const [categoryName, config] of Object.entries(CATEGORIES_CONFIG)) {
    console.log(`\n📁 === Generating questions for ${categoryName} ===`);
    
    let categoryGenerated = 0;
    let categoryInserted = 0;
    
    for (const theme of config.themes) {
      try {
        // Add delay between API calls to avoid rate limits
        if (categoryGenerated > 0) {
          console.log('  ⏳ Waiting 3 seconds to avoid rate limits...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        const questions = await generateThemedBatch(categoryName, theme);
        const inserted = await insertQuestionsToDatabase(questions);
        
        categoryGenerated += questions.length;
        categoryInserted += inserted;
        
      } catch (error) {
        console.error(`❌ Failed to generate questions for theme "${theme}": ${error.message}`);
      }
    }
    
    console.log(`\n📊 ${categoryName} Summary: Generated ${categoryGenerated}, Inserted ${categoryInserted}`);
    totalGenerated += categoryGenerated;
    totalInserted += categoryInserted;
  }
  
  console.log(`\n🎉 GENERATION COMPLETE!`);
  console.log(`📊 Total Generated: ${totalGenerated}`);
  console.log(`💾 Total Inserted: ${totalInserted}`);
  
  return { totalGenerated, totalInserted };
}

async function getCategoryStats() {
  try {
    const stats = await sequelize.query(`
      SELECT 
        c.name as category,
        q.difficulty,
        COUNT(q.id) as count
      FROM Categories c
      LEFT JOIN Questions q ON c.id = q.categoryId
      GROUP BY c.name, q.difficulty
      ORDER BY c.name, q.difficulty
    `, { type: sequelize.QueryTypes.SELECT });
    
    return stats;
  } catch (error) {
    console.error('Error getting category stats:', error);
    return [];
  }
}

async function displayCategoryStats(title) {
  console.log(`\n📈 ${title}`);
  console.log('=' .repeat(50));
  
  const stats = await getCategoryStats();
  const categoryTotals = {};
  
  stats.forEach(stat => {
    if (!categoryTotals[stat.category]) {
      categoryTotals[stat.category] = { Easy: 0, Medium: 0, Hard: 0, Total: 0 };
    }
    
    if (stat.difficulty) {
      categoryTotals[stat.category][stat.difficulty] = stat.count;
      categoryTotals[stat.category].Total += stat.count;
    }
  });
  
  console.log('Category'.padEnd(20) + 'Easy'.padEnd(8) + 'Medium'.padEnd(8) + 'Hard'.padEnd(8) + 'Total');
  console.log('-'.repeat(50));
  
  Object.entries(categoryTotals).forEach(([category, counts]) => {
    console.log(
      category.padEnd(20) + 
      counts.Easy.toString().padEnd(8) + 
      counts.Medium.toString().padEnd(8) + 
      counts.Hard.toString().padEnd(8) + 
      counts.Total.toString()
    );
  });
  
  const grandTotal = Object.values(categoryTotals).reduce((sum, counts) => sum + counts.Total, 0);
  console.log('-'.repeat(50));
  console.log('TOTAL'.padEnd(44) + grandTotal.toString());
  
  return categoryTotals;
}

async function masterGenerationPipeline() {
  console.log('🎯 GuessWhat Trivia Question Generation Pipeline');
  console.log('=' .repeat(50));
  
  await connectDB();
  
  try {
    // Display initial stats
    await displayCategoryStats('INITIAL DATABASE STATS');
    
    // Generate questions with themes
    const results = await generateWithThemes();
    
    // Display final stats
    await displayCategoryStats('FINAL DATABASE STATS');
    
    console.log(`\n✨ Pipeline completed successfully!`);
    console.log(`📊 Generated ${results.totalGenerated} questions, inserted ${results.totalInserted}`);
    
  } catch (error) {
    console.error('❌ Pipeline error:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Legacy function for backward compatibility
async function generateAndInsertQuestions() {
  await connectDB(); 

  try {
    const prompt = `
      You are a trivia question generator. Generate a list of 45 trivia questions
      in JSON format, adhering strictly to the provided structure.
      Each question must have:
      - 'question': The trivia question text.
      - 'correctAnswer': The single correct answer.
      - 'incorrectAnswers': An array of exactly 3 incorrect answers.
      - 'difficulty': Must be "Easy", "Medium", or "Hard".
      - 'categoryName': Must be "Entertainment".
      
      Ensure all answers are distinct, relevant, and grammatically correct.
      When generating questions, consider a variety of topics within the category.
      This prompt will be used several times, so ensure the questions are diverse and not repetitive.
      Do not include any introductory or concluding text outside the JSON.
      The entire output must be a single JSON array of question objects.

      JSON Structure:
      [
        {
          "question": "Who played the character of Jack in the movie Titanic?",
          "correctAnswer": "Leonardo DiCaprio",
          "incorrectAnswers": ["Brad Pitt", "Johnny Depp", "Tom Cruise"],
          "difficulty": "Easy",
          "categoryName": "Entertainment"
        },
        {
          "question": "Which TV show features the character Walter White?",
          "correctAnswer": "Breaking Bad",
          "incorrectAnswers": ["The Sopranos", "Mad Men", "Dexter"],
          "difficulty": "Medium",
          "categoryName": "Entertainment"
        },
        {
          "question": "What is the name of the fictional country in the movie Black Panther?",
          "correctAnswer": "Wakanda",
          "incorrectAnswers": ["Zamunda", "Genovia", "Latveria"],
          "difficulty": "Hard",
          "categoryName": "Entertainment"
        },
        // ... more question objects ...
      ]
    `;

    console.log("Sending prompt to Gemini API...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text(); // Get the raw text from the AI

    console.log("Received response from Gemini API.");
    // console.log("Raw AI response:", text); // Uncomment for debugging raw AI output

    // --- FIX: Extract JSON from Markdown Code Block ---
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      text = jsonMatch[1]; // Use the content inside the ```json block
    } else {
      // If no markdown block, assume the text is already raw JSON (less common for Gemini structured output)
      console.warn("AI response did not contain a JSON markdown block. Attempting to parse raw text.");
    }
    // --- END FIX ---

    // --- TODO: Parse and Validate JSON ---
    let questionsData;
    try {
      questionsData = JSON.parse(text);
      if (!Array.isArray(questionsData)) {
        throw new Error("AI response was not an array.");
      }
    } catch (jsonError) {
      console.error("Error parsing JSON from AI:", jsonError);
      console.error("Malformed AI response:", text);
      return; 
    }

    // --- TODO: Insert Questions into Database ---
    for (const qData of questionsData) {
      console.log(`Processing question: "${qData.question}" in category "${qData.categoryName}"`);

      // Find or Create Category
      const [category, created] = await Category.findOrCreate({
        where: { name: qData.categoryName },
        defaults: { name: qData.categoryName },
      });

      // Insert Question
      await Question.create({
        categoryId: category.id,
        question: qData.question,
        correctAnswer: qData.correctAnswer,
        incorrectAnswers: qData.incorrectAnswers,
        difficulty: qData.difficulty,
      });
      console.log(`Successfully added question: "${qData.question}"`);
    }

    console.log("All questions processed and inserted successfully!");

  } catch (error) {
    console.error("Error during question generation or insertion:", error);
  } finally {
    await sequelize.close();
    console.log("Database connection closed.");
  }
}

masterGenerationPipeline(); // Run the new master pipeline
//generateAndInsertQuestions(); // Keep the legacy function for now

// Example usage of a custom prompt with specific category/difficulty (for future use)
async function generateSpecificQuestions(categoryName, difficulty, limit = 10, theme = '') {
  const specificPrompt = `
    You are a trivia question generator. Generate a list of ${limit} trivia questions
    in JSON format, adhering strictly to the provided structure.
    Each question must have:
    - 'question': The trivia question text.
    - 'correctAnswer': The single correct answer.
    - 'incorrectAnswers': An array of exactly 3 incorrect answers.
    - 'difficulty': Must be "${difficulty}".
    - 'categoryName': Must be "${categoryName}".

    Ensure all answers are distinct and relevant. Do not include any introductory or concluding text outside the JSON.
    ${theme ? `Focus the questions on the theme: "${theme}".` : ''}

    JSON Structure:
    [
      {
        "question": "...",
        "correctAnswer": "...",
        "incorrectAnswers": ["...", "...", "..."],
        "difficulty": "${difficulty}",
        "categoryName": "${categoryName}"
      }
    ]
  `;
  console.log("Specific prompt for AI (template for future use):", specificPrompt);
}