

import io
import tempfile
from pathlib import Path

import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from export_product_month import build_product_month_summary
from validate_upload import validate_upload, create_preview


app = FastAPI(title="EconoCausal API")


# Allow requests from the local React/Vite frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "EconoCausal API is running"}


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "message": "EconoCausal API is running",
    }


@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Validate an uploaded Online Retail Excel dataset."""

    filename = file.filename or ""

    if Path(filename).suffix.lower() != ".xlsx":
        raise HTTPException(
            status_code=400,
            detail="Unsupported format. Please upload an .xlsx file.",
        )

    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(
            suffix=".xlsx",
            delete=False,
        ) as temp:
            temp_path = Path(temp.name)

            while True:
                chunk = await file.read(1024 * 1024)

                if not chunk:
                    break

                temp.write(chunk)

        # Reuse the existing dataset validator.
        df = validate_upload(temp_path)

        preview_df = create_preview(df, rows=5)
        preview_df = preview_df.astype(object).where(
            pd.notna(preview_df), ""
        )

        preview = preview_df.astype(str).to_dict(
            orient="records"
        )

        # Descriptive statistics only; these are not causal estimates.
        summary = {
            "unique_invoices": int(df["InvoiceNo"].nunique()),
            "unique_customers": int(df["CustomerID"].nunique()),
            "countries": int(df["Country"].nunique()),
            "total_quantity": int(df["Quantity"].sum()),
            "net_sales_value": round(
                float((df["Quantity"] * df["UnitPrice"]).sum()),
                2,
            ),
        }

        return {
            "message": "Dataset validation successful.",
            "filename": Path(filename).name,
            "rows": int(len(df)),
            "columns": [str(column) for column in df.columns],
            "preview": preview,
            "summary": summary,
        }

    except HTTPException:
        raise
    except (ValueError, FileNotFoundError) as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=(
                "Could not read this Excel file. "
                "Please check that it is a valid .xlsx file."
            ),
        ) from exc
    finally:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)

        await file.close()


@app.post("/api/export-product-month")
async def export_product_month(file: UploadFile = File(...)):
    """
    Convert historical Excel transactions into a product-month CSV.

    This output describes historical activity. It does not estimate
    the causal effect of discounts or price changes.
    """

    filename = file.filename or ""

    if Path(filename).suffix.lower() != ".xlsx":
        raise HTTPException(
            status_code=400,
            detail="Unsupported format. Please upload an .xlsx file.",
        )

    try:
        contents = await file.read()

        if not contents:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is empty.",
            )

        # Read Excel data from memory; no temporary file is needed.
        df = pd.read_excel(io.BytesIO(contents))

        required_columns = {
            "InvoiceNo",
            "StockCode",
            "InvoiceDate",
            "Quantity",
            "UnitPrice",
        }

        missing = sorted(required_columns - set(df.columns))

        if missing:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Missing required columns: "
                    + ", ".join(missing)
                ),
            )

        # Generate the summary using the existing tested utility.
        summary = build_product_month_summary(df)

        if summary.empty:
            raise HTTPException(
                status_code=400,
                detail="No valid product-month records were found.",
            )

        csv_content = summary.to_csv(index=False, float_format="%.2f")

        return Response(
            content=csv_content,
            media_type="text/csv; charset=utf-8",
            headers={
                "Content-Disposition": (
                    'attachment; filename="product_month_summary.csv"'
                )
            },
        )

    except HTTPException:
        raise
    except (ValueError, KeyError) as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Could not generate product-month summary: {exc}",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unable to read the Excel file or generate the CSV. "
                "Please check the file and try again."
            ),
        ) from exc
    finally:
        await file.close()


@app.post("/api/dataset-report")
async def download_dataset_report(file: UploadFile = File(...)):
    """Generate a downloadable text report for a validated dataset."""
    filename = file.filename or ""

    if Path(filename).suffix.lower() != ".xlsx":
        raise HTTPException(
            status_code=400,
            detail="Unsupported format. Please upload an .xlsx file.",
        )

    try:
        contents = await file.read()

        if not contents:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is empty.",
            )

        # Reuse the existing validator without changing its logic.
        with tempfile.NamedTemporaryFile(
            suffix=".xlsx", delete=False
        ) as temp:
            temp_path = Path(temp.name)
            temp.write(contents)

        try:
            df = validate_upload(temp_path)
        finally:
            temp_path.unlink(missing_ok=True)

        total_rows, total_columns = df.shape
        missing_cells = int(df.isna().sum().sum())
        duplicate_rows = int(df.duplicated().sum())

        unique_invoices = int(df["InvoiceNo"].nunique())
        unique_customers = int(df["CustomerID"].nunique())
        countries = int(df["Country"].nunique())
        total_quantity = int(df["Quantity"].sum())
        net_sales = round(
            float((df["Quantity"] * df["UnitPrice"]).sum()), 2
        )

        report = f"""ECONOCAUSAL — DATASET REPORT
========================================
File: {Path(filename).name}
Validation status: Successful

DATASET OVERVIEW
Rows: {total_rows}
Columns: {total_columns}
Column names: {", ".join(map(str, df.columns))}

DATA QUALITY
Missing cells: {missing_cells}
Duplicate rows: {duplicate_rows}

DESCRIPTIVE SUMMARY
Unique invoices: {unique_invoices}
Unique customers: {unique_customers}
Countries: {countries}
Total quantity: {total_quantity}
Net sales value: {net_sales:.2f}

INTERPRETATION NOTE
These statistics describe historical transaction data.
They do not establish that discounts or price changes
cause changes in purchasing behaviour.
Causal conclusions require a suitable experimental or
causal-inference design and validated analysis.
"""

        return Response(
            content=report,
            media_type="text/plain; charset=utf-8",
            headers={
                "Content-Disposition":
                    'attachment; filename="econocausal_dataset_report.txt"'
            },
        )

    except HTTPException:
        raise
    except (ValueError, FileNotFoundError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Unable to generate the report. Please check the Excel file.",
        ) from exc
    finally:
        await file.close()

@app.get("/api/budget-allocation")
def get_budget_allocation(
    budget: float = Query(default=50000, gt=0)
):
    """Generate a proportional budget allocation scenario."""

    csv_path = Path(__file__).resolve().parent / "budget_optimization_results.csv"

    if not csv_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Budget optimization CSV was not found."
        )

    try:
        df = pd.read_csv(csv_path)

        required_columns = {
            "Description",
            "total_revenue",
            "transaction_count",
            "allocation_weight",
            "allocated_budget",
        }

        missing = required_columns - set(df.columns)

        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"Missing CSV columns: {', '.join(sorted(missing))}"
            )

        if df.empty:
            raise HTTPException(
                status_code=400,
                detail="Budget allocation dataset is empty."
            )

        weights = pd.to_numeric(
            df["allocation_weight"], errors="coerce"
        ).fillna(0).tolist()

        if any(weight < 0 for weight in weights) or sum(weights) <= 0:
            raise HTTPException(
                status_code=400,
                detail="Allocation weights must be non-negative with a positive total."
            )

        product_count = len(df)
        minimum_per_product = 100
        maximum_per_product = 2000

        minimum_budget = product_count * minimum_per_product
        maximum_budget = product_count * maximum_per_product

        if not minimum_budget <= budget <= maximum_budget:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Budget must be between ₹{minimum_budget:,.0f} "
                    f"and ₹{maximum_budget:,.0f} for {product_count} products."
                )
            )

        # Capped proportional allocation.
        allocations = [None] * product_count
        active = set(range(product_count))
        remaining_budget = float(budget)

        while active:
            active_weight = sum(weights[i] for i in active)

            if active_weight <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="Unable to distribute the remaining budget."
                )

            proposed = {
                i: remaining_budget * weights[i] / active_weight
                for i in active
            }

            below_minimum = [
                i for i in active
                if proposed[i] < minimum_per_product
            ]

            above_maximum = [
                i for i in active
                if proposed[i] > maximum_per_product
            ]

            if not below_minimum and not above_maximum:
                for i in active:
                    allocations[i] = proposed[i]
                break

            for i in below_minimum:
                allocations[i] = float(minimum_per_product)
                remaining_budget -= minimum_per_product
                active.remove(i)

            for i in above_maximum:
                if i in active:
                    allocations[i] = float(maximum_per_product)
                    remaining_budget -= maximum_per_product
                    active.remove(i)

        # Round to paise and reconcile the small rounding difference.
        allocations = [round(value, 2) for value in allocations]
        difference = round(float(budget) - sum(allocations), 2)

        if difference != 0:
            for i in range(product_count):
                if difference > 0:
                    adjustment = min(
                        difference,
                        round(maximum_per_product - allocations[i], 2)
                    )
                else:
                    adjustment = -min(
                        abs(difference),
                        round(allocations[i] - minimum_per_product, 2)
                    )

                allocations[i] = round(allocations[i] + adjustment, 2)
                difference = round(difference - adjustment, 2)

                if difference == 0:
                    break

        df["scenario_allocation"] = allocations
        df["scenario_share"] = (
            df["scenario_allocation"] / float(budget)
        )

        products = []

        for _, row in df.iterrows():
            products.append({
                "product": str(row["Description"]),
                "historical_revenue": round(
                    float(row["total_revenue"]), 2
                ),
                "transactions": int(row["transaction_count"]),
                "allocation_weight": round(
                    float(row["allocation_weight"]), 6
                ),
                "current_allocation": round(
                    float(row["allocated_budget"]), 2
                ),
                "scenario_allocation": round(
                    float(row["scenario_allocation"]), 2
                ),
                "scenario_share": round(
                    float(row["scenario_share"]), 6
                ),
            })

        return {
            "budget": round(float(budget), 2),
            "product_count": product_count,
            "minimum_per_product": minimum_per_product,
            "maximum_per_product": maximum_per_product,
            "total_allocated": round(sum(allocations), 2),
            "allocation_method": "Capped proportional allocation",
            "interpretation": (
                "Historical-revenue-based allocation scenario. "
                "This is not a causal ROI estimate."
            ),
            "products": products,
        }

    except HTTPException:
        raise
    except (ValueError, TypeError, KeyError) as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to calculate budget allocation: {exc}"
        ) from exc

