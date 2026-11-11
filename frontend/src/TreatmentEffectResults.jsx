import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import "./TreatmentEffectResults.css";

const formatPP = (value) =>
  `${(Number(value) * 100).toFixed(4)} pp`;

const REQUIRED_COLUMNS = [
  "observation_id",
  "treatment",
  "outcome",
  "cate",
  "cate_ci_lower",
  "cate_ci_upper",
  "cate_stderr",
];

function parseIndividualCateCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/);

  if (lines.length < 2) {
    throw new Error("The individual CATE CSV is empty.");
  }

  const headers = lines[0]
    .replace(/^\uFEFF/, "")
    .split(",")
    .map((header) => header.trim());

  const indexes = Object.fromEntries(
    REQUIRED_COLUMNS.map((column) => [
      column,
      headers.indexOf(column),
    ])
  );

  if (Object.values(indexes).some((index) => index === -1)) {
    throw new Error("CSV is missing required columns.");
  }

  const rows = lines.slice(1).map((line, index) => {
    const values = line.split(",");

    const row = Object.fromEntries(
      REQUIRED_COLUMNS.map((column) => [
        column,
        values[indexes[column]]?.trim() ?? "",
      ])
    );

    const parsed = Object.fromEntries(
      REQUIRED_COLUMNS.map((column) => [
        column,
        Number(row[column]),
      ])
    );

    const valid =
      REQUIRED_COLUMNS.every(
        (column) =>
          row[column] !== "" &&
          Number.isFinite(parsed[column])
      ) &&
      [0, 1].includes(parsed.treatment) &&
      [0, 1].includes(parsed.outcome) &&
      parsed.cate_ci_lower <= parsed.cate &&
      parsed.cate <= parsed.cate_ci_upper &&
      parsed.cate_stderr >= 0;

    if (!valid) {
      throw new Error(
        `Invalid data found at CSV row ${index + 2}.`
      );
    }

    return parsed;
  });

  return rows;
}

function TreatmentEffectResults({ results = null }) {
  const [cateRows, setCateRows] = useState([]);
  const [csvLoading, setCsvLoading] = useState(true);
  const [csvError, setCsvError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadIndividualCate() {
      try {
        const response = await fetch(
          "/section_a_individual_cate.csv"
        );

        if (!response.ok) {
          throw new Error(
            `CSV loading failed: ${response.status}`
          );
        }

        const csvText = await response.text();
        const rows = parseIndividualCateCSV(csvText);

        if (!cancelled) {
          setCateRows(rows);
          setCsvLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          setCsvError(
            error instanceof Error
              ? error.message
              : "Unable to load individual CATE data."
          );
          setCsvLoading(false);
        }
      }
    }

    loadIndividualCate();

    return () => {
      cancelled = true;
    };
  }, []);

  // --------------------------------------------------
  // Existing ATE and DML summary calculations
  // --------------------------------------------------

  const ate = Number(results?.ate);
  const confidenceInterval = results?.confidenceInterval;

  const validAte = Number.isFinite(ate);

  const validAteInterval =
    Array.isArray(confidenceInterval) &&
    confidenceInterval.length >= 2 &&
    Number.isFinite(Number(confidenceInterval[0])) &&
    Number.isFinite(Number(confidenceInterval[1])) &&
    Number(confidenceInterval[0]) <= Number(confidenceInterval[1]);

  const cate = results?.cateSummary;

  const validCate =
    cate &&
    ["mean", "min", "max", "std"].every((key) =>
      Number.isFinite(Number(cate[key]))
    );

  // --------------------------------------------------
  // Individual CATE observations from Section A CSV
  // --------------------------------------------------

  const actualEffects = cateRows.map((item) => item.cate);
  const individualIntervals = cateRows;

  // Use all rows for histograms, but keep the interval
  // chart limited to 250 representative observations.

  const intervalSample =
    individualIntervals.length > 250
      ? Array.from({ length: 250 }, (_, index) => {
          const selectedIndex = Math.floor(
            (index * (individualIntervals.length - 1)) / 249
          );

          return individualIntervals[selectedIndex];
        })
      : individualIntervals;

  const standardErrors = cateRows.map(
    (item) => item.cate_stderr * 100
  );

  const confidenceIntervalWidths = cateRows.map(
    (item) =>
      (item.cate_ci_upper - item.cate_ci_lower) * 100
  );
    // --------------------------------------------------
  // Day 13: Exploratory Uplift and Qini calculations
  // --------------------------------------------------

  const rankedRows = [...cateRows].sort(
    (a, b) => b.cate - a.cate
  );

  const totalTreated = rankedRows.filter(
    (row) => row.treatment === 1
  ).length;

  const totalControl = rankedRows.length - totalTreated;

  const totalTreatedConversions = rankedRows.reduce(
    (sum, row) =>
      sum + (row.treatment === 1 ? row.outcome : 0),
    0
  );

  const totalControlConversions = rankedRows.reduce(
    (sum, row) =>
      sum + (row.treatment === 0 ? row.outcome : 0),
    0
  );

  const validUpliftData =
    rankedRows.length > 0 &&
    totalTreated > 0 &&
    totalControl > 0;

  const overallTreatedRate = validUpliftData
    ? totalTreatedConversions / totalTreated
    : 0;

  const overallControlRate = validUpliftData
    ? totalControlConversions / totalControl
    : 0;

  const overallRateDifference =
    overallTreatedRate - overallControlRate;

  const upliftPoints = [];
  const qiniPoints = [];

  if (validUpliftData) {
    let treatedCount = 0;
    let controlCount = 0;
    let treatedConversions = 0;
    let controlConversions = 0;

    const numberOfGroups = 100;

    for (let i = 0; i < rankedRows.length; i++) {
      const row = rankedRows[i];

      if (row.treatment === 1) {
        treatedCount += 1;
        treatedConversions += row.outcome;
      } else {
        controlCount += 1;
        controlConversions += row.outcome;
      }

      const isGroupEnd =
        (i + 1) % Math.ceil(rankedRows.length / numberOfGroups) === 0 ||
        i === rankedRows.length - 1;

      if (!isGroupEnd) continue;

      if (treatedCount === 0 || controlCount === 0) continue;

      const populationFraction =
        (i + 1) / rankedRows.length;

      const treatedRate =
        treatedConversions / treatedCount;

      const controlRate =
        controlConversions / controlCount;

      const uplift = treatedRate - controlRate;

      const incrementalConversions =
        treatedConversions -
        controlConversions * (treatedCount / controlCount);

      upliftPoints.push({
        x: populationFraction * 100,
        y: uplift * 100,
      });

      qiniPoints.push({
        x: populationFraction * 100,
        y: incrementalConversions,
      });
    }
  }

  const qiniRandomEndpoint =
    totalTreatedConversions -
    totalControlConversions * (totalTreated / totalControl);

  const upliftChartTrace = [
    {
      x: [0, ...upliftPoints.map((point) => point.x)],
      y: [overallRateDifference * 100, ...upliftPoints.map((point) => point.y)],
      type: "scatter",
      mode: "lines",
      name: "Ranked CATE uplift",
      line: { width: 3 },
      hovertemplate:
        "Top %{x:.1f}% customers<br>Uplift: %{y:.4f} pp<extra></extra>",
    },
    {
      x: [0, 100],
      y: [
        overallRateDifference * 100,
        overallRateDifference * 100,
      ],
      type: "scatter",
      mode: "lines",
      name: "Overall average uplift",
      line: { dash: "dash" },
      hoverinfo: "skip",
    },
  ];

  const qiniChartTrace = [
    {
      x: [0, ...qiniPoints.map((point) => point.x)],
      y: [0, ...qiniPoints.map((point) => point.y)],
      type: "scatter",
      mode: "lines",
      name: "Ranked CATE Qini",
      line: { width: 3 },
      hovertemplate:
        "Top %{x:.1f}% customers<br>Incremental conversions: %{y:.2f}<extra></extra>",
    },
    {
      x: [0, 100],
      y: [0, qiniRandomEndpoint],
      type: "scatter",
      mode: "lines",
      name: "Random targeting baseline",
      line: { dash: "dash" },
      hovertemplate:
        "Random baseline<br>Incremental conversions: %{y:.2f}<extra></extra>",
    },
  ];

  // --------------------------------------------------
  // Existing main metrics
  // --------------------------------------------------

  const metrics = [
    {
      label: "Average Treatment Effect",
      value: validAte ? formatPP(ate) : "Unavailable",
      description:
        "Estimated average change in conversion probability",
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
      value:
        results?.sampleSize?.toLocaleString("en-IN") ??
        "Unavailable",
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
        {
          label: "CATE Standard Deviation",
          value: formatPP(cate.std),
        },
      ]
    : [];

  // --------------------------------------------------
  // ATE confidence interval trace
  // --------------------------------------------------

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
              array: [
                (Number(confidenceInterval[1]) - ate) * 100,
              ],
              arrayminus: [
                (ate - Number(confidenceInterval[0])) * 100,
              ],
            },
            name: "ATE with 95% CI",
            hovertemplate:
              "ATE: %{x:.4f} pp<extra></extra>",
          },
        ]
      : [];

  // --------------------------------------------------
  // CATE summary min-max range trace
  // --------------------------------------------------

  const cateRangeTrace = validCate
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
          name: "Mean and min-max range",
          hovertemplate:
            "Mean CATE: %{x:.4f} pp<extra></extra>",
        },
      ]
    : [];

  // --------------------------------------------------
  // Individual confidence interval trace
  // Correct CSV fields are used here:
  // cate_ci_lower and cate_ci_upper
  // --------------------------------------------------

  const individualUncertaintyTrace = intervalSample.length
    ? [
        {
          type: "scatter",
          mode: "markers",
          x: intervalSample.map((item) => item.cate * 100),
          y: intervalSample.map(
            (item) => `Observation ${item.observation_id}`
          ),
          marker: { size: 6 },
          error_x: {
            type: "data",
            symmetric: false,
            array: intervalSample.map(
              (item) =>
                (item.cate_ci_upper - item.cate) * 100
            ),
            arrayminus: intervalSample.map(
              (item) =>
                (item.cate - item.cate_ci_lower) * 100
            ),
          },
          name: "Individual confidence intervals",
          hovertemplate:
            "CATE: %{x:.4f} pp<br>%{y}<extra></extra>",
        },
      ]
    : [];

  // --------------------------------------------------
  // Common Plotly configuration
  // --------------------------------------------------

  const plotConfig = {
    responsive: true,
    displayModeBar: false,
  };

  // --------------------------------------------------
  // Dashboard UI
  // --------------------------------------------------

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

      {/* Existing ATE and DML metrics */}

      <div className="stats-grid">
        {metrics.map((metric) => (
          <div className="stat-card" key={metric.label}>
            <p>{metric.label}</p>
            <h2>{metric.value}</h2>
            <span>{metric.description}</span>
          </div>
        ))}
      </div>

      {/* Existing CATE Summary */}

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
              config={plotConfig}
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

      {/* Individual Treatment Effect Distribution */}

      <div className="day11-section">
        <div className="day11-heading">
          <div>
            <h3>Treatment Effect Distribution</h3>
            <p>
              Distribution of all individual estimated treatment effects.
            </p>
          </div>

          <span className="chart-tag">
            {csvLoading
              ? "Loading individual CATE data"
              : csvError
                ? "CSV loading error"
                : `${actualEffects.length.toLocaleString("en-IN")} individual estimates`}
          </span>
        </div>

        {csvLoading ? (
          <div className="chart-empty">
            Loading individual CATE data...
          </div>
        ) : csvError ? (
          <div className="chart-empty">{csvError}</div>
        ) : actualEffects.length > 0 ? (
          <>
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
              config={plotConfig}
              useResizeHandler
              style={{ width: "100%" }}
            />

            <p className="dml-caption">
              This histogram uses all{" "}
              {actualEffects.length.toLocaleString("en-IN")}{" "}
              individual CATE estimates exported by Section A.
            </p>
          </>
        ) : (
          <div className="chart-empty">
            No valid individual CATE observations were found.
          </div>
        )}
      </div>
      
      {/* Day 13: Exploratory Uplift Curve */}
      <section className="day11-section">
        <div className="day11-heading">
          <h3>Uplift Curve</h3>
          <span className="chart-tag">Day 13 · Exploratory</span>
        </div>

        <p className="dml-caption">
          Shows cumulative conversion-rate differences between Mens E-Mail
          and No E-Mail customers ranked by estimated CATE.
          This is an exploratory in-sample analysis, not independent
          out-of-sample uplift validation.
        </p>

        {validUpliftData && upliftPoints.length > 0 ? (
          <Plot
            data={upliftChartTrace}
            layout={{
              title: "Cumulative Uplift by CATE Ranking",
              xaxis: {
                title: "Top-ranked customers included (%)",
                range: [0, 100],
              },
              yaxis: {
                title: "Conversion-rate difference (pp)",
              },
              autosize: true,
              margin: { l: 65, r: 25, t: 55, b: 65 },
              legend: { orientation: "h", y: -0.25 },
            }}
            config={plotConfig}
            useResizeHandler
            style={{ width: "100%", height: "420px" }}
          />
        ) : (
          <p className="chart-empty">Uplift data is not available.</p>
        )}
      </section>

      {/* Day 13: Exploratory Qini Curve */}
      <section className="day11-section">
        <div className="day11-heading">
          <h3>Qini Curve</h3>
          <span className="chart-tag">Day 13 · Exploratory</span>
        </div>

        <p className="dml-caption">
          Shows cumulative estimated incremental conversions for
          CATE-ranked targeting against a random-targeting baseline.
          This is an exploratory in-sample Qini curve; no validated
          Qini coefficient or independent holdout evaluation is reported.
        </p>

        {validUpliftData && qiniPoints.length > 0 ? (
          <Plot
            data={qiniChartTrace}
            layout={{
              title: "Cumulative Incremental Conversions",
              xaxis: {
                title: "Top-ranked customers included (%)",
                range: [0, 100],
              },
              yaxis: {
                title: "Estimated incremental conversions",
              },
              autosize: true,
              margin: { l: 65, r: 25, t: 55, b: 65 },
              legend: { orientation: "h", y: -0.25 },
            }}
            config={plotConfig}
            useResizeHandler
            style={{ width: "100%", height: "420px" }}
          />
        ) : (
          <p className="chart-empty">Qini data is not available.</p>
        )}
      </section>



      {/* Individual Effect Uncertainty */}

      <div className="day11-section">
        <div className="day11-heading">
          <div>
            <h3>Individual Effect Uncertainty</h3>
            <p>
              Individual CATE estimates with their reported 95% confidence
              intervals.
            </p>
          </div>

          <span className="chart-tag">
            {csvLoading
              ? "Loading individual intervals"
              : individualIntervals.length
                ? "Individual 95% CI"
                : "Individual intervals unavailable"}
          </span>
        </div>

        {csvLoading ? (
          <div className="chart-empty">
            Loading individual confidence intervals...
          </div>
        ) : individualUncertaintyTrace.length > 0 ? (
          <>
            <Plot
              data={individualUncertaintyTrace}
              layout={{
                autosize: true,
                height: 550,
                margin: { l: 150, r: 30, t: 20, b: 55 },
                xaxis: {
                  title: "Estimated treatment effect (pp)",
                  zeroline: true,
                },
                yaxis: { automargin: true },
                showlegend: false,
              }}
              config={plotConfig}
              useResizeHandler
              style={{ width: "100%" }}
            />

            <p className="dml-caption">
              Showing {intervalSample.length} representative observations
              from the{" "}
              {individualIntervals.length.toLocaleString("en-IN")}{" "}
              available individual estimates. Error bars represent the
              individual reported confidence intervals.
            </p>
          </>
        ) : csvError ? (
          <div className="chart-empty">{csvError}</div>
        ) : (
          <div className="chart-empty">
            Individual confidence intervals are not available.
          </div>
        )}
      </div>

      {/* Existing ATE Uncertainty - kept visible separately */}

      <div className="day11-section">
        <div className="day11-heading">
          <div>
            <h3>Average Treatment Effect Uncertainty</h3>
            <p>
              Confidence interval for the average treatment effect.
            </p>
          </div>

          <span className="chart-tag">
            Actual ATE 95% CI
          </span>
        </div>

        {ateUncertaintyTrace.length > 0 ? (
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
            config={plotConfig}
            useResizeHandler
            style={{ width: "100%" }}
          />
        ) : (
          <div className="chart-empty">
            Valid ATE confidence interval data is not available.
          </div>
        )}
      </div>

      {/* Individual Standard Error Distribution */}

      <div className="day11-section">
        <div className="day11-heading">
          <div>
            <h3>Standard Error Distribution</h3>
            <p>
              Distribution of individual CATE standard errors.
            </p>
          </div>

          <span className="chart-tag">
            {cateRows.length
              ? "Actual individual standard errors"
              : "Awaiting data"}
          </span>
        </div>

        {cateRows.length > 0 ? (
          <Plot
            data={[
              {
                x: standardErrors,
                type: "histogram",
                nbinsx: 30,
                name: "CATE Standard Error",
                hovertemplate:
                  "Standard error: %{x:.4f} pp<br>Frequency: %{y}<extra></extra>",
              },
            ]}
            layout={{
              autosize: true,
              height: 330,
              margin: { l: 55, r: 25, t: 20, b: 55 },
              xaxis: {
                title: "Standard error (percentage points)",
              },
              yaxis: { title: "Frequency" },
              showlegend: false,
            }}
            config={plotConfig}
            useResizeHandler
            style={{ width: "100%" }}
          />
        ) : (
          <div className="chart-empty">
            Standard error data is not available.
          </div>
        )}
      </div>

      {/* Individual Confidence Interval Width Distribution */}

      <div className="day11-section">
        <div className="day11-heading">
          <div>
            <h3>Confidence Interval Width Distribution</h3>
            <p>
              Distribution of the widths of individual reported confidence
              intervals.
            </p>
          </div>

          <span className="chart-tag">
            {cateRows.length
              ? "Actual individual CI widths"
              : "Awaiting data"}
          </span>
        </div>

        {cateRows.length > 0 ? (
          <Plot
            data={[
              {
                x: confidenceIntervalWidths,
                type: "histogram",
                nbinsx: 30,
                name: "Confidence Interval Width",
                hovertemplate:
                  "CI width: %{x:.4f} pp<br>Frequency: %{y}<extra></extra>",
              },
            ]}
            layout={{
              autosize: true,
              height: 330,
              margin: { l: 55, r: 25, t: 20, b: 55 },
              xaxis: {
                title: "Confidence interval width (pp)",
              },
              yaxis: { title: "Frequency" },
              showlegend: false,
            }}
            config={plotConfig}
            useResizeHandler
            style={{ width: "100%" }}
          />
        ) : (
          <div className="chart-empty">
            Confidence interval width data is not available.
          </div>
        )}
      </div>

      {/* Existing Interpretation Limitation */}

      <div className="demo-warning">
        <strong>Interpretation limitation:</strong> This experiment estimates
        the effect of Mens E-Mail versus No E-Mail, not the effect of a
        product discount. Individual CATE estimates, standard errors and
        their reported confidence intervals are loaded from the Section A
        CSV export.
      </div>
    </section>
  );
}

export default TreatmentEffectResults;
   