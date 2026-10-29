
import UploadPanel from "./UploadPanel";
import EDACharts from "./EDACharts";
import BaselineMetrics, {
  HILLSTROM_BASELINE_SUMMARY,
} from "./BaselineMetrics";
import { useEffect, useState } from "react";
import "./App.css";

const REPO_URL =
  "https://github.com/snigdhasudheer/Infotact_project1";

const API_BASE =
  "https://api.github.com/repos/snigdhasudheer/Infotact_project1";

const COMMITS_API = `${API_BASE}/commits?sha=main&per_page=100`;
const OPEN_PRS_API = `${API_BASE}/pulls?state=open&per_page=100`;
const CLOSED_PRS_API = `${API_BASE}/pulls?state=closed&per_page=100`;

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "dataset-eda", label: "Dataset & EDA" },
  { id: "causal-analysis", label: "Causal Analysis" },
  { id: "recommendations", label: "Recommendations" },
  { id: "budget-optimization", label: "Budget Optimization" },
  { id: "team-activity", label: "Team Activity" },
];

function App() {
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openPRs, setOpenPRs] = useState([]);
  const [mergedPRs, setMergedPRs] = useState([]);
  const [prLoading, setPrLoading] = useState(true);
  const [prError, setPrError] = useState("");

  const [activeSection, setActiveSection] = useState("dashboard");

  function navigateToSection(sectionId) {
    const section = document.getElementById(sectionId);

    if (!section) {
      console.error(`Navigation target not found: ${sectionId}`);
      return;
    }

    setActiveSection(sectionId);

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function fetchCommits() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(COMMITS_API);

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Unexpected GitHub response.");
      }

      setCommits(data);
    } catch (err) {
      setError(err.message || "Unable to load GitHub commits.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchPullRequests() {
    setPrLoading(true);
    setPrError("");

    try {
      const [openResponse, closedResponse] = await Promise.all([
        fetch(OPEN_PRS_API),
        fetch(CLOSED_PRS_API),
      ]);

      if (!openResponse.ok || !closedResponse.ok) {
        throw new Error(
          `GitHub PR API error: ${
            !openResponse.ok
              ? openResponse.status
              : closedResponse.status
          }`
        );
      }

      const [openData, closedData] = await Promise.all([
        openResponse.json(),
        closedResponse.json(),
      ]);

      if (!Array.isArray(openData) || !Array.isArray(closedData)) {
        throw new Error("Unexpected GitHub PR response.");
      }

      setOpenPRs(openData);
      setMergedPRs(closedData.filter((pr) => pr.merged_at));
    } catch (err) {
      setPrError(err.message || "Unable to load pull requests.");
    } finally {
      setPrLoading(false);
    }
  }

  useEffect(() => {
    fetchCommits();
    fetchPullRequests();
  }, []);

  function formatDate(date) {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>EconoCausal</h2>

        <nav
          className="sidebar-nav"
          aria-label="Dashboard navigation"
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-link ${
                activeSection === item.id ? "active" : ""
              }`}
              onClick={() => navigateToSection(item.id)}
              aria-current={
                activeSection === item.id ? "page" : undefined
              }
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" />
          GitHub integration
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>EconoCausal Dashboard</h1>
            <p>Dynamic Pricing via Double Machine Learning</p>
          </div>

          <a
            className="github-link"
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
          >
            Open GitHub ↗
          </a>
        </header>

        {/* Dashboard overview */}
        <section className="stats-grid" id="dashboard">
          <div className="stat-card">
            <p>Dataset Overview</p>
            <h2>In Progress</h2>
            <span>Review branch and merge status</span>
          </div>

          <div className="stat-card">
            <p>Causal Analysis</p>
            <h2>Pending</h2>
            <span>DML model not yet trained</span>
          </div>

          <div className="stat-card">
            <p>Budget Optimizer</p>
            <h2>Pending</h2>
            <span>Awaiting causal estimates</span>
          </div>

          <div className="stat-card">
            <p>GitHub Commits</p>
            <h2>{commits.length}</h2>
            <span>Latest commits fetched from main</span>
          </div>
        </section>

        {/* Project roadmap and GitHub activity */}
        <section className="content-grid" id="team-activity">
          <div className="panel">
            <h2>Project Roadmap</h2>

            <ul className="roadmap">
              <li>
                <span className="task-status done">Done</span>
                Repository setup
              </li>
              <li>
                <span className="task-status review">Review</span>
                Dataset selection and overview
              </li>
              <li>
                <span className="task-status pending">Next</span>
                Data validation
              </li>
              <li>
                <span className="task-status pending">Pending</span>
                DML model implementation
              </li>
              <li>
                <span className="task-status pending">Pending</span>
                Budget optimization
              </li>
            </ul>

            <p className="note">
              Roadmap statuses are manually maintained. Update them
              after verifying the actual project work.
            </p>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <div>
                <h2>GitHub Activity</h2>
                <p>Latest commits from the main branch</p>
              </div>

              <button
                type="button"
                className="refresh-button"
                onClick={fetchCommits}
                disabled={loading}
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {loading && <p>Loading commits from GitHub...</p>}

            {error && (
              <div className="error-message">
                <p>{error}</p>
                <button type="button" onClick={fetchCommits}>
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && commits.length === 0 && (
              <p>No commits found on main.</p>
            )}

            {!loading && !error && commits.length > 0 && (
              <div className="commit-list">
                {commits.map((item) => (
                  <div className="commit-item" key={item.sha}>
                    <div className="commit-marker" />

                    <div className="commit-details">
                      <a
                        className="commit-message"
                        href={item.html_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.commit.message.split("\n")[0]}
                      </a>

                      <p>
                        {item.commit.author?.name || "Unknown author"}
                      </p>

                      <p>{formatDate(item.commit.author?.date)}</p>

                      <code>{item.sha.slice(0, 7)}</code>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <a
              className="text-link"
              href={`${REPO_URL}/commits/main`}
              target="_blank"
              rel="noreferrer"
            >
              View all main commits ↗
            </a>
          </div>
        </section>

        {/* GitHub Pull Requests */}
        <section
          className="panel"
          style={{ marginBottom: "22px" }}
        >
          <div className="panel-heading">
            <div>
              <h2>GitHub Pull Requests</h2>
              <p>Review open and merged pull requests</p>
            </div>

            <button
              type="button"
              className="refresh-button"
              onClick={fetchPullRequests}
              disabled={prLoading}
            >
              {prLoading ? "Loading..." : "Refresh PRs"}
            </button>
          </div>

          {prError && (
            <div className="error-message">
              <p>{prError}</p>
              <button type="button" onClick={fetchPullRequests}>
                Try again
              </button>
            </div>
          )}

          {prLoading && <p>Loading pull requests from GitHub...</p>}

          {!prLoading && !prError && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "24px",
                marginTop: "20px",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <h3>Open Pull Requests ({openPRs.length})</h3>

                {openPRs.length === 0 ? (
                  <p>No open pull requests found.</p>
                ) : (
                  <div className="commit-list">
                    {openPRs.map((pr) => (
                      <div className="commit-item" key={pr.id}>
                        <div className="commit-marker" />

                        <div className="commit-details">
                          <a
                            className="commit-message"
                            href={pr.html_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            #{pr.number} {pr.title}
                          </a>

                          <p>
                            By {pr.user?.login || "Unknown author"}
                          </p>

                          <p>Updated {formatDate(pr.updated_at)}</p>

                          <span className="task-status review">
                            Open
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <a
                  className="text-link"
                  href={`${REPO_URL}/pulls`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View all open PRs ↗
                </a>
              </div>

              <div style={{ minWidth: 0 }}>
                <h3>Merged Pull Requests ({mergedPRs.length})</h3>

                {mergedPRs.length === 0 ? (
                  <p>No merged PRs in the latest results.</p>
                ) : (
                  <div className="commit-list">
                    {mergedPRs.map((pr) => (
                      <div className="commit-item" key={pr.id}>
                        <div className="commit-marker" />

                        <div className="commit-details">
                          <a
                            className="commit-message"
                            href={pr.html_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            #{pr.number} {pr.title}
                          </a>

                          <p>
                            Merged by {pr.merged_by?.login || "Unknown"}
                          </p>

                          <p>Merged {formatDate(pr.merged_at)}</p>

                          <span className="task-status done">
                            Merged
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <a
                  className="text-link"
                  href={`${REPO_URL}/pulls?q=is%3Apr+is%3Amerged`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View all merged PRs ↗
                </a>
              </div>
            </div>
          )}
        </section>

        {/* Dataset and Exploratory Data Analysis */}
        <section className="panel" id="dataset-eda">
          <UploadPanel />
          <BaselineMetrics summary={HILLSTROM_BASELINE_SUMMARY} />
          <EDACharts summary={HILLSTROM_BASELINE_SUMMARY} />
        </section>


        {/* Treatment Effect Analysis */}
        <section className="panel" id="causal-analysis">
          <div className="panel-heading">
            <div>
              <h2>Treatment Effect Analysis</h2>
              <p>
                Causal analysis using Double Machine Learning (DML).
              </p>
            </div>

            <span className="task-status pending">
              Not yet estimated
            </span>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <p>Average Treatment Effect (ATE)</p>
              <h2>Pending</h2>
              <span>Requires a validated causal model</span>
            </div>

            <div className="stat-card">
              <p>95% Confidence Interval</p>
              <h2>Pending</h2>
              <span>Will be reported after model estimation</span>
            </div>

            <div className="stat-card">
              <p>Analysis Sample Size</p>
              <h2>Pending</h2>
              <span>Eligible observations used by the model</span>
            </div>

            <div className="stat-card">
              <p>Model Status</p>
              <h2>Not trained</h2>
              <span>No validated treatment-effect estimate available</span>
            </div>
          </div>

          <div className="chart-placeholder">
            Treatment effect visualization will appear after
            a valid causal model has been trained and evaluated.
          </div>

          <div className="note">
            <strong>Data limitation:</strong> Online Retail records
            contain historical transactions, but do not by themselves
            establish which customers received a discount or what
            non-purchasing customers would have done. Therefore, this
            dashboard does not report a causal discount effect yet.
            Estimates must be added from validated treatment/control
            data and model results.
          </div>
        </section>

        <section className="panel" id="causal-analysis">
          <h2>Treatment Effect Analysis</h2>

          <p>
            Planned: estimate the effect of a pricing or marketing
            intervention using an appropriate causal method.
          </p>

          <div className="chart-placeholder">
            Treatment effect visualization will appear here
          </div>
        </section>

        {/* Planned recommendations */}
        <section className="panel" id="recommendations">
          <h2>Recommendations</h2>

          <p>
            Recommendations will be developed after validating the
            dataset and causal analysis results.
          </p>

          <div className="chart-placeholder">
            Recommendations will appear here after analysis
          </div>
        </section>

        {/* Planned budget optimization */}
        <section className="panel" id="budget-optimization">
          <h2>Budget Allocation</h2>

          <p>
            Planned: compare budget allocation strategies after
            validating the causal estimates.
          </p>

          <div className="chart-placeholder">
            Budget allocation visualization will appear here
          </div>
        </section>

        <footer className="dashboard-footer">
          EconoCausal · GitHub-powered activity · Branch: main
        </footer>
      </main>
    </div>
  );
}

export default App;
