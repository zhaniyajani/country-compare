const axios = require('axios');
const BASE_URL = process.env.API_URL || 'https://api.worldbank.org/v2';
const saved = {};

async function getData(url, params) {
  const key = url + JSON.stringify(params);
  if (saved[key]) return saved[key];

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await axios.get(url, { params: params, timeout: 15000 });
      saved[key] = response;
      return response;
    } catch (err) {
      lastError = err;
      console.log('Request failed (attempt ' + attempt + '): ' + err.message);
    }
  }
  throw lastError;
}

async function getCountries() {
  const response = await getData(BASE_URL + '/country', { format: 'json', per_page: 300 });
  const list = response.data[1] || [];
  const countries = [];
  for (let i = 0; i < list.length; i++) {
    if (list[i].region.value !== 'Aggregates') {
      countries.push({ code: list[i].id, name: list[i].name });
    }
  }
  countries.sort(function (a, b) { return a.name.localeCompare(b.name); });
  return countries;
}

async function getIndicator(code, indicator, fromYear, toYear) {
  const response = await getData(BASE_URL + '/country/' + code + '/indicator/' + indicator, {
    format: 'json',
    date: fromYear + ':' + toYear,
    per_page: 100
  });
  const rows = response.data[1] || [];
  const result = [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].value !== null) {
      result.push({ year: Number(rows[i].date), value: rows[i].value });
    }
  }
  result.sort(function (a, b) { return a.year - b.year; });
  return result;
}

async function getCountryDetails(code) {
  const response = await getData(BASE_URL + '/country/' + code, { format: 'json' });
  if (!response.data[1]) return null;
  const c = response.data[1][0];
  return {
    code: c.id,
    name: c.name,
    capital: c.capitalCity,
    region: c.region.value,
    income: c.incomeLevel.value
  };
}

module.exports = { getCountries, getIndicator, getCountryDetails };
