const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3131;

app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());

// Open (or create) the SQLite database.
const db = new sqlite3.Database(path.join(__dirname, '../data/model_state.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    // Create the table if it doesn't already exist.
    db.run(`
      CREATE TABLE IF NOT EXISTS model_states (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        state TEXT
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      }
    });
  }
});

// Save state: Insert a record with a timestamp and JSON state.
app.post('/save-state', (req, res) => {
  const { filename, state } = req.body;
  // Use the current timestamp
  const timestamp = new Date().toISOString();
  db.run("INSERT INTO model_states (timestamp, state) VALUES (?, ?)", [timestamp, state], function(err) {
    if (err) {
      console.error('Error saving state:', err.message);
      res.status(500).send('Error saving state');
    } else {
      res.send('State saved successfully');
    }
  });
});

// Load state: Retrieve the most recent state.
app.get('/load-state', (req, res) => {
  db.get("SELECT state FROM model_states ORDER BY id DESC LIMIT 1", [], (err, row) => {
    if (err) {
      console.error('Error loading state:', err.message);
      res.status(500).send('Error loading state');
    } else if (!row) {
      res.status(404).send('No state found');
    } else {
      // Parse the saved JSON string and return it.
      res.json(JSON.parse(row.state));
    }
  });
});

// List all saved states (for tracking history).
app.get('/state-files', (req, res) => {
  db.all("SELECT * FROM model_states ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      console.error('Error retrieving states:', err.message);
      res.status(500).send('Error retrieving states');
    } else {
      res.json(rows);
    }
  });
});

// Reset state: Clear all saved state records.
app.post('/reset-state', (req, res) => {
  db.run("DELETE FROM model_states", function(err) {
    if (err) {
      console.error('Error resetting state:', err.message);
      res.status(500).send('Error resetting state');
    } else {
      res.send('State reset successfully');
    }
  });
});

// app.listen(port, '127.0.0.1', () => {
//   console.log(`Server running at http://127.0.0.1:${port}/`);
// });

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}/`);
});