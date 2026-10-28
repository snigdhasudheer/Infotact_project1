
"""API tests for the EconoCausal FastAPI backend."""

import io
import unittest

import pandas as pd
from fastapi.testclient import TestClient

from main import app


class TestEconoCausalAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def create_excel(self):
        """Create a small valid Excel workbook in memory."""
        data = pd.DataFrame({
            "InvoiceNo": ["10001", "10002"],
            "StockCode": ["A001", "A001"],
            "Description": ["Product A", "Product A"],
            "Quantity": [2, 3],
            "InvoiceDate": [
                "2010-12-01 10:00:00",
                "2010-12-15 11:00:00",
            ],
            "UnitPrice": [10.0, 12.0],
            "CustomerID": [12345, 12345],
            "Country": ["United Kingdom", "United Kingdom"],
        })

        buffer = io.BytesIO()
        data.to_excel(buffer, index=False, engine="openpyxl")
        buffer.seek(0)
        return buffer

    def test_health_endpoint(self):
        response = self.client.get("/api/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_upload_rejects_csv_file(self):
        response = self.client.post(
            "/api/upload",
            files={"file": ("data.csv", b"a,b\n1,2", "text/csv")},
        )

        self.assertEqual(response.status_code, 400)

    def test_upload_accepts_valid_excel(self):
        response = self.client.post(
            "/api/upload",
            files={
                "file": (
                    "sample.xlsx",
                    self.create_excel().getvalue(),
                    "application/vnd.openxmlformats-officedocument."
                    "spreadsheetml.sheet",
                )
            },
        )

        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertEqual(result["rows"], 2)
        self.assertIn("summary", result)
        self.assertIn("preview", result)

    def test_export_rejects_csv_file(self):
        response = self.client.post(
            "/api/export-product-month",
            files={"file": ("data.csv", b"a,b\n1,2", "text/csv")},
        )

        self.assertEqual(response.status_code, 400)

    def test_export_returns_product_month_csv(self):
        response = self.client.post(
            "/api/export-product-month",
            files={
                "file": (
                    "sample.xlsx",
                    self.create_excel().getvalue(),
                    "application/vnd.openxmlformats-officedocument."
                    "spreadsheetml.sheet",
                )
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("text/csv", response.headers["content-type"])
        self.assertIn(
            "product_month_summary.csv",
            response.headers.get("content-disposition", ""),
        )

        exported = pd.read_csv(io.BytesIO(response.content))
        expected_columns = [
            "StockCode",
            "Month",
            "Average_Price",
            "Total_Quantity",
            "Total_Revenue",
            "Transaction_Count",
        ]

        self.assertEqual(exported.columns.tolist(), expected_columns)
        self.assertEqual(len(exported), 1)
        self.assertEqual(exported.iloc[0]["Month"], "2010-12")

    def test_dataset_report_rejects_csv_file(self):
        response = self.client.post(
            "/api/dataset-report",
            files={
                "file": ("data.csv", b"a,b\n1,2", "text/csv")
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn(
            "Unsupported format",
            response.json()["detail"],
        )

    def test_dataset_report_returns_downloadable_text(self):
        response = self.client.post(
            "/api/dataset-report",
            files={
                "file": (
                    "sample.xlsx",
                    self.create_excel().getvalue(),
                    "application/vnd.openxmlformats-officedocument."
                    "spreadsheetml.sheet",
                )
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("text/plain", response.headers["content-type"])
        self.assertIn(
            "econocausal_dataset_report.txt",
            response.headers.get("content-disposition", ""),
        )

        report = response.text

        self.assertIn("DATASET OVERVIEW", report)
        self.assertIn("DATA QUALITY", report)
        self.assertIn("DESCRIPTIVE SUMMARY", report)
        self.assertIn("INTERPRETATION NOTE", report)
        self.assertIn("Rows: 2", report)
        self.assertIn("Columns: 8", report)
        self.assertIn("Validation status: Successful", report)


if __name__ == "__main__":
    unittest.main(verbosity=2)
