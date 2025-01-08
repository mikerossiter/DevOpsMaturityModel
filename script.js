fetch('dimensions.json')
.then(response => response.json())
.then(data => {
    const dimensions = data;
    let currentLevels = new Array(dimensions.length).fill(0);
    let totalPossibleLevels = 0;

    dimensions.forEach((dimension) => {
      totalPossibleLevels += dimension.levels.length;
    });

    const tableBody = document.getElementById('table-body');

    const cells = [];

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

    function showDetails(dimensionIndex, levelIndex) {
      const detailTitle = document.getElementById('detail-title');
      const detailContent = document.getElementById('detail-content');
      const dimension = dimensions[dimensionIndex];
      const level = dimension.levels[levelIndex];

      detailTitle.textContent = `${dimension.name} - Level ${levelIndex + 1}`;
      detailContent.innerHTML = '';

      const details = level.split('. ');
      details.forEach((detail, index) => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `detail-${index}`;
        checkbox.onchange = () => updateCellColor(dimensionIndex, levelIndex);

        const label = document.createElement('label');
        label.htmlFor = `detail-${index}`;
        label.textContent = detail;

        detailContent.appendChild(checkbox);
        detailContent.appendChild(label);
        detailContent.appendChild(document.createElement('br'));
      });
    }

    function updateCellColor(dimensionIndex, levelIndex) {
      const checkedBoxes = document.querySelectorAll('#detail-content input:checked').length;
      const totalBoxes = document.querySelectorAll('#detail-content input[type="checkbox"]').length;
      const cell = cells.find((c) => c.dimensionIndex === dimensionIndex && c.levelIndex === levelIndex).cell;
      if (cell) {
        const threshold1 = Math.floor((totalBoxes - 1) / 2);
        const threshold2 = totalBoxes - 1;

        if (checkedBoxes === threshold2 + 1) {
          cell.className = 'green3';
          currentLevels[dimensionIndex] = levelIndex + 1;
        } else if (checkedBoxes > threshold1) {
          cell.className = 'green2';
          currentLevels[dimensionIndex] = levelIndex + 1;
        } else if (checkedBoxes > 0) {
          cell.className = 'green1';
          currentLevels[dimensionIndex] = levelIndex + 1;
        } else {
          cell.className = '';
          currentLevels[dimensionIndex] = 0;
        }
      }

      calculateAverageLevel();
    }
    
    function calculateAverageLevel() {
      let totalCompletedLevels = 0;

      currentLevels.forEach((level) => {
        totalCompletedLevels += level;
      });

      const averageLevel = Math.floor(totalCompletedLevels / dimensions.length);
      const averageLevelPane = document.getElementById('average-level');
      averageLevelPane.textContent = `Average Level: ${averageLevel}`;
    }

    const averageLevelPane = document.createElement('div');
    averageLevelPane.id = 'average-level';
    averageLevelPane.style.position = 'fixed';
    averageLevelPane.style.bottom = '10px';
    averageLevelPane.style.right = '10px';
    averageLevelPane.style.background = '#f0f0f0';
    averageLevelPane.style.padding = '10px';
    averageLevelPane.style.border = '1px solid #ccc';
    averageLevelPane.style.borderRadius = '5px';
    document.body.appendChild(averageLevelPane);

    calculateAverageLevel();
  })