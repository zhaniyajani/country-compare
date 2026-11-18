// this file is a list of the indicators(topics) the user can choose for comparison
// Each topic has: a code (for World Bank), a name and a unit (for the user).
//https://data.worldbank.org/indicator здесь я искала код индикаторов
const INDICATORS = {

  // code is in the quotes because it contains dots inside
  //Name: для юзеров чтобы было понятно что именно он выбирает, Unit: то в чем высчитывалось и отображается позже
  'NY.GDP.PCAP.CD': { name: 'GDP per capita', unit: 'US$' },
  'SP.POP.TOTL': { name: 'Population', unit: 'people' },
  'SP.DYN.LE00.IN': { name: 'Life expectancy', unit: 'years' },
  'IT.NET.USER.ZS': { name: 'Internet users', unit: '% of population' }
};

// “What this file shares with other files.” в других файлах его используют через require
module.exports = { INDICATORS };