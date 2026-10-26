import { useState } from "react";
import "./UploadPanel.css";

const API_URL = "http://127.0.0.1:8000/api/upload";

function UploadPanel() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleUpload(event) {
    event.preventDefault();
    setError("");
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
        const detail = Array.isArray(data.detail)
          ? data.detail.map((item) => item.msg).join(", ")
          : data.detail;

        throw new Error(detail || "Upload failed.");
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
            onChange={(event) => {
              setFile(event.target.files?.[0] || null);
              setError("");
              setResult(null);
            }}
          />

          <button
            className="refresh-button"
            type="submit"
            disabled={loading}
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

          {/* Added: descriptive Online Retail statistics */}
          {result.summary && (
            <>
              <h3>Dataset Summary</h3>

              <div className="upload-summary">
                <div>
                  <span>Unique invoices</span>
                  <strong>
                    {Number(result.summary.unique_invoices).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span>Unique customers</span>
                  <strong>
                    {Number(result.summary.unique_customers).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span>Countries</span>
                  <strong>
                    {Number(result.summary.countries).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span>Total quantity</span>
                  <strong>
                    {Number(result.summary.total_quantity).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span>Net sales value</span>
                  <strong>
                    {Number(result.summary.net_sales_value).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </strong>
                </div>
              </div>

              <p className="upload-file-name">
                Descriptive statistics from the uploaded data;
                these are not causal-effect estimates.
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
                        <td key={column}>
                          {row[column] ?? ""}
                        </td>
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
    </section>
  );
}

export default UploadPanel;
