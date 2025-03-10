# DevOps Maturity Model
A web application for assessing and tracking DevOps maturity.

## Introduction
This project is designed to help organisations/projects/teams assess and track their DevOps maturity across multiple dimensions. The application is built using HTML, CSS, and JavaScript. It runs on a Node.js server and is designed for local use.

## Features
* Interactive assessment interface for evaluating DevOps maturity
* Simple and intuitive design
* Highly customisable dimensions and levels through the `dimensions.json` 
* Includes `Level` gauge to view approximate level of DevOps maturity as the model is completed.
* **Save State** to persist the current state (along with a timestamp) into a local SQLite database, building a history over time.
* **Load State** retrieves the most recent saved state from the SQLite database.
* **Reset** will clear the current state from the DB entirely and refresh the UI with a warning prompt.
* **Generate Graph** opens a separate graph view (graph.html) that displays a multi-dimensional line graph of your adoption progress over time using Chart.js.

## Customisation
The application uses a `dimensions.json` file to define the dimensions and levels of the DevOps Maturity Model. This file can be easily modified to add or remove dimensions, levels, and descriptions, allowing users to tailor the model to their specific needs.

The `dimensions.json` file is a JSON object that contains an array of dimension objects, each with the following properties:
* `name` is the high-level name of the dimension (e.g. "Continuous Integration", "Collaboration and Culture").
* `subDimensions` are an array of sub-dimension objects, each representing a level description or specific aspect. Each sub-dimension includes its own name and an array of level descriptions.

By modifying the `dimensions.json` file, users can:
* Add new dimensions and levels to the model
* Remove existing dimensions and levels from the model
* Update the descriptions and details of existing dimensions and levels
* Reorder the dimensions and levels to reflect their organization's specific priorities and goals

## Getting Started
1. Clone the repository to your local machine.
2. Navigate to the folder with `cd <your-file-path>/devops-maturity-model` in order to run the model.
3. Run `npm install` to install any dependencies required by the `package.json`.
2. Run `npm start` to run the server locally.
3. Visit `http://127.0.0.1:3131` to view the maturity model.

## Requirements
* Node.js (for running the server)

## Contributing
Contributions are welcome! If you'd like to contribute to this project, please fork the repository and submit a pull request with your changes.

## License

## Acknowledgments
