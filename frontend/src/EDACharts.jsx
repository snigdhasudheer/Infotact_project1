
import Plot from "react-plotly.js";
import "./EDACharts.css";

function EDACharts({ summary = [] }) {
  if (!Array.isArray(summary) || summary.length === 0) {
    return (
      <section className="eda-section">
        <h2>Exploratory Data Analysis</h2>
        <p className="eda-description">
          Descriptive comparisons for the verified marketing experiment.
        </p>

        <div className="eda-empty">
          EDA charts are waiting for the verified summary
          from the data-analysis workflow.
        </div>
      </section>
    );
  }

  const groups = summary.map((item) => item.group);

  const chartLayout = {
    autosize: true,
    margin: { t: 25, r: 15, b: 65, l: 55 },
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { color: "inherit" },
  };

  return (
    <section className="eda-section">
      <h2>Exploratory Data Analysis</h2>
      <p className="eda-description">
        Descriptive statistics by marketing treatment group.
        These are observed summaries, not causal-effect estimates.
      </p>

      <div className="eda-grid">
        <article className="eda-card">
          <h3>Customer Count by Group</h3>
          <Plot
            data={[
              {
                type: "bar",
                x: groups,
                y: summary.map((item) => item.customers),
                hovertemplate: "%{x}<br>Customers: %{y}<extra></extra>",
              },
            ]}
            layout={{
              ...chartLayout,
              xaxis: { title: "Treatment group" },
              yaxis: { title: "Customers", rangemode: "tozero" },
            }}
            config={{ responsive: true, displayModeBar: false }}
            useResizeHandler
            style={{ width: "100%", height: "300px" }}
          />
        </article>

        <article className="eda-card">
          <h3>Visit and Conversion Rates</h3>
          <Plot
            data={[
              {
                type: "bar",
                name: "Visit rate",
                x: groups,
                y: summary.map((item) => item.visitRate),
                hovertemplate: "%{x}<br>Visit rate: %{y:.2f}%<extra></extra>",
              },
              {
                type: "bar",
                name: "Conversion rate",
                x: groups,
                y: summary.map((item) => item.conversionRate),
                hovertemplate:
                  "%{x}<br>Conversion rate: %{y:.2f}%<extra></extra>",
              },
            ]}
            layout={{
              ...chartLayout,
              barmode: "group",
              xaxis: { title: "Treatment group" },
              yaxis: {
                title: "Rate (%)",
                rangemode: "tozero",
              },
              legend: { orientation: "h", y: -0.25 },
            }}
            config={{ responsive: true, displayModeBar: false }}
            useResizeHandler
            style={{ width: "100%", height: "300px" }}
          />
        </article>

        <article className="eda-card">
          <h3>Average Customer Spend</h3>
          <Plot
            data={[
              {
                type: "bar",
                x: groups,
                y: summary.map((item) => item.meanSpend),
                hovertemplate:
                  "%{x}<br>Average spend: %{y:.2f}<extra></extra>",
              },
            ]}
            layout={{
              ...chartLayout,
              xaxis: { title: "Treatment group" },
              yaxis: { title: "Average spend", rangemode: "tozero" },
            }}
            config={{ responsive: true, displayModeBar: false }}
            useResizeHandler
            style={{ width: "100%", height: "300px" }}
          />
        </article>
      </div>
    </section>
  );
}

export default EDACharts;
