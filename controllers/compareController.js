const {
  getIndicator,
  getCountryDetails
} = require('../services/worldBankService');
const { INDICATORS } = require('../config/indicators');

// Makes big numbers easy to read: 19600000 -> 19.60M
function formatNumber(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  return n.toLocaleString('en-US', { maximumFractionDigits: 1 });
}

// Calculates average, highest, lowest and growth for one country
function calcStats(data) {
  if (data.length === 0) return null;

  const sum = data.reduce((total, d) => total + d.value, 0);
  const highest = data.reduce((best, d) => (d.value > best.value ? d : best));
  const lowest = data.reduce((worst, d) => (d.value < worst.value ? d : worst));
  const first = data[0];
  const last = data[data.length - 1];
  const growth = first.value !== 0
    ? ((last.value - first.value) / first.value) * 100
    : null;

  return { average: sum / data.length, highest, lowest, growth };
}

// POST /compare: data is already checked, so go to the result page
exports.handleCompare = (req, res) => {
  const query = new URLSearchParams(req.compareInput);
  res.redirect(`/result?${query}`);
};

// GET /result: call the API and show the comparison
exports.showResult = async (req, res, next) => {
  try {
    const { country1, country2, indicator, fromYear, toYear } = req.compareInput;
    const info = INDICATORS[indicator];

    // Send all four requests at the same time
    const [c1, c2, data1, data2] = await Promise.all([
      getCountryDetails(country1),
      getCountryDetails(country2),
      getIndicator(country1, indicator, fromYear, toYear),
      getIndicator(country2, indicator, fromYear, toYear)
    ]);

    // Wrong country code
    if (!c1 || !c2) {
      const error = new Error('One of the countries was not found. Please choose from the list.');
      error.isUserMessage = true;
      error.statusCode = 404;
      throw error;
    }

    const stats1 = calcStats(data1);
    const stats2 = calcStats(data2);

    // Who is ahead (by average)?
    let summary = null;
    if (stats1 && stats2) {
      const winner = stats1.average >= stats2.average ? c1.name : c2.name;
      const diff = Math.abs(stats1.average - stats2.average);
      summary = `${winner} is ahead on average by ${formatNumber(diff)} ${info.unit}.`;
    }

    // Table rows: one row per year, with both countries
    const years = [...new Set([...data1, ...data2].map(d => d.year))]
      .sort((a, b) => a - b);
    const rows = years.map(year => {
      const a = data1.find(d => d.year === year);
      const b = data2.find(d => d.year === year);
      return { year, v1: a ? a.value : null, v2: b ? b.value : null };
    });

    res.render('result', {
      title: 'Result',
      info, fromYear, toYear,
      c1, c2, stats1, stats2,
      summary, rows,
      format: formatNumber
    });
  } catch (err) {
    next(err);
  }
};
