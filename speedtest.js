const axios = require('axios');
const url = 'https://api.worldbank.org/v2/country/KAZ/indicator/SP.POP.TOTL';
async function run() {
  for (let i = 1; i <= 5; i++) {
    const t = Date.now();
    try {
      await axios.get(url, { params: { format: 'json', date: '2010:2020', per_page: 100 }, timeout: 10000 });
      console.log(i, 'OK', (Date.now() - t) + ' ms');
    } catch (e) {
      console.log(i, 'FAILED', e.code || e.message, (Date.now() - t) + ' ms');
    }
  }
}
run();
