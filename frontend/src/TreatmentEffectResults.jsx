
import "./TreatmentEffectResults.css";

function TreatmentEffectResults({ results = null }) {
  const hasResults = Boolean(results);

  const metrics = [
    {
      label: "Average Treatment Effect (ATE)",
      value: hasResults ? results.ate ?? "Unavailable" : "Pending",
      description: "Estimated average treatment effect",
    },
    {
      label: "95% Confidence Interval",
      value:
        hasResults && results.confidenceInterval
          ? `${results.confidenceInterval[0]} to ${results.confidenceInterval[1]}`
          : "Pending",
      description: "Uncertainty range of the estimate",
    },
    {
      label: "Analysis Sample Size",
      value: hasResults
        ? results.sampleSize ?? "Unavailable"
        : "Pending",
      description: "Eligible observations used by the model",
    },
    {
      label: "Model Status",
      value: hasResults ? results.modelStatus ?? "Unavailable" : "Not trained",
      description: hasResults
        ? "Status supplied by the validated model"
        : "No validated treatment-effect estimate available",
    },
  ];

  return (
    <section className="treatment-results">
      <div className="treatment-heading">
        <div>
          <h2>Treatment Effect Analysis</h2>
          <p>
            Causal analysis using Double Machine Learning (DML).
          </p>
        </div>

        <span className={`task-status ${hasResults ? "review" : "pending"}`}>
          {hasResults ? "Results available for review" : "Not yet estimated"}
        </span>
      </div>

      <div className="stats-grid">
        {metrics.map((metric) => (
          <div className="stat-card" key={metric.label}>
            <p>{metric.label}</p>
            <h2>{metric.value}</h2>
            <span>{metric.description}</span>
          </div>
        ))}
      </div>

      <div className="chart-placeholder treatment-chart">
        {hasResults && results.effectDistribution?.length
          ? "Treatment-effect distribution data received. Chart integration is pending validation."
          : "Treatment-effect visualization will appear after a valid causal model has been trained and evaluated."}
      </div>

      <div className="note treatment-note">
        <strong>Data limitation:</strong> Online Retail records contain
        historical transactions, but do not by themselves establish which
        customers received a discount or what non-purchasing customers would
        have done. Therefore, this dashboard does not report a causal discount
        effect yet. Estimates must come from validated treatment/control data
        and model results.
      </div>
    </section>
  );
}

export default TreatmentEffectResults;
