// Catches every error. The user sees a friendly message,
// the technical details go only to the console.
module.exports = (err, req, res, next) => {
  console.error('Error:', err.message);

  if (res.headersSent) return next(err);

  const status = err.statusCode || 500;
  let message = 'Something went wrong. Please try again later.';

  if (err.isUserMessage) {
    message = err.message;
  } else if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
    message = 'The World Bank API is too slow right now. Please try again.';
  } else if (err.response && err.response.status === 429) {
    message = 'Too many requests. Please wait a minute and try again.';
  } else if (err.response) {
    message = 'The World Bank API returned an error. Please try again later.';
  } else if (err.request) {
    message = 'Could not reach the World Bank API. Check your internet connection.';
  }

  res.status(status).render('error', { title: 'Error', status, message });
};
