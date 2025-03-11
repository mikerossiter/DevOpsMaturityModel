# DevOps Maturity Model

A web application for assessing and tracking DevOps maturity.

## Introduction

This project is designed to help organisations, projects, and teams assess and track their DevOps maturity across multiple dimensions. The application is built using HTML, CSS, and JavaScript, runs on a Node.js server, and is intended for local use. It emphasises interactivity, customisation, and data-driven evaluation of DevOps practices.

## Features

The model offers an interactive assessment interface that allows users to evaluate their DevOps maturity with precision. Customisability is achieved through the `dimensions.json` file, which lets users tailor dimensions and levels to meet their specific organisational needs. An overall "Level" gauge provides an approximate measure of maturity once the model is fully completed. The system persistently saves the current state (including a timestamp) into a local SQLite database, thereby creating a historical record of progress. Users can load the most recent saved state or reset the model entirely—resetting both the UI and the underlying database after a warning prompt. Additionally, the application includes a graph view (accessible via graph.html) that displays a multi-dimensional line graph of adoption progress over time using Chart.js.

## Customisation

The application utilises a `dimensions.json` file to define its structure. This file comprises an array of dimension objects, each with two key properties:
- **name:** The high-level identifier of the dimension (e.g. "Continuous Integration", "Collaboration and Culture").
- **subDimensions:** An array of sub-dimension objects, each representing a specific aspect or level description.

By modifying this file, users can add, remove, or reorder dimensions and levels, and update the descriptions to reflect their organisation's unique priorities and goals.

## Legal Disclaimer

**Data Privacy and Security:** This tool is designed solely to assess DevOps maturity and does not include built-in encryption for the SQLite database. Users are responsible for ensuring the security and privacy of any data entered.

**Personal Information (PII):** Do not input any PII into the `dimensions.json` file. Incorporating PII may lead to data breaches and legal complications.

**Liability:** The creators and distributors of this tool are not liable for any data breaches or legal issues arising from its use or from the inclusion of personal data.

## Getting Started

### Local Deployment

To run the application locally:

1. Clone the repository to your local machine.
2. Navigate to the project folder:

```bash
cd <your-file-path>/devops-maturity-model
```

Install the dependencies:

```bash
npm install
```
Start the server:
```bash
npm start
```
Open your browser and navigate to http://127.0.0.1:3131 to use the model.

## Docker Deployment

Alternatively, you can run the application as a Docker container. Simply execute the following command (Docker will automatically pull the image if it is not available locally):
```bash
docker run -d --restart=always -p 3131:3131 -v devops_data:/app/data mikerossiter/devops-maturity-model:latest
```
This command will start the container with a persistent Docker volume (devops_data) mounted to the container's /app/data directory and the `--restart=always` ensures that your SQLite database persists across container restarts.

## Requirements

    Node.js (for local server deployment)
    Docker (for containerised deployment)

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your proposed changes.