//this file compares two countries

// What this file does:
// takes the data from the form, asks the WB for data
// calculates statistics, sends everything to the page result.ejs

const { getIndicator, getCountryDetails } = require('../services/worldBankService');
const { INDICATORS } = require('../config/indicators');
const formatNumber = require('../utils/formatNumber');

// calcStats gets a list of years and values, returns statistics
// Example of the list [{ year: 2000, value: 5 }, { year: 2001, value: 7 }]
function calcStats(data) {

// data.length - how many items are in the list, if 0 then none
  if (data.length === 0) {
    return null; 
  }

// Boxes that change while the loop runs. "let" = a box whose value can change
  let sum = 0; 
  let highest = data[0]; 
  let lowest = data[0]; 

  for (let i = 0; i < data.length; i++) {
    sum = sum + data[i].value; // add this value to the total
    if (data[i].value > highest.value) { //больше текущего максимума?
      highest = data[i];
    }
    if (data[i].value < lowest.value) { //меньше текущего минимума?
      lowest = data[i];
    }
  }

  // Growth in percent = (newest - oldest) / oldest * 100
  const first = data[0].value;  // the oldest value
  const last = data[data.length - 1].value; // the newest value (last item) 
  let growth = null;
  // We cannot divide by 0, so in that case growth stays null
  if (first !== 0) {//защита от ошибки, то есть если ферст 0, то он дальше не отдает на решение
    growth = ((last - first) / first) * 100;
  }//!== not equal to”. divides by first, and dividing by zero is impossible. If first is 0, the code inside the if doesnt run, and growth stays null. 
  
  // Return a box with 4 results
  return {
    average: sum / data.length, 
    highest: highest,
    lowest: lowest,
    growth: growth
  };
}

// findValue looks for one year in the list and returns its value or null
function findValue(data, year) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].year === year) {  // === compares value and type 
      return data[i].value;       // found: return and stop 
    }
  }
  return null; //цикл закончился, а года нет и тогда будет null
}

// POST /compare : the form was already checked by validateCompare,
// so here we only send the browser to the result page (redirect)
// Why redirect? If the user refreshes the result page, the form is not sent again
exports.handleCompare = function (req, res) {
  const i = req.compareInput; // clean data saved by validateCompare 
  res.redirect(
    '/result?country1=' + i.country1 +   // "+" glues pieces of text 
    '&country2=' + i.country2 +
    '&indicator=' + i.indicator +
    '&fromYear=' + i.fromYear +
    '&toYear=' + i.toYear
  );
}; //example /result?country1=KAZ&country2=DEU&indicator=SP.POP.TOTL&fromYear=2010&toYear=2020

// asks the API, calculates statistics, shows the result page
// "async" lets us use "await" (wait for the API). "next" passes errors on
exports.showResult = async function (req, res, next) {
  // if something fails inside try, catch runs and the server does not crash(catch is in the end)
  try {
    const i = req.compareInput;// checked data from previous part
    const info = INDICATORS[i.indicator]; // name and unit of the chosen indicator

    // 4 requests to the API (await is wait for the answer)
    const c1 = await getCountryDetails(i.country1);  // details of country 1
    const c2 = await getCountryDetails(i.country2);  // details of country 2 
    const data1 = await getIndicator(i.country1, i.indicator, i.fromYear, i.toYear); // values by year, country 1 
    const data2 = await getIndicator(i.country2, i.indicator, i.fromYear, i.toYear); // values by year, country 2 

    // a country was not found(create our own error with a safe message)
    // ! not, || or
    if (!c1 || !c2) { //if country 1 is missing or country 2 is missing, true if 0 = null
      const error = new Error('One of the countries was not found');
      error.isUserMessage = true; // the message is safe to show 
      error.statusCode = 404;     // 404 not found 
      throw error;                // jump to catch 
    }


    const stats1 = calcStats(data1); // statistics of country 1
    const stats2 = calcStats(data2); // statistics of country 2

    // Who is ahead? We compare the averages (вверхний прямоугольник зеленый)
    let summary = null;
    if (stats1 && stats2) { // if both countries have statistics
      let winner = c2.name;
      if (stats1.average >= stats2.average) {
        winner = c1.name;
      }
      // Math.abs removes the minus sign (то есть это делается для того, чтобы после вычислений не было минуса в резульатте)
      const difference = Math.abs(stats1.average - stats2.average);
      summary = winner + ' is ahead on average by ' + formatNumber(difference) + ' ' + info.unit + '.';
    }

    // Table rows: one row per year that has data for at least one country
    const rows = [];
    for (let year = i.fromYear; year <= i.toYear; year++) {
      const v1 = findValue(data1, year); //for each year, ask each country “what is your value for this year?”
      const v2 = findValue(data2, year); //second country
      if (v1 !== null || v2 !== null) { //if country 1 has a value or country 2 has a value
        rows.push({ year: year, v1: v1, v2: v2 }); // push - add to the end of the list 
      }
    }

    // Two cards, so the page can use one loop for both countries
    const cards = [
      { country: c1, stats: stats1 },
      { country: c2, stats: stats2 }
    ];

    // render заполняет result.ejs этими данными и отправляет HTML-страницу в браузер
    // format: formatNumber lets the page call format(number) to show numbers like 19.60M.
    // format: formatNumber позволяет странице вызывать format(число), чтобы показывать числа как 19.60M.
    res.render('result', {
      title: 'Result',
      info: info,
      fromYear: i.fromYear,
      toYear: i.toYear,
      c1: c1,
      c2: c2,
      summary: summary,
      rows: rows,
      cards: cards,
      format: formatNumber
    });
  } catch (err) { //if anything inside try fails then it jumps right here
    // next(err) sends the error to the central error handler (errorHandler.js) and then shows an error page
    next(err);
  }
};
