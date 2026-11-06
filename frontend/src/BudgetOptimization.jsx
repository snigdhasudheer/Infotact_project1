
import { useEffect, useMemo, useState } from "react";
import "./BudgetOptimization.css";

const API_URL = "http://127.0.0.1:8000/api/budget-allocation";

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

function BudgetOptimization() {
  const [budget, setBudget] = useState("50000");
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAllocation = async (event) => {
    if (event) event.preventDefault();

    const amount = Number(budget);

    if (!Number.isFinite(amount) || amount < 10000 || amount > 200000) {
      setError("Please enter a budget between ₹10,000 and ₹2,00,000.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}?budget=${encodeURIComponent(amount)}`
      );

      let result;

      try {
        result = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response. Please try again."
        );
      }

      if (!response.ok) {
        throw new Error(
          result.detail || "Unable to calculate budget allocation. Please try again."
        );
      }

      if (!Array.isArray(result.products)) {
        throw new Error(
          "Invalid response received from the server. Please try again."
        );
      }

      setData(result);
    } catch (err) {
      setError(
        err.message ||
          "Backend connection failed. Please check whether FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocation();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];

    return data.products.filter((item) =>
      String(item.product || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [data, search]);

  const topProducts = useMemo(() => {
    if (!data?.products) return [];

    return [...data.products]
      .sort(
        (a, b) => b.scenario_allocation - a.scenario_allocation
      )
      .slice(0, 10);
  }, [data]);

  return (
    <section
      className="panel detail-panel budget-optimization"
      id="budget-optimization"
    >
      <div className="budget-heading">
        <div>
          <span className="eyebrow">ALLOCATION STRATEGY</span>
          <h2>Budget Optimization</h2>
          <p>
            Explore how your promotional budget can be distributed
            across products using historical revenue weights.
          </p>
        </div>

        <span
          className={`budget-status ${
            error ? "is-error" : loading ? "is-loading" : "is-connected"
          }`}
        >
          {error ? "API Error" : loading ? "Connecting..." : "API Connected"}
        </span>
      </div>

      <form className="budget-input-card" onSubmit={fetchAllocation}>
        <div>
          <label htmlFor="budgetAmount">Enter Total Budget (₹)</label>
          <input
            id="budgetAmount"
            type="number"
            min="10000"
            max="200000"
            step="100"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            placeholder="Enter budget"
          />
          <small>
            For 100 products, allowed budget is ₹10,000–₹2,00,000.
          </small>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Calculating..." : "Calculate Allocation"}
        </button>
      </form>

      {loading && (
        <div className="budget-loading" role="status" aria-live="polite">
          Calculating product-wise budget allocation. Please wait...
        </div>
      )}

      {error && (
        <div className="budget-error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => fetchAllocation()}
            disabled={loading}
          >
            Retry
          </button>
        </div>
      )}

      {data && data.products.length === 0 && !loading && (
        <div className="budget-empty" role="status">
          <h3>No allocation data available</h3>
          <p>
            No products were returned for this budget. Please check the
            dataset or try calculating again.
          </p>
        </div>
      )}

      {data && data.products.length > 0 && (
        <>
          <div className="budget-summary-grid">
            <div className="budget-stat">
              <span>Total Budget</span>
              <strong>{formatINR(data.budget)}</strong>
            </div>

            <div className="budget-stat">
              <span>Total Allocated</span>
              <strong>{formatINR(data.total_allocated)}</strong>
            </div>

            <div className="budget-stat">
              <span>Products Covered</span>
              <strong>{data.product_count}</strong>
            </div>

            <div className="budget-stat">
              <span>Allocation Method</span>
              <strong className="method-value">
                {data.allocation_method}
              </strong>
            </div>
          </div>

          <div className="budget-section-card">
            <div className="budget-section-heading">
              <div>
                <h3>Top 10 Product Allocations</h3>
                <p>Products receiving the highest scenario budget</p>
              </div>
            </div>

            <div className="allocation-bars">
              {topProducts.map((product, index) => (
                <div className="allocation-bar-row" key={product.product}>
                  <div className="allocation-bar-label">
                    <span>
                      {index + 1}. {product.product}
                    </span>
                    <strong>
                      {formatINR(product.scenario_allocation)}
                    </strong>
                  </div>

                  <div className="allocation-track">
                    <div
                      className="allocation-fill"
                      style={{
                        width: `${
                          (product.scenario_allocation /
                            data.maximum_per_product) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="budget-section-card">
            <div className="budget-section-heading">
              <div>
                <h3>Product-wise Allocation</h3>
                <p>
                  Complete allocation breakdown for {data.product_count} products
                </p>
              </div>

              <input
                className="budget-search"
                type="search"
                placeholder="Search product..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="budget-table-wrapper">
              <table className="budget-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Historical Revenue</th>
                    <th>Transactions</th>
                    <th>Current Allocation</th>
                    <th>Scenario Allocation</th>
                    <th>Budget Share</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.product}>
                      <td>{product.product}</td>
                      <td>{formatINR(product.historical_revenue)}</td>
                      <td>{product.transactions.toLocaleString("en-IN")}</td>
                      <td>{formatINR(product.current_allocation)}</td>
                      <td className="scenario-amount">
                        {formatINR(product.scenario_allocation)}
                      </td>
                      <td>
                        {(product.scenario_share * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="6">
                        No matching products found. Try another search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="budget-table-footer">
              Showing {filteredProducts.length} of {data.product_count} products
            </p>
          </div>

          <div className="budget-note">
            <strong>Interpretation:</strong> {data.interpretation}
            <br />
            This is a historical-revenue-based allocation scenario,
            not a causal ROI estimate or guaranteed return.
          </div>
        </>
      )}
    </section>
  );
}

export default BudgetOptimization;
