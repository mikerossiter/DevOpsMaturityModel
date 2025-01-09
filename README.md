# DevOps Maturity Model
A web application for assessing and tracking DevOps maturity.

## Introduction
This project is designed to help organisations/projects/teams assess and track their DevOps maturity across multiple dimensions. The application is built using HTML, CSS, and JavaScript, and is intended for use on a local network.

## Features
* Interactive assessment interface for evaluating DevOps maturity
* Simple and intuitive design
* Highly customisable dimensions and levels through the `dimensions.json` 
* Includes `Average Level` gauge to view average level of DevOps maturity as the model is completed.
* **Save State** to automatically save state to local `state.json`.
* **Load State** from `state.json` locally automatically.
* Refresh the page to reset the model.

## Customisation
The application uses a `dimensions.json` file to define the dimensions and levels of the DevOps Maturity Model. This file can be easily modified to add or remove dimensions, levels, and descriptions, allowing users to tailor the model to their specific needs.

The `dimensions.json` file is a JSON object that contains an array of dimension objects, each with the following properties:
* `name`: The name of the high level dimension (e.g. "Continuous Integration")
* `levels`: An array of sub-dimensional level objects. Each level is on a separate row (5 in total). Users can add extra levels to the JSON by separating them with '. ' e.g. two levels = "Deployments occur manually. Releases follow a schedule"

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
3. Visit `http://localhost:3131` to view the maturity model.

## Requirements
* Node.js (for running the server)

## Contributing
Contributions are welcome! If you'd like to contribute to this project, please fork the repository and submit a pull request with your changes.

## License

## Acknowledgments
