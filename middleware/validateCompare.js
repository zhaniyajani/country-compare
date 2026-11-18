// middleware/validateCompare.js : custom middleware 2 (проверка введённых данных) 
// It runs BEFORE the controller and checks what the user sent

// What this file does:
// takes the data (from the form), cleans it and turns it into the right types
// checks the countries, the indicator and the years, no errors: saves data in req.compareInput and goes on
// errors: shows the form again with the messages and STOPS

// getCountries = asks the API for the list of countries
const { getCountries } = require('../services/worldBankService');
const { INDICATORS } = require('../config/indicators');

// (req, res, next) = 3 parameters = a normal middleware
module.exports = async function (req, res, next) {
  // A POST form puts its data in req.body. The result link (GET) puts it in req.query
  // "a ? b : c" = if a is true take b, otherwise c. "===" compares value AND type
  // So: for POST use req.body, for everything else (GET) use req.query
  const data = req.method === 'POST' ? req.body : req.query;

  // String() makes sure we have text, "|| ''" gives empty text if nothing was sent
  // .toUpperCase(): "kaz" becomes "KAZ"
  const country1 = String(data.country1 || '').toUpperCase();
  const country2 = String(data.country2 || '').toUpperCase();
  const indicator = data.indicator;
  // Number() turns the text "2000" into the number 2000 (text like "abc" becomes NaN)
  // Number() превращает текст "2000" в число 2000 (текст вроде "abc" становится NaN)
  // NaN = "Not a Number", a special value for a failed conversion. / NaN = «не число», особое значение для неудачного превращения.
  // Form data always arrives as TEXT, so we need this conversion for the year checks.
  // Данные формы всегда приходят как ТЕКСТ, поэтому это превращение нужно для проверки лет.
  const fromYear = Number(data.fromYear);
  const toYear = Number(data.toYear);
  // new Date() = the current date. .getFullYear() = only the year, for example 2026
  const thisYear = new Date().getFullYear();
  // a list where we collect all problems
  const errors = [];

  try {
    //wait for the countries from API
    const countries = await getCountries();

    // list of valid codes
    // We go through the countries and take only the code of each one: ['KAZ', 'DEU', ...]
    // push = add an item to the end of the list
    const codes = [];
    for (let i = 0; i < countries.length; i++) {
      codes.push(countries[i].code);
    }

    // ----- проверка стран -----
    // else if = the next check runs only if the previous ones were false, so only ONE message is added.
    if (country1 === '' || country2 === '') {
      errors.push('Please choose both countries.');
    } else if (country1 === country2) {
      errors.push('Please choose two different countries.');
    } else if (!codes.includes(country1) || !codes.includes(country2)) {
      // "!" means NOT. includes() tells if the list contains the value
      errors.push('Please choose countries from the list.');
    }

    // ----- check the indicator -----
    if (!Object.keys(INDICATORS).includes(indicator)) {
      errors.push('Please choose an indicator.');
    }

    // ----- check the years -----
    // "!data.fromYear" is true when the year is missing or empty (an empty text counts as false)
    if (!data.fromYear || !data.toYear) {
      errors.push('Please enter both years.');
    } else if (!Number.isInteger(fromYear) || !Number.isInteger(toYear)) {
      // Number.isInteger() is true only for whole numbers
      errors.push('Years must be whole numbers.');
    } else if (fromYear < 1960 || toYear > thisYear) {
      // The WB data starts in 1960, and the future has no data
      errors.push('Years must be between 1960 and ' + thisYear + '.');
    } else if (fromYear >= toYear) {
      // ">=" = greater than or equal. The first year must be smaller than the second!
      errors.push('The "From" year must be before the "To" year.');
    }

    // errors.length = how many problems we collected. 0 = none
    if (errors.length === 0) {
      // req is passed from function to function, so the controller can read req.compareInput later
      // The data here is clean: capital codes and real numbers
      req.compareInput = {
        country1: country1,
        country2: country2,
        indicator: indicator,
        fromYear: fromYear,
        toYear: toYear
      };
      return next(); //goes to the next but stops this one
    }

    // Errors: show the form again with the messages. 400 means the user's input is wrong
    res.status(400).render('index', {
      title: 'Home',
      countries: countries,
      indicators: INDICATORS,
      errors: errors,
      form: data
    });
  } catch (err) {
    // if the API failed, send the error to the central error handler
    next(err);
  }
};