module.exports = function (err, req, res, next) {
  console.error('Error:', err.message);

  let status = 500;
  let message = 'Something went wrong. Please try again later.';

  if (err.isUserMessage) {
    status = err.statusCode;
    message = err.message;
  } else if (err.code === 'ECONNABORTED') {
    message = 'The World Bank API is too slow. Please try again.';
  } else if (err.response) {
    message = 'The World Bank API returned an error. Please try again later.';
  } else if (err.request) {
    message = 'Could not reach the World Bank API. Check your internet connection.';
  }

  res.status(status).render('error', { title: 'Error', status: status, message: message });
};
