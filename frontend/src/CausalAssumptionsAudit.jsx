import "./CausalAssumptionsAudit.css";

const ASSUMPTIONS = [
  {
    name: "Treatment definition",
    status: "Confirmed by Section A",
    type: "confirmed",
    detail:
      "Mens E-Mail is the treatment group (1), compared with No E-Mail (0) in the Hillstrom experiment.",
  },
  {
    name: "Outcome definition",
    status: "Confirmed by Section A",
    type: "confirmed",
    detail:
      "Conversion is the primary outcome, where 1 indicates conversion and 0 indicates no conversion.",
  },
  {
    name: "Confounding control",
    status: "Review required",
    type: "review",
    detail:
      "The DoWhy analysis uses backdoor linear regression adjustment. The adequacy of selected covariates and the causal DAG still requires review.",
  },
  {
    name: "Overlap / Positivity",
    status: "Diagnostic pending",
    type: "pending",
    detail:
      "Treatment and comparison groups should have sufficient covariate overlap. No explicit overlap diagnostic is reported here.",
  },
  {
    name: "Consistency",
    status: "Review required",
    type: "review",
    detail:
      "The treatment represents an email campaign assignment. The consistency of the intervention should be considered when interpreting the estimated effect.",
  },
  {
    name: "Temporal validity",
    status: "Review required",
    type: "review",
    detail:
      "Covariate timing and the ordering of variables should be reviewed to ensure that adjustment does not include post-treatment variables.",
  },
  {
    name: "Data quality",
    status: "Evidence review required",
    type: "review",
    detail:
      "Final analytical sample quality, data cleaning, and covariate validity should be reconciled with the dataset validation evidence.",
  },
  {
    name: "Model validation",
    status: "3 refutation tests reported",
    type: "confirmed",
    detail:
      "Section A supplied Random Common Cause, Placebo Treatment, and Data Subset refutation results. These are sensitivity checks, not proof of causal validity.",
  },
];

const REFUTATION_RESULTS = [
  {
    name: "Random Common Cause",
    original: 0.006773492096981292,
    effect: 0.006769962039492018,
    pValue: 0.3280900673653532,
    interpretation: "The estimated effect remains almost unchanged.",
  },
  {
    name: "Placebo Treatment",
    original: 0.006773492096981292,
    effect: -0.00048635067941799233,
    pValue: 0.26743949149660917,
    interpretation: "The placebo treatment effect is close to zero.",
  },
  {
    name: "Data Subset (80%)",
    original: 0.006773492096981292,
    effect: 0.006642709968067527,
    pValue: 0.34572425410472307,
    interpretation: "The estimate remains relatively stable on the subset.",
  },
];

function formatEffect(value) {
  return value.toFixed(6);
}

function formatPValue(value) {
  return value.toFixed(6);
}

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

        <span className="audit-label">Section A results integrated</span>
      </div>

      <div className="audit-notice">
        <strong>Current audit status</strong>
        <p>
          Three DoWhy refutation tests have been reported by Section A.
          Their results provide sensitivity evidence but do not prove that
          all causal identification assumptions are satisfied.
        </p>
      </div>

      <div className="audit-assumptions">
        {ASSUMPTIONS.map((assumption) => (
          <article className="audit-assumption" key={assumption.name}>
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
        <h3>DoWhy Causal Estimation</h3>

        <p>
          Section A reported a DoWhy estimate using backdoor linear
          regression adjustment on the Hillstrom experiment.
        </p>

        <div className="audit-ate-card">
          <span>DoWhy Average Treatment Effect (ATE)</span>
          <strong>0.00677349</strong>
          <small>0.67735 percentage points</small>
        </div>

        <p className="audit-comparison-note">
          This is the DoWhy estimate. It is reported separately from the
          LinearDML estimate shown in the treatment effect section.
        </p>

        <h3 className="audit-refutation-heading">
          DoWhy Refutation Diagnostics
        </h3>

        <p>
          All three tests were executed with 10 simulations each, as
          documented by Section A.
        </p>

        <div className="audit-table-wrapper">
          <table className="audit-results-table">
            <thead>
              <tr>
                <th>Refutation Test</th>
                <th>Original ATE</th>
                <th>New Effect</th>
                <th>p-value</th>
              </tr>
            </thead>

            <tbody>
              {REFUTATION_RESULTS.map((result) => (
                <tr key={result.name}>
                  <td>{result.name}</td>
                  <td>{formatEffect(result.original)}</td>
                  <td>{formatEffect(result.effect)}</td>
                  <td>{formatPValue(result.pValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="audit-result-interpretations">
          {REFUTATION_RESULTS.map((result) => (
            <div className="audit-result-item" key={result.name}>
              <strong>{result.name}</strong>
              <span>{result.interpretation}</span>
            </div>
          ))}
        </div>

        <div className="audit-diagnostic-placeholder">
          <strong>Interpretation of refutation results</strong>
          <span>
            All three refutation p-values are above 0.05. The tests did not
            show statistically significant evidence against the original
            estimate under these tested procedures. This does not prove
            that confounding has been eliminated or that causal assumptions
            are valid.
          </span>
        </div>

        <div className="audit-warning">
          <strong>DoWhy warning</strong>
          <p>
            DoWhy displayed a normal-distribution assumption warning during
            the refutation procedures. This limitation should be considered
            when interpreting the diagnostic results.
          </p>
        </div>
      </div>

      <div className="audit-data-context">
        <h3>Dataset and treatment context</h3>

        <ul>
          <li>
            <strong>Hillstrom:</strong> The analysis compares Mens E-Mail
            treatment (1) against No E-Mail (0), with conversion as the
            primary outcome.
          </li>
          <li>
            <strong>Interpretation:</strong> The estimated effect concerns
            an email marketing campaign, not a product discount.
          </li>
          <li>
            <strong>Online Retail:</strong> Historical transaction records
            alone cannot establish the causal effect of discounts because
            randomized discount assignment and a complete non-purchasing
            population are not available.
          </li>
          <li>
            <strong>Refutation scope:</strong> These three tests assess
            sensitivity to selected changes in the estimation procedure.
            They cannot independently establish causal validity.
          </li>
        </ul>
      </div>

      <p className="audit-footer-note">
        Audit scope: assumption documentation, DoWhy estimation, and
        refutation diagnostics. Final causal conclusions depend on
        validated identification assumptions and appropriate interpretation
        of the available evidence.
      </p>
    </div>
  );
}

export default CausalAssumptionsAudit;