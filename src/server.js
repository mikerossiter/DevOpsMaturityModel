const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
const dimensions = require('../public/dimensions.json');
const app = express();
const PORT = process.env.PORT || 3131;

app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());

// Open (or create) the SQLite database.
const db = new sqlite3.Database(path.join(__dirname, '../data/model_state.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
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

// Gap Analysis Report
app.get('/gap-analysis', (req, res) => {
  db.get("SELECT state FROM model_states ORDER BY id DESC LIMIT 1", (err, row) => {
    if (err) {
      console.error("Error retrieving state:", err);
      return res.status(500).send("Error retrieving saved state.");
    }
    if (!row) {
      return res.send("<h1>Gap Analysis Report</h1><p>No saved state found. Please save your state first.</p>");
    }

    const savedState = JSON.parse(row.state);
    const selectedLevels = savedState.selectedLevels;

    // Begin building the HTML page.
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet">
        <meta charset="utf-8">
        <title>Gap Analysis</title>
        <style>
          body { font-family: Lato, sans-serif; margin: 40px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; }
          textarea { width: 100%; height: 60px; }
          .button-container { margin-top: 20px; }
          button { padding: 10px 20px; font-size: 16px; cursor: pointer; }
        </style>
      </head>
      <body>
        <h1>Gap Analysis</h1>
        <p>This report lists the current maturity levels along with a gap analysis to help you determine improvements needed to reach the next level. Please review each entry and add your own notes where indicated.</p>
        <div class="button-container">
          <button onclick="window.print()">Print / Save as PDF</button>
        </div>
        <table>
          <tr>
            <th>Dimension</th>
            <th>Sub-Dimension</th>
            <th>Current Condition</th>
            <th>Target Condition</th>
            <th>Notes (Improvement Suggestions and Objectives - drag to scale)</th>
          </tr>
    `;

    // Iterate over dimensions as defined in saved state.
    for (let d in selectedLevels) {
      const dimIndex = parseInt(d);
      const dimension = dimensions[dimIndex];
      for (let s in selectedLevels[d]) {
        const subIndex = parseInt(s);
        const subDimension = dimension.subDimensions[subIndex];
        const levelNumber = parseInt(selectedLevels[d][s]); // Levels now assumed to be 1-4.
        const currentLevelText = subDimension.levels[levelNumber - 1] || "Not selected";
        let nextLevelText = "N/A";
        if (levelNumber < subDimension.levels.length) {
          nextLevelText = subDimension.levels[levelNumber];
        }
        html += `
          <tr>
            <td>${dimension.name}</td>
            <td>${subDimension.name}</td>
            <td>${currentLevelText}</td>
            <td>${nextLevelText}</td>
            <td><textarea placeholder="Describe actions to reach the next level"></textarea></td>
          </tr>
        `;
      }
    }
    
    html += `
        </table>
      </body>
      </html>
    `;
    res.send(html);
  });
});


// Endpoint to serve the README rendered as HTML.
app.get('/readme', (req, res) => {
  fs.readFile(path.join(__dirname, '../README.md'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send("Error reading README");
    }
    const htmlContent = md.render(data);
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>README</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css">
        <style>
          body { 
            box-sizing: border-box; 
            min-width: 200px; 
            max-width: 980px; 
            margin: 0 auto; 
            padding: 45px;
          }
          .markdown-body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
          }
        </style>
      </head>
      <body class="markdown-body">
        ${htmlContent}
      </body>
      </html>
    `;
    res.send(fullHtml);
  });
});

// Save state endpoint.
app.post('/save-state', (req, res) => {
  const { filename, state } = req.body;
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

// Load state endpoint.
app.get('/load-state', (req, res) => {
  db.get("SELECT state FROM model_states ORDER BY id DESC LIMIT 1", [], (err, row) => {
    if (err) {
      console.error('Error loading state:', err.message);
      res.status(500).send('Error loading state');
    } else if (!row) {
      res.status(404).send('No state found');
    } else {
      res.json(JSON.parse(row.state));
    }
  });
});

// List states endpoint.
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

// Reset state endpoint.
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
});
