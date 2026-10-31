import Plot from "react-plotly.js";
import "./TreatmentEffectResults.css";

const DEMO_EFFECTS = [
  -0.12, -0.09, -0.08, -0.07, -0.06, -0.05,
  -0.04, -0.03, -0.02, -0.02, -0.01, 0.00,
  0.01, 0.02, 0.02, 0.03, 0.04, 0.04,
  0.05, 0.05, 0.06, 0.07, 0.08, 0.08,
  0.09, 0.10, 0.11, 0.12, 0.13, 0.15,
];

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
      value: hasResults ? results.sampleSize ?? "Unavailable" : "Pending",
      description: "Observations used by the model",
    },
    {
      label: "Model Status",
      value: hasResults ? results.modelStatus ?? "Unavailable" : "Not trained",
      description: "Status supplied by the model",
    },
  ];

  // Accept numeric effects or objects containing effect/CATE values.
  const actualEffects = Array.isArray(results?.effectDistribution)
    ? results.effectDistribution
        .map((item) =>
          typeof item === "number"
            ? item
            : Number(item?.effect ?? item?.cate)
        )
        .filter(Number.isFinite)
    : [];

  const useDemoData = !hasResults;
  const distributionData = useDemoData ? DEMO_EFFECTS : actualEffects;

  // Individual effect intervals are optional.
  const individualIntervals = Array.isArray(results?.effectDistribution)
    ? results.effectDistribution.filter(
        (item) =>
          typeof item === "object" &&
          Number.isFinite(Number(item?.effect ?? item?.cate)) &&
          Number.isFinite(Number(item?.lower ?? item?.lowerBound)) &&
          Number.isFinite(Number(item?.upper ?? item?.upperBound))
      )
    : [];

  const ateInterval = results?.confidenceInterval;

  const validAteInterval =
    Array.isArray(ateInterval) &&
    ateInterval.length >= 2 &&
    Number.isFinite(Number(ateInterval[0])) &&
    Number.isFinite(Number(ateInterval[1]));

  const uncertaintyTrace = individualIntervals.length
    ? [
        {
          type: "scatter",
          mode: "markers",
          x: individualIntervals.map((item) =>
            Number(item.effect ?? item.cate)
          ),
          y: individualIntervals.map((_, index) => `Effect ${index + 1}`),
          orientation: "h",
          marker: { size: 8 },
          error_x: {
            type: "data",
            symmetric: false,
            array: individualIntervals.map(
              (item) =>
                Number(item.upper ?? item.upperBound) -
                Number(item.effect ?? item.cate)
            ),
            arrayminus: individualIntervals.map(
              (item) =>
                Number(item.effect ?? item.cate) -
                Number(item.lower ?? item.lowerBound)
            ),
          },
          name: "Individual effect intervals",
        },
      ]
    : validAteInterval
      ? [
          {
            type: "scatter",
            mode: "markers",
            x: [Number(results.ate)],
            y: ["Average Treatment Effect"],
            marker: { size: 12 },
            error_x: {
              type: "data",
              symmetric: false,
              array: [
                Number(ateInterval[1]) - Number(results.ate),
              ],
              arrayminus: [
                Number(results.ate) - Number(ateInterval[0]),
              ],
            },
            name: "95% Confidence Interval",
          },
        ]
      : useDemoData
        ? [
            {
              type: "scatter",
              mode: "markers",
              x: [0.04],
              y: ["Illustrative ATE"],
              marker: { size: 12 },
              error_x: {
                type: "data",
                symmetric: false,
                array: [0.08],
                arrayminus: [0.08],
              },
              name: "Illustrative 95% CI",
            },
          ]
        : [];

  return (
    <section className="treatment-results">
      <div className="treatment-heading">
        <div>
          <h2>Treatment Effect Analysis</h2>
          <p>
            Double Machine Learning: average and heterogeneous treatment
            effects.
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

      <div className="day11-section">
        <div className="day11-heading">
          <div>
            <h3>Treatment Effect Distribution</h3>
            <p>
              Distribution of estimated individual treatment effects.
            </p>
          </div>
          <span className="chart-tag">
            {useDemoData ? "Illustrative preview" : "Model results"}
          </span>
        </div>

        {distributionData.length > 0 ? (
          <Plot
            data={[
              {
                x: distributionData,
                type: "histogram",
                nbinsx: 15,
                name: "Treatment effects",
                marker: { opacity: 0.8 },
                hovertemplate:
                  "Effect: %{x}<br>Observations: %{y}<extra></extra>",
              },
            ]}
            layout={{
              autosize: true,
              height: 330,
              margin: { l: 55, r: 25, t: 20, b: 55 },
              xaxis: {
                title: "Estimated treatment effect",
                zeroline: true,
              },
              yaxis: {
                title: "Frequency",
              },
              showlegend: false,
            }}
            config={{ responsive: true, displayModeBar: false }}
            useResizeHandler
            style={{ width: "100%" }}
          />
        ) : (
          <div className="chart-empty">
            Individual treatment-effect data is not available yet.
          </div>
        )}
      </div>

      <div className="day11-section">
        <div className="day11-heading">
          <div>
            <h3>Effect Uncertainty</h3>
            <p>
              Confidence intervals show the uncertainty around estimated
              effects.
            </p>
          </div>
          <span className="chart-tag">
            {individualIntervals.length
              ? "Individual intervals"
              : validAteInterval
                ? "ATE confidence interval"
                : useDemoData
                  ? "Illustrative preview"
                  : "Awaiting intervals"}
          </span>
        </div>

        {uncertaintyTrace.length > 0 ? (
          <Plot
            data={uncertaintyTrace}
            layout={{
              autosize: true,
              height: individualIntervals.length
                ? Math.max(300, individualIntervals.length * 35)
                : 250,
              margin: { l: 150, r: 30, t: 20, b: 55 },
              xaxis: {
                title: "Estimated treatment effect",
                zeroline: true,
              },
              yaxis: {
                automargin: true,
              },
              showlegend: false,
            }}
            config={{ responsive: true, displayModeBar: false }}
            useResizeHandler
            style={{ width: "100%" }}
          />
        ) : (
          <div className="chart-empty">
            Valid confidence interval data is not available yet.
          </div>
        )}
      </div>

      {useDemoData && (
        <div className="demo-warning">
          <strong>Illustrative data only:</strong> These charts use sample
          values to demonstrate the dashboard. They are not calculated from
          Hillstrom, Online Retail, or a trained DML model. Do not use them
          for causal conclusions.
        </div>
      )}

      <div className="note treatment-note">
        <strong>Data limitation:</strong> Online Retail records contain
        historical transactions, but do not establish discount assignment or
        non-purchasing customer outcomes. Actual causal estimates require
        validated treatment/control data and model results.
      </div>
    </section>
  );
}

export default TreatmentEffectResults;
