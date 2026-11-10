require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Country Compare is running');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});