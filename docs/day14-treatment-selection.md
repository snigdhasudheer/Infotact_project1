# Day 14 - Customer Treatment Selection Rule

## 1. Purpose

This document defines the customer-level treatment prioritization rule used in the EconoCausal dashboard.

The analysis uses the Hillstrom dataset and compares:

- Treatment group: Mens E-Mail
- Control group: No E-Mail
- Outcome: Customer conversion

The objective is to rank observations using their estimated Conditional Average Treatment Effects (CATE).

## 2. Input Data

The recommendation component uses `section_a_individual_cate.csv`.

Required columns:

- `observation_id`
- `treatment`
- `outcome`
- `cate`
- `cate_ci_lower`
- `cate_ci_upper`

The CATE estimates and confidence intervals are supplied by Section A's LinearDML analysis.

## 3. Customer Prioritization Rule

Each observation is assigned one of two priority categories.

### Higher Priority

An observation is classified as Higher Priority when both conditions hold:

1. Estimated CATE is greater than zero.
2. The lower bound of its 95% confidence interval is greater than zero.

Mathematically:

`CATE > 0 AND CI_lower > 0`

### Needs Review

All remaining observations are assigned to Needs Review.

This includes observations with non-positive estimated CATE or confidence intervals that include zero.

## 4. Ranking Method

Observations are sorted using the lower confidence interval bound in descending order.

Observations classified as Higher Priority appear before Needs Review observations.

The dashboard displays the top 100 ranked observations and reports:

- Total valid observations
- Higher Priority observations
- Needs Review observations
- Estimated CATE in percentage points
- 95% confidence interval

## 5. Business Interpretation

Higher Priority observations have positive estimated email-treatment effects with confidence intervals above zero under the fitted model.

These observations may be considered for further investigation when evaluating email campaign targeting strategies.

The ranking is a decision-support output, not a validated operational targeting policy.

## 6. Limitations

- CATE rankings are exploratory and based on the available in-sample estimates.
- Independent holdout validation has not been established.
- Observation IDs represent dataset row identifiers, not identifiable customer records.
- The treatment represents Mens E-Mail versus No E-Mail, not a price discount.
- The ranking does not establish guaranteed future conversion outcomes.
- Operational deployment requires independent validation and business approval.

## 7. Implementation Reference

Frontend implementation:

- `frontend/src/Recommendations.jsx`
- `frontend/src/Recommendations.css`

Individual CATE input:

- `frontend/public/section_a_individual_cate.csv`

The implementation validates required CSV columns, filters invalid numeric rows, assigns priority categories, sorts observations and displays a ranked table.

## 8. Validation Status

The frontend production build completed successfully using `npm run build`.

The build reports a large JavaScript chunk warning. This is a bundle-size warning and not a compilation failure.

**Conclusion:** The Day 14 customer treatment selection rule is implemented and documented as an exploratory CATE-based decision-support method.