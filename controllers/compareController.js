const { getIndicator, getCountryDetails } = require('../services/worldBankService');
const { INDICATORS } = require('../config/indicators');
const formatNumber = require('../utils/formatNumber');

function calcStats(data) {
  if (data.length === 0) return null;
  let sum = 0;
  let highest = data[0];
  let lowest = data[0];
  for (let i = 0; i < data.length; i++) {
    sum = sum + data[i].value;
    if (data[i].value > highest.value) highest = data[i];
    if (data[i].value < lowest.value) lowest = data[i];
  }
  const first = data[0].value;
  const last = data[data.length - 1].value;
  const growth = first !== 0 ? ((last - first) / first) * 100 : null;
  return { average: sum / data.length, highest: highest, lowest: lowest, growth: growth };
}

function findValue(data, year) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].year === year) return data[i].value;
  }
  return null;
}

exports.handleCompare = function (req, res) {
  const i = req.compareInput;
  res.redirect('/result?country1=' + i.country1 + '&country2=' + i.country2 +
    '&indicator=' + i.indicator + '&fromYear=' + i.fromYear + '&toYear=' + i.toYear);
};

exports.showResult = async function (req, res, next) {
  try {
    const i = req.compareInput;
    const info = INDICATORS[i.indicator];

    const c1 = await getCountryDetails(i.country1);
    const c2 = await getCountryDetails(i.country2);
    const data1 = await getIndicator(i.country1, i.indicator, i.fromYear, i.toYear);
    const data2 = await getIndicator(i.country2, i.indicator, i.fromYear, i.toYear);

    if (!c1 || !c2) {
      const error = new Error('One of the countries was not found.');
      error.isUserMessage = true;
      error.statusCode = 404;
      throw error;
    }

    const stats1 = calcStats(data1);
    const stats2 = calcStats(data2);

    let summary = null;
    if (stats1 && stats2) {
      const winner = stats1.average >= stats2.average ? c1.name : c2.name;
      const difference = Math.abs(stats1.average - stats2.average);
      summary = winner + ' is ahead on average by ' + formatNumber(difference) + ' ' + info.unit + '.';
    }

    const rows = [];
    for (let year = i.fromYear; year <= i.toYear; year++) {
      const v1 = findValue(data1, year);
      const v2 = findValue(data2, year);
      if (v1 !== null || v2 !== null) rows.push({ year: year, v1: v1, v2: v2 });
    }

    res.render('result', {
      title: 'Result', info: info, fromYear: i.fromYear, toYear: i.toYear,
      c1: c1, c2: c2, stats1: stats1, stats2: stats2,
      summary: summary, rows: rows, format: formatNumber
    });
  } catch (err) {
    next(err);
  }
};
