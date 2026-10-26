
import tempfile
from pathlib import Path

import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from validate_upload import validate_upload, create_preview

app = FastAPI(title="EconoCausal API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
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

        df = validate_upload(temp_path)

        preview_df = create_preview(df, rows=5)
        preview_df = preview_df.astype(object).where(
            pd.notna(preview_df), ""
        )
        preview = preview_df.astype(str).to_dict(
            orient="records"
        )

        # Added: descriptive summary for the Online Retail dataset
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
