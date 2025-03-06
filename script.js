document.addEventListener("DOMContentLoaded", () => {
  fetch("dimensions.json")
    .then((response) => response.json())
    .then((dimensions) => {
      const tableBody = document.getElementById("table-body");
      const averageLevelDisplay = document.getElementById("average-level");
      let selectedLevels = {}; // Track user selections

      // Save State Button
      const saveStateButton = document.getElementById("save-state-btn");
      saveStateButton.addEventListener("click", () => {
        const timestamp = new Date().toISOString();
        const modelState = getModelState();
        const filename = `state-${timestamp}.json`;

        fetch("/save-state", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: filename,
            state: JSON.stringify(modelState, null, 2),
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("State saved successfully:", data);
            alert("State saved successfully!");
          })
          .catch((error) => {
            console.error("Error saving state:", error);
            alert("Error saving state!");
          });
      });

      // Load State Button
      const loadStateButton = document.getElementById("load-state-btn");
      loadStateButton.addEventListener("click", () => {
        fetch("/load-state")
          .then((response) => response.json())
          .then((data) => {
            if (data.selectedLevels) {
              loadModelState(data);
              alert("State loaded successfully!");
            } else {
              alert("No valid state data found");
            }
          })
          .catch((error) => {
            console.error("Error loading state:", error);
            alert("Error loading state!");
          });
      });

      function loadModelState(savedState) {
        const { selectedLevels: savedLevels } = savedState;
        dimensions.forEach((dimension, dimensionIndex) => {
          if (!selectedLevels[dimensionIndex]) {
            selectedLevels[dimensionIndex] = {};
          }
          dimension.subDimensions.forEach((subDim, subDimIndex) => {
            const savedLevel = savedLevels[dimensionIndex]?.[subDimIndex];
            const levelSelector = document.querySelector(
              `#dimension-${dimensionIndex}-subdimension-${subDimIndex}`
            );
            if (levelSelector && savedLevel) {
              levelSelector.value = savedLevel;
              selectedLevels[dimensionIndex][subDimIndex] = savedLevel;
            }
          });
          updateProgress(dimensionIndex);
        });
        updateAverageLevel();
      }

      // Update aggregated progress for a dimension in both thin (closed) and full (if expanded) bars
      function updateProgress(dimensionIndex) {
        // Calculate aggregated progress from sub-dimensions
        const selectElements = document.querySelectorAll(
          `.sub-dimension-${dimensionIndex} select.level-selector`
        );
        let total = 0;
        let count = 0;
        selectElements.forEach((select) => {
          const val = parseInt(select.value) || 1;
          total += val;
          count++;
        });
        let average = total / count;
        let percentage = (average / 5) * 100;

        // Update full progress bar if exists (expanded state)
        const progressBar = document.getElementById(`progress-bar-${dimensionIndex}`);
        if (progressBar) {
          progressBar.style.width = `${percentage}%`;
          progressBar.textContent = `${percentage.toFixed(1)}% Complete`;
          progressBar.className = "progress-bar"; // Reset
          if (percentage === 100) {
            progressBar.classList.add("colour5");
          } else if (percentage > 80) {
            progressBar.classList.add("colour4");
          } else if (percentage > 60) {
            progressBar.classList.add("colour3");
          } else if (percentage > 40) {
            progressBar.classList.add("colour2");
          } else {
            progressBar.classList.add("colour1");
          }
        }
        // Update thin (closed) progress bar
        const thinProgressBar = document.getElementById(`progress-bar-closed-${dimensionIndex}`);
        if (thinProgressBar) {
          thinProgressBar.style.width = `${percentage}%`;
          // Optionally, you can omit text on a thin bar:
          thinProgressBar.textContent = "";
          thinProgressBar.className = "progress-bar progress-bar-thin";
          if (percentage === 100) {
            thinProgressBar.classList.add("colour5");
          } else if (percentage > 80) {
            thinProgressBar.classList.add("colour4");
          } else if (percentage > 60) {
            thinProgressBar.classList.add("colour3");
          } else if (percentage > 40) {
            thinProgressBar.classList.add("colour2");
          } else {
            thinProgressBar.classList.add("colour1");
          }
        }
        updateAverageLevel();
      }

      function updateAllProgress() {
        dimensions.forEach((dimension, dimensionIndex) => {
          updateProgress(dimensionIndex);
        });
        updateAverageLevel();
      }

      // Update overall average level using all dimensions
      function updateAverageLevel() {
        let totalLevels = 0;
        let totalSubdimensions = 0;
        dimensions.forEach((dimension, dimensionIndex) => {
          dimension.subDimensions.forEach((subDim, subDimIndex) => {
            let level = 1;
            if (selectedLevels[dimensionIndex] && selectedLevels[dimensionIndex][subDimIndex]) {
              level = selectedLevels[dimensionIndex][subDimIndex];
            }
            totalLevels += level;
            totalSubdimensions++;
          });
        });
        let averageLevel = totalLevels / totalSubdimensions;
        let roundedAverageLevel = Math.round(averageLevel);
        let maxPossibleLevels = totalSubdimensions * 5;
        let overallProgress =
          ((totalLevels - totalSubdimensions) / (maxPossibleLevels - totalSubdimensions)) * 100;
        overallProgress = Math.max(20, overallProgress);
        averageLevelDisplay.textContent = `Average Level: ${roundedAverageLevel} (${overallProgress.toFixed(1)}% completed)`;
      }

      function getModelState() {
        const modelState = { selectedLevels: {} };
        dimensions.forEach((dimension, dimensionIndex) => {
          modelState.selectedLevels[dimensionIndex] = {};
          dimension.subDimensions.forEach((_, subDimIndex) => {
            const selectElement = document.querySelector(
              `#dimension-${dimensionIndex}-subdimension-${subDimIndex}`
            );
            if (selectElement) {
              modelState.selectedLevels[dimensionIndex][subDimIndex] = parseInt(selectElement.value);
            } else {
              modelState.selectedLevels[dimensionIndex][subDimIndex] = 1;
            }
          });
        });
        return modelState;
      }

      // Render dimensions and their dropdowns along with a thin progress bar row (always visible when closed)
      function renderDimensions() {
        dimensions.forEach((dimension, dimensionIndex) => {
          // Create dimension row
          const row = document.createElement("tr");
          row.classList.add("dimension-row");
          row.id = `row-${dimensionIndex}`;

          const cell = document.createElement("td");
          cell.textContent = dimension.name;
          cell.classList.add("clickable");
          cell.style.cursor = "pointer";
          cell.style.fontWeight = "bold";
          cell.colSpan = 2;
          row.appendChild(cell);
          tableBody.appendChild(row);

          // Create thin progress bar row (closed view)
          const closedProgressRow = document.createElement("tr");
          closedProgressRow.id = `progress-row-closed-${dimensionIndex}`;
          const closedProgressCell = document.createElement("td");
          closedProgressCell.colSpan = 2;
          const closedProgressContainer = document.createElement("div");
          closedProgressContainer.classList.add("progress-container");
          const thinProgressBar = document.createElement("div");
          thinProgressBar.classList.add("progress-bar", "progress-bar-thin");
          thinProgressBar.id = `progress-bar-closed-${dimensionIndex}`;
          closedProgressContainer.appendChild(thinProgressBar);
          closedProgressCell.appendChild(closedProgressContainer);
          closedProgressRow.appendChild(closedProgressCell);
          tableBody.insertBefore(closedProgressRow, row.nextSibling);

          let expanded = false;
          const arrow = document.createElement("span");
          arrow.classList.add("arrow");
          arrow.textContent = "   🔽";
          cell.appendChild(arrow);

          cell.addEventListener("click", () => {
            if (expanded) {
              // Collapse: Remove expanded sub-dimension rows and full progress row,
              // and show the thin (closed) progress bar row.
              const subRows = document.querySelectorAll(`.sub-dimension-${dimensionIndex}`);
              subRows.forEach((el) => el.remove());
              const progressRow = document.getElementById(`progress-row-${dimensionIndex}`);
              if (progressRow) progressRow.remove();
              // Show thin progress bar row
              closedProgressRow.style.display = "table-row";
              expanded = false;
            } else {
              // Expand: Hide the thin progress bar row and insert sub-dimension rows
              closedProgressRow.style.display = "none";
              if (!selectedLevels[dimensionIndex]) {
                selectedLevels[dimensionIndex] = {};
              }
              dimension.subDimensions.forEach((subDim, subDimIndex) => {
                const subRow = document.createElement("tr");
                subRow.classList.add(`sub-dimension-${dimensionIndex}`);

                const subCell1 = document.createElement("td");
                subCell1.textContent = subDim.name;
                subCell1.style.paddingLeft = "20px";

                const subCell2 = document.createElement("td");
                const select = document.createElement("select");
                select.classList.add("level-selector");
                select.id = `dimension-${dimensionIndex}-subdimension-${subDimIndex}`;

                subDim.levels.forEach((levelText, levelIndex) => {
                  const option = document.createElement("option");
                  option.value = levelIndex + 1;
                  option.textContent = `Level ${levelIndex + 1}: ${levelText}`;
                  select.appendChild(option);
                });

                // Set select value based on previous selection if available
                if (
                  selectedLevels[dimensionIndex] &&
                  selectedLevels[dimensionIndex][subDimIndex]
                ) {
                  select.value = selectedLevels[dimensionIndex][subDimIndex];
                } else {
                  select.value = "1";
                }

                select.addEventListener("change", () => {
                  selectedLevels[dimensionIndex][subDimIndex] = parseInt(select.value);
                  updateProgress(dimensionIndex);
                });

                subCell2.appendChild(select);
                subRow.appendChild(subCell1);
                subRow.appendChild(subCell2);
                // Insert sub-dimension rows right after the dimension row (and before the thin progress bar row)
                tableBody.insertBefore(subRow, closedProgressRow);
              });

              // Optionally, insert a full aggregated progress row (if you want a larger bar in expanded view)
              const progressRow = document.createElement("tr");
              progressRow.id = `progress-row-${dimensionIndex}`;
              const progressCell = document.createElement("td");
              progressCell.colSpan = 2;
              const progressContainer = document.createElement("div");
              progressContainer.classList.add("progress-container");
              const progressBar = document.createElement("div");
              progressBar.classList.add("progress-bar");
              progressBar.id = `progress-bar-${dimensionIndex}`;
              progressContainer.appendChild(progressBar);
              progressCell.appendChild(progressContainer);
              progressRow.appendChild(progressCell);
              tableBody.insertBefore(progressRow, closedProgressRow);
              expanded = true;
              updateProgress(dimensionIndex);
            }
          });
        });
      }

      // Initialize by rendering dimensions
      renderDimensions();
    })
    .catch((error) => console.error("Error loading dimensions:", error));
});
