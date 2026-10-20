
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


def validate_upload(file_path):
    path = Path(file_path)

    # Test 1: File must exist
    if not path.is_file():
        raise FileNotFoundError(f"File not found: {path}")

    # Test 2: Only Excel .xlsx is currently supported
    if path.suffix.lower() != ".xlsx":
        raise ValueError("Unsupported format. Please upload an .xlsx file.")

    # Test 3: Read and validate schema
    df = pd.read_excel(path, engine="openpyxl")

    missing = EXPECTED_COLUMNS - set(df.columns)
    unexpected = set(df.columns) - EXPECTED_COLUMNS

    if missing:
        raise ValueError(f"Missing required columns: {sorted(missing)}")

    if unexpected:
        raise ValueError(f"Unexpected columns: {sorted(unexpected)}")

    # Test 4: Create sample preview
    preview = df.head(5)

    print("Validation passed!")
    print("Rows:", len(df))
    print("Columns:", len(df.columns))
    print("\nSample preview:")
    print(preview.to_string(index=False))

    return df


if __name__ == "__main__":
    validate_upload("data/raw/Online Retail.xlsx")
