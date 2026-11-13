const { getCountryDetails, getIndicator } = require('../services/worldBankService');
const { INDICATORS } = require('../config/indicators');
const formatNumber = require('../utils/formatNumber');

exports.showCountry = async function (req, res, next) {
  try {
    const code = String(req.params.code).toUpperCase();
    const country = code.length <= 3 ? await getCountryDetails(code) : null;

    if (!country) {
      const error = new Error('Country not found.');
      error.isUserMessage = true;
      error.statusCode = 404;
      throw error;
    }

    const thisYear = new Date().getFullYear();
    const keys = Object.keys(INDICATORS);
    const latest = [];
    for (let i = 0; i < keys.length; i++) {
      const data = await getIndicator(code, keys[i], thisYear - 10, thisYear);
      const item = { name: INDICATORS[keys[i]].name, unit: INDICATORS[keys[i]].unit, value: null, year: null };
      if (data.length > 0) {
        item.value = formatNumber(data[data.length - 1].value);
        item.year = data[data.length - 1].year;
      }
      latest.push(item);
    }

    res.render('country', { title: country.name, country: country, latest: latest });
  } catch (err) {
    next(err);
  }
};
