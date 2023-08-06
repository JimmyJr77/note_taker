// IMPORT NECESSARY MODULES
const fs = require('fs'); // for file system operations
const express = require('express'); // for creating an express application
const path = require('path'); // for handling file paths
const notes = require('./db/db.json'); // to access array data within db.json

// SET PORT NUMBER FOR SERVER TO LISTEN ON
const PORT = 3002; 

// CREATE AN INSTANCE OF THE EXPRESS APPLICATION
const app = express();

// SET UP MIDDLEWARE
app.use(express.static('public')); //serve static files from the 'public' directory
app.use(express.json()); // middleware to parse json data sent in the req body

// ROUTE TO CATCH ALL ERRANT GET REQUESTS AND SEND TO INDEX.HTML
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

// ROUTE TO CATCH GET REQUESTS TO /NOTES AND SEND TO NOTES.HTML
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, './public/notes.html'));
});

// HANDLES GET REQUESTS FOR /API/NOTES URL & ESTABLISHES EXPECTATION OF JSON
app.get('/api/notes', (req, res) => res.json(notes));

// HANDLE THE POST REQUEST TO /API/NOTES TO SAVE NEW NOTES
app.post('/api/notes', (req, res) => {
  const newNote = req.body; // The request object contains the data sent by the client (title & note) in the request body.
  newNote.id = Date.now().toString(); // Assign a unique ID to the new note by way of date converted to string
  notes.push(newNote); // Add the new note & ID to the existing notes in memory only! Must write to db.json...

  // WRITE THE UPDATED NOTES TO JSON
  // Writes the notes array to the db.json file.
  // Arg1 = file path, Arg2 = file to be written, Arg 3 = callback function for after completion of operation
  // JSON.stringify(notes) converts notes array to a json formatted string
  fs.writeFile('./db/db.json', JSON.stringify(notes), (err) => { 
    if (err) { // Callback fuction to identify error if error or null if it works
      console.error('Error saving note to the database:', err); // If error, logs the message and error code to console log
      return res.status(500).json({ error: 'Failed to save note to the database' });
    } // Sends a JSON response back to the client with error message. 500 err indicates internal server error.
    // If the note is successfully saved, send a response back to the client
    return res.status(201).json({ message: 'Note saved successfully' }); // Sends JSON repsonse to client --> successful creation of a new resource
  });
});

// CREATE A NEW ROUTE THAT GETS A SINGLE NOTE USING THE ID
app.get('/api/notes/:id', (req, res) => { // This parameter allows us to specify the ID of the note we want to retrieve.
  const noteId = req.params.id; // extracts the value of the id route parameter from req object. Assigns it to noteID.
  const selectedNote = notes.find((note) => note.id === noteId); // Uses the Array.find() method to search notes for a note with a specific id propert that matches the noteID.

  if (!selectedNote) { // If a note is not found, a 404 err and message is sent back to the client.
    return res.status(404).json({ error: 'Note not found' });
  }

  return res.json(selectedNote); // If a note is found, it returns the selected note in JSON. Only 1st match is returned.
});

// HANDLE THE "DELETE" REQUEST AND DELETE NOTES USING THE ID
app.delete('/api/notes/:id', (req, res) => { // Sets up a route handler for the DELETE request where :id is a route parameter. 
    const noteId = req.params.id; // Extracts the value of the id route parameter from the request object --> assigns it to noteId
    const noteIndex = notes.findIndex((note) => note.id === noteId);
    // Above line uses the Array.findIndex() method to find the index of the note in the notes array whose id property matches the noteId 
    // Returns the index of the first element in the array that satisfies the testing function, or -1 if no element is found.
    if (noteIndex === -1) { // Checks if noteIndex is -1 (not found)
      return res.status(404).json({ error: 'Note not found' }); // If not found, returns the error code and message
    }
  
    notes.splice(noteIndex, 1);  // Removes the note from the notes array.
  
    // Writes the updated notes array to the db.json file using the fs.writeFile() function
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
