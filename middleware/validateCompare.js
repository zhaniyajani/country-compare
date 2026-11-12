const { getCountries } = require('../services/worldBankService');
const { INDICATORS } = require('../config/indicators');

// Checks the form data BEFORE we call the API
module.exports = async (req, res, next) => {
  // POST sends data in the body, GET sends it in the URL
  const data = req.method === 'POST' ? req.body : req.query;

  const country1 = String(data.country1 || '').toUpperCase();
  const country2 = String(data.country2 || '').toUpperCase();
  const indicator = data.indicator;
  const fromYear = Number(data.fromYear);
  const toYear = Number(data.toYear);
  const currentYear = new Date().getFullYear();
  const errors = [];

  // Countries
  const codePattern = /^[A-Z]{2,3}$/;
  if (!country1 || !country2) {
    errors.push('Please choose both countries.');
  } else if (!codePattern.test(country1) || !codePattern.test(country2)) {
    errors.push('Country code is not valid.');
  } else if (country1 === country2) {
    errors.push('Please choose two different countries.');
  }

  // Indicator
  if (!INDICATORS[indicator]) {
    errors.push('Please choose an indicator.');
  }

  // Years
  if (!data.fromYear || !data.toYear) {
    errors.push('Please enter both years.');
  } else if (!Number.isInteger(fromYear) || !Number.isInteger(toYear)) {
    errors.push('Years must be whole numbers.');
  } else {
    if (fromYear < 1960 || toYear > currentYear) {
      errors.push(`Years must be between 1960 and ${currentYear}.`);
    }
    if (fromYear >= toYear) {
      errors.push('The "From" year must be before the "To" year.');
    }
  }

  // Everything fine: save clean data and continue
  if (errors.length === 0) {
    req.compareInput = { country1, country2, indicator, fromYear, toYear };
    return next();
  }

  // Something is wrong: show the form again with the error messages
  try {
    const countries = await getCountries();
    res.status(400).render('index', {
      title: 'Home',
      countries,
      indicators: INDICATORS,
      errors,
      form: data
    });
  } catch (err) {
    next(err);
  }
};
