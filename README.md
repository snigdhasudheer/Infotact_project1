# EconoCausal — Dynamic Pricing via Double Machine Learning

**An Interactive Causal Inference and Data Analytics Dashboard**

EconoCausal is a collaborative data science and machine learning project developed as part of the **Infotact Advanced Data Science & ML Engineering Internship**.

The project combines exploratory data analysis, causal inference, Double Machine Learning (DML), causal robustness analysis, and budget allocation scenarios in an interactive web dashboard.

The objective is to transform analytical results into understandable insights through a React frontend and Python FastAPI backend.

> **Research scope:** The Hillstrom dataset is used to estimate the effect of email marketing treatment on customer conversion. It does not directly estimate the causal effect of discounts or product prices. The Online Retail dataset is used for descriptive sales analysis and historical revenue-based allocation scenarios.

---

## Project Objectives

- Develop a reusable dataset upload and validation workflow.
- Analyze customer behavior and historical retail transactions.
- Compare treatment and control group performance.
- Estimate treatment effects using Double Machine Learning.
- Explore heterogeneous treatment effects and uncertainty.
- Document causal assumptions and perform DoWhy refutation tests.
- Build an interactive dashboard for analytical results.
- Explore budget allocation using historical product revenue.

## Technology Stack

| Component        | Technologies       |
| ---------------- | ------------------ |
| Programming      | Python, JavaScript |
| Frontend         | React, Vite        |
| Backend          | FastAPI, Uvicorn   |
| Data Processing  | Pandas, NumPy      |
| Visualization    | Plotly             |
| Causal Inference | EconML, DoWhy      |
| Optimization     | SciPy              |
| Testing          | Pytest             |
| Version Control  | Git, GitHub        |

## Datasets

### 1. Hillstrom Email Marketing Dataset

Used for causal treatment-effect analysis.

- Original observations: 64,000
- Selected groups: Mens E-Mail and No E-Mail
- Final analysis sample: 42,613
- Treatment variable: `treatment`
- Outcome variable: `conversion`

Treatment definition:

- `1` = Mens E-Mail
- `0` = No E-Mail

Outcome definition:

- `1` = Customer converted
- `0` = Customer did not convert

Selected pre-treatment covariates include recency, history, mens, womens, zip code, newbie, and channel.

### 2. UCI Online Retail Dataset

Used for descriptive retail analysis and product-month summaries.

Important columns:

- InvoiceNo
- StockCode
- Description
- Quantity
- InvoiceDate
- UnitPrice
- CustomerID
- Country

The dataset supports product-level sales analysis, monthly summaries, historical revenue calculations, and budget allocation scenarios.

**Important limitation:** Observational transaction data does not independently establish causal relationships between discounts, prices, and sales.

---

## Project Features

### 1. Interactive Dashboard

- React-based dashboard interface.
- Navigation between analytical sections.
- Integration of frontend components and backend services.
- Centralized presentation of analytical results.

### 2. Dataset Upload and Validation

- Excel file upload.
- File-format and schema validation.
- Dataset preview.
- Validation error handling.
- Dataset summary generation.
- Product-month CSV export.
- Dataset report generation.

### 3. Exploratory Data Analysis

Interactive visualizations include:

- Customer Count by Group.
- Visit and Conversion Rates.
- Average Customer Spend.

These charts provide descriptive comparisons of customer groups.

### 4. Baseline Metrics

Displays treatment and control group performance using customer counts, conversions, conversion rates, and percentage-point differences.

| Group             | Customers | Conversions | Conversion Rate |
| ----------------- | --------: | ----------: | --------------: |
| Mens E-Mail       |    21,307 |         267 |         1.2531% |
| Womens E-Mail     |    21,387 |         189 |         0.8837% |
| No E-Mail Control |    21,306 |         122 |         0.5726% |

The baseline comparison is descriptive and is not a substitute for adjusted causal estimation.

### 5. Double Machine Learning (DML)

The project integrates the Section A DML estimation results using EconML.

**Methodology**

- Estimator: LinearDML.
- Nuisance models: Random Forest models for treatment and outcome estimation.
- Cross-fitting: 3-fold.
- Categorical feature handling: One-hot encoding.
- Selected pre-treatment covariates.

**DML Estimation Results**

| Metric                         |   Result |
| ------------------------------ | -------: |
| Average Treatment Effect (ATE) | 0.006730 |
| 95% CI Lower Bound             | 0.004930 |
| 95% CI Upper Bound             | 0.008530 |
| Sample Size                    |   42,613 |

The estimated ATE corresponds to approximately **0.673 percentage points** increase in conversion probability for Mens E-Mail compared with No E-Mail.

### 6. Model Validation

**Treatment Model**

| Metric   |   Result |
| -------- | -------: |
| Accuracy | 0.500974 |
| ROC-AUC  | 0.502577 |
| Log Loss | 0.699822 |

**Outcome Prediction Diagnostic**

| Metric |    Result |
| ------ | --------: |
| RMSE   |  0.095623 |
| MAE    |  0.018208 |
| R²     | -0.010879 |

The outcome prediction metrics are from a separate predictive diagnostic using X only. They should not be interpreted as a complete evaluation of the DML estimator.

### 7. Raw vs DML Comparison

| Metric                    |                     Result |
| ------------------------- | -------------------------: |
| Control Conversion Rate   |                  0.572609% |
| Treatment Conversion Rate |                  1.253109% |
| Raw Treatment Effect      | 0.680501 percentage points |
| DML ATE                   | 0.673003 percentage points |

The raw comparison and adjusted DML estimate are close, providing a useful consistency check.

### 8. Individual Treatment Effects (CATE)

- Individual Conditional Average Treatment Effect results.
- Distribution of estimated treatment effects.
- Confidence interval visualization.
- Exploration of treatment-effect heterogeneity.

These visualizations help examine variation in estimated treatment effects across observations.

### 9. DoWhy Causal Audit

The project includes an additional causal estimation and refutation analysis using DoWhy.

**Causal Model Setup**

- Treatment: Mens E-Mail vs No E-Mail.
- Outcome: Conversion.
- Observations: 42,613.
- Confounders: Selected observed pre-treatment covariates.
- Estimation method: Backdoor linear regression adjustment.

**DoWhy ATE**

| Metric                   |     Result |
| ------------------------ | ---------: |
| ATE                      | 0.00677349 |
| ATE in percentage points |    0.67735 |

**Refutation Results**

Three refutation tests were conducted using 10 simulations each.

| Refutation Test     | Original ATE |  New Effect |  p-value |
| ------------------- | -----------: | ----------: | -------: |
| Random Common Cause |   0.00677349 |  0.00676996 | 0.328090 |
| Placebo Treatment   |   0.00677349 | -0.00048635 | 0.267439 |
| Data Subset (80%)   |   0.00677349 |  0.00664271 | 0.345724 |

**Interpretation**

- Random Common Cause: The estimated effect remained almost unchanged after adding a random common cause.
- Placebo Treatment: The placebo treatment produced an effect close to zero.
- Data Subset: The estimated effect remained relatively stable on 80% subsets.

These tests provide sensitivity evidence, not proof that all confounding has been eliminated or that every causal assumption is valid.

### 10. Customer Recommendations

The dashboard includes a customer recommendation interface for exploring treatment-selection outputs based on the available analytical results.

### 11. Budget Optimization

The budget optimization module allows users to enter a total promotional budget and explore product-level allocation results.

Features include:

- Budget input.
- Backend API integration.
- Historical revenue-based allocation.
- Product-level allocation table.
- Allocation scenario exploration.

**Limitation:** This is a historical-revenue-weighted allocation strategy, not a causal ROI optimizer or a guarantee of future profit.

### 12. Product-Month CSV Validation

A reusable validation utility checks `product_month_summary.csv` before it is used by the dashboard.

Validation checks include:

- Six required columns and unexpected-column detection.
- Empty files and blank product codes.
- Month format validation (`YYYY-MM`).
- Numeric and non-negative price, quantity, revenue, and transaction counts.
- Whole-number transaction counts greater than zero.
- Duplicate `StockCode` + `Month` combinations.
- Clear pass/fail output and non-zero exit status for failed validation.

Expected CSV schema:

`StockCode, Month, Average_Price, Total_Quantity, Total_Revenue, Transaction_Count`

---

## Project Architecture

```text
EconoCausal/
│
├── main.py
├── requirements.txt
├── README.md
│
├── data/
│   └── raw/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── BaselineMetrics.jsx
│   │   ├── EDACharts.jsx
│   │   ├── UploadPanel.jsx
│   │   ├── SectionADmlResults.jsx
│   │   ├── TreatmentEffectResults.jsx
│   │   ├── CausalAssumptionsAudit.jsx
│   │   └── BudgetOptimization.jsx
│   └── package.json
│
├── tests/
│
└── notebooks/
```

_This is a high-level representation of the project structure. Some analysis notebooks and result files may be maintained separately in the repository._

---

## Installation and Setup

### Prerequisites

- Python 3.10 or later.
- Node.js and npm.
- Git.

### 1. Clone the Repository

```bash
git clone https://github.com/snigdhasudheer/Infotact_project1.git
cd Infotact_project1
```

### 2. Create a Python Environment

```bash
python -m venv .venv
```

Activate it on Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

### 3. Start the Backend

```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Backend URL:

`http://127.0.0.1:8000`

Health endpoint:

`http://127.0.0.1:8000/api/health`

### 4. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

`http://localhost:5173`

---

## API Endpoints

| Method | Endpoint                    | Description                        |
| ------ | --------------------------- | ---------------------------------- |
| GET    | `/api/health`               | Backend health check               |
| POST   | `/api/upload`               | Upload and validate dataset        |
| POST   | `/api/export-product-month` | Export product-month CSV           |
| POST   | `/api/dataset-report`       | Generate dataset report            |
| GET    | `/api/budget-allocation`    | Generate budget allocation results |

---

## Testing

### Backend Tests

Run from the project root:

```bash
python -m pytest -q
```

### Frontend Production Build

```bash
cd frontend
npm run build
```

### Frontend Lint

```bash
npm run lint
```

---

## Development Timeline — Day 1 to Day 16

### Phase 1 — Project Foundation and Data Preparation

| Day   | Date   | Focus                       | Work                                                                                           |
| ----- | ------ | --------------------------- | ---------------------------------------------------------------------------------------------- |
| Day 1 | Oct 19 | Repository and Requirements | Project setup, requirements checklist, Git configuration, React setup and dashboard wireframe. |
| Day 2 | Oct 20 | Dataset Decision            | Dataset comparison, schema inspection, upload format inspection and sample-data preview.       |
| Day 3 | Oct 21 | Data Validation             | Missing values, duplicates, data types, upload validation and error handling.                  |
| Day 4 | Oct 22 | EDA                         | Treatment and outcome summaries, customer analysis and descriptive charts.                     |
| Day 5 | Oct 23 | Causal DAG                  | Treatment, outcome, covariates, causal assumptions and methodology documentation.              |
| Day 6 | Oct 24 | Frontend Foundation         | React layout, dashboard navigation and API input/output planning.                              |
| Day 7 | Oct 25 | Dataset Upload              | Preprocessing workflow, upload and dataset preview integration.                                |

### Phase 2 — Modeling and Causal Analysis

| Day    | Date   | Focus                | Work                                                                             |
| ------ | ------ | -------------------- | -------------------------------------------------------------------------------- |
| Day 8  | Oct 26 | Baseline Analysis    | Basic outcome analysis and treatment/control baseline metrics.                   |
| Day 9  | Oct 27 | API Contract         | Request/response planning and frontend integration foundation.                   |
| Day 10 | Oct 28 | Double ML            | EconML DML workflow and treatment-effect results interface.                      |
| Day 11 | Oct 29 | Treatment Effects    | ATE, CATE and uncertainty visualizations.                                        |
| Day 12 | Oct 30 | DoWhy Audit          | Causal assumptions, estimation and refutation analysis.                          |
| Day 13 | Oct 31 | Uplift Visualization | Supported evaluation metrics and uplift-related visualizations where applicable. |
| Day 14 | Nov 1  | Recommendations      | Customer recommendation interface and treatment-selection exploration.           |

### Phase 3 — Optimization and Integration

| Day    | Date  | Focus                 | Work                                                                                          |
| ------ | ----- | --------------------- | --------------------------------------------------------------------------------------------- |
| Day 15 | Nov 2 | Budget Optimizer      | Budget input, allocation logic and product-level allocation results.                          |
| Day 16 | Nov 3 | Component Integration | Connect frontend components with backend API services and integrate the application workflow. |

---

## Team Contributions

The project follows a two-section collaborative development workflow.

### Section A — Data Science and Causal Modeling

- Dataset exploration and preparation.
- Treatment and outcome definition.
- DML model implementation.
- Average and heterogeneous treatment-effect estimation.
- Model validation and causal diagnostics.
- DoWhy estimation and refutation outputs.

### Section B — Dashboard and Backend Integration

- React dashboard and navigation.
- Dataset upload and validation interface.
- EDA and baseline visualizations.
- Treatment-effect result presentation.
- Causal assumptions and diagnostic interface.
- Customer recommendation interface.
- Budget optimization interface.
- Backend API and frontend integration.

---

## Limitations and Responsible Interpretation

1. The Hillstrom dataset estimates email marketing treatment effects, not product discount or price effects.
2. Online Retail data supports descriptive transaction analysis, not causal pricing conclusions by itself.
3. DML estimates depend on treatment definition, covariate selection, model specification and identification assumptions.
4. Refutation tests provide robustness and sensitivity evidence; they do not prove causal validity.
5. Historical revenue-based budget allocation does not guarantee future revenue or profit.
6. Results should be interpreted within the scope of the datasets and analytical methods used.

## Future Scope

- Improve dashboard performance and code splitting.
- Expand causal robustness and model validation.
- Improve customer-level decision support.
- Explore causal pricing methods with suitable pricing intervention data.
- Integrate validated causal response estimates into future budget optimization workflows.

---

## Repository

**GitHub:** https://github.com/snigdhasudheer/Infotact_project1

**Project:** EconoCausal — Dynamic Pricing via Double Machine Learning

_Developed as part of the Infotact Advanced Data Science & ML Engineering Internship._
