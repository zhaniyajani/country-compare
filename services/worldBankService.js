const axios = require('axios');

const BASE_URL = 'https://api.worldbank.org/v2';

// Request 1: list of countries for the dropdowns
async function getCountries() {
  const response = await axios.get(`${BASE_URL}/country`, {
    params: { format: 'json', per_page: 300 },
    timeout: 8000
  });

  const countries = response.data[1];
  if (!countries) return [];

  return countries
    .filter(c => c.region.value !== 'Aggregates') // remove "World", "Euro area"
    .map(c => ({ code: c.id, name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Request 2: yearly values of an indicator for one country
async function getIndicator(countryCode, indicator, fromYear, toYear) {
  const response = await axios.get(
    `${BASE_URL}/country/${countryCode}/indicator/${indicator}`,
    {
      params: { format: 'json', date: `${fromYear}:${toYear}`, per_page: 100 },
      timeout: 8000
    }
  );

  const rows = response.data[1];
  if (!rows) return []; // no data

  return rows
    .filter(r => r.value !== null)               // remove empty values
    .map(r => ({ year: Number(r.date), value: r.value }))
    .sort((a, b) => a.year - b.year);
}

// Request 3: details of one country (name, capital, region, income)
async function getCountryDetails(code) {
  const response = await axios.get(`${BASE_URL}/country/${code}`, {
    params: { format: 'json' },
    timeout: 8000
  });

  // For a wrong code the API answers 200 with a message, so data[1] is missing
  const c = response.data[1] && response.data[1][0];
  if (!c) return null;

  return {
    code: c.id,
    name: c.name,
    capital: c.capitalCity,
    region: c.region.value,
    income: c.incomeLevel.value
  };
}

module.exports = { getCountries, getIndicator, getCountryDetails };
