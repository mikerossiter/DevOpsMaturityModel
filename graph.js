const graphContainer = document.getElementById('graph-container');
const ctx = document.getElementById('adoption-graph').getContext('2d');

fetch('/state-files')
    .then(response => response.json())
    .then(stateFiles => {
        if (!stateFiles.length) {
            graphContainer.innerHTML = '<p class="no-state-message">No state files found.</p>';
            return;
        }

        const data = stateFiles.map(file => {
            const state = JSON.parse(file);
            return {
                x: new Date(state.timestamp),
                y: state.completionPercentage
            };
        }).sort((a, b) => a.x - b.x);

        new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Completion (%)',
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    x: { type: 'time', time: { unit: 'day' } },
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });
    });
