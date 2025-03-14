# DevOps Maturity Model

A web application for assessing and tracking DevOps maturity.

## Introduction

This project is designed to help all organisations, projects, and teams assess and track their DevOps maturity across multiple dimensions. The application is built using HTML, CSS, and JavaScript, runs on a Node.js server with an SQLite database, and is intended for local use via the browser using npm or the Docker image. It emphasises interactivity, customisation, and data-driven evaluation of DevOps practices. While DevOps initially emerged as a practice aimed at software development teams, this model is designed to support IT integration at all levels, ensuring a holistic approach across the entire organisation.

## Features

The model offers an interactive assessment interface that allows users to evaluate their DevOps maturity with precision. Customisability is achieved through the `dimensions.json` file, which lets users tailor dimensions and levels to meet their specific organisational needs. An overall "Level" gauge provides an approximate measure of maturity once the model is fully completed. The system persistently saves the current state, thereby creating a historical record of progress. Users can load the most recent saved state or reset the model entirely. Additionally, the application includes a time series graph view that displays a multi-dimensional line graph of adoption progress over time.

## How to Use This Maturity Model

1. **Survey Your DevOps Baseline**  
   - Begin by conducting an initial DevOps survey (for example, the DORA Quick Check or similar questionnaire). This will help you understand what DevOps currently looks like within your organisation or team.  
   - As recommended by DORA, consider mapping your workflows with [**Value Stream Mapping (VSM)**](https://dora.dev/guides/value-stream-management/). By visualising your end-to-end process, you can pinpoint major bottlenecks or constraints and highlight potential improvement areas.

2. **Assign Levels for Each Subdimension**  
   - For each dimension and subdimension (e.g., “Continuous Delivery & Automation”, “Architecture & Infrastructure”), select the level (Foundational, Improving, Accelerating, or Optimising) that most closely matches your current practice. **N.B** Users can adapt the sub-dimensions if, for instance, a particular domain is not applicable to their environment post initial survey.  
   - These selections will generate an **average maturity level** (ranging from **1** to **4**) and a **percentage** complete to help visualise the journey. This average can serve as a useful snapshot of your overall DevOps posture.

3. **Generate a Gap Analysis Report**  
   - Once you have saved your state, the application can generate a Gap Analysis Report. This report lists each dimension and sub-dimension, shows your current level description alongside the next target level (if available), and provides text areas for you to input your own gap analysis and action plan. This report is a key tool in your transformation Kata, guiding you through a cycle of Plan, Do, Check, and Act to incrementally improve your DevOps practices.

3. **Plan Your Next Steps with a Kata**  
   - Once you have established your current level, decide how you would like to **move from your present state (e.g., Foundational) to a higher state (e.g., Improving)**.  
   - Use a [**Kata cycle**](https://dora.dev/guides/devops-culture-transform/) (Plan, Do, Check, Act) to run small experiments that close the gap between your current level and your target level.

| **Step**                                     | **Explanation**                                                                     |
|----------------------------------------------|-------------------------------------------------------------------------------------|
| **1. Understand the Direction or Challenge** | Define the broader goal or “true north” that your team wants to achieve. Consider what success looks like. 🧭                                 |
| **2. Grasp the Current Condition**           | Gather data and insights about your current process. Identify key constraints, issues, and blind spots. 🔎                                |
| **3. Establish the Next Target Condition**   | Set a short-term milestone or goal that will bring you closer to the long-term challenge. 🎯                                             |
| **4. Iterate Toward the Target Condition**   | Run small experiments, check results frequently (PDCA cycles), and adjust based on learnings. 🔁                                             |


   - If you prefer, you can refer to the following example table to see how the levels align across the subdimensions (note that **Foundational, Improving, Accelerating, Leading** are used here rather than other naming conventions).

   | Level                 | Description                                                    |
   |-----------------------|----------------------------------------------------------------|
   | **1 - Foundational**  | Processes and practices are being established; initial awareness and adoption efforts are underway.   |
   | **2 - Improving**     | Greater consistency and automation are being introduced; teams actively refine capabilities.          |
   | **3 - Accelerating**  | Advanced automation and collaboration are in place; feedback loops and rapid delivery are emphasised. |
   | **4 - Leading**       | Continuous improvement is cultural; processes are dynamic, data-driven, and deliver high performance. |

   - **Remember** - the levels are guidelines rather than a strict prescription.  

5. **Incorporate into Regular Team Ceremonies**  
   - Consider revisiting this model and your selected levels in **monthly retrospectives**, **weekly stand-ups**, or other regular meetings.  
   - By reviewing progress frequently, you can keep your improvement initiatives on track and adapt them in response to changing conditions.

6. **Track Adoption Over Time**  
   - Each time you update your levels, make sure to save the changes so that you can **load the time series graph**. This historical view will show whether your adoption and maturity are **improving, stagnating, or even regressing**.  
   - Regularly reviewing these trends helps you spot patterns and react to potential downward trends promptly. Teams often revisit their DevOps maturity every 1–3 sprints (or monthly) to reflect incremental progress.

7. **Further Reading and Next Steps**  
   - After you have progressed through these stages and feel comfortable at (or near) the Optimising level, you may wish to explore more advanced team dynamics.  
   - **Team Topologies** (by Matthew Skelton and Manuel Pais) is an excellent resource to help you refine the structure and collaboration of your teams at scale.  
   - Investigate how your results align with the **DORA metrics**.
   - Use the **DORA capability catalog** (that aligns with the **three ways** as defined in the **DevOps Handbook** by Gene Kim et al) to improve and drive meaningful change.  

| **Deployment Frequency** 🚀  **How often new code is deployed to production. Frequent, smaller releases reduce risk.** | **Lead Time for Changes** ⏱️  **Time from commit to production. Shorter lead times mean faster feedback and higher agility.** |
|:---:|:---:|
| **Change Failure Rate** ❌ **Percentage of deployments causing production failures or rollbacks. Lower is better.** | **Time to Restore Service** ⏰ **Speed of recovering from incidents or failed deployments. Rapid recovery minimises impact.** |



By following this approach—*surveying, mapping, selecting levels, running improvement Katas, and tracking progress over time*—you will create a **continuous improvement culture** that systematically drives your teams towards higher levels of DevOps maturity.

## Customisation

The application utilises a `dimensions.json` file to define its structure. This file comprises an array of dimension objects, each with two key properties:
- **name:** The high-level identifier of the dimension (e.g. "Continuous Integration", "Collaboration and Culture").
- **subDimensions:** An array of sub-dimension objects, each representing a specific aspect or level description.

By modifying this file, users can add, remove, or reorder dimensions and levels, and update the descriptions to reflect their organisation's unique priorities and goals.

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
Open your browser and navigate to [http://localhost:3131](http://localhost:3131) to use the model.

## Docker Deployment

Alternatively, you can run the application as a Docker container. Simply execute the following command (Docker will automatically pull the image if it is not available locally):
```bash
docker run -d --name devops-maturity-model --restart=always -p 3131:3131 -v devops_data:/app/data mikerossiter/devops-maturity-model:latest
```
This command will start the container with a persistent Docker volume (devops_data) mounted to the container's /app/data directory and the `--restart=always` ensures that your SQLite database persists across container restarts.

To update the running image run:
```bash
docker pull mikerossiter/devops-maturity-model
```

## Requirements

    Node.js (for local server deployment)
    Docker (for containerised deployment)

## Uninstall

To stop the local server running with node.js simply type:
```bash
npm stop
```

To stop and remove the docker container run:
```bash
docker stop devops-maturity-model &&
docker rm devops-maturity-model &&
docker rmi mikerossiter/devops-maturity-model:latest &&
docker volume rm devops_data
```

## Legal Disclaimer

**Data Privacy and Security:** This tool is designed solely to assess DevOps maturity and does not include built-in encryption for the SQLite database. Users are responsible for ensuring the security and privacy of any data entered.

**Personal Information (PII):** Do not input any PII into the `dimensions.json` file. Incorporating PII may lead to data breaches and legal complications.

**Liability:** The creators and distributors of this tool are not liable for any data breaches or legal issues arising from its use or from the inclusion of personal data.
