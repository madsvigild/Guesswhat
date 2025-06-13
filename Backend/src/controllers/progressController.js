const Progress = require('../models/Progress');

const saveProgress = async (req, res) => {
  try {
    const { playerId, score, achievements } = req.body;

    // Check if progress already exists for the player
    let progress = await Progress.findOne({ where: { playerId } });

    if (progress) {
      // Update existing progress
      progress.score += score; // Increment the score
      progress.achievements = [...new Set([...progress.achievements, ...achievements])]; // Merge achievements
      await progress.save();
    } else {
      // Create new progress
      progress = await Progress.create({ playerId, score, achievements });
    }

    res.status(201).json(progress);
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ error: 'Failed to save progress.' });
  }
};

const getProgress = async (req, res) => {
  try {
    const { playerId } = req.params;

    // Fetch progress for the player
    const progress = await Progress.findOne({ where: { playerId } });

    if (!progress) {
      return res.status(404).json({ error: 'Progress not found for this player.' });
    }

    res.status(200).json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress.' });
  }
};

module.exports = { saveProgress, getProgress };