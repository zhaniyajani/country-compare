module.exports = function (req, res) {
  res.status(404).render('error', { title: 'Not found', status: 404, message: 'Page not found.' });
};
