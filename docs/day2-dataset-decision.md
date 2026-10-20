# Day 2 - Dataset Decision and Schema Validation

## 1. Dataset Selection

- Dataset: UCI Online Retail
- Source file: `data/raw/Online Retail.xlsx`
- Supported input format currently inspected: Excel `.xlsx`
- Original shape: 541,909 rows x 8 columns
- Cleaned analysis shape: 524,878 rows x 9 columns

## 2. Original Schema

| Column      | Data type  | Purpose                   |
| ----------- | ---------- | ------------------------- |
| InvoiceNo   | object     | Invoice identifier        |
| StockCode   | object     | Product identifier        |
| Description | object     | Product description       |
| Quantity    | int64      | Quantity purchased        |
| InvoiceDate | datetime64 | Transaction date and time |
| UnitPrice   | float64    | Price per unit            |
| CustomerID  | float64    | Customer identifier       |
| Country     | object     | Customer country          |

The analysis dataset adds `Revenue`, calculated as `Quantity * UnitPrice`.

## 3. Data Quality Validation

| Check                    | Observed result |
| ------------------------ | --------------: |
| Original rows            |         541,909 |
| Original columns         |               8 |
| Exact duplicate rows     |           5,268 |
| Missing Description      |           1,454 |
| Missing CustomerID       |         135,080 |
| UnitPrice <= 0           |           2,517 |
| Quantity <= 0            |          10,624 |
| Cleaned analysis rows    |         524,878 |
| Cleaned analysis columns |               9 |

The individual quality counts can overlap and must not be added to estimate the number of removed rows.

## 4. Initial Cleaning Rules

1. Remove exact duplicate rows.
2. Remove rows without a product Description.
3. Keep rows with positive UnitPrice.
4. Keep rows with positive Quantity.
5. Calculate Revenue as Quantity multiplied by UnitPrice.

Missing CustomerID values remain possible after cleaning and must be considered in customer-level analyses.

## 5. Upload Format and Sample Preview - Task B

- The current notebook loads an Excel `.xlsx` file.
- The file path is checked before loading.
- The notebook checks required and unexpected columns.
- The notebook displays the first 10 records and last 5 records.
- A five-row sample preview was also verified during validation.
- CSV upload is not currently claimed as supported by this notebook.
- Invalid extensions and missing required columns should produce clear validation errors.

The current notebook demonstrates dataset inspection and schema validation. It is not, by itself, a complete web-based file-upload feature.

## 6. Dataset Suitability for Causal Dynamic Pricing

The dataset contains historical transactions, quantities, unit prices, invoice dates, products, and countries. It supports exploratory sales and price-demand analysis.

However, it does not provide a randomized pricing treatment or establish that observed prices were assigned independently of demand. Historical associations must not be presented as proven causal effects.

A causal dynamic-pricing experiment needs an explicit treatment definition, outcome definition, relevant confounders, and suitable identification assumptions or experimental data.

## 7. Day 2 Deliverable Checklist

- [x] Dataset selected and loaded
- [x] Original schema inspected
- [x] Missing values and duplicate rows inspected
- [x] Initial cleaning rules applied
- [x] Revenue feature calculated
- [x] Sample-data preview generated
- [x] Dataset decision and schema documented
- [x] Causal limitations documented
- [x] Separate automated upload-format tests executed (5/5 passed)
- [x] Final Day 2 review completed

Status: Day 2 core analysis, dataset validation, upload-format tests, and documentation review completed.
