const { getCountries } = require('../services/worldBankService');
const { INDICATORS } = require('../config/indicators');

module.exports = async function (req, res, next) {
  const data = req.method === 'POST' ? req.body : req.query;
  const country1 = String(data.country1 || '').toUpperCase();
  const country2 = String(data.country2 || '').toUpperCase();
  const indicator = data.indicator;
  const fromYear = Number(data.fromYear);
  const toYear = Number(data.toYear);
  const thisYear = new Date().getFullYear();
  const errors = [];

  try {
    const countries = await getCountries();
    const codes = countries.map(function (c) { return c.code; });

    if (!country1 || !country2) {
      errors.push('Please choose both countries.');
    } else if (country1 === country2) {
      errors.push('Please choose two different countries.');
    } else if (!codes.includes(country1) || !codes.includes(country2)) {
      errors.push('Please choose countries from the list.');
    }

    if (!INDICATORS[indicator]) {
      errors.push('Please choose an indicator.');
    }

    if (!Number.isInteger(fromYear) || !Number.isInteger(toYear)) {
      errors.push('Please enter both years as whole numbers.');
    } else if (fromYear < 1960 || toYear > thisYear) {
      errors.push('Years must be between 1960 and ' + thisYear + '.');
    } else if (fromYear >= toYear) {
      errors.push('The "From" year must be before the "To" year.');
    }

    if (errors.length === 0) {
      req.compareInput = { country1, country2, indicator, fromYear, toYear };
      return next();
    }

    res.status(400).render('index', {
      title: 'Home', countries: countries, indicators: INDICATORS, errors: errors, form: data
    });
  } catch (err) {
    next(err);
  }
};
