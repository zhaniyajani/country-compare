//routes/index.js : какой адрес ведёт к какой функции контроллера

// What this file does:
//"map" of the site: for every address and method (GET or POST) it says which function must answer 
// The routes only POINT to the functions, the work is done in controllers.

// "require" loads code from another file or package. 'express' package installed with npm
const express = require('express');
// A Router is a small mini app that only holds routes. app.js plugs it in with app.use()
// express.Router() creates a new empty router
const router = express.Router();

const homeController = require('../controllers/homeController');       // showHome, showAbout
const compareController = require('../controllers/compareController'); // handleCompare, showResult
const countryController = require('../controllers/countryController'); // showCountry
const validateCompare = require('../middleware/validateCompare');       // checks the form data 

// router.get(address, function) runs the function when the browser asks for this address with GET
// GET  "give me a page"
router.get('/', homeController.showHome);          // the home page with the form
router.get('/about', homeController.showAbout);    // the about page

// POST: the form data is sent. POST = "take this data"
// Here there are TWO functions after the address. Express runs them in order, from left to right:
// 1) validateCompare: data is wrong -> shows the form again with errors and STOPS (no next()).
//      data is correct -> calls next() and the request goes on
// 2) compareController.handleCompare: redirects the browser to /result?...
router.post('/compare', validateCompare, compareController.handleCompare);
router.get('/result', validateCompare, compareController.showResult);

// ":code" is a route parameter. For /country/KAZ the value KAZ is in req.params.code.
// ":" start of the variable "code" is a name of the variable
router.get('/country/:code', countryController.showCountry);

//makes the router the one thing this file gives to others
module.exports = router;