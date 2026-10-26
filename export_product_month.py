"""Create a dashboard-ready product-month CSV from Online Retail.xlsx.

Usage:
    python export_product_month.py "Online Retail.xlsx" --output product_month_summary.csv

This produces descriptive historical summaries; it does not estimate causal price effects.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd

REQUIRED_INPUT_COLUMNS = [
    "InvoiceNo",
    "StockCode",
    "InvoiceDate",
    "Quantity",
    "UnitPrice",
]
OUTPUT_COLUMNS = [
    "StockCode",
    "Month",
    "Average_Price",
    "Total_Quantity",
    "Total_Revenue",
    "Transaction_Count",
]


def build_product_month_summary(df: pd.DataFrame) -> pd.DataFrame:
    """Clean transaction rows and aggregate them by stock code and month."""
    missing = [column for column in REQUIRED_INPUT_COLUMNS if column not in df.columns]
    if missing:
        raise ValueError(f"Missing required input columns: {', '.join(missing)}")

    retail = df.drop_duplicates().copy()
    retail = retail.dropna(subset=["StockCode", "InvoiceDate", "InvoiceNo"])
    retail["InvoiceDate"] = pd.to_datetime(retail["InvoiceDate"], errors="coerce")
    retail["Quantity"] = pd.to_numeric(retail["Quantity"], errors="coerce")
    retail["UnitPrice"] = pd.to_numeric(retail["UnitPrice"], errors="coerce")
    retail = retail.dropna(subset=["InvoiceDate", "Quantity", "UnitPrice"])
    retail = retail[(retail["Quantity"] > 0) & (retail["UnitPrice"] > 0)].copy()

    if retail.empty:
        return pd.DataFrame(columns=OUTPUT_COLUMNS)

    retail["Revenue"] = retail["Quantity"] * retail["UnitPrice"]
    retail["Month"] = retail["InvoiceDate"].dt.to_period("M").astype(str)

    summary = (
        retail.groupby(["StockCode", "Month"], as_index=False)
        .agg(
            Average_Price=("UnitPrice", "mean"),
            Total_Quantity=("Quantity", "sum"),
            Total_Revenue=("Revenue", "sum"),
            Transaction_Count=("InvoiceNo", "nunique"),
        )
    )
    return summary[OUTPUT_COLUMNS]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input_file", help="Path to Online Retail.xlsx")
    parser.add_argument(
        "--output",
        default="product_month_summary.csv",
        help="Output CSV path (default: product_month_summary.csv)",
    )
    args = parser.parse_args()

    input_path = Path(args.input_file)
    if not input_path.is_file():
        parser.error(f"Input file not found: {input_path}")

    transactions = pd.read_excel(input_path)
    summary = build_product_month_summary(transactions)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    summary.to_csv(output_path, index=False)

    print(f"Exported {len(summary):,} product-month rows to {output_path}")
    print("Columns:", ", ".join(summary.columns))


if __name__ == "__main__":
    main()
