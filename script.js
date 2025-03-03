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

    // Show details for a specific level and sub-dimension
    function showDetails(dimensionIndex, levelIndex) {
      const detailTitle = document.getElementById('detail-title');
      const detailContent = document.getElementById('detail-content');
      const dimension = dimensions[dimensionIndex];
      const levelObj = dimension.levels[levelIndex];

      // Update title
      detailTitle.textContent = `${dimension.name} - Level ${levelIndex + 1}`;

      // Clear previous content
      detailContent.innerHTML = '';

      if (!levelObj || !levelObj.subDimensions) {
        detailContent.classList.remove('visible');
        return;
      }

      detailContent.classList.add('visible');

      // Iterate over each sub-dimension
      levelObj.subDimensions.forEach((subDim, index) => {
        const subDimContainer = document.createElement('div');
        subDimContainer.className = 'sub-dimension-container';
        subDimContainer.style.marginBottom = '10px';

        const checkboxId = `detail-${dimensionIndex}-${levelIndex}-${index}`;

        // Create checkbox and label
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

        // Expandable details section per sub-dimension
        const expandBtn = document.createElement('button');
        expandBtn.textContent = 'Show More';
        expandBtn.style.marginLeft = '10px';

        const detailsContainer = document.createElement('div');
        detailsContainer.style.display = 'none';
        detailsContainer.style.marginTop = '5px';
        detailsContainer.textContent = subDim.details || 'No additional details available.';

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
        detailContent.appendChild(subDimContainer);
      });
    }

    // Count checkbox states for a specific level
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

    // Update cell colors
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

    // Calculate completion percentage
    function computeCompletionPercentage() {
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

    // Calculate and display the average level
    function calculateAverageLevel() {
      const sumLevels = currentLevels.reduce((sum, level) => sum + level, 0);
      const avgLevelInt = Math.round(sumLevels / currentLevels.length);
      const completionPercentage = computeCompletionPercentage();

      const averageLevelPane = document.getElementById('average-level');
      if (averageLevelPane) {
        averageLevelPane.textContent = `Average Level: ${avgLevelInt} (${completionPercentage.toFixed(2)}% completed)`;
      }
    }

    // Save state function
    function saveState() {
      const timestamp = new Date().toISOString();
      const completionPercentage = computeCompletionPercentage();
      const state = { timestamp, currentLevels, checkboxStates, completionPercentage };

      fetch('/save-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: `state-${timestamp.replace(/[-:.TZ]/g, '')}.json`, state: JSON.stringify(state) })
      }).then(() => alert('State saved successfully!'));
    }

    // Load state function
    function loadState() {
      fetch('/load-state')
        .then(response => response.ok ? response.json() : Promise.reject('No state files present.'))
        .then(state => {
          checkboxStates = state.checkboxStates || {};
          currentLevels = state.currentLevels || new Array(dimensions.length).fill(0);

          document.getElementById('detail-content').innerHTML = '';
          document.getElementById('detail-title').textContent = '';

          dimensions.forEach((dimension, dimensionIndex) => {
            dimension.levels.forEach((_, levelIndex) => {
              updateCellColor(dimensionIndex, levelIndex);
            });
          });

          calculateAverageLevel();
          alert("State loaded successfully!");
        })
        .catch(error => alert(error));
    }

    // Add buttons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.id = 'buttons-container';

    buttonsContainer.appendChild(Object.assign(document.createElement('button'), { textContent: 'Save State', onclick: saveState }));
    buttonsContainer.appendChild(Object.assign(document.createElement('button'), { textContent: 'Load State', onclick: loadState }));
    buttonsContainer.appendChild(Object.assign(document.createElement('button'), { textContent: 'Generate Graph', onclick: () => window.open('graph.html', '_blank') }));

    document.body.appendChild(buttonsContainer);

    calculateAverageLevel();
  });
