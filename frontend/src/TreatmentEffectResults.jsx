import Plot from "react-plotly.js";
import "./TreatmentEffectResults.css";

const formatPP = (value) => `${(Number(value) * 100).toFixed(4)} pp`;

function TreatmentEffectResults({ results = null }) {
  const ate = Number(results?.ate);
  const confidenceInterval = results?.confidenceInterval;

  const validAte =
    Number.isFinite(ate);

  const validAteInterval =
    Array.isArray(confidenceInterval) &&
    confidenceInterval.length >= 2 &&
    Number.isFinite(Number(confidenceInterval[0])) &&
    Number.isFinite(Number(confidenceInterval[1]));

  const cate = results?.cateSummary;

  const validCate =
    cate &&
    ["mean", "min", "max", "std"].every((key) =>
      Number.isFinite(Number(cate[key]))
    );

  // Individual CATE observations are optional.
  const actualEffects = Array.isArray(results?.effectDistribution)
    ? results.effectDistribution
        .map((item) =>
          typeof item === "number"
            ? item
            : Number(item?.effect ?? item?.cate)
        )
        .filter(Number.isFinite)
    : [];

  const individualIntervals = Array.isArray(results?.effectDistribution)
    ? results.effectDistribution.filter(
        (item) =>
          typeof item === "object" &&
          Number.isFinite(Number(item?.effect ?? item?.cate)) &&
          Number.isFinite(Number(item?.lower ?? item?.lowerBound)) &&
          Number.isFinite(Number(item?.upper ?? item?.upperBound))
      )
    : [];

  const metrics = [
    {
      label: "Average Treatment Effect",
      value: validAte ? formatPP(ate) : "Unavailable",
      description: "Estimated average change in conversion probability",
    },
    {
      label: "95% Confidence Interval",
      value: validAteInterval
        ? `${formatPP(confidenceInterval[0])} to ${formatPP(confidenceInterval[1])}`
        : "Unavailable",
      description: "Uncertainty around the average effect",
    },
    {
      label: "Analysis Sample Size",
      value: results?.sampleSize?.toLocaleString("en-IN") ?? "Unavailable",
      description: "Observations used in DML estimation",
    },
    {
      label: "Model",
      value: results?.modelStatus ?? "Unavailable",
      description: "Estimation method",
    },
  ];

  const cateMetrics = validCate
    ? [
        { label: "Mean CATE", value: formatPP(cate.mean) },
        { label: "Minimum CATE", value: formatPP(cate.min) },
        { label: "Maximum CATE", value: formatPP(cate.max) },
        { label: "CATE Standard Deviation", value: formatPP(cate.std) },
      ]
    : [];

  const ateUncertaintyTrace =
    validAte && validAteInterval
      ? [
          {
            type: "scatter",
            mode: "markers",
            x: [ate * 100],
            y: ["Average Treatment Effect"],
            marker: { size: 13 },
            error_x: {
              type: "data",
              symmetric: false,
              array: [(Number(confidenceInterval[1]) - ate) * 100],
              arrayminus: [(ate - Number(confidenceInterval[0])) * 100],
            },
            name: "ATE with 95% CI",
            hovertemplate:
              "ATE: %{x:.4f} pp<extra></extra>",
          },
        ]
      : [];

  const cateRangeTrace =
    validCate
      ? [
          {
            type: "scatter",
            mode: "markers",
            x: [Number(cate.mean) * 100],
            y: ["CATE summary range"],
            marker: { size: 13 },
            error_x: {
              type: "data",
              symmetric: false,
              array: [
                (Number(cate.max) - Number(cate.mean)) * 100,
              ],
              arrayminus: [
                (Number(cate.mean) - Number(cate.min)) * 100,
              ],
            },
            name: "Mean and min–max range",
            hovertemplate:
              "Mean CATE: %{x:.4f} pp<extra></extra>",
          },
        ]
      : [];

  const individualUncertaintyTrace = individualIntervals.length
    ? [
        {
          type: "scatter",
          mode: "markers",
          x: individualIntervals.map((item) =>
            Number(item.effect ?? item.cate) * 100
          ),
          y: individualIntervals.map(
            (_, index) => `Observation ${index + 1}`
          ),
          marker: { size: 7 },
          error_x: {
            type: "data",
            symmetric: false,
            array: individualIntervals.map(
              (item) =>
                (Number(item.upper ?? item.upperBound) -
                  Number(item.effect ?? item.cate)) *
                100
            ),
            arrayminus: individualIntervals.map(
              (item) =>
                (Number(item.effect ?? item.cate) -
                  Number(item.lower ?? item.lowerBound)) *
                100
            ),
          },
          name: "Individual confidence intervals",
        },
      ]
    : [];

  return (
    <section className="treatment-results">
      <div className="treatment-heading">
        <div>
          <h2>Treatment Effect Analysis</h2>
          <p>
            Actual Double Machine Learning results from the Hillstrom
            Mens E-Mail versus No E-Mail experiment.
          </p>
        </div>

        <span className="task-status review">
          Actual DML results
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
            <h3>CATE Summary</h3>
            <p>
              Summary statistics of the estimated conditional treatment
              effects.
            </p>
          </div>
          <span className="chart-tag">
            Actual summary statistics
          </span>
        </div>

        {validCate ? (
          <>
            <div className="stats-grid">
              {cateMetrics.map((metric) => (
                <div className="stat-card" key={metric.label}>
                  <p>{metric.label}</p>
                  <h2>{metric.value}</h2>
                </div>
              ))}
            </div>

            <Plot
              data={cateRangeTrace}
              layout={{
                autosize: true,
                height: 240,
                margin: { l: 130, r: 30, t: 20, b: 55 },
                xaxis: {
                  title: "Estimated CATE (percentage points)",
                  zeroline: true,
                },
                yaxis: { automargin: true },
                showlegend: false,
              }}
              config={{ responsive: true, displayModeBar: false }}
              useResizeHandler
              style={{ width: "100%" }}
            />

            <p className="dml-caption">
              The horizontal range represents the reported minimum and
              maximum CATE, with the mean marked. It is not a confidence
              interval or a substitute for the individual CATE distribution.
            </p>
          </>
        ) : (
          <div className="chart-empty">
            CATE summary statistics are not available.
          </div>
        )}
      </div>

      <div className="day11-section">
        <div className="day11-heading">
          <div>
            <h3>Treatment Effect Distribution</h3>
            <p>
              Distribution of individual estimated treatment effects.
            </p>
          </div>
          <span className="chart-tag">
            {actualEffects.length
              ? "Individual model estimates"
              : "Awaiting individual CATE data"}
          </span>
        </div>

        {actualEffects.length > 0 ? (
          <Plot
            data={[
              {
                x: actualEffects.map((value) => value * 100),
                type: "histogram",
                nbinsx: 30,
                name: "Individual CATE",
                hovertemplate:
                  "CATE: %{x:.4f} pp<br>Frequency: %{y}<extra></extra>",
              },
            ]}
            layout={{
              autosize: true,
              height: 330,
              margin: { l: 55, r: 25, t: 20, b: 55 },
              xaxis: {
                title: "Individual CATE (percentage points)",
                zeroline: true,
              },
              yaxis: { title: "Frequency" },
              showlegend: false,
            }}
            config={{ responsive: true, displayModeBar: false }}
            useResizeHandler
            style={{ width: "100%" }}
          />
        ) : (
          <div className="chart-empty">
            Individual CATE values are not exported yet. The actual
            distribution will appear after the Section A CSV is received.
          </div>
        )}
      </div>

      <div className="day11-section">
        <div className="day11-heading">
          <div>
            <h3>Effect Uncertainty</h3>
            <p>
              Confidence interval for the average treatment effect.
            </p>
          </div>
          <span className="chart-tag">
            {individualUncertaintyTrace.length
              ? "Individual intervals available"
              : validAteInterval
                ? "Actual ATE 95% CI"
                : "Awaiting confidence interval"}
          </span>
        </div>

        {individualUncertaintyTrace.length > 0 ? (
          <Plot
            data={individualUncertaintyTrace}
            layout={{
              autosize: true,
              height: Math.max(
                300,
                individualUncertaintyTrace[0].y.length * 25
              ),
              margin: { l: 140, r: 30, t: 20, b: 55 },
              xaxis: {
                title: "Estimated treatment effect (pp)",
                zeroline: true,
              },
              yaxis: { automargin: true },
              showlegend: false,
            }}
            config={{ responsive: true, displayModeBar: false }}
            useResizeHandler
            style={{ width: "100%" }}
          />
        ) : ateUncertaintyTrace.length > 0 ? (
          <Plot
            data={ateUncertaintyTrace}
            layout={{
              autosize: true,
              height: 250,
              margin: { l: 150, r: 30, t: 20, b: 55 },
              xaxis: {
                title: "Average treatment effect (pp)",
                zeroline: true,
              },
              yaxis: { automargin: true },
              showlegend: false,
            }}
            config={{ responsive: true, displayModeBar: false }}
            useResizeHandler
            style={{ width: "100%" }}
          />
        ) : (
          <div className="chart-empty">
            Valid confidence interval data is not available.
          </div>
        )}
      </div>

      <div className="demo-warning">
        <strong>Interpretation limitation:</strong> This experiment estimates
        the effect of Mens E-Mail versus No E-Mail, not the effect of a
        product discount. The available CATE values are summary statistics;
        individual distribution and individual confidence intervals require
        additional Section A outputs.
      </div>
    </section>
  );
}

export default TreatmentEffectResults;
