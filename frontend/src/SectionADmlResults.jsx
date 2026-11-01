import "./SectionADmlResults.css";

// Values verified from section_a_dml_results.csv
export const DML_RESULTS = {
  treatmentVariable: "treatment",
  outcomeVariable: "outcome",
  treatmentGroup: "Mens E-Mail",
  controlGroup: "No E-Mail",
  sampleSize: 42613,
  features: 9,
  ate: 0.0067300341686025115,
  ciLower: 0.004930046744075232,
  ciUpper: 0.00853002159312979,
  meanCate: 0.0067300341686025115,
  minCate: 0.001002189597781513,
  maxCate: 0.029542526705475535,
  cateStd: 0.003732812764183508,
};

const VALIDATION = [
  { model: "Treatment Model", metric: "Accuracy", value: "0.500974" },
  { model: "Treatment Model", metric: "ROC-AUC", value: "0.502577" },
  { model: "Treatment Model", metric: "Log Loss", value: "0.699822" },
  { model: "Outcome Model", metric: "RMSE", value: "0.095623" },
  { model: "Outcome Model", metric: "MAE", value: "0.018208" },
  { model: "Outcome Model", metric: "R² Score", value: "-0.010879" },
];

const RAW_COMPARISON = [
  { metric: "Control conversion rate", value: "0.572609%" },
  { metric: "Treatment conversion rate", value: "1.253109%" },
  { metric: "Raw treatment effect", value: "0.680501 pp" },
  { metric: "DML treatment effect", value: "0.673003 pp" },
];

function MetricCard({ label, value, detail }) {
  return (
    <article className="dml-metric-card">
      <p>{label}</p>
      <h3>{value}</h3>
      <span>{detail}</span>
    </article>
  );
}

function SectionADmlResults() {
  const result = DML_RESULTS;

  return (
    <section className="section-a-dml">
      <div className="dml-heading">
        <div>
          <h2>Section A · Double Machine Learning Results</h2>
          <p>
            Actual estimation output from the Hillstrom Mens E-Mail
            versus No E-Mail experiment.
          </p>
        </div>
        <span className="dml-source-tag">CSV results integrated</span>
      </div>

      <div className="dml-metrics-grid">
        <MetricCard
          label="Average Treatment Effect (ATE)"
          value={`${(result.ate * 100).toFixed(4)} pp`}
          detail="Estimated change in conversion probability"
        />
        <MetricCard
          label="95% Confidence Interval"
          value={`${(result.ciLower * 100).toFixed(4)} to ${(result.ciUpper * 100).toFixed(4)} pp`}
          detail="Lower and upper confidence bounds"
        />
        <MetricCard
          label="Analysis Sample Size"
          value={result.sampleSize.toLocaleString("en-IN")}
          detail="Customers included in DML estimation"
        />
        <MetricCard
          label="Features Used"
          value={result.features}
          detail="Pre-treatment model features"
        />
      </div>

      <div className="dml-panel">
        <h3>Experiment Configuration</h3>
        <div className="dml-detail-grid">
          <p><strong>Treatment variable:</strong> {result.treatmentVariable}</p>
          <p><strong>Outcome variable:</strong> {result.outcomeVariable}</p>
          <p><strong>Treatment group:</strong> {result.treatmentGroup}</p>
          <p><strong>Control group:</strong> {result.controlGroup}</p>
          <p><strong>Mean CATE:</strong> {result.meanCate.toFixed(6)}</p>
          <p><strong>CATE standard deviation:</strong> {result.cateStd.toFixed(6)}</p>
          <p><strong>Minimum CATE:</strong> {result.minCate.toFixed(6)}</p>
          <p><strong>Maximum CATE:</strong> {result.maxCate.toFixed(6)}</p>
        </div>
      </div>

      <div className="dml-two-column">
        <div className="dml-panel">
          <h3>Model Validation Metrics</h3>
          <div className="dml-table-wrap">
            <table className="dml-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {VALIDATION.map((item) => (
                  <tr key={`${item.model}-${item.metric}`}>
                    <td>{item.model}</td>
                    <td>{item.metric}</td>
                    <td>{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="dml-caption">
            Outcome metrics are predictive diagnostics, not a complete
            evaluation of the DML estimator.
          </p>
        </div>

        <div className="dml-panel">
          <h3>Raw vs DML Comparison</h3>
          <div className="dml-table-wrap">
            <table className="dml-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {RAW_COMPARISON.map((item) => (
                  <tr key={item.metric}>
                    <td>{item.metric}</td>
                    <td>{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="dml-caption">
            Raw and DML estimates are close; this is a consistency
            comparison, not independent proof of causality.
          </p>
        </div>
      </div>

      <div className="dml-methodology-note">
        <strong>Interpretation and limitation:</strong> The estimated ATE
        is approximately 0.673 percentage points for Mens E-Mail versus
        No E-Mail. This is an email-marketing treatment effect from the
        Hillstrom experiment. It is not a product discount or price
        elasticity estimate. The treatment model ROC-AUC is close to 0.50
        and the outcome diagnostic R² is negative, so model diagnostics
        should be reviewed before making business recommendations.
      </div>
    </section>
  );
}

export default SectionADmlResults;