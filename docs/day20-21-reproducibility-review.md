# Day 20–21: Reproducibility and Final Review

## 1. Purpose

This document records the environment setup, execution steps, validation checks, and known limitations required to reproduce the EconoCausal dashboard workflow.

## 2. Project Environment

### Backend
- Python
- FastAPI
- Uvicorn
- Pandas
- OpenPyXL
- Python multipart
- Pytest
- FastAPI TestClient

Backend dependencies are listed in the root `requirements.txt`.

### Frontend
- React 19
- Vite
- Plotly
- React Plotly
- Oxlint

Frontend dependencies and scripts are maintained in `frontend/package.json`.

### Causal Analysis
The analytical notebooks and result files include:
- EconML LinearDML estimation
- DoWhy estimation and refutation analysis
- Propensity Score Matching
- Treatment-effect and model-validation outputs

The root backend requirements file does not currently provide a complete, independently verified environment for reproducing every analytical notebook. Notebook dependencies and versions should be recorded separately before claiming full model reproducibility.

## 3. Environment Setup

### Step 1: Clone the repository

```bash
git clone https://github.com/snigdhasudheer/Infotact_project1.git
cd Infotact_project1
```

### Step 2: Create and activate Python environment

Windows PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

### Step 3: Install backend dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Install frontend dependencies

```bash
cd frontend
npm install
```

## 4. Running the Application

### Start backend

From the repository root:

```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Health check:

```text
http://127.0.0.1:8000/api/health
```

### Start frontend

From the frontend directory:

```bash
npm run dev
```

Open the local Vite URL displayed in the terminal.

## 5. Validation and Testing

### Backend test suite

From the repository root:

```bash
python -m pytest -q
```

Latest recorded validation:
- 29 tests passed.
- One Starlette deprecation warning related to the current TestClient/httpx integration.

### Frontend production build

From the frontend directory:

```bash
npm run build
```

Latest recorded validation:
- Production build completed successfully.
- A large JavaScript chunk warning remains and should be addressed through future code splitting.

### Frontend lint

```bash
npm run lint
```

Lint verification completed: 0 errors and 5 React-related warnings.

## 6. Data and Result Files

Important analytical artifacts include:
- Hillstrom DML result CSV files.
- Individual CATE estimates and confidence intervals.
- Model validation metrics.
- DoWhy refutation results.
- PSM result files.
- Budget allocation input CSV.

The individual CATE dashboard components load `section_a_individual_cate.csv` from the frontend public directory.

The backend budget allocation endpoint reads `budget_optimization_results.csv` from the repository root.

Ensure the required CSV files are present before running the complete dashboard workflow.

## 7. Reproducibility Considerations

- Use the documented treatment and outcome definitions.
- Preserve the distinction between observed results and simulated scenarios.
- Verify input file versions and schemas before rerunning analyses.
- Record random seeds and package versions when regenerating model results.
- Do not interpret historical revenue allocation as causal ROI.
- Do not interpret email campaign treatment effects as discount or price effects.
- Do not treat DoWhy refutation tests as proof that all confounding has been eliminated.

## 8. Final Review Status

| Area | Review status |
|---|---|
| Backend API tests | 29 passed |
| Frontend production build | Passed |
| Upload and dataset reporting | Tested |
| Budget allocation API | Tested |
| Static CATE integration | File and paths verified |
| Causal methodology limitations | Documented |
| Full notebook environment reproduction | Pending |
| Frontend lint verification | Pending |
| Final report and demo evidence | Pending |

## 9. Conclusion

The current project supports a reproducible backend and frontend setup with tested API workflows and integrated analytical result files. Full reproduction of every causal notebook still requires a verified analytical environment, package versions, and execution records.