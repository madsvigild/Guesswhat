const cron = require('node-cron');
const DailyGame = require('../models/DailyGame'); // Import DailyGame model
const Question = require('../models/Question');   // Import Question model
const Category = require('../models/Category');   // Import Category model
const { sequelize, Op } = require('../config/db'); // Import sequelize and Op for queries
const { GoogleGenerativeAI } = require('@google/generative-ai'); // For LLM generation
const winston = require('winston'); // NEW: Import winston
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') }); // Load .env for API key

// --- Winston Logger Setup (NEW/RESTORED) ---
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/daily-game.log' }),
    new winston.transports.Console()
  ]
});
// --- End Winston Logger Setup ---

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use Gemini for generation here

// --- Helper function to generate current events questions using LLM (Corrected to use retries and expected format) ---
async function generateQuestionsFromLLM(prompt, count, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(`[Scheduler] LLM generation attempt ${attempt}/${retries} for ${count} questions`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Extract JSON from markdown if present
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        text = jsonMatch[1];
      } else {
        logger.warn("[Scheduler] LLM response did not contain a JSON markdown block. Attempting to parse raw text.");
        // Attempt to find raw JSON array in case LLM doesn't use markdown
        const jsonStart = text.indexOf('[');
        const jsonEnd = text.lastIndexOf(']') + 1;
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          text = text.substring(jsonStart, jsonEnd);
        }
      }

      let questionsData;
      try {
        questionsData = JSON.parse(text);
        if (!Array.isArray(questionsData)) {
          throw new Error("LLM response was not an array of questions.");
        }
      } catch (jsonError) {
        logger.error("[Scheduler] Error parsing JSON from LLM:", jsonError);
        throw new Error("Failed to parse LLM response as JSON.");
      }

      // Basic validation for generated questions based on YOUR MODEL'S EXPECTATIONS
      // (question, correctAnswer, incorrectAnswers array of 3)
      const validatedQuestions = questionsData.filter(q => 
        q.question && typeof q.correctAnswer === 'string' && 
        Array.isArray(q.incorrectAnswers) && q.incorrectAnswers.length === 3
      );

      logger.info(`[Scheduler] LLM generated ${validatedQuestions.length} valid questions.`);
      return validatedQuestions;
    } catch (error) {
      logger.error(`[Scheduler] LLM generation attempt ${attempt} failed:`, error.message);
      if (attempt === retries) {
        logger.error('[Scheduler] All LLM generation attempts failed');
        return [];
      }
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
}

// --- Fallback function to get questions when LLM fails ---
async function getFallbackQuestions(count, categoryFilter) {
  try {
    logger.info('[Scheduler] Using fallback questions due to LLM failure');
    
    // Attempt to retrieve categories based on filter, otherwise general ones
    let whereCategory = {};
    if (categoryFilter) {
      const category = await Category.findOne({
        where: { name: { [Op.iLike]: `%${categoryFilter}%` } }
      });
      if (category) {
        whereCategory = { categoryId: category.id };
      } else {
        logger.warn(`[Scheduler] Fallback category "${categoryFilter}" not found.`);
      }
    } else {
      // If no specific category filter, use predefined fallback categories
      const fallbackCategoryNames = ['General Knowledge', 'History', 'Science', 'Geography', 'Entertainment'];
      const availableCategories = await Category.findAll({
        where: { name: { [Op.in]: fallbackCategoryNames } }
      });
      if (availableCategories.length > 0) {
        whereCategory = { categoryId: { [Op.in]: availableCategories.map(c => c.id) } };
      } else {
        logger.warn('[Scheduler] No predefined fallback categories found, retrieving any random questions.');
      }
    }

    const questions = await Question.findAll({
      where: whereCategory, // Apply category filter if determined
      order: [sequelize.fn('RANDOM')],
      limit: count
    });
    
    if (questions.length === 0) {
      throw new Error('No fallback questions available from database.');
    }
    
    return questions.map(q => q.id);
  } catch (error) {
    logger.error('[Scheduler] Error getting fallback questions:', error);
    return []; // Return empty array on fallback error
  }
}

// Function to create a daily game for tomorrow
async function scheduleTomorrowsGame() {
  const transaction = await sequelize.transaction();
  
  try {
    logger.info('[Scheduler] Starting to schedule tomorrow\'s daily game...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Midnight UTC
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    dayAfterTomorrow.setHours(0, 0, 0, 0);

    // Check if a game already exists for tomorrow (within transaction)
    const existingGame = await DailyGame.findOne({
      where: { releaseDate: { [Op.eq]: tomorrow } },
      transaction
    });

    if (existingGame) {
      await transaction.rollback();
      logger.info(`[Scheduler] Daily game for ${tomorrow.toDateString()} already exists. Skipping creation.`);
      return;
    }

    // Theme rotation based on day of week for tomorrow's game
    // Mapped explicitly to your likely existing Category names
    const dayThemes = {
      0: { theme: "Science Sunday", categoryName: "Science" },     // Sunday
      1: { theme: "Music Monday", categoryName: "Entertainment" }, // Monday (Music often falls under Entertainment)
      2: { theme: "Tech Tuesday", categoryName: "Technology" },    // Tuesday
      3: { theme: "World Wednesday", categoryName: "Geography" },  // Wednesday
      4: { theme: "History Thursday", categoryName: "History" },   // Thursday
      5: { theme: "Film Friday", categoryName: "Entertainment" },  // Friday (Film often falls under Entertainment)
      6: { theme: "Sports Saturday", categoryName: "Sports" }      // Saturday
    };

    const dayOfWeek = tomorrow.getDay();
    const { theme: dailyTheme, categoryName: themedCategoryName } = dayThemes[dayOfWeek] || { theme: "General Knowledge Mix", categoryName: "General Knowledge" };
    
    const questionsToGenerate = 5; // Number of current events questions to attempt to generate
    const questionsToFetchFromDB = 5; // Number of themed questions to fetch from DB
    
    let allQuestionIds = [];
    
    // --- Attempt to Generate Current Events Questions (using LLM) ---
    const currentEventsPrompt = `
      Generate ${questionsToGenerate} multiple-choice trivia questions about significant news events, 
      discoveries, or developments that happened in the past week (as of ${new Date().toISOString().split('T')[0]}). 
      Each question must have:
      - 'question': The trivia question text.
      - 'correctAnswer': The single correct answer.
      - 'incorrectAnswers': An array of exactly 3 incorrect answers.
      - 'difficulty': Must be "Medium".
      - 'categoryName': Must be "Current Events".
      
      Ensure all answers are distinct, relevant, and grammatically correct.
      Do not include any introductory or concluding text outside the JSON.
      The entire output must be a single JSON array of question objects.
      JSON Structure: [{"question": "...", "correctAnswer": "...", "incorrectAnswers": ["...", "...", "..."], "difficulty": "Medium", "categoryName": "Current Events"}]
    `;

    let generatedQuestions = await generateQuestionsFromLLM(currentEventsPrompt, questionsToGenerate);
    
    if (generatedQuestions.length > 0) {
      // Save LLM-generated questions to database within transaction
      for (const qData of generatedQuestions) {
        try {
          const [category] = await Category.findOrCreate({ // Find or create 'Current Events' category
            where: { name: qData.categoryName || 'Current Events' },
            defaults: { name: qData.categoryName || 'Current Events' },
            transaction
          });
          
          const newQuestion = await Question.create({
            categoryId: category.id,
            question: qData.question,
            correctAnswer: qData.correctAnswer,
            incorrectAnswers: qData.incorrectAnswers,
            difficulty: qData.difficulty || 'Medium',
            source: 'LLM_Generated_Daily' // Add a source for traceability
          }, { transaction });
          allQuestionIds.push(newQuestion.id);
        } catch (insertError) {
          logger.error(`[Scheduler] Failed to insert LLM generated question "${qData.question}":`, insertError.message);
        }
      }
      logger.info(`[Scheduler] Successfully inserted ${generatedQuestions.length} LLM-generated questions.`);
    } else {
      logger.warn('[Scheduler] LLM generation failed or returned no valid questions. Attempting fallback for current events.');
      const fallbackIds = await getFallbackQuestions(questionsToGenerate, "General Knowledge"); // Fallback for current events
      allQuestionIds = [...allQuestionIds, ...fallbackIds];
    }

    // --- Get Themed Questions from Database ---
    let themedQuestionIds = [];
    if (themedCategoryName) {
      const category = await Category.findOne({
        where: { name: themedCategoryName } // Exact match based on explicit mapping
      });

      if (category) {
        const themedQuestions = await Question.findAll({
          where: { categoryId: category.id },
          order: [sequelize.fn('RANDOM')],
          limit: questionsToFetchFromDB
        });
        themedQuestionIds = themedQuestions.map(q => q.id);
        logger.info(`[Scheduler] Fetched ${themedQuestionIds.length} themed questions for "${themedCategoryName}".`);
      } else {
        logger.warn(`[Scheduler] Category "${themedCategoryName}" not found for themed questions. Using fallback.`);
        const fallbackIds = await getFallbackQuestions(questionsToFetchFromDB, themedCategoryName);
        themedQuestionIds = [...themedQuestionIds, ...fallbackIds];
      }
    } else {
      logger.warn(`[Scheduler] No theme category defined for tomorrow's game. Using fallback for themed questions.`);
      const fallbackIds = await getFallbackQuestions(questionsToFetchFromDB, null); // General fallback
      themedQuestionIds = [...themedQuestionIds, ...fallbackIds];
    }

    // Combine all questions (current events + themed + fallbacks)
    allQuestionIds = [...allQuestionIds, ...themedQuestionIds].slice(0, questionsToGenerate + questionsToFetchFromDB); // Ensure total count doesn't exceed target

    if (allQuestionIds.length === 0) {
      await transaction.rollback();
      throw new Error('No questions available for daily game creation after all attempts. Aborting.');
    }

    // Create the daily game within transaction
    const newGame = await DailyGame.create({
      title: `Daily Challenge: ${dailyTheme} - ${tomorrow.toDateString()}`,
      theme: dailyTheme,
      releaseDate: tomorrow,
      expiryDate: dayAfterTomorrow,
      isActive: true,
      questionIds: allQuestionIds
    }, { transaction });

    await transaction.commit();
    logger.info(`[Scheduler] Successfully created daily game with ID: ${newGame.id} for ${tomorrow.toDateString()}. Total questions: ${newGame.questionIds.length}`);
  } catch (error) {
    await transaction.rollback();
    logger.error('[Scheduler] Error creating tomorrow\'s daily game:', error);
    
    // Additional error details for debugging
    if (error.name === 'SequelizeConnectionError') {
      logger.error('[Scheduler] Database connection error during scheduling');
    } else if (error.name === 'SequelizeValidationError') {
      logger.error('[Scheduler] Validation error:', error.errors?.map(e => e.message));
    }
  }
}

function startScheduler() {
  // Schedule daily at midnight UTC
  cron.schedule('0 0 * * *', async () => {
    logger.info('[Scheduler] Running daily game scheduler job...');
    await scheduleTomorrowsGame();
  });
  
  // Only run immediately if no game exists for today/tomorrow
  checkAndScheduleIfNeeded();
  
  logger.info('[Scheduler] Daily game scheduler initialized.');
}

async function checkAndScheduleIfNeeded() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0); // Midnight UTC
  
  const existingGame = await DailyGame.findOne({
    where: { releaseDate: { [Op.eq]: tomorrow } }
  });
  
  if (!existingGame) {
    logger.info('[Scheduler] No daily game found for tomorrow. Scheduling immediately.');
    await scheduleTomorrowsGame();
  } else {
    logger.info(`[Scheduler] Daily game for ${tomorrow.toDateString()} already exists. No immediate scheduling needed.`);
  }
}

module.exports = { startScheduler };
