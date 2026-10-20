
import tempfile
import unittest
from pathlib import Path

import pandas as pd

from validate_upload import validate_upload, EXPECTED_COLUMNS


class TestValidateUpload(unittest.TestCase):

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.folder = Path(self.temp_dir.name)

        self.valid_data = {
            column: [f"sample_{column}"]
            for column in EXPECTED_COLUMNS
        }

    def tearDown(self):
        self.temp_dir.cleanup()

    def create_excel(self, filename, data):
        path = self.folder / filename
        pd.DataFrame(data).to_excel(path, index=False)
        return path

    def test_valid_excel(self):
        path = self.create_excel("valid.xlsx", self.valid_data)
        result = validate_upload(path)
        self.assertEqual(len(result), 1)

    def test_missing_file(self):
        path = self.folder / "missing.xlsx"
        with self.assertRaises(FileNotFoundError):
            validate_upload(path)

    def test_unsupported_format(self):
        path = self.folder / "data.csv"
        path.write_text("sample,data")
        with self.assertRaisesRegex(ValueError, "Unsupported format"):
            validate_upload(path)

    def test_missing_required_column(self):
        data = {
            column: values
            for column, values in self.valid_data.items()
            if column != "Country"
        }
        path = self.create_excel("missing_column.xlsx", data)

        with self.assertRaisesRegex(ValueError, "Missing required columns"):
            validate_upload(path)

    def test_unexpected_column(self):
        data = dict(self.valid_data)
        data["ExtraColumn"] = ["unexpected"]
        path = self.create_excel("extra_column.xlsx", data)

        with self.assertRaisesRegex(ValueError, "Unexpected columns"):
            validate_upload(path)


if __name__ == "__main__":
    unittest.main(verbosity=2)
