document.addEventListener("DOMContentLoaded", () => {
  fetch("dimensions.json")
    .then((response) => response.json())
    .then((dimensions) => {
      const tableBody = document.getElementById("table-body");
      const averageLevelDisplay = document.getElementById("average-level");

      const levelDescriptionDisplay = document.getElementById("level-description");
      let selectedLevels = {}; // Track user selections

      // Updated level descriptions mapping (4 levels)
      const levelDescriptions = {
        1: "Foundational - Basic, ad-hoc practices.",
        2: "Improving - Some structure, still evolving.",
        3: "Accelerating - Standardised, stable processes with frequent interactions.",
        4: "Leading - On-demand deployment, highly optimised DevOps practices."
      };

      // Save State Button (sends state to server via SQLite)
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
          .then((response) => response.text())
          .then((data) => {
            // console.log("State saved successfully:", data);
            // alert("State saved successfully!");
          })
          .catch((error) => {
            console.error("Error saving state:", error);
            alert("Error saving state!");
          });
      });

      const loadStateButton = document.getElementById("load-state-btn");
      loadStateButton.addEventListener("click", () => {
        fetch("/load-state")
          .then((response) => {
            if (!response.ok) {
              if (response.status === 404) {
                throw new Error("No state saved. Please save state first.");
              } else {
                throw new Error("Error loading state");
              }
            }
            return response.json();
          })
          .then((data) => {
            if (data.selectedLevels) {
              loadModelState(data);
            } else {
              alert("No state saved");
            }
          })
          .catch((error) => {
            console.error("Error loading state:", error);
            alert(error.message);
          });
      });

      const resetStateButton = document.getElementById("reset-state-btn");
      resetStateButton.addEventListener("click", () => {
        if (confirm("Warning: This will delete all saved state and start from fresh. Are you sure you want to proceed?")) {
          // Call the server to reset the state in the database.
          fetch("/reset-state", {
            method: "POST"
          })
            .then(response => response.text())
            .then(data => {
              console.log("Server reset:", data);
              // Reset the client UI.
              resetModel();
              alert("Model has been reset to fresh state.");
            })
            .catch(error => {
              console.error("Error resetting state:", error);
              alert("Error resetting state!");
            });
        }
      });

      function loadModelState(savedState) {
        const { selectedLevels: savedLevels } = savedState;
        dimensions.forEach((dimension, dimensionIndex) => {
          // Always update the tracking variable.
          selectedLevels[dimensionIndex] = savedLevels[dimensionIndex] || {};
          dimension.subDimensions.forEach((subDim, subDimIndex) => {
            // Save the value from saved state.
            if (savedLevels[dimensionIndex] && savedLevels[dimensionIndex][subDimIndex] !== undefined) {
              selectedLevels[dimensionIndex][subDimIndex] = savedLevels[dimensionIndex][subDimIndex];
            }
            // If dropdown exists (i.e. dimension is expanded), update its value.
            const levelSelector = document.querySelector(
              `#dimension-${dimensionIndex}-subdimension-${subDimIndex}`
            );
            if (levelSelector) {
              levelSelector.value = savedLevels[dimensionIndex]?.[subDimIndex] || "";
            }
          });
          updateProgress(dimensionIndex);
        });
        updateAverageLevel();
      }

      // Reset the model (client-side only): clear selections, progress bars, and update display.
      function resetModel() {
        selectedLevels = {}; // Clear tracking object.
        // Reset all dropdowns (whether expanded or collapsed)
        const allSelects = document.querySelectorAll("select.level-selector");
        allSelects.forEach((select) => {
          select.value = "";
        });
        // Reset progress bars for each dimension.
        dimensions.forEach((dimension, dimensionIndex) => {
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
        });
        // Reset overall average display.
        averageLevelDisplay.textContent = "Please select levels for each dimension";
        levelDescriptionDisplay.textContent = "";
      }

      function updateProgress(dimensionIndex) {
        const selectElements = document.querySelectorAll(
          `.sub-dimension-${dimensionIndex} select.level-selector`
        );
        let total = 0;
        let count = 0;

        if (selectElements.length > 0) {
          selectElements.forEach((select) => {
            if (select.value === "") return;
            total += parseInt(select.value);
            count++;
          });
        } else {
          // If collapsed, compute using saved state.
          if (selectedLevels[dimensionIndex]) {
            Object.values(selectedLevels[dimensionIndex]).forEach((val) => {
              if (val !== "" && val !== undefined) {
                total += val;
                count++;
              }
            });
          }
        }

        const dimensionSubCount = dimensions[dimensionIndex].subDimensions.length;
        if (count < dimensionSubCount) {
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
        // Adjusted for 4 levels instead of 5
        let percentage = (average / 4) * 100;

        // Expanded view progress bar.
        const progressBar = document.getElementById(`progress-bar-${dimensionIndex}`);
        if (progressBar) {
          progressBar.style.width = `${percentage}%`;
          progressBar.textContent = `${percentage.toFixed(1)}% Complete`;
          progressBar.className = "progress-bar";
          if (percentage === 100) {
            progressBar.classList.add("colour5");
          } else if (percentage > 75) {
            progressBar.classList.add("colour4");
          } else if (percentage > 50) {
            progressBar.classList.add("colour3");
          } else if (percentage > 25) {
            progressBar.classList.add("colour2");
          } else {
            progressBar.classList.add("colour1");
          }
        }

        // Collapsed (thin) view progress bar.
        const thinProgressBar = document.getElementById(`progress-bar-closed-${dimensionIndex}`);
        if (thinProgressBar) {
          thinProgressBar.style.width = `${percentage}%`;
          thinProgressBar.textContent = "";
          thinProgressBar.className = "progress-bar progress-bar-thin";
          if (percentage === 100) {
            thinProgressBar.classList.add("colour5");
          } else if (percentage > 75) {
            thinProgressBar.classList.add("colour4");
          } else if (percentage > 50) {
            thinProgressBar.classList.add("colour3");
          } else if (percentage > 25) {
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

      // Update overall average only when all dropdowns are selected.
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
          averageLevelDisplay.textContent = "Please select levels for each dimension";
          levelDescriptionDisplay.textContent = "";
          return;
        }

        // Compute the average level on a 1..4 scale
        let averageLevel = totalLevels / totalSubdimensions;
        let roundedAverageLevel = Math.round(averageLevel);

        // Calculate percentage complete: if all selections are at level 1, that's 0% complete,
        // if they're all at level 4, that's 100% complete.
        let percentage = (averageLevel / 4 ) * 100;

        // For percentage calculations with 4 levels
        let maxPossibleLevels = totalSubdimensions * 4;
        let overallProgress =
          ((totalLevels - totalSubdimensions) / (maxPossibleLevels - totalSubdimensions)) * 100;

        // If you want a minimum progress display, you can keep or remove this line:
        overallProgress = Math.max(20, overallProgress);

        // Display results
        averageLevelDisplay.textContent = `Level: ${roundedAverageLevel} (${percentage.toFixed(2)}% completed)`;
        levelDescriptionDisplay.textContent = levelDescriptions[roundedAverageLevel] || "";
      }

      function getModelState() {
        const modelState = { selectedLevels: {} };
        dimensions.forEach((dimension, dimensionIndex) => {
          modelState.selectedLevels[dimensionIndex] = {};
          // If there is no stored state for this dimension, default every sub-dimension to blank.
          if (!selectedLevels[dimensionIndex]) {
            dimension.subDimensions.forEach((_, subDimIndex) => {
              modelState.selectedLevels[dimensionIndex][subDimIndex] = "";
            });
          } else {
            dimension.subDimensions.forEach((_, subDimIndex) => {
              // Use the value from selectedLevels; if it's falsy, store blank.
              modelState.selectedLevels[dimensionIndex][subDimIndex] =
                selectedLevels[dimensionIndex][subDimIndex] || "";
            });
          }
        });
        return modelState;
      }

      // Render dimensions and their dropdowns with blank defaults and a thin progress bar row.
      function renderDimensions() {
        dimensions.forEach((dimension, dimensionIndex) => {
          // Dimension row.
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

          // Thin progress bar row.
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

                // Default blank option.
                const defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.textContent = "Select level";
                select.appendChild(defaultOption);

                // Level options (4-level scale)
                subDim.levels.forEach((levelText, levelIndex) => {
                  const option = document.createElement("option");
                  option.value = levelIndex + 1; // 1..4
                  option.textContent = `Level ${levelIndex + 1}: ${levelText}`;
                  select.appendChild(option);
                });

                // Use saved value if exists.
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

              // Full progress row (expanded view).
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
      averageLevelDisplay.textContent = "Please select levels for each dimension";
      levelDescriptionDisplay.textContent = "";
    })
    .catch((error) => console.error("Error loading dimensions:", error));
});
