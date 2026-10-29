
import { useState } from "react";
import "./UploadPanel.css";

const API_URL = "http://127.0.0.1:8000/api/upload";
const EXPORT_API_URL = "http://127.0.0.1:8000/api/export-product-month";
const REPORT_API_URL = "http://127.0.0.1:8000/api/dataset-report";

function getErrorMessage(data, fallback) {
  const detail = data?.detail;

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(", ") || fallback;
  }

  return detail || fallback;
}

function UploadPanel() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [exportError, setExportError] = useState("");
  const [exportSuccess, setExportSuccess] = useState("");
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");

  function handleFileChange(event) {
    setFile(event.target.files?.[0] || null);
    setError("");
    setExportError("");
    setExportSuccess("");
    setReportError("");
    setReportSuccess("");
    setResult(null);
  }

  async function handleUpload(event) {
    event.preventDefault();
    setError("");
    setExportError("");
    setExportSuccess("");
    setReportError("");
    setReportSuccess("");
    setResult(null);

    if (!file) {
      setError("Please select an Excel (.xlsx) file.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setError("Unsupported format. Please select an .xlsx file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Upload failed."));
      }

      setResult(data);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Check that FastAPI is running on port 8000."
          : err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    setExportError("");
    setExportSuccess("");

    if (!file) {
      setExportError("Please select an Excel (.xlsx) file first.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setExportError("Unsupported format. Please select an .xlsx file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setExporting(true);

    try {
      const response = await fetch(EXPORT_API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          getErrorMessage(data, "Could not generate the CSV.")
        );
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("The API returned an empty CSV file.");
      }

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = "product_month_summary.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);

      setExportSuccess(
        "Product-Month CSV generated successfully. Check your downloads."
      );
    } catch (err) {
      setExportError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Make sure FastAPI is running on port 8000."
          : err.message || "CSV export failed."
      );
    } finally {
      setExporting(false);
    }
  }

  async function handleReportDownload() {
    setReportError("");
    setReportSuccess("");

    if (!file) {
      setReportError("Please select an Excel (.xlsx) file first.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setReportError("Unsupported format. Please select an .xlsx file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setReporting(true);

    try {
      const response = await fetch(REPORT_API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          getErrorMessage(data, "Could not generate the dataset report.")
        );
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("The API returned an empty report file.");
      }

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = "econocausal_dataset_report.txt";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);

      setReportSuccess(
        "Dataset report downloaded successfully. Check your downloads."
      );
    } catch (err) {
      setReportError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the report backend. Check that FastAPI is running on port 8001."
          : err.message || "Dataset report download failed."
      );
    } finally {
      setReporting(false);
    }
  }

  return (
    <section className="panel upload-panel">
      <div className="panel-heading">
        <div>
          <h2>Dataset Upload &amp; Validation</h2>
          <p>
            Upload an Excel dataset to validate its schema and preview
            the data.
          </p>
        </div>

        <span className="upload-tag">XLSX</span>
      </div>

      <form onSubmit={handleUpload}>
        <label className="upload-label" htmlFor="dataset-file">
          Select Excel file (.xlsx)
        </label>

        <div className="upload-controls">
          <input
            id="dataset-file"
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
          />

          <button
            className="refresh-button"
            type="submit"
            disabled={loading || exporting || reporting}
          >
            {loading ? "Validating..." : "Upload & Validate"}
          </button>
        </div>

        {file && (
          <p className="upload-file-name">
            Selected: {file.name}
          </p>
        )}
      </form>

      {error && (
        <div className="upload-error" role="alert">
          <strong>Validation failed</strong>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="upload-success" role="status">
          <h3>Validation successful</h3>
          <p>{result.message}</p>

          <div className="upload-summary">
            <div>
              <span>File</span>
              <strong>{result.filename}</strong>
            </div>

            <div>
              <span>Total rows</span>
              <strong>{result.rows}</strong>
            </div>

            <div>
              <span>Total columns</span>
              <strong>{result.columns.length}</strong>
            </div>
          </div>

          {result.summary && (
            <>
              <h3>Dataset Summary</h3>

              <div className="upload-summary">
                <div>
                  <span>Unique invoices</span>
                  <strong>
                    {Number(
                      result.summary.unique_invoices
                    ).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span>Unique customers</span>
                  <strong>
                    {Number(
                      result.summary.unique_customers
                    ).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span>Countries</span>
                  <strong>
                    {Number(
                      result.summary.countries
                    ).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span>Total quantity</span>
                  <strong>
                    {Number(
                      result.summary.total_quantity
                    ).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span>Net sales value</span>
                  <strong>
                    {Number(
                      result.summary.net_sales_value
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </div>
              </div>

              <p className="upload-file-name">
                These are descriptive statistics from historical data,
                not causal-effect estimates.
              </p>
            </>
          )}

          <h3>Column names</h3>

          <div className="upload-columns">
            {result.columns.map((column) => (
              <span key={column}>{column}</span>
            ))}
          </div>

          <h3>Data preview (first 5 rows)</h3>

          {result.preview.length > 0 ? (
            <div className="upload-table-wrapper">
              <table className="upload-table">
                <thead>
                  <tr>
                    {result.columns.map((column) => (
                      <th key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {result.preview.map((row, index) => (
                    <tr key={index}>
                      {result.columns.map((column) => (
                        <td key={column}>{row[column] ?? ""}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>
              The file is valid, but it contains no preview rows.
            </p>
          )}
        </div>
      )}

      <div className="product-month-export">
        <h3>Product-Month Export</h3>
        <p>
          Generate a CSV showing historical product activity grouped
          by month. Select an Excel file above to get started.
        </p>

        <button
          className="refresh-button"
          type="button"
          onClick={handleExport}
          disabled={!file || loading || exporting || reporting}
        >
          {exporting
            ? "Generating CSV..."
            : "Download Product-Month CSV"}
        </button>

        {exportError && (
          <div className="upload-error" role="alert">
            <strong>Export failed</strong>
            <p>{exportError}</p>
          </div>
        )}

        {exportSuccess && (
          <div className="upload-success" role="status">
            <p>{exportSuccess}</p>
          </div>
        )}

        <p className="upload-file-name">
          Historical summary only; this export does not establish
          causal effects of discounts or price changes.
        </p>
      </div>

      <div className="product-month-export">
        <h3>Dataset Report</h3>
        <p>
          Download a text report containing dataset dimensions,
          column names, data-quality statistics and descriptive
          sales information.
        </p>

        <button
          className="refresh-button"
          type="button"
          onClick={handleReportDownload}
          disabled={!file || loading || exporting || reporting}
        >
          {reporting
            ? "Generating Report..."
            : "Download Dataset Report"}
        </button>

        {reportError && (
          <div className="upload-error" role="alert">
            <strong>Report generation failed</strong>
            <p>{reportError}</p>
          </div>
        )}

        {reportSuccess && (
          <div className="upload-success" role="status">
            <p>{reportSuccess}</p>
          </div>
        )}

        <p className="upload-file-name">
          This report describes historical transactions. It does not
          prove that discounts or price changes cause changes in
          purchasing behaviour.
        </p>
      </div>
    </section>
  );
}

export default UploadPanel;

