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

## 8. Comparison of Both Selected Datasets

### Dataset 1: Online Retail

- **File:** `data/raw/Online Retail.xlsx`
- **Original dimensions:** 541,909 rows × 8 columns
- **Columns:** InvoiceNo, StockCode, Description, Quantity, InvoiceDate, UnitPrice, CustomerID, Country
- **Purpose:** Historical transaction, price, quantity, and revenue analysis.
- **Schema validation:** Passed.
- **Note:** The latest comparison inspected only the first 1,000 rows for missing values.

### Dataset 2: Hillstrom

- **File:** `data/raw/hillstorm_no_indices.csv`
- **Dimensions:** 64,000 rows × 12 columns
- **Columns:** recency, history_segment, history, mens, womens, zip_code, newbie, channel, segment, visit, conversion, spend
- **Missing values:** 0
- **Duplicate rows flagged:** 6,562
- **Purpose:** Marketing-treatment and customer conversion/spending analysis.

### Schema Comparison

- **Common column names:** None.
- Online Retail contains transaction, product, price, quantity, date, and country fields.
- Hillstrom contains customer history, marketing segment, visit, conversion, and spending fields.
- The datasets should not be directly merged because no common column names or verified join key have been established.

### Final Dataset Decision

Use Online Retail for historical price and quantity exploration. Use Hillstrom for marketing-treatment and conversion analysis. Hillstrom's marketing treatment is not a price treatment, so it cannot by itself identify the causal effect of changing prices.

Before removing Hillstrom duplicate rows, investigate whether they are truly duplicate records or expected repeated customer profiles. Do not remove them automatically.

**Status:** Both dataset files are present and their schemas have been inspected. Online Retail schema validation and Hillstrom basic inspection are complete. Duplicate investigation and final integrated experiment-design review remain pending.

### Dataset 1: Online Retail

- File: `data/raw/Online Retail.xlsx`
- Original dimensions: 541,909 rows x 8 columns
- Columns: InvoiceNo, StockCode, Description, Quantity, InvoiceDate, UnitPrice, CustomerID, Country
- Purpose: Historical transaction, unit-price, quantity, and revenue analysis.
- Schema validation: Passed.
- Note: The latest comparison inspected only the first 1,000 rows for missing values; this is not a full-file missing-value check.

### Dataset 2: Hillstrom

- File: `data/raw/hillstorm_no_indices.csv`
- Dimensions: 64,000 rows x 12 columns
- Columns: recency, history_segment, history, mens, womens, zip_code, newbie, channel, segment, visit, conversion, spend
- Missing values: 0
- Duplicate rows flagged: 6,562
- Purpose: Marketing-treatment and customer conversion/spending analysis.

### Schema Comparison

- Common column names: None.
- Online Retail contains transaction, product, price, quantity, date, and country fields.
- Hillstrom contains customer history, marketing segment, visit, conversion, and spending fields.
- The datasets should not be directly merged because no common column names or verified join key have been established.

### Final Dataset Decision

Use Online Retail for historical price and quantity exploration. Use Hillstrom for marketing-treatment and conversion analysis. Hillstrom's marketing treatment is not a price treatment, so it cannot by itself identify the causal effect of changing prices.

Before removing Hillstrom duplicate rows, investigate whether these are truly duplicate records or expected repeated customer profiles. Do not remove them automatically.

Status: Both dataset files are present and their schemas have been inspected. Online Retail schema validation and Hillstrom basic inspection are complete. Duplicate investigation and final integrated experiment-design review remain separate follow-up tasks.
