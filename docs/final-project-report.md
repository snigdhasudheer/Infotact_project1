# EconoCausal — Final Project Report

## 1. Abstract

EconoCausal is a data science and web application project focused on customer marketing analysis, causal inference, and marketing budget allocation.

The project integrates the Hillstrom email marketing dataset and Online Retail transaction data. It uses Double Machine Learning (DML), DoWhy refutation analysis, and Propensity Score Matching to study customer conversion and treatment effects. A React dashboard and FastAPI backend provide data exploration, analytical results, and budget allocation functionality.

The primary causal analysis evaluates the effect of the Mens E-Mail campaign compared with the No E-Mail group on customer conversion.

## 2. Project Objectives

- Analyze customer marketing and transaction datasets.
- Perform data quality checks and exploratory data analysis.
- Define treatment, outcome, and relevant covariates.
- Estimate treatment effects using Double Machine Learning.
- Examine causal assumptions through DoWhy refutation tests.
- Analyze heterogeneous treatment effects using CATE estimates.
- Develop a dashboard for presenting analytical findings.
- Implement backend APIs for data processing and budget allocation.

## 3. Datasets

### 3.1 Hillstrom Email Marketing Dataset

The Hillstrom dataset is used for the primary causal analysis.

- Total observations: 64,000.
- Total columns: 12.
- Treatment comparison: Mens E-Mail versus No E-Mail.
- Primary outcome: Customer conversion.
- Womens E-Mail group is excluded from the primary comparison.

The analytical DML sample contains 42,613 observations.

### 3.2 Online Retail Dataset

The Online Retail dataset contains historical retail transaction records.

- Original observations: 541,909.
- Original columns: 8.
- Duplicate records and missing values were examined during data quality analysis.
- The dataset supports historical product, revenue, and monthly sales exploration.

Online Retail is used for descriptive analysis. Its historical records do not independently establish causal price elasticity.

## 4. Methodology

### 4.1 Exploratory Data Analysis

The project includes:
- Dataset structure and data type inspection.
- Missing-value and duplicate analysis.
- Treatment and outcome checks.
- Product and monthly sales analysis.
- Descriptive visualizations and summary statistics.

### 4.2 Double Machine Learning

The primary treatment and outcome definitions are:

- Treatment: Mens E-Mail = 1, No E-Mail = 0.
- Outcome: Conversion = 1 or 0.
- Estimator: EconML LinearDML.
- Cross-fitting: 3 folds.
- Outcome nuisance model: RandomForestRegressor.
- Treatment nuisance model: RandomForestClassifier.

The covariates include recency, history, mens, womens, zip_code, newbie, and channel. Categorical variables are encoded for model estimation.

### 4.3 DoWhy Refutation Analysis

DoWhy refutation tests were used to examine the stability of the estimated treatment effect under alternative specifications.

The implemented checks include:
- Random Common Cause.
- Placebo Treatment.
- Data Subset.

These tests provide sensitivity evidence. They do not prove that all confounding has been eliminated.

### 4.4 Propensity Score Matching

A separate Section B analysis implements Propensity Score Matching and records treatment-effect and covariate-balance outputs.

The matching analysis is an additional analytical approach and should be interpreted in the context of its matching assumptions and diagnostics.

### 4.5 Budget Allocation

The current budget allocation implementation uses historical-revenue-based proportional weights, subject to per-product allocation constraints.

The backend validates budget inputs, checks feasibility, calculates allocations, and reconciles rounded amounts.

This is a constrained proportional allocation approach, not a SciPy-based optimization algorithm or a causal ROI optimizer.

## 5. Key DML Results

The integrated Section A DML results are:

| Metric | Result |
|---|---:|
| Estimator | LinearDML |
| Observations | 42,613 |
| ATE | 0.6730 percentage points |
| Confidence interval lower bound | 0.4930 percentage points |
| Confidence interval upper bound | 0.8530 percentage points |
| Mean CATE | 0.6730 percentage points |
| Minimum CATE | 0.1002 percentage points |
| Maximum CATE | 2.9543 percentage points |
| CATE standard deviation | 0.3733 percentage points |

The estimated ATE is positive for the Mens E-Mail versus No E-Mail comparison in the analyzed sample.

The result should be interpreted according to the treatment definition and causal identification assumptions. It must not be interpreted as the effect of discounts or price changes.

## 6. Model Diagnostics and Refutation Results

The reported nuisance-model diagnostics include:

| Diagnostic | Result |
|---|---:|
| Treatment ROC-AUC | 0.502577 |
| Treatment accuracy | 0.500974 |
| Treatment log loss | 0.699822 |
| Outcome RMSE | 0.095623 |
| Outcome MAE | 0.018208 |
| Outcome R² | -0.010879 |

These are predictive diagnostics for nuisance models, not direct measures of causal estimator quality.

Selected DoWhy refutation results:

| Refutation test | New estimate | p-value |
|---|---:|---:|
| Random Common Cause | 0.006769962 | 0.3281 |
| Placebo Treatment | -0.000486351 | 0.26744 |
| Data Subset (80%) | 0.006642710 | 0.34572 |

The refutation results are sensitivity checks, not proof of causal identification.

## 7. System Architecture and Implementation

### Backend

The FastAPI application provides:

| Endpoint | Purpose |
|---|---|
| GET `/` | Root endpoint |
| GET `/api/health` | Health check |
| POST `/api/upload` | Dataset upload |
| POST `/api/export-product-month` | Product-month export |
| POST `/api/dataset-report` | Dataset report |
| GET `/api/budget-allocation` | Budget allocation results |

### Frontend

The React and Vite dashboard integrates:
- Dashboard overview.
- Dataset exploration and EDA.
- Causal analysis results.
- Treatment-effect visualizations.
- Recommendations.
- Budget allocation.
- Team activity information.

Plotly is used for analytical visualizations.

### Data Integration

The dashboard loads individual CATE estimates from the integrated CSV result file. Budget allocation results are loaded by the backend from the configured CSV input.

## 8. Testing and Validation

The latest recorded verification includes:

| Validation | Result |
|---|---|
| Backend automated tests | 29 passed |
| Backend test warnings | 1 deprecation warning |
| Frontend production build | Passed |
| Frontend lint | 0 errors, 5 warnings |
| Git whitespace check | Passed |

The frontend build reports a large JavaScript bundle warning. The current backend test suite validates API and budget-allocation behavior.

## 9. Limitations

1. The Hillstrom treatment is an email campaign, not a discount or price intervention.
2. Online Retail historical price and quantity data is descriptive and does not independently identify causal price elasticity.
3. The original treatment randomization protocol still requires verification before finalizing the causal DAG and identification claims.
4. DoWhy refutation tests do not prove that unobserved confounding is absent.
5. Predictive nuisance-model metrics should not be treated as causal estimator validation.
6. Current budget allocation is based on historical revenue weights, not causal incremental returns.
7. Full reproduction of all analytical notebooks requires a separately verified analytical environment and package-version record.

## 10. Future Work

- Verify the original treatment assignment protocol.
- Finalize the causal DAG and identification documentation.
- Record and verify analytical package versions and random seeds.
- Implement and validate a genuine SciPy-based constrained optimizer.
- Evaluate budget decisions using suitable incremental-outcome objectives.
- Improve frontend code splitting to reduce bundle size.
- Add further frontend and end-to-end tests.
- Complete the final demonstration and handover package.

## 11. Conclusion

EconoCausal brings together customer marketing analysis, causal inference outputs, backend data-processing APIs, and an interactive dashboard.

The project has integrated LinearDML treatment-effect results, individual CATE estimates, DoWhy sensitivity checks, Propensity Score Matching outputs, and a tested proportional budget allocation API.

The current implementation provides a foundation for evidence-informed marketing analysis. Its findings must remain within the documented treatment definitions and methodological limitations. Further work on analytical reproducibility, treatment-assignment verification, and genuine constrained optimization is required before making stronger causal or budget-return claims.

## 12. Project Repository

GitHub: https://github.com/snigdhasudheer/Infotact_project1

Development branch: `himanshu-eco`
