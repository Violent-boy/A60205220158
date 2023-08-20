const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const axios = require('axios');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Add the new route handler for /numbers
app.get('/numbers', async (req, res) => {
  const urls = req.query.url;

  if (!urls) {
    return res.status(400).json({ error: 'No URLs provided' });
  }

  const urlArray = Array.isArray(urls) ? urls : [urls];

  try {
    const responses = await Promise.all(
      urlArray.map(async (url) => {
        try {
          const response = await axios.get(url);
          return response.data.numbers;
        } catch (error) {
          console.error(`Error fetching data from ${url}: ${error.message}`);
          return [];
        }
      })
    );

    const mergedNumbers = responses.flat().filter((num, index, arr) => arr.indexOf(num) === index).sort((a, b) => a - b);

    return res.json({ numbers: mergedNumbers });
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
