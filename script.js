// Fetch dimensions and load the initial state
fetch('dimensions.json')
  .then(response => response.json())
  .then(dimensions => {
    // Initialize state arrays/objects
    currentLevels = new Array(dimensions.length).fill(0);
    checkboxStates = {};

    const tableBody = document.getElementById('table-body');
    const cells = [];

    // Create table rows for each dimension
    dimensions.forEach((dimension, dimensionIndex) => {
      const row = tableBody.insertRow();
      const dimensionCell = row.insertCell();
      dimensionCell.textContent = dimension.name;

      // Create one cell per level for this dimension
      dimension.levels.forEach((level, levelIndex) => {
        const cell = row.insertCell();
        cell.onclick = () => showDetails(dimensionIndex, levelIndex);
        cells.push({ dimensionIndex, levelIndex, cell });
      });
    });

    // Global object to track which levels are expanded
    let expansionStates = {};

    // Updated showDetails function that works with the new JSON structure
    function showDetails(dimensionIndex, levelIndex) {
      const detailTitle = document.getElementById('detail-title');
      const detailContent = document.getElementById('detail-content');
      const dimension = dimensions[dimensionIndex];
      const levelObj = dimension.levels[levelIndex]; // object with 'text' and 'details'

      // Update the title
      detailTitle.textContent = `${dimension.name} - Level ${levelIndex + 1}`;

      // Clear previous content
      detailContent.innerHTML = '';

      if (!levelObj) {
        detailContent.classList.remove('visible');
        return;
      }

      // Show the detail box
      detailContent.classList.add('visible');

      // Split the summary text into individual sub-dimensions
      const sentences = levelObj.text.split('. ').filter(s => s.trim() !== '');
      sentences.forEach((sentence, index) => {
        // Create a container for this sentence
        const sentenceContainer = document.createElement('div');
        sentenceContainer.className = 'sentence-container';
        sentenceContainer.style.marginBottom = '10px';

        // Ensure the sentence ends with a period
        const sentenceText = sentence.trim().endsWith('.') ? sentence.trim() : sentence.trim() + '.';
        const checkboxId = `detail-${dimensionIndex}-${levelIndex}-${index}`;

        // Create the checkbox and label
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = checkboxId;
        checkbox.checked = checkboxStates[checkboxId] || false;
        checkbox.onchange = () => {
          checkboxStates[checkboxId] = checkbox.checked;
          updateCellColor(dimensionIndex, levelIndex);
          calculateAverageLevel();
        };

        const label = document.createElement('label');
        label.htmlFor = checkboxId;
        label.textContent = sentenceText;

        // Append checkbox and label to the sentence container
        sentenceContainer.appendChild(checkbox);
        sentenceContainer.appendChild(label);

        // Create an individual expand/collapse button for this sub-dimension
        const expandBtn = document.createElement('button');
        expandBtn.textContent = 'Show More';
        expandBtn.style.marginLeft = '10px';

        // Create a details container specific to this sentence
        const detailsContainer = document.createElement('div');
        detailsContainer.style.display = 'none';
        detailsContainer.style.marginTop = '5px';
        detailsContainer.textContent = levelObj.details || 'No additional details available.';

        // Toggle expansion on button click
        expandBtn.onclick = () => {
          if (detailsContainer.style.display === 'none') {
            detailsContainer.style.display = 'block';
            expandBtn.textContent = 'Show Less';
          } else {
            detailsContainer.style.display = 'none';
            expandBtn.textContent = 'Show More';
          }
        };

        // Append the expand button and details container to the sentence container
        sentenceContainer.appendChild(expandBtn);
        sentenceContainer.appendChild(detailsContainer);

        // Append the sentence container to the main detailContent
        detailContent.appendChild(sentenceContainer);
      });
    }


    // Update cell colors based on checkbox states
    function updateCellColor(dimensionIndex, levelIndex) {
      const { checkedBoxes, totalBoxes } = countCheckboxStates(dimensionIndex, levelIndex);
      const cell = cells.find(c => c.dimensionIndex === dimensionIndex && c.levelIndex === levelIndex)?.cell;

      if (cell) {
        const percentage = totalBoxes > 0 ? (checkedBoxes / totalBoxes) * 100 : 0;

        // Update cell text with percentage if greater than 0
        cell.textContent = checkedBoxes > 0 ? `${percentage.toFixed(1)}%` : '';

        // Update cell class for color
        const threshold1 = Math.floor((totalBoxes - 1) / 2);
        const threshold2 = totalBoxes - 1;

        if (checkedBoxes === threshold2 + 1) {
          cell.className = 'colour3';
          currentLevels[dimensionIndex] = levelIndex + 1;
        } else if (checkedBoxes > threshold1) {
          cell.className = 'colour2';
          currentLevels[dimensionIndex] = levelIndex + 1;
        } else if (checkedBoxes > 0) {
          cell.className = 'colour1';
          currentLevels[dimensionIndex] = levelIndex + 1;
        } else {
          cell.className = '';
          currentLevels[dimensionIndex] = 0;
        }
      }
    }

    // Calculate and display the average level
    function calculateAverageLevel() {
      // Compute the average level from currentLevels
      const sumLevels = currentLevels.reduce((sum, level) => sum + level, 0);
      const avgLevel = sumLevels / currentLevels.length;
      const avgLevelInt = Math.round(avgLevel); // average level as whole number
      
      // Compute percentage based on the unrounded average (two decimals)
      const percentage = (avgLevel / 5) * 100;
      
      const averageLevelPane = document.getElementById('average-level');
      if (averageLevelPane) {
        averageLevelPane.textContent = `Average Level: ${avgLevelInt} (${percentage.toFixed(2)}% completed)`;
      } else {
        console.error("Average level pane not found");
      }
    }

    // Count checkbox states for a specific dimension level (using level.text)
    function countCheckboxStates(dimensionIndex, levelIndex) {
      const levelText = dimensions[dimensionIndex].levels[levelIndex].text;
      const sentences = levelText.split('. ').filter(s => s.trim() !== "");
      const totalBoxes = sentences.length;

      let checkedBoxes = 0;
      for (let i = 0; i < totalBoxes; i++) {
        const checkboxId = `detail-${dimensionIndex}-${levelIndex}-${i}`;
        if (checkboxStates[checkboxId]) {
          checkedBoxes++;
        }
      }
      return { checkedBoxes, totalBoxes };
    }

    // Compute the average completion percentage across all dimensions
    function computeAverageCompletionPercentage() {
      let totalChecked = 0;
      let totalBoxes = 0;
      dimensions.forEach((dimension, dimensionIndex) => {
        dimension.levels.forEach((level, levelIndex) => {
          const { checkedBoxes, totalBoxes: boxes } = countCheckboxStates(dimensionIndex, levelIndex);
          totalChecked += checkedBoxes;
          totalBoxes += boxes;
        });
      });
      return totalBoxes ? (totalChecked / totalBoxes) * 100 : 0;
    }

    // Save state to a new file with a timestamp
    function saveState() {
      const now = new Date();
      const timestamp = now.toISOString();
      // Create a filename timestamp that's safe and sortable
      const filenameTimestamp = now.toISOString().replace(/[-:.TZ]/g, '');
      
      // Use the same calculation as on the main page:
      const computedCompletionPercentage = computeAverageCompletionPercentage();
      
      const state = { 
        timestamp, 
        currentLevels, 
        checkboxStates, 
        completionPercentage: computedCompletionPercentage 
      };
      const filename = `state-${filenameTimestamp}.json`;

      fetch('/save-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, state: JSON.stringify(state) }),
      })
      .then(response => {
        if (response.ok) alert('State saved successfully!');
      })
      .catch(error => console.error('Error saving state:', error));
    }

    // Load state from the latest state file in /load-state
    function loadState() {
      fetch('/load-state')
        .then(response => {
          if (!response.ok) throw new Error('State file not found');
          return response.json();
        })
        .then(state => {
          console.log('Loaded state:', state);
          
          // Update the state from the loaded data
          checkboxStates = state.checkboxStates || {};
          currentLevels = state.currentLevels || new Array(dimensions.length).fill(0);
          
          // Clear previous detail content
          const detailContent = document.getElementById('detail-content');
          detailContent.innerHTML = '';
          
          // Recreate checkboxes for each dimension level using level.text
          dimensions.forEach((dimension, dimensionIndex) => {
            dimension.levels.forEach((level, levelIndex) => {
              const details = level.text.split('. ');
              details.forEach((detail, index) => {
                const checkboxId = `detail-${dimensionIndex}-${levelIndex}-${index}`;
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = checkboxId;
                checkbox.checked = checkboxStates[checkboxId] || false;
      
                // Update state on change
                checkbox.onchange = () => {
                  checkboxStates[checkboxId] = checkbox.checked;
                  updateCellColor(dimensionIndex, levelIndex);
                  calculateAverageLevel();
                };
      
                const label = document.createElement('label');
                label.htmlFor = checkboxId;
                label.textContent = detail;
      
                // Append checkbox and label to detail content
                detailContent.appendChild(checkbox);
                detailContent.appendChild(label);
                detailContent.appendChild(document.createElement('br'));
              });
            });
          });
      
          // Update cell colors based on loaded states
          dimensions.forEach((dimension, dimensionIndex) => {
            dimension.levels.forEach((_, levelIndex) => {
              updateCellColor(dimensionIndex, levelIndex);
            });
          });
      
          // Recalculate and update the average level
          calculateAverageLevel();
          alert("State loaded successfully!");
        })
        .catch(error => console.error('Error loading state:', error));
    }

    // Add save, load, and generate graph buttons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.id = 'buttons-container';
    buttonsContainer.style.position = 'fixed';
    buttonsContainer.style.bottom = '10px';
    buttonsContainer.style.left = '10px';

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save State';
    saveButton.onclick = saveState;

    const loadButton = document.createElement('button');
    loadButton.textContent = 'Load State';
    loadButton.onclick = loadState;

    // New "Generate Graph" button
    const graphButton = document.createElement('button');
    graphButton.textContent = 'Generate Graph';
    graphButton.onclick = () => window.open('graph.html', '_blank');

    buttonsContainer.appendChild(saveButton);
    buttonsContainer.appendChild(loadButton);
    buttonsContainer.appendChild(graphButton);

    document.body.appendChild(buttonsContainer);

    // Initial calculations
    calculateAverageLevel();
  });
