import "./CausalAssumptionsAudit.css";

const ASSUMPTIONS = [
  {
    name: "Treatment definition",
    status: "Pending Section A validation",
    type: "pending",
    detail:
      "Confirm the final treatment variable and comparison groups from the approved causal analysis.",
  },
  {
    name: "Outcome definition",
    status: "Pending Section A validation",
    type: "pending",
    detail:
      "Confirm the primary outcome and its measurement from the approved analysis.",
  },
  {
    name: "Confounding control",
    status: "Review required",
    type: "review",
    detail:
      "Review whether relevant confounders are identified and whether the selected covariates are justified by the causal DAG.",
  },
  {
    name: "Overlap / Positivity",
    status: "Diagnostic pending",
    type: "pending",
    detail:
      "Treatment and comparison groups must have sufficient covariate overlap. No overlap diagnostic result is currently available here.",
  },
  {
    name: "Consistency",
    status: "Review required",
    type: "review",
    detail:
      "Check whether the treatment is clearly defined and represents a consistent intervention across observations.",
  },
  {
    name: "Temporal validity",
    status: "Review required",
    type: "review",
    detail:
      "Review whether covariates are measured before treatment and whether the analysis respects the relevant time order.",
  },
  {
    name: "Data quality",
    status: "Evidence review required",
    type: "review",
    detail:
      "Reconcile existing dataset validation and cleaning evidence with the final analytical sample.",
  },
  {
    name: "Model validation",
    status: "Diagnostics pending",
    type: "pending",
    detail:
      "DoWhy refutation and robustness results have not yet been supplied for display in this dashboard.",
  },
];

function CausalAssumptionsAudit() {
  return (
    <div className="causal-audit">
      <div className="causal-audit-heading">
        <div>
          <h2>Causal Assumptions Audit</h2>
          <p>
            Review of identification assumptions and diagnostic evidence
            required for causal interpretation.
          </p>
        </div>

        <span className="audit-label">Documentation review</span>
      </div>

      <div className="audit-notice">
        <strong>Current audit status</strong>
        <p>
          This panel documents assumptions that require validation. It does
          not establish that the causal assumptions are satisfied, and it
          does not represent completed DoWhy refutation tests.
        </p>
      </div>

      <div className="audit-assumptions">
        {ASSUMPTIONS.map((assumption) => (
          <article
            className="audit-assumption"
            key={assumption.name}
          >
            <div className="audit-assumption-top">
              <h3>{assumption.name}</h3>
              <span className={`audit-status ${assumption.type}`}>
                {assumption.status}
              </span>
            </div>

            <p>{assumption.detail}</p>
          </article>
        ))}
      </div>

      <div className="audit-diagnostics">
        <h3>DoWhy Refutation Diagnostics</h3>

        <p>
          Refutation test results are not yet available in the Section B
          dashboard. They will be displayed after Section A provides the
          executed tests, results, and interpretation.
        </p>

        <div className="audit-diagnostic-placeholder">
          <strong>Awaiting Section A results</strong>
          <span>
            No refutation test outcome is being reported as passed or failed
            at this stage.
          </span>
        </div>
      </div>

      <div className="audit-data-context">
        <h3>Dataset and treatment context</h3>

        <ul>
          <li>
            <strong>Hillstrom:</strong> The preliminary analysis uses
            marketing email treatment groups and conversion as the primary
            outcome. Final definitions require Section A confirmation.
          </li>
          <li>
            <strong>Interpretation:</strong> An email campaign effect is
            not a product discount effect.
          </li>
          <li>
            <strong>Online Retail:</strong> Historical transaction records
            alone cannot establish the causal effect of discounts because
            randomized discount assignment and a complete non-purchasing
            population are not available.
          </li>
        </ul>
      </div>

      <p className="audit-footer-note">
        Audit scope: assumption documentation and diagnostic reporting.
        Final causal conclusions depend on validated definitions, justified
        identification assumptions, and actual diagnostic evidence.
      </p>
    </div>
  );
}

export default CausalAssumptionsAudit;