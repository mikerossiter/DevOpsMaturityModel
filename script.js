// Fetch dimensions and load the initial state
fetch('dimensions.json')
  .then(response => response.json())
  .then(dimensions => {
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

    // Global object to track expansion states (if needed)
    let expansionStates = {};

    // Updated showDetails function – now using subDimensions
    function showDetails(dimensionIndex, levelIndex) {
      const detailTitle = document.getElementById('detail-title');
      const detailContent = document.getElementById('detail-content');
      const dimension = dimensions[dimensionIndex];
      const levelObj = dimension.levels[levelIndex]; // now an object with subDimensions

      // Update the title
      detailTitle.textContent = `${dimension.name} - Level ${levelIndex + 1}`;

      // Clear previous content
      detailContent.innerHTML = '';

      if (!levelObj || !levelObj.subDimensions) {
        detailContent.classList.remove('visible');
        return;
      }

      detailContent.classList.add('visible');

      // Iterate over each sub-dimension in the level
      levelObj.subDimensions.forEach((subDim, index) => {
        // Create a container for this sub-dimension
        const subDimContainer = document.createElement('div');
        subDimContainer.className = 'sub-dimension-container';
        subDimContainer.style.marginBottom = '10px';

        const checkboxId = `detail-${dimensionIndex}-${levelIndex}-${index}`;

        // Create checkbox and label using subDim.text
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
        label.textContent = subDim.text;

        subDimContainer.appendChild(checkbox);
        subDimContainer.appendChild(label);

        // Create an individual expand/collapse button for this sub-dimension's details
        const expandBtn = document.createElement('button');
        expandBtn.textContent = 'Show More';
        expandBtn.style.marginLeft = '10px';

        // Create a details container specific to this sub-dimension
        const detailsContainer = document.createElement('div');
        detailsContainer.style.display = 'none';
        detailsContainer.style.marginTop = '5px';
        detailsContainer.textContent = subDim.details || 'No additional details available.';

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

        subDimContainer.appendChild(expandBtn);
        subDimContainer.appendChild(detailsContainer);

        // Append the container for this sub-dimension to the overall detail content
        detailContent.appendChild(subDimContainer);
      });
    }

    // Update cell colors based on checkbox states
    function updateCellColor(dimensionIndex, levelIndex) {
      const { checkedBoxes, totalBoxes } = countCheckboxStates(dimensionIndex, levelIndex);
      const cell = cells.find(c => c.dimensionIndex === dimensionIndex && c.levelIndex === levelIndex)?.cell;

      if (cell) {
        const percentage = totalBoxes > 0 ? (checkedBoxes / totalBoxes) * 100 : 0;
        cell.textContent = checkedBoxes > 0 ? `${percentage.toFixed(1)}%` : '';

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
      const sumLevels = currentLevels.reduce((sum, level) => sum + level, 0);
      const avgLevel = sumLevels / currentLevels.length;
      const avgLevelInt = Math.round(avgLevel);
      const percentage = (avgLevel / 5) * 100;

      const averageLevelPane = document.getElementById('average-level');
      if (averageLevelPane) {
        averageLevelPane.textContent = `Average Level: ${avgLevelInt}`;
      } else {
        console.error("Average level pane not found");
      }
    }

    // Updated countCheckboxStates: now using subDimensions array
    function countCheckboxStates(dimensionIndex, levelIndex) {
      const subDimensions = dimensions[dimensionIndex].levels[levelIndex].subDimensions;
      const totalBoxes = subDimensions.length;
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
      const filenameTimestamp = now.toISOString().replace(/[-:.TZ]/g, '');
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
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error('State files not found');
            }
            throw new Error('State files not found');
          }
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
          
          // Recreate checkboxes for each dimension level (using subDimensions)
          dimensions.forEach((dimension, dimensionIndex) => {
            dimension.levels.forEach((level, levelIndex) => {
              level.subDimensions.forEach((subDim, index) => {
                const checkboxId = `detail-${dimensionIndex}-${levelIndex}-${index}`;
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
                label.textContent = subDim.text;

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
          
          // Recalculate average level
          calculateAverageLevel();
          alert("State loaded successfully!");
        })
        .catch(error => {
          if (error.message === 'No state files present.') {
            alert('No state files present.');
          } else {
            console.error('Error loading state:', error);
          }
        });
    }


    // Add save, load, generate graph, and reset buttons
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

    const graphButton = document.createElement('button');
    graphButton.textContent = 'Generate Graph';
    graphButton.onclick = () => window.open('graph.html', '_blank');

    // New Reset button
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset';
    resetButton.onclick = () => {
      if (confirm('Are you sure you want to clear all saved state files? This cannot be undone.')) {
        fetch('/reset-state', { method: 'POST' })
          .then(response => {
            if (response.ok) {
              alert('Save state folder has been cleared.');
              // Clear in-memory state
              checkboxStates = {};
              currentLevels = new Array(dimensions.length).fill(0);
              // Clear the table cells (the cells that show percentages and colours)
              cells.forEach(c => {
                c.cell.textContent = '';
                c.cell.className = '';
              });
              // Clear the detail panel
              const detailContent = document.getElementById('detail-content');
              detailContent.innerHTML = '';
              // Update average level display
              calculateAverageLevel();
            } else {
              alert('Failed to clear save state folder.');
            }
          })
          .catch(error => {
            console.error('Error resetting state folder:', error);
            alert('Error resetting save state folder.');
          });
      }
    };


    buttonsContainer.appendChild(saveButton);
    buttonsContainer.appendChild(loadButton);
    buttonsContainer.appendChild(graphButton);
    buttonsContainer.appendChild(resetButton);

    document.body.appendChild(buttonsContainer);


    // Initial calculation
    calculateAverageLevel();
  });
