import "./BaselineMetrics.css";

export const HILLSTROM_BASELINE_SUMMARY = [
  {
    group: "Mens E-Mail",
    customers: 21307,
    conversions: 267,
    visitors: 3894,
    meanSpend: 1.422617,
  },
  {
    group: "Womens E-Mail",
    customers: 21387,
    conversions: 189,
    visitors: 3238,
    meanSpend: 1.077202,
  },
  {
    group: "No E-Mail",
    customers: 21306,
    conversions: 122,
    visitors: 2262,
    meanSpend: 0.652789,
  },
].map((item) => ({
  ...item,
  conversionRate: (item.conversions / item.customers) * 100,
  visitRate: (item.visitors / item.customers) * 100,
}));

function BaselineMetrics({ summary = HILLSTROM_BASELINE_SUMMARY }) {
  const control = summary.find((item) => item.group === "No E-Mail");

  if (!control) {
    return (
      <section className="baseline-metrics">
        <h2>Baseline Metrics</h2>
        <p>Control-group metrics are unavailable.</p>
      </section>
    );
  }

  function formatDifference(rate) {
    const difference = rate - control.conversionRate;
    const sign = difference > 0 ? "+" : "";
    return `${sign}${difference.toFixed(4)} pp`;
  }

  return (
    <section className="baseline-metrics">
      <div className="baseline-heading">
        <div>
          <h2>Baseline Metrics</h2>
          <p>
            Hillstrom marketing experiment · Observed group-level outcomes
          </p>
        </div>
        <span className="baseline-tag">Descriptive analysis</span>
      </div>

      <div className="baseline-table-wrap">
        <table className="baseline-table">
          <thead>
            <tr>
              <th scope="col">Marketing group</th>
              <th scope="col">Customers</th>
              <th scope="col">Conversions</th>
              <th scope="col">Conversion rate</th>
              <th scope="col">Difference vs control</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((item) => (
              <tr key={item.group}>
                <th scope="row">
                  {item.group}
                  {item.group === "No E-Mail" && (
                    <span className="baseline-control">Control</span>
                  )}
                </th>
                <td>{item.customers.toLocaleString("en-IN")}</td>
                <td>{item.conversions.toLocaleString("en-IN")}</td>
                <td>{item.conversionRate.toFixed(4)}%</td>
                <td>
                  {item.group === "No E-Mail"
                    ? "Reference"
                    : formatDifference(item.conversionRate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="baseline-note">
        Source: saved output from
        {" "}
        <code>04_hillstrom_treatment_outcome_checks.ipynb</code>.
        Differences are descriptive percentage-point comparisons, not
        estimates of a discount effect or proof of causality.
      </p>
    </section>
  );
}

export default BaselineMetrics;
