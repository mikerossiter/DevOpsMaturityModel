document.addEventListener("DOMContentLoaded", () => {
  fetch("dimensions.json")
    .then((response) => response.json())
    .then((dimensions) => {
      const tableBody = document.getElementById("table-body");
      const averageLevelDisplay = document.getElementById("average-level");
      const levelDescriptionDisplay = document.getElementById("level-description");
      let selectedLevels = {}; // Track user selections

      // Level descriptions mapping
      const levelDescriptions = {
        1: "Level 1: Initial - Basic, ad-hoc practices.",
        2: "Level 2: Emerging - Some structure, still improving.",
        3: "Level 3: Established - Standardized and repeatable.",
        4: "Level 4: Advanced - Proactive, optimized processes.",
        5: "Level 5: Optimized - Fully automated, AI-driven improvements."
      };

      // Save State Button (functionality to be added later)
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

      // Load State Button (functionality to be added later)
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
            if (levelSelector && savedLevel !== "") {
              levelSelector.value = savedLevel;
              selectedLevels[dimensionIndex][subDimIndex] = savedLevel;
            }
          });
          updateProgress(dimensionIndex);
        });
        updateAverageLevel();
      }

      // Update the aggregated progress for a dimension in both full (expanded) and thin (closed) bars.
      function updateProgress(dimensionIndex) {
        const selectElements = document.querySelectorAll(
          `.sub-dimension-${dimensionIndex} select.level-selector`
        );
        let total = 0;
        let count = 0;
        selectElements.forEach((select) => {
          if (select.value === "") {
            // If any dropdown is blank, do not count it.
            return;
          }
          total += parseInt(select.value);
          count++;
        });
        // If not all dropdowns are selected, reset the progress bar.
        if (count < selectElements.length) {
          const progressBar = document.getElementById(`progress-bar-${dimensionIndex}`);
          if (progressBar) {
            progressBar.style.width = "0%";
            progressBar.textContent = "";
          }
          const thinProgressBar = document.getElementById(`progress-bar-closed-${dimensionIndex}`);
          if (thinProgressBar) {
            thinProgressBar.style.width = "0%";
            thinProgressBar.textContent = "";
          }
          updateAverageLevel();
          return;
        }
        let average = total / count;
        let percentage = (average / 5) * 100;

        // Update full progress bar (expanded view)
        const progressBar = document.getElementById(`progress-bar-${dimensionIndex}`);
        if (progressBar) {
          progressBar.style.width = `${percentage}%`;
          progressBar.textContent = `${percentage.toFixed(1)}% Complete`;
          progressBar.className = "progress-bar";
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
        // Update thin progress bar (closed view)
        const thinProgressBar = document.getElementById(`progress-bar-closed-${dimensionIndex}`);
        if (thinProgressBar) {
          thinProgressBar.style.width = `${percentage}%`;
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

      // Update the overall average level display if—and only if—all dropdowns are selected.
      function updateAverageLevel() {
        let totalLevels = 0;
        let totalSubdimensions = 0;
        let allSelected = true;
        dimensions.forEach((dimension, dimensionIndex) => {
          dimension.subDimensions.forEach((subDim, subDimIndex) => {
            totalSubdimensions++;
            if (
              !selectedLevels[dimensionIndex] ||
              selectedLevels[dimensionIndex][subDimIndex] === undefined ||
              selectedLevels[dimensionIndex][subDimIndex] === ""
            ) {
              allSelected = false;
            } else {
              totalLevels += selectedLevels[dimensionIndex][subDimIndex];
            }
          });
        });
        if (!allSelected) {
          averageLevelDisplay.textContent = "Average Level: --";
          levelDescriptionDisplay.textContent = "";
          return;
        }
        let averageLevel = totalLevels / totalSubdimensions;
        let roundedAverageLevel = Math.round(averageLevel);
        let maxPossibleLevels = totalSubdimensions * 5;
        let overallProgress =
          ((totalLevels - totalSubdimensions) / (maxPossibleLevels - totalSubdimensions)) * 100;
        overallProgress = Math.max(20, overallProgress);
        averageLevelDisplay.textContent = `Average Level: ${roundedAverageLevel} (${overallProgress.toFixed(1)}% completed)`;
        levelDescriptionDisplay.textContent = levelDescriptions[roundedAverageLevel] || "";
      }

      function getModelState() {
        const modelState = { selectedLevels: {} };
        dimensions.forEach((dimension, dimensionIndex) => {
          modelState.selectedLevels[dimensionIndex] = {};
          dimension.subDimensions.forEach((_, subDimIndex) => {
            const selectElement = document.querySelector(
              `#dimension-${dimensionIndex}-subdimension-${subDimIndex}`
            );
            if (selectElement && selectElement.value !== "") {
              modelState.selectedLevels[dimensionIndex][subDimIndex] = parseInt(selectElement.value);
            } else {
              modelState.selectedLevels[dimensionIndex][subDimIndex] = "";
            }
          });
        });
        return modelState;
      }

      // Render dimensions and their dropdowns along with a thin progress bar row (always visible when closed)
      function renderDimensions() {
        dimensions.forEach((dimension, dimensionIndex) => {
          // Create dimension row.
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

          // Create thin progress bar row (closed view).
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
              // Collapse: remove sub-dimension rows and full progress row, show thin progress bar row.
              const subRows = document.querySelectorAll(`.sub-dimension-${dimensionIndex}`);
              subRows.forEach((el) => el.remove());
              const progressRow = document.getElementById(`progress-row-${dimensionIndex}`);
              if (progressRow) progressRow.remove();
              closedProgressRow.style.display = "table-row";
              expanded = false;
            } else {
              // Expand: hide thin progress bar row and insert sub-dimension rows.
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

                // Add default blank option.
                const defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.textContent = "Select level";
                select.appendChild(defaultOption);

                // Add level options.
                subDim.levels.forEach((levelText, levelIndex) => {
                  const option = document.createElement("option");
                  option.value = levelIndex + 1;
                  option.textContent = `Level ${levelIndex + 1}: ${levelText}`;
                  select.appendChild(option);
                });

                // Set the select value based on saved state if available.
                if (
                  selectedLevels[dimensionIndex] &&
                  selectedLevels[dimensionIndex][subDimIndex] !== undefined &&
                  selectedLevels[dimensionIndex][subDimIndex] !== ""
                ) {
                  select.value = selectedLevels[dimensionIndex][subDimIndex];
                } else {
                  select.value = "";
                }

                select.addEventListener("change", () => {
                  if (select.value === "") {
                    selectedLevels[dimensionIndex][subDimIndex] = "";
                  } else {
                    selectedLevels[dimensionIndex][subDimIndex] = parseInt(select.value);
                  }
                  updateProgress(dimensionIndex);
                });

                subCell2.appendChild(select);
                subRow.appendChild(subCell1);
                subRow.appendChild(subCell2);
                tableBody.insertBefore(subRow, closedProgressRow);
              });

              // Optionally, insert a full aggregated progress row (expanded view).
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

      // Initialize by rendering dimensions (with blank dropdowns) and clear average level.
      renderDimensions();
      averageLevelDisplay.textContent = "Average Level: --";
      levelDescriptionDisplay.textContent = "";
    })
    .catch((error) => console.error("Error loading dimensions:", error));
});
