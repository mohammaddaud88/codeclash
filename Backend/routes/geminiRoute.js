const express = require('express');
const router = express.Router();
const geminiController = require('../controller/geminiController');

// Mount all Gemini controller routes directly
router.get('/learn/:problemId', geminiController.handleLearn);
router.get('/editorial/:problemId', geminiController.handleEditorial);

module.exports = router;