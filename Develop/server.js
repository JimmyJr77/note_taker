const fs = require('fs');
const express = require('express');
const path = require('path');
const notes = require('./db/db.json');

const PORT = 3002;

const app = express();

app.use(express.static('public'));
app.use(express.json()); // middleware to parse json

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, './public/notes.html'));
});

app.get('/api/notes', (req, res) => res.json(notes));

// HANDLE THE POST REQUEST TO SAVE NEW NOTES
app.post('/api/notes', (req, res) => {
  const newNote = req.body; // The new note data sent from the client
  newNote.id = Date.now().toString(); // Assign a unique ID to the new note
  notes.push(newNote); // Add the new note to the existing notes in memory

  // Write the updated notes to the db.json file
  fs.writeFile('./db/db.json', JSON.stringify(notes), (err) => {
    if (err) {
      console.error('Error saving note to the database:', err);
      return res.status(500).json({ error: 'Failed to save note to the database' });
    }
    // If the note is successfully saved, send a response back to the client
    return res.status(201).json({ message: 'Note saved successfully' });
  });
});

// CREATE A NEW ROUT THAT GETS A SINGLE NOTE USING THE ID
app.get('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  const selectedNote = notes.find((note) => note.id === noteId);

  if (!selectedNote) {
    return res.status(404).json({ error: 'Note not found' });
  }

  return res.json(selectedNote);
});

// // HANDLE THE "DELETE" REQUEST AND DELETE NOTES USING THE ID
app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
    const noteIndex = notes.findIndex((note) => note.id === noteId);
  
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }
  
    // Remove the note from the notes array
    notes.splice(noteIndex, 1);
  
    // Write the updated notes to the db.json file
    fs.writeFile('./db/db.json', JSON.stringify(notes), (err) => {
      if (err) {
        console.error('Error deleting note from the database:', err);
        return res.status(500).json({ error: 'Failed to delete note from the database' });
      }
      // If the note is successfully deleted, send a response back to the client
      return res.status(200).json({ message: 'Note deleted successfully' });
    });
  });

// LISTEN FOR A PORT AND PRINT TO THE CONSOLE WHERE THE LOCAL HOST CAN BE ACCESSED
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
