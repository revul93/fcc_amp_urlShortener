const express = require('express');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const { randomStrGen, validateUrl } = require('./utils');

const PORT = process.env.PORT || 3000;
const HOSTNAME = process.env.HOSTNAME || 'localhost';

app.use(express.static(path.join(__dirname, '/public')));
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.urlencoded({ extended: true }));

const urlDB = JSON.parse(fs.readFileSync('./shorten.json', 'utf-8'));
console.log('DB loaded');

app.get('/api/all', (req, res) => {
  res.json(urlDB);
});

app.get('/', (req, res) => {
  res.sendFile('./public/index.html');
});

app.post('/api/shorturl/new', (req, res) => {
  const url = req.body.url;

  if (!url) {
    return res.status(401).json({ error: 'missing paramaeters: url' });
  }

  if (!validateUrl(url)) {
    return res.status(401).json({ error: 'invalid url' });
  }

  let index;
  if (Object.values(urlDB).includes(url)) {
    index = Object.keys(urlDB).find((key) => urlDB[key] === url);
  } else {
    do {
      index = randomStrGen(6);
    } while (index in Object.keys(urlDB));
    urlDB[index] = url;
    fs.writeFileSync('./shorten.json', JSON.stringify(urlDB, false, 2));
  }

  return res.json({
    original_url: url,
    short_url: index,
  });
});

app.get('/api/shorturl/:index', (req, res) => {
  const index = req.params.index;
  console.log(index);
  if (!(index in urlDB)) {
    return res.status(401).json({
      error: `No url found under index '${index}'`,
    });
  }
  return res.redirect(urlDB[index]);
});

app.listen(PORT, () => {
  console.log(`Server started listening on http://${HOSTNAME}:${PORT}/`);
});
