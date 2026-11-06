"""
RHPA Step 1: Dataset audit, reproducible cleaning, quality flags, and dictionary template.

Run from the repository root:
    python src/step1_data_pipeline.py

Expected input:
    data/raw/NFHS(factSheet).csv

Outputs:
    data/processed/step1_district_health_cleaned.csv
    data/processed/step1_indicator_quality_flags.csv
    outputs/reports/step1_dataset_audit.xlsx
    outputs/reports/step1_data_dictionary_template.xlsx

Important:
- The raw CSV is never modified.
- Asterisk values are treated as unavailable, not zero.
- Parenthesized values are converted numerically but their flag is retained.
- The script does NOT assume what parentheses mean in the source documentation.
"""

from __future__ import annotations

from pathlib import Path
import re
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW_FILE = ROOT / "data" / "raw" / "NFHS(factSheet).csv"
PROCESSED_DIR = ROOT / "data" / "processed"
REPORT_DIR = ROOT / "outputs" / "reports"

DISTRICT_COL = "District Names"
STATE_COL = "State/UT"

MISSING_MARKERS = {"", "*", "NA", "N/A", "NULL", "NONE", "-", "—"}

def normalize_geo(series: pd.Series) -> pd.Series:
    """Trim and collapse whitespace without guessing geographic name corrections."""
    return (
        series.astype("string")
        .str.strip()
        .str.replace(r"\s+", " ", regex=True)
    )

def parse_indicator_value(value):
    """
    Convert a source cell to a numeric value.
    Returns (numeric_value, source_flag).

    Flags:
      missing_marker
      parenthesized
      ordinary_numeric
      non_numeric_text
    """
    if pd.isna(value):
        return pd.NA, "missing_marker"

    text = str(value).strip()
    if text.upper() in MISSING_MARKERS:
        return pd.NA, "missing_marker"

    parenthesized = bool(re.fullmatch(r"\(\s*[-+]?\d+(?:\.\d+)?\s*\)", text))
    if parenthesized:
        text = text.strip()[1:-1].strip()

    # Remove thousands separators only when they appear in numeric strings.
    text = text.replace(",", "")
    try:
        number = float(text)
        return number, ("parenthesized" if parenthesized else "ordinary_numeric")
    except ValueError:
        return pd.NA, "non_numeric_text"

def build_outputs():
    if not RAW_FILE.exists():
        raise FileNotFoundError(
            f"Could not find {RAW_FILE}. Place the original CSV in data/raw/."
        )

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)

    # Read as strings to preserve source formatting and flags.
    raw = pd.read_csv(RAW_FILE, dtype="string", keep_default_na=False)
    if DISTRICT_COL not in raw.columns or STATE_COL not in raw.columns:
        raise ValueError(
            f"Expected geographic columns '{DISTRICT_COL}' and '{STATE_COL}'. "
            f"Found: {list(raw.columns[:10])}"
        )

    cleaned = raw.copy()
    cleaned[DISTRICT_COL] = normalize_geo(cleaned[DISTRICT_COL])
    cleaned[STATE_COL] = normalize_geo(cleaned[STATE_COL])

    # Build per-cell quality flags for indicator columns.
    identifier_cols = {DISTRICT_COL, STATE_COL}
    indicator_cols = [c for c in raw.columns if c not in identifier_cols]

    flags_records = []
    for col in indicator_cols:
        parsed_values = []
        for row_idx, source_value in raw[col].items():
            numeric_value, flag = parse_indicator_value(source_value)
            parsed_values.append(numeric_value)

            if flag in {"missing_marker", "parenthesized", "non_numeric_text"}:
                flags_records.append({
                    "source_row_index": row_idx,
                    STATE_COL: cleaned.at[row_idx, STATE_COL],
                    DISTRICT_COL: cleaned.at[row_idx, DISTRICT_COL],
                    "indicator": col,
                    "original_value": source_value,
                    "quality_flag": flag,
                })

        # Convert a column only if it is numeric-like or contains numeric/missing tokens.
        nonempty = raw[col].astype("string").str.strip()
        recognized = nonempty.str.fullmatch(
            r"(?:\(\s*[-+]?\d+(?:\.\d+)?\s*\)|[-+]?\d+(?:\.\d+)?|"
            r"\*|NA|N/A|NULL|NONE|-|—)?",
            case=False,
            na=False,
        )
        if recognized.mean() >= 0.90:
            cleaned[col] = pd.to_numeric(pd.Series(parsed_values, index=raw.index), errors="coerce")

    flags = pd.DataFrame(
        flags_records,
        columns=[
            "source_row_index", STATE_COL, DISTRICT_COL,
            "indicator", "original_value", "quality_flag"
        ],
    )

    # Geographic checks.
    geo_pairs = cleaned[[STATE_COL, DISTRICT_COL]].copy()
    duplicate_pair_count = int(geo_pairs.duplicated().sum())
    blank_geo_count = int(
        (cleaned[STATE_COL].fillna("").str.strip().eq("") |
         cleaned[DISTRICT_COL].fillna("").str.strip().eq("")).sum()
    )

    # Column-level audit.
    audit_rows = []
    for col in raw.columns:
        audit_rows.append({
            "column": col,
            "original_dtype_read_as": "string (source-preserving read)",
            "cleaned_dtype": str(cleaned[col].dtype),
            "missing_or_suppressed_count": int(
                cleaned[col].isna().sum()
                + raw[col].astype("string").str.strip().eq("*").sum()
            ),
            "unique_nonmissing_values": int(cleaned[col].nunique(dropna=True)),
        })
    column_audit = pd.DataFrame(audit_rows)

    overview = pd.DataFrame([
        ["Rows", len(raw), "Records in original source"],
        ["Columns", len(raw.columns), "Columns in original source"],
        ["Unique states/UTs", cleaned[STATE_COL].nunique(dropna=True), "After whitespace normalization"],
        ["Unique district names", cleaned[DISTRICT_COL].nunique(dropna=True), "Names may repeat across states"],
        ["Duplicate state-district pairs", duplicate_pair_count, "Review before modeling"],
        ["Rows with blank geography", blank_geo_count, "Review before modeling"],
        ["Quality-flag records", len(flags), "Missing, parenthesized, or non-numeric cells"],
        ["Parenthesized-value flags", int((flags["quality_flag"] == "parenthesized").sum()), "Meaning must be checked against source notes"],
        ["Asterisk/missing-marker flags", int((flags["quality_flag"] == "missing_marker").sum()), "Not interpreted as zero"],
        ["Non-numeric text flags", int((flags["quality_flag"] == "non_numeric_text").sum()), "Requires review"],
    ], columns=["audit_item", "value", "interpretation"])

    # Dictionary template: deliberately leaves substantive classification for reviewed metadata.
    dictionary = pd.DataFrame({
        "column_order": range(1, len(raw.columns) + 1),
        "column_name": raw.columns,
        "source_dtype": [str(raw[c].dtype) for c in raw.columns],
        "cleaned_dtype": [str(cleaned[c].dtype) for c in raw.columns],
        "proposed_category": [
            "Geography" if c in identifier_cols else "Needs manual classification"
            for c in raw.columns
        ],
        "indicator_definition": ["To verify against NFHS source documentation"] * len(raw.columns),
        "unit_or_denominator": ["To verify"] * len(raw.columns),
        "vulnerability_direction": ["Not yet assigned"] * len(raw.columns),
        "analytical_role": [
            "Geographic identifier" if c in identifier_cols else "Candidate; review before modeling"
            for c in raw.columns
        ],
        "notes": [""] * len(raw.columns),
    })

    cleaned_path = PROCESSED_DIR / "step1_district_health_cleaned.csv"
    flags_path = PROCESSED_DIR / "step1_indicator_quality_flags.csv"
    audit_path = REPORT_DIR / "step1_dataset_audit.xlsx"
    dictionary_path = REPORT_DIR / "step1_data_dictionary_template.xlsx"

    cleaned.to_csv(cleaned_path, index=False)
    flags.to_csv(flags_path, index=False)

    with pd.ExcelWriter(audit_path, engine="openpyxl") as writer:
        overview.to_excel(writer, sheet_name="Overview", index=False)
        column_audit.to_excel(writer, sheet_name="Column Audit", index=False)
        flags.groupby("quality_flag", dropna=False).size().rename("count").reset_index().to_excel(
            writer, sheet_name="Quality Flag Summary", index=False
        )

    with pd.ExcelWriter(dictionary_path, engine="openpyxl") as writer:
        dictionary.to_excel(writer, sheet_name="Dictionary Template", index=False)

    print("\nDHPA Step 1 completed.")
    print(f"Original dataset: {raw.shape[0]} rows x {raw.shape[1]} columns")
    print(f"Cleaned dataset:  {cleaned_path}")
    print(f"Quality flags:    {flags_path}")
    print(f"Audit workbook:   {audit_path}")
    print(f"Dictionary:       {dictionary_path}")
    print("\nReview parenthesized values against the official source notes before interpreting them.")

if __name__ == "__main__":
    build_outputs()
