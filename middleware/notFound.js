// middleware/notFound.js : the 404 handler 
// It is placed after all routes in app.js, so it only runs when no route matched the address
// What this file does:
// catches every address that no route knows, shows the page views/error.ejs with the status 404

// (req, res) = 2 parameters
// no "next", because this function ENDS the request
module.exports = function (req, res) {
  // status(404) sets the HTTP status code, render fills views/error.ejs and sends the page
  // 404 = "Not Found" (the address does not exist)
  res.status(404).render('error', { title: 'Not found', status: 404, message: 'Page not found.' });
};
