const axios = require('axios');
const urls = [
  'https://api.worldbank.org/v2/country?format=json&per_page=300',
  'https://api.worldbank.org/v2/country/KAZ?format=json',
  'https://api.worldbank.org/v2/country/KAZ/indicator/SP.POP.TOTL?format=json&date=2000:2020'
];
async function run() {
  for (const url of urls) {
    try {
      const r = await axios.get(url, { timeout: 8000 });
      console.log('OK', r.status, url);
    } catch (e) {
      console.log('FAILED', e.response ? e.response.status : e.code, e.message, url);
    }
  }
}
run();
