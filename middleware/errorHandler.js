//middleware/errorHandler.js : the central error handler

// What this file does:
// prints the technical error in the termina
// chooses a friendly message and a status code
// shows the page error.ejs

// Express knows it is an ERROR handler because it has 4 parameters: (err, req, res, next).

// "module.exports = function ..." makes this function the ONE thing this file gives to others
// err = the error object, req = request, res = response, next = pass on 
module.exports = function (err, req, res, next) {
  // console.error prints text in the terminal 
  // err.message is a the text of the error
  // err.config.url is the API address that failed (only Axios errors have it)
  console.error('Error:', err.message, err.config ? err.config.url : '');

  // default values, used when we do not recognise the error
  //500 = server error
  let status = 500;
  let message = 'Something went wrong. Please try again later.';

  if (err.isUserMessage) {
    // errors that I created  have safe messages to show (like "Country is not found" and 404)
    status = err.statusCode;
    message = err.message;
  } else if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
    // "||" means or. Axios gives these codes when the timeout is over.
    // "===" compares value and type
    message = 'The World Bank API is too slow. Please try again.';
  } else if (err.response && err.response.status === 429) {
    // "&&" means and. The API answered, but with too many requests.
    // 429 - Too Many Requests
    message = 'Too many requests. Please wait a minute and try again.';
  } else if (err.response) {
    // the API answered with another error code (4xx or 5xx)
    // for example 502 Bad Gateway, which the World Bank sometimes returns
    message = 'The World Bank API returned an error. Please try again later.';
  } else if (err.request) {
    // the request was sent but no answer came back (no internet)
    message = 'Could not reach the World Bank API. Check your internet connection.';
  }

  // res.status(status) sets the status code of the answer (404, 500...).
  // .render('error', {...}) fills error.ejs with the data and sends the page
  res.status(status).render('error', { title: 'Error', status: status, message: message });
};