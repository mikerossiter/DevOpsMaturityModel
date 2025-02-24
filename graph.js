// graph.js
const graphCanvas = document.getElementById('adoption-graph');
const ctx = graphCanvas.getContext('2d');

// Fetch all state files and parse the data
fetch('/state-files')
 .then(response => response.json())
 .then(stateFiles => {
    const adoptionData = stateFiles.map(stateFile => {
      const state = JSON.parse(stateFile);
      const completionPercentage = calculateCompletionPercentage(state.currentLevels, state.checkboxStates);
      return { timestamp: state.timestamp, completionPercentage };
    });

    // Sort the data by timestamp
    adoptionData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Create the graph
    const adoptionGraph = new Chart(ctx, {
      type: 'line',
      data: {
        labels: adoptionData.map(data => data.timestamp),
        datasets: [{
          label: 'Adoption',
          data: adoptionData.map(data => data.completionPercentage),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        }],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  });

// Calculate the completion percentage
function calculateCompletionPercentage(currentLevels, checkboxStates) {
  const totalCheckboxes = Object.keys(checkboxStates).length;
  const checkedCheckboxes = Object.values(checkboxStates).filter(checked => checked).length;
  return (checkedCheckboxes / totalCheckboxes) * 100;
}