const graphContainer = document.getElementById('graph-container');
const graphCanvas = document.getElementById('adoption-graph');
const ctx = graphCanvas.getContext('2d');

function createChart(data) {
  console.log("Creating chart with data:", data);
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.timestamp),
      datasets: [{
        label: 'Completion (%)',
        data: data.map(d => d.completionPercentage),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1
      }]
    },
    options: {
      scales: {
        x: {
          type: 'time',
          time: {
            // This format is used for the tooltip
            tooltipFormat: 'MMM d, yyyy, h:mm:ss a',
            // Specify the display format for ticks; here we set the unit to 'hour'
            // so that both date and time are shown.
            unit: 'hour',
            displayFormats: {
              hour: 'MMM d, yyyy, h:mm a'
            }
          },
          title: {
            display: true,
            text: 'Date & Time'
          }
        },
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Completion (%)'
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
      // Replace the container's content with a message
      graphContainer.innerHTML = '<p class="no-state-message">No state files found.</p>';
      return;
    }
    
    // Map each file to the data object (assuming each state has a timestamp and completionPercentage)
    const adoptionData = stateFiles.map(file => {
      try {
        const state = JSON.parse(file);
        return { 
          timestamp: state.timestamp, 
          completionPercentage: state.completionPercentage 
        };
      } catch (e) {
        console.error("Error parsing state file:", file, e);
        return null;
      }
    }).filter(item => item !== null);
    
    console.log('Chart data:', adoptionData);
    
    // Sort the data by timestamp (oldest to newest)
    adoptionData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    createChart(adoptionData);
  })
  .catch(err => {
    console.error('Error fetching state files:', err);
    graphContainer.innerHTML = '<p class="no-state-message">Error loading state files.</p>';
  });
