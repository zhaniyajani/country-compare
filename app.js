require('dotenv').config();
const express = require('express');
const path = require('path');
const logger = require('./middleware/logger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(logger);

app.use('/', require('./routes/index'));

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, function () {
  console.log('Server running at http://localhost:' + PORT);
});
