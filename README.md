# Day 6: Product-Month CSV Validation

## Purpose
This utility validates `product_month_summary.csv` before it is used by the React dashboard. It is separate from the frontend navigation work and does not require Google Colab.

## Checks performed
- Confirms the six required columns and rejects unexpected columns.
- Detects empty files, blank product codes, and invalid month values (expected `YYYY-MM`).
- Checks that price, quantity, revenue, and transaction count are numeric and non-negative.
- Checks that transaction counts are whole numbers greater than zero.
- Detects duplicate `StockCode` + `Month` keys.
- Prints a clear pass/fail result and returns a non-zero exit code when validation fails.

## Requirements
Python 3.9+ and pandas.

Install dependency:

```bash
python -m pip install pandas
```

## Run the validator
Place `product_month_summary.csv` beside the script or provide its path:

```bash
python validate_product_month_csv.py product_month_summary.csv
```

## Run tests
From this folder:

```bash
python -m unittest -v
```

Tests use small synthetic fixtures; they do not contain or claim to reproduce the real retail dataset.

## Expected CSV schema
`StockCode, Month, Average_Price, Total_Quantity, Total_Revenue, Transaction_Count`


## Section A: Double Machine Learning (DML) Estimation

### Objective
Estimate the causal effect of Mens E-Mail marketing treatment on customer conversion using Double Machine Learning (DML).

### Dataset
- **Dataset:** Hillstrom Email Marketing Dataset
- **Original observations:** 64,000
- **Selected groups:** Mens E-Mail (treatment) and No E-Mail (control)
- **Final sample size:** 42,613
- **Treatment variable (T):** 1 = Mens E-Mail, 0 = No E-Mail
- **Outcome variable (Y):** Conversion (1 = converted, 0 = not converted)

### Methodology
- Selected pre-treatment features: `recency`, `history`, `mens`, `womens`, `zip_code`, `newbie`, and `channel`.
- Applied one-hot encoding to categorical variables.
- Used `LinearDML` from EconML.
- Random Forest models were used for treatment and outcome nuisance estimation.
- Applied 3-fold cross-fitting.

### DML Estimation Results

| Metric | Result |
|---|---:|
| Average Treatment Effect (ATE) | 0.006730 |
| 95% CI Lower Bound | 0.004930 |
| 95% CI Upper Bound | 0.008530 |
| Sample Size | 42,613 |

The estimated ATE indicates an increase of approximately **0.673 percentage points** in conversion probability for the Mens E-Mail treatment compared with the No E-Mail control group.

### Model Validation

**Treatment model**
- Accuracy: 0.500974
- ROC-AUC: 0.502577
- Log Loss: 0.699822

**Outcome prediction diagnostic**
- RMSE: 0.095623
- MAE: 0.018208
- R²: -0.010879

*Note: The outcome prediction metrics are from a separate predictive diagnostic using X only, not a complete evaluation of the DML estimator.*

### Raw vs DML Comparison

| Metric | Result |
|---|---:|
| Control conversion rate | 0.572609% |
| Treatment conversion rate | 1.253109% |
| Raw treatment effect | 0.680501 percentage points |
| DML ATE | 0.673003 percentage points |

The raw comparison and DML estimate are close, providing a useful consistency check.

### Output Files
- `06_section_a_dml_estimation_ipynb.ipynb` – DML implementation notebook
- `section_a_dml_results.csv` – Main estimation results
- `section_a_model_validation.csv` – Model validation metrics
- `section_a_raw_vs_dml_comparison.csv` – Raw and DML comparison

### Important Note
The Hillstrom dataset is an email marketing experiment. This Section A analysis estimates the effect of email marketing treatment on customer conversion; it does not directly estimate a product pricing or discount effect.

Note: the validator checks data quality only. It does not estimate causal price effects or alter the source data.

### DoWhy Causal Estimation and Refutation Analysis

To evaluate the robustness of the estimated treatment effect, an additional causal analysis was performed using the DoWhy library.

**1. Causal Model Setup**

- Treatment: Mens E-Mail (1), No E-Mail (0).
- Outcome: Conversion (1 = converted, 0 = not converted).
- Dataset size: 42,613 observations.
- Confounders: Recency, history, mens, womens, newbie, zip code and channel (after encoding).
- Estimation method: Backdoor linear regression adjustment.

**2. DoWhy ATE Estimation**

The estimated Average Treatment Effect (ATE) was:

- ATE: 0.00677349
- ATE in percentage points: 0.67735

This indicates an estimated increase of approximately 0.677 percentage points in conversion probability for the Mens E-Mail treatment compared with the No E-Mail control group, conditional on the selected observed covariates.

**3. Refutation Tests**

Three refutation tests were conducted using DoWhy with 10 simulations each.

| Refutation Test | Original ATE | New Effect | p-value |
|---|---:|---:|---:|
| Random Common Cause | 0.00677349 | 0.00676996 | 0.328090 |
| Placebo Treatment | 0.00677349 | -0.00048635 | 0.267439 |
| Data Subset (80%) | 0.00677349 | 0.00664271 | 0.345724 |

**4. Interpretation**

- Random Common Cause: The estimated effect remained almost unchanged after adding a random common cause.
- Placebo Treatment: The placebo treatment produced an effect close to zero.
- Data Subset: The estimated effect remained relatively stable when the analysis was performed on 80% subsets of the observations.

Overall, these results provide encouraging evidence of stability under the three tested refutation procedures. They do not prove that all confounding has been eliminated or that the causal assumptions are necessarily valid.

**5. Limitations**

- The analysis relies on the unconfoundedness assumption and the selected observed covariates.
- The dataset represents an email marketing experiment, not a real-world dynamic pricing experiment.
- Refutation tests are sensitivity checks and cannot establish causal validity on their own.
- DoWhy displayed a normal-distribution assumption warning during the refutation procedures, which should be considered when interpreting the results.

**Result File:** `section_a_dowhy_refutation_results.csv`
