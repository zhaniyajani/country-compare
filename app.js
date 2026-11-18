// app.js : the starting point of the application (npm start runs this file)

// What this file does :
// loads the settings from .env, creates the Express application and sets up EJS
// plugs in the middleware and the routes IN A CERTAIN ORDER, starts the server

// Reads the file .env and puts its lines (PORT, API_URL) into process.env. It must run first.
// Why first: the other files read process.env when they load, so the values must already be there.
// require('dotenv') loads the package, .config() runs it
require('dotenv').config();

// "require" loads a package or one of files
const express = require('express');   // the web framework
const path = require('path');         // built in Node module for building file paths

// my middleware files
const logger = require('./middleware/logger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

// create the application object
// express is a function: calling it with () gives us a new empty application
const app = express();

// the port comes from .env. "||" means: if it is missing, use 3000.
// A port is like a door number of the computer: the browser opens http://localhost:3000.
// process.env = the box with the settings that dotenv filled
const PORT = process.env.PORT || 3000;

// use EJS to turn .ejs files into HTML pages
// app.set(name, value) = change a setting of the application
// After this, res.render('index') finds views/index.ejs and the ending .ejs is not needed
app.set('view engine', 'ejs');
// where the .ejs files are. __dirname is the folder of this file
// path.join glues the pieces with the right slash for the system (a backslash on Windows)
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Without this line req.body would be empty and validateCompare could not read the form.
app.use(express.urlencoded({ extended: true }));

// custom: prints method, address and time for every request
// It sees every request that was not answered by express.static above
app.use(logger);

// app.use('/', router) = plug the router in at the address '/'
// require('./routes/index') loads the router that routes/index.js exports
app.use('/', require('./routes/index'));

// notFound: no route answered, so show the 404 pagу
// errorHandler: someone called next(err), so show the error page. It is the very last
app.use(notFound);
app.use(errorHandler);

// start listening for browser requests on the port
// app.listen(port, function) starts the server
app.listen(PORT, function () {
  // prints a message in the terminal. "+" glues the text and the port number
  console.log('Server running at http://localhost:' + PORT);
});