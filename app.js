require('./server/config/config');

const express = require('express');
const bodyParser = require('body-parser');

const { env } = require('./server/config/config');
const { mongoose } = require('./server/db/mongoose');

const { PORT } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(require('./controllers'));

app.listen(PORT, () => {
  if (env === 'development') {
    console.log(`Listening on port ${PORT}`);
  }
});

module.exports = { app };
