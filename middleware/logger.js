//middleware/logger.js :журнал запросов

// What this file does:
// for every request it prints one line in the terminal, then passes the request further

// Middleware is a function that stands between the request and the answer

// (req, res, next) = 3 parameters. With 3 parameters Express knows it is a normal middleware
// req = the request from the browser, res = our answer (not used here), next = go on
module.exports = function (req, res, next) {
  // prints the time, the method (GET or POST) and the address of every request
  // console.log print text in the terminal
  // new Date() = the current date and time
  // .toISOString() = turns it into text like 2026-11-18T02:25:00.000Z
  // "+" glues pieces of text together. ' ' is a space between the pieces
  // req.url = the address with the query, for example /result?country1=KAZ
  // Example line in the terminal: 2026-11-18T02:25:00.000Z GET /country/KAZ
  console.log(new Date().toISOString() + ' ' + req.method + ' ' + req.url);
  next();
};
