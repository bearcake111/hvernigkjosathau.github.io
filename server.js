//CLEAN All code in server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));
app.use(
  '/search-thingmenn',
  express.static(path.join(__dirname, 'search-thingmenn'))
);
app.use('/mal-details', express.static(path.join(__dirname, 'mal-details')));
app.use(
  '/search-malaskra',
  express.static(path.join(__dirname, 'search-malaskra'))
);

app.get('/api/thingmenn', async (req, res) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, 'thingmenn.json'),
      'utf8'
    );
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/malaskra', async (req, res) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, 'malaskra.json'),
      'utf8'
    );
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/efnisflokkar', async (req, res) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, 'efnisflokkar.json'),
      'utf8'
    );
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
