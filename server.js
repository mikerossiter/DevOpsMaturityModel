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

  const latestStateFile = stateFiles.sort((a, b) => {
    const timestampA = a.replace('state-', '').replace('.json', '');
    const timestampB = b.replace('state-', '').replace('.json', '');
    return new Date(timestampB) - new Date(timestampA);
  })[0];

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

app.listen(port, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${port}/`);
});