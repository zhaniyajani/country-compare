const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const compareController = require('../controllers/compareController');
const validateCompare = require('../middleware/validateCompare');

router.get('/', homeController.showHome);

// validateCompare runs first, then the controller
router.post('/compare', validateCompare, compareController.handleCompare);
router.get('/result', validateCompare, compareController.showResult);

module.exports = router;
