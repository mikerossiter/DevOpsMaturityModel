// Fetch dimensions and load the initial state
fetch('dimensions.json')
  .then(response => response.json())
  .then(dimensions => {
    let currentLevels = new Array(dimensions.length).fill(0);
    let checkboxStates = {};

    const tableBody = document.getElementById('table-body');
    const cells = [];

    // Create table rows
    dimensions.forEach((dimension, dimensionIndex) => {
      const row = tableBody.insertRow();
      const dimensionCell = row.insertCell();
      dimensionCell.textContent = dimension.name;

      dimension.levels.forEach((level, levelIndex) => {
        const cell = row.insertCell();
        cell.onclick = () => showDetails(dimensionIndex, levelIndex);
        cells.push({ dimensionIndex, levelIndex, cell });
      });
    });

    // Show details for a dimension level
    function showDetails(dimensionIndex, levelIndex) {
        const detailTitle = document.getElementById('detail-title');
        const detailContent = document.getElementById('detail-content');
        const dimension = dimensions[dimensionIndex];
        const level = dimension.levels[levelIndex];

        // Update the title
        detailTitle.textContent = `${dimension.name} - Level ${levelIndex + 1}`;

        // Clear previous content
        detailContent.innerHTML = '';

        // If there are no details, hide the detail box
        if (!level) {
            detailContent.classList.remove('visible');
            return;
        }

        // Show the detail box by adding the 'visible' class
        detailContent.classList.add('visible');

        // Split details by ". " (assuming each detail is separated by a period and space)
        const details = level.split('. ');

        // Create checkbox and label elements for each detail
        details.forEach((detail, index) => {
            const checkboxId = `detail-${dimensionIndex}-${levelIndex}-${index}`;
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = checkboxId;
            checkbox.checked = checkboxStates[checkboxId] || false;
            
            // Update the state on change
            checkbox.onchange = () => {
                checkboxStates[checkboxId] = checkbox.checked;
                updateCellColor(dimensionIndex, levelIndex);
                calculateAverageLevel(); // Update the average level dynamically
            };

            const label = document.createElement('label');
            label.htmlFor = checkboxId;
            label.textContent = detail;

            // Append the checkbox and label to the detail content
            detailContent.appendChild(checkbox);
            detailContent.appendChild(label);
            detailContent.appendChild(document.createElement('br'));
        });
    }


    // Update cell colors based on checkbox states
    function updateCellColor(dimensionIndex, levelIndex) {
      const { checkedBoxes, totalBoxes } = countCheckboxStates(dimensionIndex, levelIndex);
      const cell = cells.find(c => c.dimensionIndex === dimensionIndex && c.levelIndex === levelIndex)?.cell;

      if (cell) {
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
      let totalChecked = 0;
      let totalCheckboxes = 0;

      dimensions.forEach((dimension, dimensionIndex) => {
        dimension.levels.forEach((level, levelIndex) => {
          const { checkedBoxes, totalBoxes } = countCheckboxStates(dimensionIndex, levelIndex);
          totalChecked += checkedBoxes;
          totalCheckboxes += totalBoxes;
        });
      });

      const completionPercentage = (totalChecked / totalCheckboxes) * 100;
      const averageLevel = (completionPercentage / 100) * dimensions.length;
      // averageLevel = Math.round(averageLevel);      

      const averageLevelPane = document.getElementById('average-level');
      if (averageLevelPane) {
        averageLevelPane.textContent = `Average Level: ${Math.round(averageLevel)} (${completionPercentage.toFixed(1)}% completed)`;
      } else {
        console.error("Average level pane not found");
      }
    }

    // Count checkbox states for a specific dimension level
    function countCheckboxStates(dimensionIndex, levelIndex) {
      const levelDetails = dimensions[dimensionIndex].levels[levelIndex].split('. ');
      const totalBoxes = levelDetails.length;

      let checkedBoxes = 0;
      for (let i = 0; i < totalBoxes; i++) {
        const checkboxId = `detail-${dimensionIndex}-${levelIndex}-${i}`;
        if (checkboxStates[checkboxId]) {
          checkedBoxes++;
        }
      }

      return { checkedBoxes, totalBoxes };
    }

    // Save state to state.json
    function saveState() {
      const state = { currentLevels, checkboxStates };
      fetch('/save-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      })
        .then(response => {
          if (response.ok) alert('State saved successfully!');
        })
        .catch(error => console.error('Error saving state:', error));
    }

    // Load state from state.json
    function loadState() {
      fetch('/state.json')
        .then(response => {
          if (!response.ok) throw new Error('State file not found');
          return response.json();
        })
        .then(state => {
          console.log('Loaded state:', state); // Debugging step to log the state
          checkboxStates = state.checkboxStates || {};
          currentLevels = state.currentLevels || new Array(dimensions.length).fill(0);

          // Apply the loaded state to checkboxes
          Object.keys(checkboxStates).forEach(checkboxId => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
              checkbox.checked = checkboxStates[checkboxId];
            }
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


        // Add save and load buttons
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

    buttonsContainer.appendChild(saveButton);
    buttonsContainer.appendChild(loadButton);
    document.body.appendChild(buttonsContainer);

    // Initial calculations
    calculateAverageLevel();
    // loadState();
  });
