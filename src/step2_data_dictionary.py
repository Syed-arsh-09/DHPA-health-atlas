"""
RHPA Step 2: Provisional Data Dictionary Generator

Purpose
-------
Reads the cleaned NFHS district-level CSV and creates a provisional,
reproducible indicator-classification workbook.

Important
---------
- This is a first-pass classification based on the indicator labels.
- It is NOT a substitute for the official NFHS-5 variable definitions,
  footnotes, denominators, or survey documentation.
- Review and refine classifications before selecting clustering features.
- The raw dataset is never modified.

Default paths (relative to the project root):
    Input:  data/processed/step1_district_health_cleaned.csv
    Output: outputs/reports/RHPA_Step2_Provisional_Data_Dictionary.xlsx

Run from the project root:
    python src/step2_data_dictionary.py

Optional custom paths:
    python src/step2_data_dictionary.py --input path/to/file.csv --output path/to/file.xlsx
"""

from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd


# The column positions below refer to the current 109-column cleaned
# NFHS fact-sheet dataset. Positions are 1-based and must be reviewed if
# the source dataset's schema or column order changes.
FIXED_COLUMNS = {
    1: (
        "Geographic identifiers",
        "Identifier",
        "Not applicable",
        "District identifier; use together with State/UT as the district key.",
    ),
    2: (
        "Geographic identifiers",
        "Identifier",
        "Not applicable",
        "State/UT identifier; use together with District Names as the district key.",
    ),
    3: (
        "Survey sample counts",
        "Sample-size metadata",
        "Not applicable",
        "Number of households surveyed; metadata, not a healthcare outcome.",
    ),
    4: (
        "Survey sample counts",
        "Sample-size metadata",
        "Not applicable",
        "Number of women interviewed; metadata, not a healthcare outcome.",
    ),
    5: (
        "Survey sample counts",
        "Sample-size metadata",
        "Not applicable",
        "Number of men interviewed; metadata, not a healthcare outcome.",
    ),
}

# Inclusive, 1-based column ranges:
# (first column, last column, category, analytical role,
#  preliminary direction, notes)
CATEGORY_RANGES = [
    (6, 7, "Education and demographic context", "Contextual indicator",
     "Depends on analytical question",
     "Education access is generally favorable when higher; population age composition is contextual."),
    (8, 11, "Demographic and civil registration context", "Contextual indicator",
     "Depends on analytical question",
     "Sex ratios and civil registration are contextual; avoid assigning one blanket vulnerability direction."),
    (12, 12, "Household basic amenities", "Social determinant",
     "Higher generally favorable", "Electricity access."),
    (13, 14, "Sanitation and drinking water", "Environmental health determinant",
     "Higher generally favorable",
     "Improved drinking-water source and improved sanitation; retain as separate indicators."),
    (15, 16, "Household basic amenities", "Social determinant",
     "Higher generally favorable", "Clean cooking fuel and iodized salt."),
    (17, 17, "Healthcare financial protection", "Healthcare access / protection",
     "Higher generally favorable",
     "Health insurance/financing coverage does not by itself establish effective access or quality."),
    (18, 18, "Education and demographic context", "Contextual indicator",
     "Higher generally favorable", "Pre-primary school attendance."),
    (19, 20, "Education and demographic context", "Social determinant",
     "Higher generally favorable", "Female literacy and years of schooling."),
    (21, 23, "Demographic and reproductive context", "Contextual / risk indicator",
     "Lower generally favorable",
     "Child marriage, higher-order births and adolescent pregnancy/motherhood; interpret separately."),
    (24, 24, "Menstrual health and hygiene", "Reproductive health indicator",
     "Higher generally favorable", "Hygienic menstrual protection."),
    (25, 36, "Family planning", "Reproductive healthcare indicator",
     "Mixed; indicator-specific",
     "Method prevalence is not uniformly a vulnerability measure; unmet need is adverse when higher. Counselling indicators are generally favorable when higher."),
    (37, 43, "Maternal healthcare", "Maternal healthcare service indicator",
     "Higher generally favorable",
     "Antenatal care, tetanus protection, iron-folic acid, MCP card and postnatal care."),
    (44, 44, "Maternal healthcare", "Healthcare cost indicator",
     "Lower generally favorable, with context",
     "Out-of-pocket expenditure; interpret alongside access, facility type and quality."),
    (45, 46, "Newborn and child postnatal care", "Maternal and newborn healthcare indicator",
     "Higher generally favorable",
     "Postnatal check-up/care within the specified time window."),
    (47, 50, "Maternal healthcare", "Healthcare utilization / skilled delivery indicator",
     "Higher generally favorable",
     "Institutional births and skilled attendance."),
    (51, 53, "Maternal healthcare", "Delivery-mode indicator",
     "Context-dependent",
     "Caesarean rates are not simply better when higher or lower; interpret against clinical need and access."),
    (54, 65, "Child immunization", "Preventive healthcare indicator",
     "Higher generally favorable",
     "Vaccination coverage and place of vaccination; distinguish coverage from provider mix."),
    (66, 66, "Child illness", "Child health outcome",
     "Lower generally favorable", "Diarrhoea prevalence."),
    (67, 68, "Child illness", "Treatment indicator",
     "Higher generally favorable", "ORS and zinc use among children with diarrhoea."),
    (69, 69, "Child illness", "Healthcare-seeking indicator",
     "Higher generally favorable", "Care-seeking for diarrhoea."),
    (70, 70, "Child illness", "Child health outcome",
     "Lower generally favorable", "ARI symptom prevalence."),
    (71, 71, "Child illness", "Healthcare-seeking indicator",
     "Higher generally favorable", "Care-seeking for fever/ARI symptoms."),
    (72, 77, "Infant and young child feeding", "Nutrition practice indicator",
     "Higher generally favorable",
     "Breastfeeding and complementary feeding; keep separate from anthropometric nutrition outcomes."),
    (78, 82, "Child nutritional status", "Nutrition outcome indicator",
     "Mixed; indicator-specific",
     "Stunting, wasting, severe wasting and underweight are adverse when higher; overweight is also an adverse outcome when higher."),
    (83, 85, "Adult nutritional status", "Nutrition outcome indicator",
     "Mixed; indicator-specific",
     "Low BMI and high-risk waist-to-hip ratio are adverse when higher; overweight/obesity is also an adverse outcome when higher."),
    (86, 90, "Anemia", "Nutrition / micronutrient health outcome",
     "Lower generally favorable", "Anemia prevalence by population subgroup."),
    (91, 96, "Blood glucose", "Non-communicable disease (NCD) risk indicator",
     "Lower generally favorable",
     "High/very high blood sugar by sex and threshold; some combined indicators include medication."),
    (97, 102, "Blood pressure", "Non-communicable disease (NCD) risk indicator",
     "Lower generally favorable",
     "Elevated blood pressure by sex and severity; combined indicators may include medication."),
    (103, 105, "Preventive health screening", "Preventive healthcare indicator",
     "Higher generally favorable, cautiously",
     "Self-reported history of screening/examination; not a measure of diagnostic quality or treatment."),
    (106, 109, "Health risk behaviours", "Health risk behaviour indicator",
     "Lower generally favorable", "Tobacco and alcohol use, separately by sex."),
]

CLASSIFICATION_NOTES = [
    ("Purpose", "First-pass semantic classification using indicator labels in the supplied cleaned dataset."),
    ("Geography", "Use State/UT + District Names together as the district key. Do not use text identifiers as clustering features."),
    ("Sample counts", "Columns 3–5 are survey sample-size metadata. Keep them for reliability/context checks, not as ordinary healthcare outcome features."),
    ("Vulnerability direction", "Directions are preliminary. Context-dependent and mixed indicators must not be automatically inverted or combined."),
    ("Family planning", "Method prevalence is not inherently a deficiency measure. Unmet need is generally adverse when higher; counselling indicators are generally favorable when higher."),
    ("Caesarean section", "Higher or lower rates are not inherently better. Interpret with clinical need, access and facility context."),
    ("NCD indicators", "Higher elevated glucose or blood pressure prevalence generally indicates greater burden; medication-inclusive definitions need careful interpretation."),
    ("Data quality", "Keep parentheses/suppression flags alongside numeric values. Consider sensitivity analysis rather than treating all estimates as equally reliable."),
    ("Rural interpretation", "The supplied district file has no rural/urban disaggregation column. Do not describe current indicators as rural-only."),
    ("Next stage", "Verify definitions, footnotes, denominators, reference periods and comparability before selecting clustering features."),
]


def classify_column(position: int):
    """Return provisional category metadata for a 1-based column position."""
    if position in FIXED_COLUMNS:
        return FIXED_COLUMNS[position]

    for start, end, category, role, direction, notes in CATEGORY_RANGES:
        if start <= position <= end:
            return category, role, direction, notes

    return (
        "Needs review",
        "Unclassified",
        "Not determined",
        "No predefined rule; requires manual review.",
    )


def build_dictionary(data: pd.DataFrame) -> pd.DataFrame:
    """Build a row for each dataset column, retaining observed data metadata."""
    records = []

    for position, original_name in enumerate(data.columns, start=1):
        name = str(original_name).strip()
        category, role, direction, notes = classify_column(position)

        if position <= 2:
            unit = "Text identifier"
        elif position <= 5:
            unit = "Count"
        elif "(Rs.)" in name:
            unit = "Indian rupees (Rs.); denominator/context as stated in indicator"
        elif "%" in name:
            unit = "Percentage; population/denominator specified in indicator label"
        else:
            unit = "Review official source definition"

        series = data.iloc[:, position - 1]

        records.append(
            {
                "column_order": position,
                "column_name": name,
                "source_dtype_in_cleaned_file": str(series.dtype),
                "missing_values": int(series.isna().sum()),
                "unique_nonmissing_values": int(series.nunique(dropna=True)),
                "proposed_category": category,
                "proposed_subcategory_or_role": role,
                "indicator_definition_from_label": name,
                "unit_or_measure": unit,
                "vulnerability_direction_preliminary": direction,
                "analytical_role": (
                    "Identifier — exclude from clustering"
                    if position <= 2
                    else "Metadata — exclude from ordinary clustering"
                    if position <= 5
                    else "Candidate indicator — review before selection"
                ),
                "classification_status": "Provisional — verify against official NFHS-5 definitions",
                "notes": notes,
            }
        )

    return pd.DataFrame(records)


def create_workbook(input_csv: Path, output_xlsx: Path) -> None:
    """Read the cleaned dataset and write the provisional dictionary workbook."""
    if not input_csv.exists():
        raise FileNotFoundError(
            f"Input CSV not found: {input_csv}\n"
            "Run Step 1 first or pass the correct path using --input."
        )

    data = pd.read_csv(input_csv)

    if data.shape[1] != 109:
        raise ValueError(
            f"Expected 109 columns in the current RHPA dataset, found {data.shape[1]}. "
            "Review CATEGORY_RANGES before generating the dictionary."
        )

    dictionary = build_dictionary(data)

    category_summary = (
        dictionary.groupby("proposed_category", sort=False)
        .agg(
            number_of_columns=("column_order", "count"),
            column_numbers=("column_order", lambda values: ", ".join(map(str, values))),
        )
        .reset_index()
    )

    notes = pd.DataFrame(CLASSIFICATION_NOTES, columns=["topic", "guidance"])

    output_xlsx.parent.mkdir(parents=True, exist_ok=True)

    with pd.ExcelWriter(output_xlsx, engine="openpyxl") as writer:
        dictionary.to_excel(writer, index=False, sheet_name="Provisional Dictionary")
        category_summary.to_excel(writer, index=False, sheet_name="Category Summary")
        notes.to_excel(writer, index=False, sheet_name="Classification Notes")

    print("RHPA Step 2 completed.")
    print(f"Input dataset:       {input_csv}")
    print(f"Input dimensions:    {data.shape[0]} rows x {data.shape[1]} columns")
    print(f"Classified columns:  {len(dictionary)}")
    print(f"Categories:          {category_summary.shape[0]}")
    print(f"Output workbook:     {output_xlsx}")
    print("\nCategory summary:")
    print(category_summary.to_string(index=False))


def main():
    project_root = Path(__file__).resolve().parents[1]

    parser = argparse.ArgumentParser(
        description="Generate RHPA's provisional NFHS indicator data dictionary."
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=project_root / "data" / "processed" / "step1_district_health_cleaned.csv",
        help="Path to the cleaned Step 1 CSV.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=project_root / "outputs" / "reports" / "RHPA_Step2_Provisional_Data_Dictionary.xlsx",
        help="Path for the generated Excel workbook.",
    )
    args = parser.parse_args()

    create_workbook(args.input.resolve(), args.output.resolve())


if __name__ == "__main__":
    main()
