//this file shows details of one country

// What this file does:
// takes the country code from the address (/country/KAZ), asks the WB about the country
// asks for the latest value of each indicator, sends everything to the page country.ejs

// "require" loads code from another file. { } takes only the named functions out of it
const { getCountryDetails, getLatestValue } = require('../services/worldBankService');
const { INDICATORS } = require('../config/indicators');
const formatNumber = require('../utils/formatNumber');

// getLatestItem: asks the API for ONE indicator and ALWAYS returns an item for the table
// If the request fails, the item just shows "No recent data"
async function getLatestItem(code, key) { //code = country code ('KAZ'), key = indicator code ('SP.POP.TOTL')
  const item = {
    name: INDICATORS[key].name, // for example "Population"
    unit: INDICATORS[key].unit, // for example "people"
    value: null,
    year: null
  };

    // if something fails inside try, сработает catch, и страница всё равно работает
  try {
    // answer looks like { value: 19600000, year: 2023 } or null
    const latest = await getLatestValue(code, key);
    if (latest) {
      item.value = formatNumber(latest.value); // 19600000 becomes "19.60M"
      item.year = latest.year; //save the year 
    }
  } catch (err) {
    // err.message = the text of the error
    //print text in the terminal
    console.log('Could not load ' + key + ' for ' + code + ': ' + err.message);
  }

  return item;
}

exports.showCountry = async function (req, res, next) {
  try {
    // String(...) makes sure it is text. .toUpperCase() makes capital letters: "kaz" becomes "KAZ"
    const code = String(req.params.code).toUpperCase();

    // World Bank codes have 2 or 3 letters, so longer text is not sent to the API
    let country = null;
    if (code.length <= 3) {
      country = await getCountryDetails(code); // details of the country, or null if not found
    }
    // No country found: create our own error with a safe message and a 404 status.
    // ! not, true when null
    if (!country) {
      const error = new Error('Country not found.');
      error.isUserMessage = true; // the message is safe to show to the user
      error.statusCode = 404; 
      throw error; 
    }

    // Ask for the 4 indicators at the same time. Promise.all waits until all of them are done.
    // Object.keys(INDICATORS) = the list of the codes: ['NY.GDP.PCAP.CD', 'SP.POP.TOTL', ...]
    const keys = Object.keys(INDICATORS);
    // keys.map(function (key) {...}) = go through the list and make a new list:
    // for each code call getLatestItem. We get 4 "future results"
    // "await Promise.all(...)" waits for all 4 and gives a list of 4 ready items, in the same order
    // getLatestItem never throws an error (it has its own try/catch), so Promise.all does not fail
    const latest = await Promise.all(keys.map(function (key) {
      return getLatestItem(code, key);
    }));

    // render fills country.ejs with this data and sends the HTML page to the browser
    // title = заголовок вкладки, country = данные страны, latest = 4 строки таблицы.
    res.render('country', { title: country.name, country: country, latest: latest });
  } catch (err) {
    // next(err) sends the error to the central error handler (errorHandler.js)
    next(err);
  }
};
