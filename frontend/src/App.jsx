
import "./App.css";

function App() {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>EconoCausal</h2>
        <p className="active">Dashboard</p>
        <p>Dataset & EDA</p>
        <p>Causal Analysis</p>
        <p>Recommendations</p>
        <p>Budget Optimization</p>
        <p>Settings</p>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>EconoCausal Dashboard</h1>
            <p>
              Dynamic Pricing via Double Machine Learning
            </p>
          </div>
          <button className="profile" aria-label="User profile">
            H
          </button>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <p>Dataset Status</p>
            <h2>Pending</h2>
            <span>Dataset selection required</span>
          </div>

          <div className="stat-card">
            <p>Causal Analysis</p>
            <h2>Pending</h2>
            <span>DML model not yet trained</span>
          </div>

          <div className="stat-card">
            <p>Budget Optimizer</p>
            <h2>Pending</h2>
            <span>Awaiting treatment effects</span>
          </div>

          <div className="stat-card">
            <p>Team Members</p>
            <h2>02</h2>
            <span>Two-person project team</span>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel">
            <h2>Treatment Effect Analysis</h2>
            <p>
              Estimate how a marketing intervention affects
              customer conversion.
            </p>

            <div className="chart-placeholder">
              Treatment effect chart will appear here
            </div>
          </div>

          <div className="panel">
            <h2>Project Progress</h2>
            <ul>
              <li>React frontend scaffold created</li>
              <li>Dashboard wireframe in progress</li>
              <li>Dataset selection pending</li>
              <li>Causal model implementation pending</li>
            </ul>
          </div>
        </section>

        <section className="panel">
          <h2>Budget Allocation</h2>
          <p>
            Planned feature: compare promotional allocation
            strategies under a fixed budget.
          </p>
          <div className="chart-placeholder">
            Budget allocation visualization will appear here
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
