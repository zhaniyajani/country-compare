const axios = require('axios');
const BASE_URL = 'https://api.worldbank.org/v2';

async function getCountries() {
  const response = await axios.get(BASE_URL + '/country', {
    params: { format: 'json', per_page: 300 },
    timeout: 8000
  });
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
  const response = await axios.get(BASE_URL + '/country/' + code + '/indicator/' + indicator, {
    params: { format: 'json', date: fromYear + ':' + toYear, per_page: 100 },
    timeout: 8000
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
  const response = await axios.get(BASE_URL + '/country/' + code, {
    params: { format: 'json' },
    timeout: 8000
  });
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
