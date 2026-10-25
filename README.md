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

Note: the validator checks data quality only. It does not estimate causal price effects or alter the source data.
