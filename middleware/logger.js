// Prints method, URL and time for every request
module.exports = (req, res, next) => {
  const time = new Date().toISOString();
  console.log(`[${time}] ${req.method} ${req.url}`);
  next(); // go to the next middleware
};
