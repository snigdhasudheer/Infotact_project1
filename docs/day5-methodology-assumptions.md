# Day 5 — Methodology and Assumptions

## 1. Project Objective

EconoCausal aims to study how marketing interventions may affect customer behaviour and how a limited promotional budget could be allocated using causal machine learning.

The analysis must distinguish observed data from simulated scenarios and must not claim causal effects without adequate evidence.

## 2. Methodology Overview

The planned workflow is:

1. Validate the selected dataset and its schema.
2. Explore the data and document its limitations.
3. Review the causal diagram and variable definitions supplied by Section A.
4. Document the identification assumptions and check whether the available data supports them.
5. Present causal estimates only after the treatment, outcome, and covariates have been validated.
6. Use DoWhy for appropriate causal-model checks and refutation tests.
7. Use EconML Double Machine Learning (DML) only when the data and assumptions support its use.
8. Consider budget optimization only after reliable treatment-effect estimates are available.

## 3. Dataset Considerations

### Online Retail

Online Retail contains historical transaction records and can support descriptive analysis of product prices, quantities, revenue, and transaction patterns.

However, it does not directly provide randomized discount assignments or a complete population of customers who did not purchase. Therefore, a relationship between price and quantity must not automatically be interpreted as a causal effect.

### Hillstrom

Hillstrom contains email-marketing treatment information and customer outcomes. It may support analysis of the recorded marketing intervention, subject to validation of the treatment groups, outcomes, and required assumptions.

An email intervention is not equivalent to a discount intervention. Results must not be presented as the causal effect of a discount.

## 4. Assumptions to Review

The following assumptions must be reviewed against the variable definitions and causal diagram provided by Section A.

- **Treatment definition:** The intervention must be clearly identified and consistently represented in the data.
- **Outcome definition:** The outcome must match the business question and be measured appropriately.
- **Confounding control:** Relevant pre-treatment variables that influence both treatment and outcome should be considered.
- **Overlap:** The data should contain sufficient comparable observations across relevant treatment levels.
- **Consistency:** The recorded treatment should correspond to the intervention being studied.
- **Data quality:** Missing values, duplicates, invalid records, and variable types must be checked.
- **Temporal validity:** Covariates should be measured before treatment where required; variables caused by treatment should not be treated as ordinary pre-treatment confounders.
- **Model validation:** Estimates and diagnostics must be evaluated before drawing conclusions.

These are assumptions to review, not claims that they have already been satisfied.

## 5. Roles and Dependencies

Section A is responsible for defining the treatment, outcome, covariates, causal diagram, and related assumptions.

Section B is responsible for documenting the methodology and assumptions and presenting the information clearly in the project documentation or dashboard.

The final documentation should be aligned with Section A's validated definitions once they are available.

## 6. Current Status

- Dataset decision and limitations are documented.
- Excel upload validation and its five automated tests have been completed.
- An initial upload interface and EDA chart component have been added.
- Integration of the pending product-month CSV remains outstanding.
- The methodology documentation is being prepared.
- Causal estimation, refutation results, and budget optimization results have not yet been established by this document.

## 7. Limitations

Historical observational price data alone cannot establish the causal effect of changing prices without defensible identification assumptions and sufficient supporting data.

No numerical causal effects, model-performance results, or budget savings are claimed here. Any future simulated scenarios must be explicitly labelled as simulated.


