# EconoCausal Requirements Checklist

## 1. Data and Analysis

- [x] Select and document project datasets.
- [x] Perform dataset quality checks.
- [x] Perform exploratory data analysis (EDA).
- [x] Define treatment, outcome, and covariates for the Hillstrom analysis.
- [x] Document the proposed causal DAG and identification assumptions.
- [x] Implement and integrate Double Machine Learning (DML) results using EconML.
- [x] Integrate individual CATE estimates and confidence intervals.
- [x] Perform DoWhy refutation analysis.
- [x] Implement Propensity Score Matching analysis.
- [ ] Verify the original treatment randomization protocol and finalize the causal DAG.

## 2. Budget Optimization

- [x] Implement budget allocation API.
- [x] Apply allocation constraints and budget validation.
- [x] Display allocation recommendations in the dashboard.
- [x] Document the current historical-revenue-weighted allocation approach.
- [ ] Implement and validate a genuine SciPy-based optimization algorithm.
- [ ] Validate recommendations using causal incremental outcomes and a suitable business objective.

**Limitation:** Current allocation is capped proportional allocation based on historical revenue weights. It is not a SciPy optimizer and does not establish causal ROI.

## 3. Backend

- [x] Implement FastAPI application.
- [x] Implement health-check endpoint.
- [x] Implement file upload endpoint.
- [x] Implement product-month export endpoint.
- [x] Implement dataset-report endpoint.
- [x] Implement budget-allocation endpoint.
- [x] Add backend API and validation tests.

## 4. Frontend

- [x] Build React dashboard using Vite.
- [x] Integrate Plotly visualizations.
- [x] Integrate dataset upload and reporting.
- [x] Integrate DML and CATE results.
- [x] Integrate treatment-effect and recommendation views.
- [x] Integrate budget allocation results.
- [x] Add loading, error, and empty-state handling.
- [x] Verify production build.

## 5. Testing and Reproducibility

- [x] Add backend API tests.
- [x] Add budget-allocation API tests.
- [x] Verify backend test suite: 29 passed.
- [x] Verify frontend production build.
- [x] Run frontend lint verification (0 errors, 5 warnings).
- [ ] Verify the complete analytical notebook environment.
- [x] Document backend and frontend setup instructions.
- [x] Document important methodology limitations.
- [ ] Record and verify analytical package versions and random seeds.

## 6. Documentation and Final Delivery

- [x] Document dataset selection and methodology.
- [x] Document causal DAG and assumptions.
- [x] Document treatment-selection methodology.
- [x] Document budget-allocation approach.
- [x] Document reproducibility and validation workflow.
- [ ] Update README architecture and project timeline through Day 23.
- [ ] Prepare final project report.
- [ ] Prepare presentation slides.
- [ ] Capture final dashboard screenshots.
- [ ] Prepare project demonstration script.
- [ ] Perform final integration and handover verification.

## Current Validation Summary

| Validation | Recorded result |
|---|---|
| Backend tests | 29 passed |
| Frontend production build | Passed |
| Budget API tests | Passed |
| CATE result integration | Verified |
| Full notebook reproducibility | Pending |
| Final report and demo | Pending |

## Scientific Scope and Limitations

1. Hillstrom treatment represents an email campaign, not a discount or price intervention.
2. Online Retail data supports historical descriptive analysis; it does not independently establish causal price elasticity.
3. DoWhy refutation tests provide sensitivity evidence, not proof that confounding has been eliminated.
4. Predictive model metrics should not be interpreted as causal model validation.
5. Budget recommendations must not be presented as proven causal ROI.

**Status:** Core dashboard and backend workflows are implemented and tested. Analytical reproducibility, genuine constrained optimization, and final handover deliverables remain pending.
