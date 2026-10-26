"""Unit tests for the product-month dashboard CSV validator."""
import tempfile
import unittest
from pathlib import Path
import pandas as pd

from validate_product_month_csv import REQUIRED_COLUMNS, validate_product_month_csv


class ValidateProductMonthCsvTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp_dir.cleanup)
        self.path = Path(self.temp_dir.name) / "summary.csv"
        self.valid_df = pd.DataFrame([
            {"StockCode": "A001", "Month": "2026-01", "Average_Price": 12.5,
             "Total_Quantity": 20, "Total_Revenue": 250.0, "Transaction_Count": 3},
            {"StockCode": "B002", "Month": "2026-01", "Average_Price": 5.0,
             "Total_Quantity": 10, "Total_Revenue": 50.0, "Transaction_Count": 2},
        ], columns=REQUIRED_COLUMNS)

    def write_df(self, df):
        df.to_csv(self.path, index=False)

    def test_valid_csv_passes(self):
        self.write_df(self.valid_df)
        self.assertEqual(validate_product_month_csv(self.path), [])

    def test_missing_required_column_is_reported(self):
        self.write_df(self.valid_df.drop(columns=["Total_Revenue"]))
        self.assertTrue(any("Missing required columns" in issue
                            for issue in validate_product_month_csv(self.path)))

    def test_invalid_month_format_is_reported(self):
        df = self.valid_df.copy()
        df.loc[0, "Month"] = "Jan-2026"
        self.write_df(df)
        self.assertTrue(any("YYYY-MM" in issue
                            for issue in validate_product_month_csv(self.path)))

    def test_duplicate_product_month_key_is_reported(self):
        df = pd.concat([self.valid_df, self.valid_df.iloc[[0]]], ignore_index=True)
        self.write_df(df)
        self.assertTrue(any("duplicate StockCode-Month" in issue
                            for issue in validate_product_month_csv(self.path)))

    def test_negative_metric_is_reported(self):
        df = self.valid_df.copy()
        df.loc[0, "Average_Price"] = -1
        self.write_df(df)
        self.assertTrue(any("negative" in issue
                            for issue in validate_product_month_csv(self.path)))

    def test_empty_csv_data_is_reported(self):
        self.write_df(self.valid_df.iloc[0:0])
        self.assertTrue(any("no data rows" in issue
                            for issue in validate_product_month_csv(self.path)))

    def test_missing_file_is_reported(self):
        self.assertTrue(any("File not found" in issue
                            for issue in validate_product_month_csv(self.path)))


if __name__ == "__main__":
    unittest.main(verbosity=2)
