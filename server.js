const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3131;

app.use(express.static('./'));
app.use(bodyParser.json());

app.post('/save-state', (req, res) => {
  const saveStateDir = './save-state';
  const { filename, state } = req.body;

  if (!fs.existsSync(saveStateDir)) {
    fs.mkdirSync(saveStateDir);
  }

  const filePath = path.join(saveStateDir, filename);

  fs.writeFile(filePath, state, (err) => {
    if (err) {
      console.error('Error writing state file:', err);
      res.status(500).send('Error writing state file');
    } else {
      res.send('State saved successfully');
    }
  });
});


app.get('/load-state', (req, res) => {
  const saveStateDir = './save-state';
  const files = fs.readdirSync(saveStateDir);
  const stateFiles = files.filter(file => file.startsWith('state-') && file.endsWith('.json'));

  if (stateFiles.length === 0) {
    res.status(404).send('No state files found');
    return;
  }

  const latestStateFile = stateFiles.sort((a, b) => b.localeCompare(a))[0];
  const filePath = path.join(saveStateDir, latestStateFile);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error('Error reading state file:', err);
      res.status(500).send('Error reading state file');
    } else {
      res.json(JSON.parse(data));
    }
  });
});


app.get('/state-files', (req, res) => {
  const saveStateDir = './save-state';
  if (!fs.existsSync(saveStateDir)) {
    return res.json([]);
  }
  const files = fs.readdirSync(saveStateDir);
  const stateFiles = files.filter(file => file.startsWith('state-') && file.endsWith('.json'));
  
  // Read each file's content (as text)
  const states = stateFiles.map(file => {
    const filePath = path.join(saveStateDir, file);
    const data = fs.readFileSync(filePath, 'utf8');
    return data;
  });
  
  res.json(states);
});

app.post('/reset-state', (req, res) => {
  const saveStateDir = './save-state';
  if (!fs.existsSync(saveStateDir)) {
    return res.status(404).send('Save state folder does not exist.');
  }
  const files = fs.readdirSync(saveStateDir);
  try {
    files.forEach(file => {
      fs.unlinkSync(path.join(saveStateDir, file));
    });
    res.send('Save state folder cleared successfully.');
  } catch (error) {
    console.error('Error clearing save state folder:', error);
    res.status(500).send('Error clearing save state folder.');
  }
});


app.listen(port, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${port}/`);
});