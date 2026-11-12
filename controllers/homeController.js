const { getCountries } = require('../services/worldBankService');
const { INDICATORS } = require('../config/indicators');

// Shows the home page with the form
exports.showHome = async (req, res, next) => {
  try {
    const countries = await getCountries();
    res.render('index', {
      title: 'Home',
      countries,
      indicators: INDICATORS,
      errors: [],
      form: {}
    });
  } catch (err) {
    next(err); // goes to the error handler
  }
};
