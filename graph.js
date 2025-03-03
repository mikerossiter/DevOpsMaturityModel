const graphContainer = document.getElementById('graph-container');
const graphCanvas = document.getElementById('adoption-graph');
const ctx = graphCanvas.getContext('2d');

function createChart(data) {
  console.log("Creating chart with data:", data);

  if (data.length === 0) {
    graphContainer.innerHTML = '<p class="no-state-message">No data available to display.</p>';
    return;
  }

  // Ensure timestamps are parsed as Date objects
  data.forEach(d => {
    d.timestamp = new Date(d.timestamp);
    console.log(`Parsed Timestamp: ${d.timestamp.toISOString()}`);
  });

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.timestamp), // Keep timestamps in their original order
      datasets: [{
        label: 'Completion (%)',
        data: data.map(d => ({ x: d.timestamp, y: d.completionPercentage })),
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
            unit: 'hour', // Adjust this dynamically if needed
            displayFormats: {
              hour: 'MMM d, HH:mm',
              day: 'MMM d, yyyy'
            }
          },
          ticks: {
            source: 'data', // ✅ Forces the graph to use the real timestamps
            autoSkip: false, // ✅ Ensures no timestamps get skipped
            maxTicksLimit: data.length, // ✅ Ensures every timestamp is shown
            callback: function(value, index, values) {
              let date = new Date(value);
              return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
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

// Fetch the saved state files
fetch('/state-files')
  .then(response => response.json())
  .then(stateFiles => {
    if (!stateFiles || stateFiles.length === 0) {
      graphContainer.innerHTML = '<p class="no-state-message">No state files found.</p>';
      return;
    }

    // Parse state files and extract timestamp & completionPercentage
    const adoptionData = stateFiles.map(file => {
      try {
        const state = JSON.parse(file);
        return { 
          timestamp: new Date(state.timestamp),  
          completionPercentage: state.completionPercentage 
        };
      } catch (e) {
        console.error("Error parsing state file:", file, e);
        return null;
      }
    }).filter(item => item !== null);

    console.log('Parsed Chart Data:', adoptionData);

    // Sort the data by timestamp
    adoptionData.sort((a, b) => a.timestamp - b.timestamp);
    
    createChart(adoptionData);
  })
  .catch(err => {
    console.error('Error fetching state files:', err);
    graphContainer.innerHTML = '<p class="no-state-message">Error loading state files.</p>';
  });
