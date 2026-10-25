"""Validate product-month summary CSV files before dashboard integration."""
from __future__ import annotations

import argparse
from pathlib import Path
import sys
import pandas as pd

REQUIRED_COLUMNS = [
    "StockCode",
    "Month",
    "Average_Price",
    "Total_Quantity",
    "Total_Revenue",
    "Transaction_Count",
]
NUMERIC_COLUMNS = [
    "Average_Price",
    "Total_Quantity",
    "Total_Revenue",
    "Transaction_Count",
]


def validate_product_month_csv(path: str | Path) -> list[str]:
    """Return a list of validation problems; an empty list means valid."""
    file_path = Path(path)
    if not file_path.exists():
        return [f"File not found: {file_path}"]
    if file_path.suffix.lower() != ".csv":
        return ["Input file must have a .csv extension."]

    try:
        df = pd.read_csv(file_path, dtype={"StockCode": "string", "Month": "string"})
    except (OSError, UnicodeDecodeError, pd.errors.ParserError) as exc:
        return [f"Could not read CSV: {exc}"]

    problems: list[str] = []
    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    unexpected = [col for col in df.columns if col not in REQUIRED_COLUMNS]
    if missing:
        problems.append("Missing required columns: " + ", ".join(missing))
    if unexpected:
        problems.append("Unexpected columns: " + ", ".join(unexpected))
    if missing:
        return problems

    if df.empty:
        problems.append("CSV contains no data rows.")
        return problems

    blank_keys = df["StockCode"].isna() | df["StockCode"].str.strip().eq("")
    if blank_keys.any():
        problems.append(f"StockCode has {int(blank_keys.sum())} blank value(s).")

    month_valid = df["Month"].str.fullmatch(r"\d{4}-(0[1-9]|1[0-2])", na=False)
    if (~month_valid).any():
        problems.append(f"Month must use YYYY-MM format ({int((~month_valid).sum())} invalid row(s)).")

    for column in NUMERIC_COLUMNS:
        converted = pd.to_numeric(df[column], errors="coerce")
        invalid = converted.isna()
        if invalid.any():
            problems.append(f"{column} has {int(invalid.sum())} non-numeric or missing value(s).")
        elif (converted < 0).any():
            problems.append(f"{column} contains negative value(s).")
        if column == "Transaction_Count" and not invalid.any():
            if (converted % 1 != 0).any():
                problems.append("Transaction_Count must contain whole numbers.")
            if (converted == 0).any():
                problems.append("Transaction_Count must be greater than zero.")

    duplicated = df.duplicated(subset=["StockCode", "Month"], keep=False)
    if duplicated.any():
        problems.append(
            f"Found {int(duplicated.sum())} row(s) with duplicate StockCode-Month keys."
        )

    return problems


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Validate the product-month CSV before using it in the React dashboard."
    )
    parser.add_argument("csv_path", help="Path to product_month_summary.csv")
    args = parser.parse_args()

    problems = validate_product_month_csv(args.csv_path)
    if problems:
        print("VALIDATION FAILED")
        for problem in problems:
            print(f"- {problem}")
        return 1

    df = pd.read_csv(args.csv_path)
    print("VALIDATION PASSED")
    print(f"Rows: {len(df)}")
    print("Columns: " + ", ".join(df.columns))
    print("No schema or data-quality issues found.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
