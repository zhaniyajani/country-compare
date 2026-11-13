const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const compareController = require('../controllers/compareController');
const countryController = require('../controllers/countryController');
const validateCompare = require('../middleware/validateCompare');

router.get('/', homeController.showHome);
router.get('/about', homeController.showAbout);
router.post('/compare', validateCompare, compareController.handleCompare);
router.get('/result', validateCompare, compareController.showResult);
router.get('/country/:code', countryController.showCountry);

module.exports = router;
