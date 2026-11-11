
import BudgetOptimization from "./BudgetOptimization";
import Recommendations from "./Recommendations";
import CausalAssumptionsAudit from "./CausalAssumptionsAudit";
import { DML_RESULTS } from "./SectionADmlResults";
import SectionADmlResults from "./SectionADmlResults";
import TreatmentEffectResults from "./TreatmentEffectResults";
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
  { id: "treatment-effects", label: "Treatment Effects" },
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
    setActiveSection(sectionId);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
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
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">EC</div>
          <div>
            <h2>EconoCausal</h2>
            <span>Analytics Platform</span>
          </div>
        </div>

        <p className="sidebar-label">MAIN MENU</p>

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
              <span className="nav-indicator" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" />
          GitHub integration
          <small>Connected project repository</small>
        </div>
      </aside>

      {/* Main content */}
      <main
        className="main-content"
        data-active-section={activeSection}
      >
        {/* Top header */}
        <header className="topbar">
          <div className="topbar-title">
            <span className="eyebrow">ECONOCAUSAL PROJECT</span>
            <h1>
              {activeSection === "dashboard"
                ? "Project Overview"
                : NAV_ITEMS.find(
                    (item) => item.id === activeSection
                  )?.label || "Project Overview"}
            </h1>
            <p>Dynamic Pricing via Double Machine Learning</p>
          </div>

          <div className="topbar-actions">
            {activeSection !== "dashboard" && (
              <button
                type="button"
                className="back-dashboard-button"
                onClick={() => navigateToSection("dashboard")}
              >
                &larr; Back to Dashboard
              </button>
            )}

            <a
              className="github-link"
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
            >
              Open GitHub &nearr;
            </a>
          </div>
        </header>

        {/* Dashboard overview */}
        <section className="stats-grid" id="dashboard">
          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-icon blue">D</span>
              <span className="stat-tag">DATA</span>
            </div>
            <p>Dataset Overview</p>
            <h2>Integrated</h2>
            <span>Hillstrom and Online Retail</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-icon purple">C</span>
              <span className="stat-tag">DML</span>
            </div>
            <p>Causal Analysis</p>
            <h2>Integrated</h2>
            <span>Actual Hillstrom email-treatment results</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-icon orange">₹</span>
              <span className="stat-tag">BUDGET</span>
            </div>
            <p>Budget Optimizer</p>
            <h2>Available</h2>
            <span>Historical-revenue-based allocation; not causal ROI</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-icon green">G</span>
              <span className="stat-tag">GITHUB</span>
            </div>
            <p>GitHub Commits</p>
            <h2>{commits.length}</h2>
            <span>Latest commits fetched from main</span>
          </div>
        </section>

        {/* Clickable module overview */}
        <section className="module-section" id="module-overview">
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPLORE PROJECT</span>
              <h2>Project Modules</h2>
              <p>Select a module to explore its detailed analysis.</p>
            </div>
          </div>

          <div className="module-grid">
            <button
              type="button"
              className="module-card"
              onClick={() => navigateToSection("dataset-eda")}
            >
              <span className="module-icon blue">D</span>
              <strong>Dataset & EDA</strong>
              <small>Upload, data quality, baseline metrics and charts.</small>
              <span className="module-link">Explore module &rarr;</span>
            </button>

            <button
              type="button"
              className="module-card"
              onClick={() => navigateToSection("causal-analysis")}
            >
              <span className="module-icon purple">C</span>
              <strong>Causal Analysis</strong>
              <small>DML estimation and causal assumptions audit.</small>
              <span className="module-link">Explore module &rarr;</span>
            </button>

            <button
              type="button"
              className="module-card"
              onClick={() => navigateToSection("treatment-effects")}
            >
              <span className="module-icon green">T</span>
              <strong>Treatment Effects</strong>
              <small>ATE, CATE, uncertainty, uplift and Qini analysis.</small>
              <span className="module-link">Explore module &rarr;</span>
            </button>

            <button
              type="button"
              className="module-card"
              onClick={() => navigateToSection("recommendations")}
            >
              <span className="module-icon orange">R</span>
              <strong>Recommendations</strong>
              <small>Business insights and analytical findings.</small>
              <span className="module-link">Explore module &rarr;</span>
            </button>

            <button
              type="button"
              className="module-card"
              onClick={() => navigateToSection("budget-optimization")}
            >
              <span className="module-icon teal">B</span>
              <strong>Budget Optimization</strong>
              <small>Budget allocation and strategy analysis.</small>
              <span className="module-link">Explore module &rarr;</span>
            </button>

            <button
              type="button"
              className="module-card"
              onClick={() => navigateToSection("team-activity")}
            >
              <span className="module-icon pink">G</span>
              <strong>Team Activity</strong>
              <small>Project roadmap, GitHub commits and pull requests.</small>
              <span className="module-link">Explore module &rarr;</span>
            </button>
          </div>
        </section>

        {/* Team activity: roadmap and GitHub commits */}
        <section className="content-grid" id="team-activity">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">PROJECT TRACKING</span>
                <h2>Project Roadmap</h2>
              </div>
            </div>

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
                <span className="task-status review">Review</span>
                DML results integrated into dashboard
              </li>
              <li>
                <span className="task-status done">Available</span>
                Historical-revenue-based budget allocation
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
                <span className="eyebrow">REPOSITORY</span>
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
              View all main commits &rarr;
            </a>
          </div>
        </section>

        {/* GitHub Pull Requests */}
        <section className="panel" id="github-prs">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">COLLABORATION</span>
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
            <div className="pr-grid">
              <div>
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
                  View all open PRs &rarr;
                </a>
              </div>

              <div>
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
                  View all merged PRs &rarr;
                </a>
              </div>
            </div>
          )}
        </section>

        {/* Dataset and EDA */}
        <section className="panel detail-panel" id="dataset-eda">
          <UploadPanel />
          <BaselineMetrics summary={HILLSTROM_BASELINE_SUMMARY} />
          <EDACharts summary={HILLSTROM_BASELINE_SUMMARY} />
        </section>

        {/* Causal Analysis */}
        <section className="panel detail-panel" id="causal-analysis">
          <SectionADmlResults />
          <CausalAssumptionsAudit />
        </section>

        {/* Treatment Effects */}
        <section className="panel detail-panel" id="treatment-effects">
          <TreatmentEffectResults
            results={{
              ate: DML_RESULTS.ate,
              confidenceInterval: [
                DML_RESULTS.ciLower,
                DML_RESULTS.ciUpper,
              ],
              sampleSize: DML_RESULTS.sampleSize,
              modelStatus: "Estimated - LinearDML",
              cateSummary: {
                mean: DML_RESULTS.meanCate,
                min: DML_RESULTS.minCate,
                max: DML_RESULTS.maxCate,
                std: DML_RESULTS.cateStd,
              },
            }}
          />
        </section>

        {/* Recommendations */}
        <section
          className="panel detail-panel"
          id="recommendations"
        >
          <Recommendations />
        </section>

        {/* Budget Optimization */}
        <BudgetOptimization />

        <footer className="dashboard-footer">
          EconoCausal &middot; GitHub-powered activity &middot; Branch: main
        </footer>
      </main>
    </div>
  );
}

export default App;
