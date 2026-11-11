# EconoCausal — Causal Analysis and Marketing Budget Dashboard

EconoCausal is a data science project that combines causal inference, customer marketing analysis, and a web dashboard to study the impact of email campaigns and support marketing budget allocation.

## Project Scope

The primary causal analysis uses the Hillstrom dataset.

- **Treatment:** Mens E-Mail versus No E-Mail
- **Outcome:** Customer conversion
- **Method:** Double Machine Learning (LinearDML)
- **Additional analysis:** DoWhy refutation tests, Propensity Score Matching, and individual CATE estimates.

**Important:** The Hillstrom treatment is an email campaign, not a discount intervention. The project does not establish a causal discount or pricing effect.

Online Retail data is used for historical product, revenue, and monthly sales analysis. Its historical price and quantity observations are descriptive and do not independently establish causal price elasticity.

## Technology Stack

**Backend**
- Python
- FastAPI
- Pandas
- Uvicorn
- Pytest

**Frontend**
- React
- Vite
- Plotly
- React Plotly

**Causal Analysis**
- EconML
- DoWhy
- Propensity Score Matching

## Project Structure

```text
Infotact_project1/
│
├── data/
├── docs/
│   ├── day2-dataset-decision.md
│   ├── day5-causal-dag.md
│   ├── day5-methodology-assumptions.md
│   ├── day9-backend-integration-testing.md
│   ├── day14-treatment-selection.md
│   ├── day15-budget-optimization.md
│   ├── day20-21-reproducibility-review.md
│   └── requirements-checklist.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
│
├── 01_dataset_overview.ipynb
├── 02_online_retail_overview.ipynb
├── 03_hillstrom_quality_analysis.ipynb
├── 04_hillstrom_treatment_outcome_checks.ipynb
├── 05_online_retail_price_demand_eda.ipynb
├── 06_section_a_dml_estimation_ipynb.ipynb
├── 07_section_b_propensity_score_matching.ipynb
│
├── main.py
├── requirements.txt
├── test_api.py
├── test_export_product_month.py
├── test_validate_product_month_csv.py
├── test_validate_upload.py
├── budget_optimization_results.csv
├── section_a_dml_results.csv
├── section_a_individual_cate.csv
├── section_a_model_validation.csv
├── section_a_dowhy_refutation_results.csv
├── section_a_raw_vs_dml_comparison.csv
├── section_b_psm_att_results.csv
├── section_b_psm_balance_results.csv
└── README.md
```

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/snigdhasudheer/Infotact_project1.git
cd Infotact_project1
```

### 2. Create Python environment

Windows PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

### 3. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 4. Install frontend dependencies

```powershell
cd frontend
npm install
```

## Run the Application

### Backend

From the repository root:

```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Health endpoint:

`http://127.0.0.1:8000/api/health`

### Frontend

From the `frontend` directory:

```bash
npm run dev
```

Open the local URL shown by Vite in the terminal.

## Backend API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Root endpoint |
| GET | `/api/health` | Backend health check |
| POST | `/api/upload` | Upload dataset |
| POST | `/api/export-product-month` | Export product-month data |
| POST | `/api/dataset-report` | Generate dataset report |
| GET | `/api/budget-allocation` | Retrieve budget allocation |

## Causal Analysis Results

The integrated Section A DML analysis reports:

| Metric | Result |
|---|---:|
| Estimator | LinearDML |
| Observations | 42,613 |
| ATE | 0.6730 percentage points |
| Confidence interval | 0.4930–0.8530 percentage points |
| Mean CATE | 0.6730 percentage points |

The ATE represents the estimated effect of Mens E-Mail compared with No E-Mail on conversion in the analyzed Hillstrom sample.

Model predictive metrics and DoWhy refutation results are supporting diagnostics, not proof of causal identification.

## Budget Allocation

The current dashboard uses capped proportional allocation based on historical revenue weights.

It includes:
- Budget validation
- Per-product allocation constraints
- Allocation reconciliation
- API response validation

**Limitation:** The current implementation is not a SciPy-based constrained optimizer and does not establish causal ROI.

## Testing

### Backend tests

From the repository root:

```bash
python -m pytest -q
```

Latest recorded result: **29 passed**.

### Frontend production build

From the `frontend` directory:

```bash
npm run build
```

Latest recorded result: successful production build. A large JavaScript bundle warning remains.

### Frontend lint

```bash
npm run lint
```

Lint verification: completed with 0 errors and 5 warnings.

## Documentation

Additional project documentation is available in `docs/`, including:
- Dataset selection
- Causal DAG and assumptions
- Backend integration testing
- Treatment selection
- Budget allocation methodology
- Reproducibility review
- Requirements checklist

## Project Timeline

The project follows a 23-day development plan covering:

1. Dataset selection and quality checks
2. Exploratory data analysis
3. Causal treatment and outcome definition
4. DML estimation and validation
5. Causal assumptions and refutation analysis
6. Propensity Score Matching
7. CATE and treatment-effect visualizations
8. Budget allocation and recommendations
9. FastAPI backend development
10. React dashboard integration
11. Testing, documentation, and reproducibility
12. Final integration and project handover

## Current Validation Status

- Backend API test suite: 29 tests passed.
- Frontend production build: passed.
- Budget allocation API: tested.
- Individual CATE result integration: verified.
- Full analytical notebook environment reproduction: pending.
- Genuine SciPy optimization: pending.
- Final report, slides, screenshots, and demonstration: pending.

## Scientific Limitations

1. Email campaign treatment should not be interpreted as a discount treatment.
2. Online Retail historical records are used for descriptive analysis.
3. DoWhy refutation tests provide sensitivity evidence, not proof that confounding has been eliminated.
4. Predictive performance metrics are not substitutes for causal validation.
5. Historical-revenue-weighted budget allocation is not equivalent to causal incremental-return optimization.
