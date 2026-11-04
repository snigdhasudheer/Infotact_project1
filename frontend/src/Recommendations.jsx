import { useEffect, useMemo, useState } from "react";
import "./Recommendations.css";

const CSV_URL = "/section_a_individual_cate.csv";

function formatPP(value) {
  return `${(Number(value) * 100).toFixed(3)} pp`;
}

function Recommendations() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRecommendations() {
      try {
        const response = await fetch(CSV_URL);

        if (!response.ok) {
          throw new Error("Unable to load individual CATE data.");
        }

        const csv = await response.text();
        const lines = csv.trim().split(/\r?\n/);
        const headers = lines[0].split(",").map((item) => item.trim());

        const requiredColumns = [
          "observation_id",
          "treatment",
          "outcome",
          "cate",
          "cate_ci_lower",
          "cate_ci_upper",
        ];

        const missing = requiredColumns.filter(
          (column) => !headers.includes(column)
        );

        if (missing.length > 0) {
          throw new Error(`Missing CSV columns: ${missing.join(", ")}`);
        }

        const index = Object.fromEntries(
          requiredColumns.map((column) => [
            column,
            headers.indexOf(column),
          ])
        );

        const parsed = lines.slice(1).map((line) => {
          const values = line.split(",");

          return {
            id: values[index.observation_id],
            treatment: Number(values[index.treatment]),
            outcome: Number(values[index.outcome]),
            cate: Number(values[index.cate]),
            lower: Number(values[index.cate_ci_lower]),
            upper: Number(values[index.cate_ci_upper]),
          };
        }).filter((row) =>
          row.id &&
          [row.treatment, row.outcome, row.cate, row.lower, row.upper]
            .every(Number.isFinite)
        );

        const ranked = parsed.map((row) => ({
          ...row,
          priority: row.cate > 0 && row.lower > 0
            ? "Higher Priority"
            : "Needs Review",
        }));

        ranked.sort((a, b) => {
          if (a.priority !== b.priority) {
            return a.priority === "Higher Priority" ? -1 : 1;
          }

          return b.lower - a.lower;
        });

        setCustomers(ranked);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, []);

  const summary = useMemo(() => ({
    total: customers.length,
    high: customers.filter(
      (customer) => customer.priority === "Higher Priority"
    ).length,
    review: customers.filter(
      (customer) => customer.priority === "Needs Review"
    ).length,
  }), [customers]);

  if (loading) {
    return <p>Loading customer recommendations...</p>;
  }

  if (error) {
    return (
      <div className="recommendation-error">
        <p>{error}</p>
        <p>
          Check that section_a_individual_cate.csv exists inside
          frontend/public.
        </p>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <div className="recommendation-intro">
        <span className="eyebrow">CUSTOMER DECISION SUPPORT</span>
        <h2>Customer Treatment Recommendations</h2>
        <p>
          Customers are ranked using their estimated treatment effects
          from the Hillstrom Mens E-Mail experiment.
        </p>
      </div>

      <div className="recommendation-summary">
        <div className="recommendation-stat">
          <span>Total observations</span>
          <strong>{summary.total.toLocaleString("en-IN")}</strong>
        </div>

        <div className="recommendation-stat">
          <span>Higher priority</span>
          <strong>{summary.high.toLocaleString("en-IN")}</strong>
        </div>

        <div className="recommendation-stat">
          <span>Needs review</span>
          <strong>{summary.review.toLocaleString("en-IN")}</strong>
        </div>
      </div>

      <div className="recommendation-rule">
        <strong>Selection rule</strong>
        <p>
          Higher Priority: estimated CATE is positive and the lower
          confidence interval bound is above zero. Customers are ranked
          by the lower confidence bound, highest first.
        </p>
      </div>

      <div className="recommendation-table-heading">
        <h3>Ranked Customer Observations</h3>
        <span>Showing top 100 observations</span>
      </div>

      <div className="recommendation-table-wrapper">
        <table className="recommendation-table">
          <thead>
            <tr>
              <th>Observation ID</th>
              <th>Observed Group</th>
              <th>Conversion</th>
              <th>Estimated Uplift</th>
              <th>95% Confidence Interval</th>
              <th>Priority</th>
            </tr>
          </thead>

          <tbody>
            {customers.slice(0, 100).map((customer) => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>
                  {customer.treatment === 1
                    ? "Mens E-Mail"
                    : "No E-Mail"}
                </td>
                <td>
                  {customer.outcome === 1 ? "Converted" : "Not converted"}
                </td>
                <td className="recommendation-uplift">
                  {formatPP(customer.cate)}
                </td>
                <td>
                  {formatPP(customer.lower)} to {formatPP(customer.upper)}
                </td>
                <td>
                  <span
                    className={`priority-label ${
                      customer.priority === "Higher Priority"
                        ? "priority-high"
                        : "priority-review"
                    }`}
                  >
                    {customer.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="recommendation-disclaimer">
        <strong>Important limitation:</strong> These are exploratory,
        in-sample CATE-based rankings, not validated future customer
        outcomes. Observation IDs are dataset row identifiers, not
        customer identities. This analysis concerns email treatment,
        not price discounts. Validate on independent data before
        operational use.
      </p>
    </div>
  );
}

export default Recommendations;