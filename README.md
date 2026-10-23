# EconoCausal

**Dynamic Pricing via Double Machine Learning**

EconoCausal explores causal inference for pricing and marketing campaign optimization.

## Current Progress

### Day 1 - Repository and Requirements
- Git repository and project structure established.
- React + Vite frontend scaffold created.
- Dashboard wireframe and initial GitHub activity integration added.

### Day 2 - Dataset Decision and Validation
- Online Retail and Hillstrom datasets compared.
- Dataset schemas and limitations documented in `docs/day2-dataset-decision.md`.
- Online Retail and Hillstrom exploratory analysis notebooks added.
- Excel upload validation implemented in `validate_upload.py`.
- Automated upload validation tests added in `test_validate_upload.py`.
- All 5 upload validation tests pass.

## Dataset Notes

- Online Retail contains historical transaction data for descriptive analysis.
- Hillstrom contains email marketing treatment data, not a direct pricing experiment.
- Neither dataset alone establishes the causal effect of changing prices.
- Final causal analysis requires an appropriate treatment, outcome, and validated methodology.

## Planned Features

- Dataset ingestion and validation
- Exploratory data analysis (EDA)
- Causal effect estimation using EconML
- Causal model validation using DoWhy
- Budget allocation optimization using SciPy
- FastAPI backend
- React frontend with Plotly visualizations

## Project Structure

- `data/` - Project datasets
- `docs/` - Dataset decision and documentation
- `frontend/` - React + Vite dashboard
- `01_dataset_overview.ipynb` - Initial dataset overview
- `02_online_retail_overview.ipynb` - Online Retail analysis
- `03_hillstrom_quality_analysis.ipynb` - Hillstrom quality analysis
- `validate_upload.py` - Excel upload validation
- `test_validate_upload.py` - Automated validation tests

## Pending Work

- Complete and verify the dashboard EDA presentation.
- Implement the FastAPI backend.
- Develop and validate the causal estimation pipeline.
- Implement budget allocation after causal estimates are validated.

## Important Note

No causal effects or budget optimization results will be claimed until the relevant models are implemented and evaluated. Simulated data, if used, will be clearly labeled.

## Recent Progress

### Day 3 - Data Validation
- Excel upload validation and error handling added.
- Validation covers missing files, missing required columns, unexpected columns, unsupported formats, and valid Excel input.
- All 5 upload validation tests passed.

### Day 4 - Upload Integration and Initial EDA
- Added a FastAPI application with an Excel upload endpoint and health check.
- Added a React upload panel with validation feedback and data preview.
- Added an initial EDA chart component and Plotly dependencies.
- Product-month CSV integration and dataset-specific EDA remain pending.

### Day 5 - Methodology and Assumptions (Section B)
- Preparing methodology and assumptions documentation in `docs/day5-methodology-assumptions.md`.
- Documenting methodology prerequisites, dataset limitations, and the distinction between observed and simulated results.
- Section A variable definitions and the causal diagram are dependencies for final alignment.
- Causal estimates and budget optimization results are not yet claimed.

## Current Implementation Status
- Excel upload validation: implemented and tested.
- Initial upload interface: added.
- Initial EDA component: added; product-month CSV integration is pending.
- Section B methodology documentation: drafted; review remains pending.
- Causal estimation and budget optimization: pending.
