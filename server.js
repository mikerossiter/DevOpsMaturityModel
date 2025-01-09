const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const port = 3131;

app.use(express.static('./'));
app.use(bodyParser.json());

app.post('/save-state', (req, res) => {
  const state = req.body;

  fs.writeFile('state.json', JSON.stringify(state, null, 2), (err) => {
    if (err) {
      console.error('Error saving state:', err);
      res.status(500).send('Failed to save state');
    } else {
      res.send('State saved successfully');
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
