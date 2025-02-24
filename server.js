const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3131;

app.use(express.static('./'));
app.use(bodyParser.json());

app.post('/save-state', (req, res) => {
  const { filename, currentLevels, checkboxStates, timestamp } = req.body;

  const saveStateDir = './save-state';
  if (!fs.existsSync(saveStateDir)) {
    fs.mkdirSync(saveStateDir);
  }

  const filePath = `${saveStateDir}/${filename}`;

  const state = { currentLevels, checkboxStates, timestamp };

  fs.writeFile(filePath, JSON.stringify(state, null, 2), (err) => {
    if (err) {
      console.error('Error saving state:', err);
      res.status(500).send('Failed to save state');
    } else {
      res.send('State saved successfully');
    }
  });
});

app.get('/state-files', (req, res) => {
  const stateFiles = [];
  const stateFilesDir = path.join(__dirname, './');

  fs.readdir(stateFilesDir, (err, files) => {
    if (err) {
      console.error('Error reading state files:', err);
      res.status(500).send('Error reading state files');
    } else {
      files.forEach(file => {
        if (file.startsWith('state-') && file.endsWith('.json')) {
          const filePath = path.join(stateFilesDir, file);
          fs.readFile(filePath, (err, data) => {
            if (err) {
              console.error('Error reading state file:', err);
            } else {
              stateFiles.push(data.toString());
              if (stateFiles.length === files.filter(f => f.startsWith('state-') && f.endsWith('.json')).length) {
                res.json(stateFiles);
              }
            }
          });
        }
      });
    }
  });
});

app.get('/dimensions.json', (req, res) => {
  const filePath = path.join(__dirname, 'dimensions.json');

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error('Error reading dimensions file:', err);
      res.status(500).send('Error reading dimensions file');
    } else {
      res.json(JSON.parse(data.toString()));
    }
  });
});

app.listen(port, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${port}/`);
});