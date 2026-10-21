
from pathlib import Path
import pandas as pd

EXPECTED_COLUMNS = {
    "InvoiceNo",
    "StockCode",
    "Description",
    "Quantity",
    "InvoiceDate",
    "UnitPrice",
    "CustomerID",
    "Country",
}


def validate_file_exists(path: Path):
    if not path.is_file():
        raise FileNotFoundError(f"File not found: {path}")


def validate_file_format(path: Path):
    if path.suffix.lower() != ".xlsx":
        raise ValueError("Unsupported format. Please upload an .xlsx file.")


def validate_schema(df: pd.DataFrame):
    missing = EXPECTED_COLUMNS - set(df.columns)
    unexpected = set(df.columns) - EXPECTED_COLUMNS

    if missing:
        raise ValueError(
            f"Missing required columns: {sorted(missing)}"
        )

    if unexpected:
        raise ValueError(
            f"Unexpected columns: {sorted(unexpected)}"
        )


def create_preview(df: pd.DataFrame, rows: int = 5):
    return df.head(rows)


def validate_upload(file_path):
    path = Path(file_path)

    validate_file_exists(path)
    validate_file_format(path)

    df = pd.read_excel(path, engine="openpyxl")

    validate_schema(df)

    preview = create_preview(df)

    print("Validation passed!")
    print(f"Rows: {len(df)}")
    print(f"Columns: {len(df.columns)}")
    print("\nSample preview:")
    print(preview.to_string(index=False))

    return df
