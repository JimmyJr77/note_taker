const express = require('express');
const path = require('path');
const notes_db = require('./db/notes_db');

const PORT = 3002;

const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'notes.html'));
  });

app.get('/api/notes_db', (req, res) => res.json(notes_db));

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});

