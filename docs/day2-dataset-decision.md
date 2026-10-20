# Day 2 — Dataset Decision Document

## Dataset Selection

- **Dataset:** UCI Online Retail
- **File:** `data/raw/Online Retail.xlsx`
- **Format:** Excel (.xlsx)
- **Original rows:** 541,909
- **Original columns:** 8
- **Analysis rows:** 524,878
- **Analysis columns:** 9

## Data Quality Summary

- Original duplicate rows: 5,268
- Missing CustomerID values: 135,080
- Revenue calculated as Quantity × UnitPrice.

## Why This Dataset?

The dataset contains historical retail transactions, product quantities, unit prices, invoice dates, and customer information. It can be used to explore historical sales patterns and price-demand relationships.

## Important Limitation

The dataset does not contain a randomized price-treatment experiment. Therefore, causal effects of price changes cannot be established directly from this dataset alone.

## Day 2 Deliverables

- [x] Dataset loaded
- [x] Schema inspected
- [x] Sample preview generated
- [x] Missing values and duplicates inspected
- [x] Preliminary revenue analysis completed
- [x] Dataset decision document saved separately

**Status:** Day 2 completed, pending review of dataset suitability for causal dynamic pricing.
