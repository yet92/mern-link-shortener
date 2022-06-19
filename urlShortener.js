const express = require('express');
const config = require('config');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

app.use(express.json({ extended: true }));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/link', require('./routes/link.routes'));
app.use('/t', require('./routes/redirect.routes'));

const PORT = process.env.PORT || config.get('port') || 5000;

if (process.env.NODE_ENV === 'production') {
  app.use('/', express.static(path.join(__dirname, 'client', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}


async function start() {

  try {

    app.listen(PORT, () => {
      console.log('App listen on http://localhost:%s...', PORT);
    });
    await mongoose.connect(config.get('mongoURI'));
    console.log('connected to db');
  } catch (e) {
    console.log('Server error: ', e.message);
    process.exit(1);
  }

}

start();


