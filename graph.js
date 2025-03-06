const graphContainer = document.getElementById('graph-container');
const ctx = document.getElementById('adoption-graph').getContext('2d');
    
// Helper function to get a random color for each dimension's line.
function getRandomColor() {
  const r = Math.floor(Math.random() * 200);
  const g = Math.floor(Math.random() * 200);
  const b = Math.floor(Math.random() * 200);
  return `rgba(${r}, ${g}, ${b}, 1)`;
}

// 1) Fetch dimensions first, so we know how many dimensions there are and their names.
fetch("dimensions.json")
  .then(response => response.json())
  .then(dimensions => {

    // 2) Then fetch all saved states (from your SQLite /state-files endpoint).
    fetch('/state-files')
      .then(response => response.json())
      .then(stateRows => {
        if (!stateRows.length) {
          graphContainer.innerHTML = '<p class="no-state-message">No state files found.</p>';
          return;
        }

        // Convert each row into an object with:
        //  - timestamp: Date
        //  - selectedLevels: the parsed JSON object from row.state
        // Then sort them chronologically.
        const stateData = stateRows.map(row => ({
          timestamp: new Date(row.timestamp),
          selectedLevels: JSON.parse(row.state).selectedLevels
        })).sort((a, b) => a.timestamp - b.timestamp);

        // Build a Chart.js dataset for each dimension in dimensions.json.
        const datasets = dimensions.map((dimension, dimensionIndex) => {
          const subCount = dimension.subDimensions.length;

          // For each saved state, compute progress for this dimension.
          const data = stateData.map(state => {
            // If dimension is missing from saved state, default to blank object.
            const levelsObj = state.selectedLevels[dimensionIndex] || {};
            let total = 0;
            // For each subdimension index from 0..subCount-1,
            // read the level from levelsObj or default to 1 if missing.
            for (let i = 0; i < subCount; i++) {
              let val = levelsObj[i];
              if (val === undefined || val === "") {
                val = 1; // default to level 1 if missing
              } else {
                val = parseInt(val, 10);
              }
              total += val;
            }
            // Compute progress as sumOfLevels / (5 * subCount) * 100
            // e.g. if everything is level 4 => (4/5=80%) for each subdim => overall 80%.
            const progress = (total / (5 * subCount)) * 100;

            return { x: state.timestamp, y: progress };
          });

          return {
            label: dimension.name,
            data: data,
            borderColor: getRandomColor(),
            tension: 0.1,
            fill: false
          };
        });

        // Finally, create a multi-dimensional line chart using Chart.js
        new Chart(ctx, {
  type: 'line',
  data: { datasets: datasets },
  options: {
    elements: {
      line: {
        tension: 0.5,
        cubicInterpolationMode: 'monotone',
        borderWidth: 5
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'MMM dd, yyyy',
          displayFormats: {
            day: 'MMM dd, yyyy'
          }
        },
        ticks: {
          autoSkip: false,   // disable auto-skipping
          maxRotation: 45,   // force a rotation for labels
          minRotation: 45    // ensure they are rotated
        },
        title: { display: true, text: 'Time' }
      },
      y: {
        beginAtZero: true,
        max: 100,
        title: { display: true, text: 'Adoption (%)' }
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Adoption Progress for Each Dimension Over Time'
      }
    }
  }
});
      })
      .catch(error => {
        console.error("Error fetching state files:", error);
        graphContainer.innerHTML = '<p class="no-state-message">Error loading state files.</p>';
      });
  })
  .catch(error => {
    console.error("Error fetching dimensions:", error);
    graphContainer.innerHTML = '<p class="no-state-message">Error loading dimensions.</p>';
  });
