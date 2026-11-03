# Day 13 – Budget Optimization Using SciPy

## Objective
Develop a prototype to distribute a fixed promotional budget across selected products based on their historical revenue.

## Dataset
- Dataset: Online Retail.xlsx
- Eligible products: 2,244
- Products selected for optimization: Top 100 by historical revenue.

## Methodology
1. Cleaned the retail transaction dataset.
2. Removed duplicate records, missing customer/product descriptions, cancelled invoices, and invalid quantities or prices.
3. Calculated revenue using Quantity × UnitPrice.
4. Aggregated sales information by product.
5. Selected the top 100 eligible products based on historical revenue.
6. Calculated revenue-based allocation weights.
7. Applied a bounded allocation method using NumPy.

## Budget Constraints
- Total budget: ₹50,000
- Minimum allocation per product: ₹100
- Maximum allocation per product: ₹2,000
- Number of selected products: 100

## Results
- Total allocated budget: ₹50,000
- Minimum actual allocation: ₹292.83
- Maximum actual allocation: ₹2,000
- Budget constraint: Satisfied
- Allocation limits: Satisfied

## Output
Generated `budget_optimization_results.csv`, containing product-level historical revenue, allocation weights, target allocations, final budget allocations, and budget shares.

## Limitation
This is a historical-revenue-based budget allocation prototype. It does not establish causal discount effects or prove incremental revenue or ROI improvement. Further validation using treatment effects, product margins, and demand response is required.
