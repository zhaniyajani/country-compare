const { getCountries } = require('../services/worldBankService');
const { INDICATORS } = require('../config/indicators');

exports.showHome = async function (req, res, next) {
  try {
    const countries = await getCountries();
    res.render('index', { title: 'Home', countries: countries, indicators: INDICATORS, errors: [], form: {} });
  } catch (err) {
    next(err);
  }
};

exports.showAbout = function (req, res) {
  res.render('about', { title: 'About' });
};
