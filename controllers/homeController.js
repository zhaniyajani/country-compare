//the home page and the about page

// What this file does:
// showHome: gets the list of countries and shows the form, showAbout: shows the about page

// getCountries asks the API for the list of countries
const { getCountries } = require('../services/worldBankService');
// INDICATORS = the 4 indicators with names and units / 4 показателя с названиями и единицами
const { INDICATORS } = require('../config/indicators');

// "exports.showHome" puts the function into the exports box, so index.js can use it
exports.showHome = async function (req, res, next) {
  try {
    // Wait for the API and save the list of countries in the box "countries"
    // The list looks like [{ id: 'KAZ', name: 'Kazakhstan' }, { id: 'DEU', name: 'Germany' }, ...]
    const countries = await getCountries();

    // render заполняет index.ejs этими значениями и отправляет HTML в браузер
    // {} mean no error messages and an empty form on the first visit
    res.render('index', {
      title: 'Home', //заголовок вкладки 
      countries: countries, // the list for the two country drop downs
      indicators: INDICATORS,   // the 4 indicators for the indicator drop down 
      errors: [], //empty: no errors appeared
      form: {} //empty: nothing was typed
    });
  } catch (err) {
    next(err);
  }
};


exports.showAbout = function (req, res) {
  //about.ejs заполняется заголовком и отправляется в браузер.
  res.render('about', { title: 'About' });
};
