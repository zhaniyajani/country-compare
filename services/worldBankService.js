// services/worldBankService.js : ALL requests to the World Bank API are in this file 

// Controllers never call the API themselves. They call the functions from this file
// What this file does:
// one function getData sends every request (with timeout, retries and a cache)
// four functions ask for the data we need and CLEAN the answer
//the functions are exported for the controllers and middleware

 
// axios = a package that sends HTTP requests. https = a built-in Node module
const axios = require('axios');
const https = require('https');

// new https.Agent({...}) = create a "connection settings" object that axios will use below
const agent = new https.Agent({ keepAlive: false, family: 4 });

const BASE_URL = process.env.API_URL || 'https://api.worldbank.org/v2';
 
// A simple cache: answers we already received are kept in memory, so the same request is instant next time
// {} an empty object. We use it like a notebook: label (the request) -> value (the answer)
// The cache is erased when the server restarts
const saved = {};
 
// the pause between tries is this many milliseconds times the try number
// "a ? b : c" = if a is true take b, otherwise c. So: if RETRY_PAUSE is set in .env use it, else 1000.
const RETRY_PAUSE = process.env.RETRY_PAUSE ? Number(process.env.RETRY_PAUSE) : 1000;
 
// url = the address, params = the extra parameters
async function getData(url, params) {
  // the key identifies a request: the address plus its parameters as text
  // JSON.stringify turns an object into text: { a: 1 } becomes '{"a":1}'
  // If the notebook already has this key, return the saved answer at once and do NOT call the API
  if (saved[key]) {
    return saved[key];
  }
 
  let lastError;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      // await = wait here until the API answers. timeout: 15000 = give up after 15 seconds
      // { params: params, ... } = the options. httpsAgent: agent = use our connection settings from above
      const response = await axios.get(url, { params: params, timeout: 15000, httpsAgent: agent });
      // Success: put the answer in the notebook and return it. return ends the function, so the loop stops
      saved[key] = response;
      return response;
    } catch (err) {
      // The request failed: remember the error, print a line in the terminal, and the loop goes on
      lastError = err;
      console.log('Request failed (attempt ' + attempt + '): ' + err.message);
      // wait a little before the next try: 1 second, then 2, then 3, then 4
      // After the 5th (last) attempt there is no need to wait
      if (attempt < 5) {
        // await waits until the promise is done, so the code really pauses. attempt * RETRY_PAUSE = 1 s, 2 s, 3 s, 4 s
        await new Promise(function (resolve) {
          setTimeout(resolve, attempt * RETRY_PAUSE);
        });
      }
    }
  }
  // all attempts failed: throw the error, the controller passes it to errorHandler.js
  throw lastError;
}
 
// REQUEST 1: the list of countries for the dropdowns
// Result: [{ code: 'KAZ', name: 'Kazakhstan' }, { code: 'DEU', name: 'Germany' }, ...]
async function getCountries() {
  const response = await getData(BASE_URL + '/country', { format: 'json', per_page: 300 });
 
  // The API answers with 2 items: [0] = information about the page, [1] = the real data
  // "|| []": if there is no data, use an empty list
  // response.data = axios puts the body of the answer here
  const list = response.data[1] || [];
 
  const countries = [];
  for (let i = 0; i < list.length; i++) {
    // Groups such as "World" and "Euro area" have the region "Aggregates", so we skip them
    // "!==" = NOT equal in value and type
    if (list[i].region.value !== 'Aggregates') {
      // We keep only what we need: the code (the API calls it id) and the name. push = add to the end of the list
      countries.push({ code: list[i].id, name: list[i].name });
    }
  }
 
  // sort A to Z
  // sort() asks the function which of two items goes first. localeCompare compares texts like a dictionary
  countries.sort(function (a, b) {
    return a.name.localeCompare(b.name);
  });
  return countries;
}

// REQUEST 2: yearly values of one indicator for one country
// Result: [{ year: 2010, value: 16300000 }, { year: 2011, value: 16600000 }, ...]
async function getIndicator(code, indicator, fromYear, toYear) {
  // encodeURIComponent makes the text safe inside an address (special signs are changed)
  // Example: https://api.worldbank.org/v2/country/KAZ/indicator/SP.POP.TOTL
  const url = BASE_URL + '/country/' + encodeURIComponent(code) + '/indicator/' + indicator;
  // date: '2000:2022' is how the API wants a range of years
  // per_page: 100 = up to 100 years in one answer (the data starts in 1960, so it is enough).
  const response = await getData(url, { format: 'json', date: fromYear + ':' + toYear, per_page: 100 });
 
  const rows = response.data[1] || [];
  const result = [];
  for (let i = 0; i < rows.length; i++) {
    // Many years have no value: the API sends null. We skip those
    if (rows[i].value !== null) {
      // the API sends the year as text, so Number() makes it a real number
      // API присылает год текстом, поэтому Number() делает из него настоящее число
      result.push({ year: Number(rows[i].date), value: rows[i].value });
    }
  }
 
  // oldest year first
  // a.year - b.year: a negative result means "a goes first", so smaller years come first
  result.sort(function (a, b) {
    return a.year - b.year;
  });
  return result;
}
 
// REQUEST 3: details of one country (name, capital, region, income level)
// Result: { code, name, capital, region, income } or null if the country does not exist
async function getCountryDetails(code) {
  const response = await getData(BASE_URL + '/country/' + encodeURIComponent(code), { format: 'json' });
 
  // For a wrong code the API still answers with status 200, but without data
  if (!response.data[1]) {
    return null;
  }
 
  // the answer is a list with one country inside, so I take the first item
  // [0] = the first item (counting starts from 0)
  const c = response.data[1][0];
  // We return our own clean object, so the rest of the app does not depend on the API's names
  // The API calls them id, capitalCity, region.value and incomeLevel.value
  return {
    code: c.id,
    name: c.name,
    capital: c.capitalCity,
    region: c.region.value,
    income: c.incomeLevel.value
  };
}
 
// REQUEST 4: the newest available value of one indicator (used on the country page)
// mrnev=1 means: most recent value that is not empty. The answer is tiny, so it is fast
async function getLatestValue(code, indicator) {
  const url = BASE_URL + '/country/' + encodeURIComponent(code) + '/indicator/' + indicator;
  const response = await getData(url, { format: 'json', mrnev: 1 });
 
  const rows = response.data[1] || [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].value !== null) {
      // return gives the result and STOPS the function: we need only the first non-empty value
      return { year: Number(rows[i].date), value: rows[i].value };
    }
  }
  // no value exists for this indicator
  return null;
}
 
// export the functions so controllers and middleware can use them
// { a, b } is short for { a: a, b: b }: an object with four named parts
// That is why other files load them with { }: const { getCountries } = require(...)
module.exports = { getCountries, getIndicator, getCountryDetails, getLatestValue };
 
