# Day 15 - Budget Optimization and Allocation Method

## 1. Purpose

This document describes the budget allocation functionality implemented in EconoCausal.

The dashboard allows users to enter a total promotional budget and explore product-wise allocation scenarios using historical revenue.

## 2. Backend Endpoint

Endpoint:

`GET /api/budget-allocation`

Input:

- Budget amount in INR.
- Default budget: ₹50,000.

The endpoint reads `budget_optimization_results.csv` and generates product-wise allocation results.

## 3. Allocation Method

The implemented method is capped proportional allocation based on historical revenue weights.

The allocation process:

1. Load product-level historical revenue and existing allocation data.
2. Calculate proportional allocation weights.
3. Distribute the remaining budget across active products.
4. Apply minimum and maximum allocation constraints.
5. Recalculate allocations for products that exceed the constraints.
6. Round allocations to two decimal places.
7. Reconcile rounding differences so the total allocation matches the requested budget.

## 4. Allocation Constraints

| Constraint | Value |
|---|---:|
| Minimum per product | ₹100 |
| Maximum per product | ₹2,000 |
| Default total budget | ₹50,000 |
| Frontend budget range | ₹10,000–₹2,00,000 |

The backend also validates the feasible budget range according to the number of products.

## 5. Dashboard Features

The frontend provides:

- Total budget input
- API connection and error status
- Total allocated budget
- Product coverage
- Allocation method
- Top 10 product allocation chart
- Searchable product-wise allocation table
- Historical revenue and transaction information
- Current versus scenario allocation comparison

## 6. Important Methodological Limitation

The current implementation is a historical-revenue-based allocation scenario.

It does not use:

- A SciPy optimization objective function
- Estimated causal treatment effects
- Incremental revenue or causal ROI estimates
- Experimentally validated promotional returns

The Online Retail dataset is observational transaction data. Historical revenue associations cannot establish the causal impact of promotional spending.

The Hillstrom email-treatment estimates must not be interpreted as discount effects.

Therefore, the current allocation should not be described as a causal ROI-maximizing or experimentally validated budget optimization model.

## 7. Future Improvement

A future causal budget optimizer would require a defensible treatment-effect or incremental-return objective, product-level treatment evidence, business constraints, and independent validation before operational use.

SciPy optimization may be introduced once a valid objective function and supporting data are available.

## 8. Implementation Reference

- Backend: `main.py`
- Frontend: `frontend/src/BudgetOptimization.jsx`
- Styles: `frontend/src/BudgetOptimization.css`
- Input data: `budget_optimization_results.csv`

## 9. Validation Status

The backend implementation includes budget feasibility checks, per-product allocation limits, proportional redistribution, and rounding reconciliation.

The frontend production build has completed successfully.

**Conclusion:** The current system provides a constrained historical-revenue-based allocation scenario. It is not a causal ROI optimizer.