const express = require('express');
const { saveProgress, getProgress } = require('../controllers/progressController');

const router = express.Router();

router.post('/', saveProgress);
router.get('/:playerId', getProgress);

module.exports = router;