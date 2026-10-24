# Product-month CSV export

This small, reusable Python utility exports the product-month summary needed by the EconoCausal React dashboard. It runs locally and does not require Google Colab.

## Requirements

```bash
pip install pandas openpyxl
```

## Run

Place the original `Online Retail.xlsx` file on your computer, then run:

```bash
python export_product_month.py "Online Retail.xlsx" --output product_month_summary.csv
```

The output has these columns, in this order:

1. `StockCode`
2. `Month`
3. `Average_Price`
4. `Total_Quantity`
5. `Total_Revenue`
6. `Transaction_Count`

The script removes exact duplicate rows, excludes rows without a stock code, invoice date, or invoice number, and excludes invalid/non-positive quantities and prices. It groups valid transactions by product and calendar month. This is descriptive analysis and does not establish a causal effect of price on demand.

## Run tests

With pandas installed, run:

```bash
python -m unittest -v test_export_product_month.py
```

The tests use a small synthetic dataset and do not require the real retail workbook.
