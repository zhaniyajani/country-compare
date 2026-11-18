// utils/formatNumber.js : makes big numbers easier to read 
//   19600000 --> 19.60M" (M = million)
//   2500000000 --> "2.50B" (B = billion)
//   38.456 --> "38.5"

// What this file does :
// gets one number and returns it as a short text
// used in the controllers and in the pages (tables and cards)

// n - parameter; the number we want to format
module.exports = function (n) {
  if (n >= 1000000000) {
    // divide by a billion, keep 2 digits after the dot (toFixed), then add the letter B
    return (n / 1000000000).toFixed(2) + 'B';
  }
  if (n >= 1000000) {
    return (n / 1000000).toFixed(2) + 'M';
  }
  // small numbers (for example life expectancy): keep 1 digit after the dot
  return n.toFixed(1);
};