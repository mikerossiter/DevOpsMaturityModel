<div align="center">

# DevOps Maturity Assessment Tool

**Assess. Track. Improve.**

A lightweight, self-hosted tool for measuring and driving DevOps adoption across your organisation.

---

[Getting Started](#getting-started) · [Features](#features) · [How It Works](#how-it-works) · [Customisation](#customisation) · [License](#license)

</div>

## Why This Tool?

Most DevOps transformations stall because teams lack a clear picture of where they are and where they need to go. This tool gives you that picture — a structured, data-driven assessment across six integrated dimensions, paired with gap analysis and time-series tracking to keep improvement efforts honest and on course.

It runs locally or in a container, stores everything in a lightweight SQLite database, and requires no external services.

## Features

| | |
|---|---|
| **Multi-Dimensional Assessment** | Evaluate maturity across 6 dimensions and 18 sub-dimensions on a 4-level scale |
| **Gap Analysis Reports** | Generate printable reports showing current state, target state, and space for action plans |
| **Time-Series Tracking** | Save snapshots over time and visualise adoption trends on an interactive graph |
| **Fully Customisable** | Modify `dimensions.json` to tailor dimensions, levels, and descriptions to your context |
| **Persistent State** | SQLite-backed storage that survives container restarts via Docker volumes |
| **Zero External Dependencies** | No cloud services, no accounts — runs entirely on your infrastructure |

## Dimensions

The assessment framework covers six areas that collectively represent DevOps capability:

| Dimension | Sub-Dimensions |
|---|---|
| **Continuous Delivery & Automation** | Version Control & Trunk-Based Development · CI & Test Automation · Deployment Automation & Release Orchestration · Database Change Management |
| **Architecture & Infrastructure** | Loosely Coupled Architecture · Cloud & Infrastructure Automation · Platform Engineering |
| **Lean Product Management & Process** | Working in Small Batches & Limiting WIP · User-Centric & Hypothesis-Driven Development · Stable, Prioritised Backlog |
| **Observability & Reliability** | Monitoring & Alerting · Failure Recovery & Incident Response · Chaos Engineering / Proactive Resilience |
| **Security & Compliance** | Shift-Left Security · Secure Software Supply Chain · Compliance Automation |
| **Culture & Leadership** | Westrum Organisational Culture · Transformational Leadership · Team Autonomy & Empowerment |

Each sub-dimension is rated across four maturity levels:

| Level | Description |
|---|---|
| **1 — Foundational** | Processes are being established; initial awareness and adoption efforts are underway |
| **2 — Improving** | Greater consistency and automation; teams actively refine capabilities |
| **3 — Accelerating** | Advanced automation and collaboration; feedback loops and rapid delivery are emphasised |
| **4 — Leading** | Continuous improvement is cultural; processes are dynamic, data-driven, and deliver high performance |

## Getting Started

### Prerequisites

- **Node.js** (for local deployment), or
- **Docker** (for containerised deployment)

### Option 1 — Run with Node.js

```bash
git clone <repository-url>
cd devops-maturity-model
npm install
npm start
```

Open [http://localhost:3131](http://localhost:3131).

### Option 2 — Run with Docker

```bash
docker run -d \
  --name devops-maturity-model \
  --restart=always \
  -p 3131:3131 \
  -v devops_data:/app/data \
  registry.gitlab.com/devops-maturity-model/devops-maturity-model:latest
```

The `-v devops_data:/app/data` flag ensures your SQLite database persists across container restarts.

**To update:**

```bash
docker stop devops-maturity-model
docker rm devops-maturity-model
docker pull registry.gitlab.com/devops-maturity-model/devops-maturity-model:latest
```

Then re-run the `docker run` command above.

### Uninstall

**Node.js:**

```bash
npm stop
```

**Docker:**

```bash
docker stop devops-maturity-model
docker rm devops-maturity-model
docker rmi registry.gitlab.com/devops-maturity-model/devops-maturity-model:latest
docker volume rm devops_data
```

## How It Works

### 1. Survey Your Baseline

Start by understanding your current DevOps state. Consider running the [DORA Quick Check](https://dora.dev/quickcheck/) or a similar questionnaire, and map your workflows using [Value Stream Mapping](https://dora.dev/guides/value-stream-management/) to identify bottlenecks.

### 2. Assess Each Sub-Dimension

For each of the 18 sub-dimensions, select the maturity level that best reflects your current practice. The tool calculates an overall maturity score and percentage to give you a snapshot of your DevOps posture.

### 3. Generate a Gap Analysis

Save your state and open the Gap Analysis report. It shows your current level alongside the next target level for every sub-dimension, with space to document improvement actions — a practical input for your transformation backlog.

### 4. Plan and Iterate

Use a structured improvement approach:

| Step | Action |
|---|---|
| **Understand the direction** | Define the broader goal your team is working towards |
| **Grasp current condition** | Use the assessment data to identify key constraints |
| **Set a target condition** | Pick a short-term milestone that moves you closer |
| **Iterate with PDCA cycles** | Run small experiments, check results, adjust |

This aligns with the [Improvement Kata](https://dora.dev/guides/devops-culture-transform/) approach recommended by DORA.

### 5. Track Progress Over Time

Each time you save, a timestamped snapshot is stored. Use the **Time Series Graph** to visualise adoption trends across all dimensions — spot improvements, stagnation, or regression at a glance.

### 6. Align with DORA Metrics

Use your assessment alongside the four key DORA metrics to measure real-world delivery performance:

| Metric | What It Measures |
|---|---|
| **Deployment Frequency** | How often code reaches production |
| **Lead Time for Changes** | Time from commit to production |
| **Change Failure Rate** | Percentage of deployments causing failures |
| **Rework Rate** | Speed of recovery from incidents |

### Further Reading

- [**Accelerate**](https://itrevolution.com/product/accelerate/) — Nicole Forsgren, Jez Humble, Gene Kim
- [**The DevOps Handbook**](https://itrevolution.com/product/the-devops-handbook-second-edition/) — Gene Kim, Jez Humble, Patrick Debois, John Willis, Nicole Forsgren
- [**Team Topologies**](https://teamtopologies.com/book) — Matthew Skelton, Manuel Pais
- [**Flow Engineering**](https://flowengineering.io/) — Steve Pereira, Andrew Davis
- [**DORA Capability Catalog**](https://dora.dev/capabilities/)

## Customisation

The tool's structure is defined in `dimensions.json`. Each dimension has a `name` and an array of `subDimensions`, each containing level descriptions. Modify this file to:

- Add, remove, or reorder dimensions
- Adjust level descriptions to match your organisation's language
- Remove sub-dimensions that don't apply to your context

Changes take effect on the next page load — no rebuild required.

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| Database | SQLite |
| Charting | Chart.js |
| Container | Docker (Alpine) |

## Legal Disclaimer

**Data Privacy:** This tool does not include built-in encryption for the SQLite database. Users are responsible for securing any data entered.

**PII:** Do not input personally identifiable information into `dimensions.json` or assessment notes.

**Liability:** The creators and distributors of this tool are not liable for any data breaches or legal issues arising from its use.

## License

This project is open source and licensed under the [GNU General Public License v3.0](./LICENSE).

© 2026 Mike Rossiter
