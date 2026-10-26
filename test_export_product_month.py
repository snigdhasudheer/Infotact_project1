"""Unit tests for the product-month CSV aggregation."""

import unittest

import pandas as pd

from export_product_month import OUTPUT_COLUMNS, build_product_month_summary


class ProductMonthSummaryTests(unittest.TestCase):
    def setUp(self):
        self.transactions = pd.DataFrame(
            {
                "InvoiceNo": ["100", "101", "102", "103", "104"],
                "StockCode": ["A", "A", "A", "B", "B"],
                "InvoiceDate": [
                    "2010-12-01",
                    "2010-12-15",
                    "2011-01-02",
                    "2010-12-10",
                    "2010-12-11",
                ],
                "Quantity": [2, 3, 1, 5, -1],
                "UnitPrice": [10.0, 12.0, 8.0, 2.0, 2.0],
            }
        )

    def test_expected_output_columns(self):
        result = build_product_month_summary(self.transactions)
        self.assertEqual(result.columns.tolist(), OUTPUT_COLUMNS)

    def test_groups_by_product_and_month(self):
        result = build_product_month_summary(self.transactions)
        self.assertEqual(len(result), 3)
        december_a = result[(result["StockCode"] == "A") & (result["Month"] == "2010-12")].iloc[0]
        self.assertAlmostEqual(december_a["Average_Price"], 11.0)
        self.assertEqual(december_a["Total_Quantity"], 5)
        self.assertAlmostEqual(december_a["Total_Revenue"], 56.0)
        self.assertEqual(december_a["Transaction_Count"], 2)

    def test_excludes_non_positive_quantity_and_deduplicates(self):
        duplicated = pd.concat([self.transactions, self.transactions.iloc[[0]]], ignore_index=True)
        result = build_product_month_summary(duplicated)
        december_b = result[(result["StockCode"] == "B") & (result["Month"] == "2010-12")].iloc[0]
        self.assertEqual(december_b["Total_Quantity"], 5)
        self.assertAlmostEqual(december_b["Total_Revenue"], 10.0)

    def test_missing_required_column_raises_error(self):
        with self.assertRaisesRegex(ValueError, "Missing required input columns"):
            build_product_month_summary(self.transactions.drop(columns=["UnitPrice"]))


if __name__ == "__main__":
    unittest.main()
