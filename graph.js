const graphCanvas = document.getElementById('adoption-graph');
if (!graphCanvas) {
  console.error('Canvas with id "adoption-graph" not found.');
}
const ctx = graphCanvas.getContext('2d');

function createChart(data) {
  console.log("Creating chart with data:", data);
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.timestamp),
      datasets: [{
        label: 'Maturity Score (%)',
        data: data.map(d => d.maturityScore),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        title: { display: true, text: 'Adoption Over Time' }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            tooltipFormat: 'MMM d, yyyy, h:mm:ss a',
            unit: 'minute'
          },
          title: {
            display: true,
            text: 'Time'
          }
        },
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Maturity Score (%)'
          }
        }
      }
    }
  });
}

fetch('/state-files')
  .then(response => {
    console.log('Response from /state-files:', response);
    return response.json();
  })
  .then(stateFiles => {
    console.log('State files:', stateFiles);
    if (!stateFiles || stateFiles.length === 0) {
      console.warn("No state files found.");
      return;
    }
    
    // Calculate maturity score using currentLevels
    const maxLevel = 5;
    const adoptionData = stateFiles.map(file => {
      try {
        const state = JSON.parse(file);
        const numDimensions = state.currentLevels.length;
        const sumLevels = state.currentLevels.reduce((sum, level) => sum + level, 0);
        const maturityScore = (sumLevels / (maxLevel * numDimensions)) * 100;
        return { timestamp: state.timestamp, maturityScore };
      } catch (e) {
        console.error("Error parsing state file:", file, e);
        return null;
      }
    }).filter(item => item !== null);
    
    console.log('Chart data before sorting:', adoptionData);
    adoptionData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    console.log('Chart data after sorting:', adoptionData);
    createChart(adoptionData);
  })
  .catch(err => {
    console.error('Error fetching state files:', err);
  });
