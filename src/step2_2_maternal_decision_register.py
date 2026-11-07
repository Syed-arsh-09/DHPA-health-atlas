"""
RHPA Step 2.2 — Maternal Healthcare Decision Register

Generates a reproducible register for the reviewed NFHS-5 maternal,
newborn postnatal, delivery and skilled-attendance indicators (columns 37–53).

Run from the project root:
    python src/step2_2_maternal_decision_register.py

Optional:
    python src/step2_2_maternal_decision_register.py --input data/processed/step1_district_health_cleaned.csv --flags data/processed/step1_indicator_quality_flags.csv

Outputs:
    outputs/reports/step2_2_maternal_decision_register.xlsx
    outputs/reports/step2_2_maternal_decision_register.csv

All decisions are provisional research decisions for the primary clustering
feature set. "Contextual only" means retain for descriptive/contextual analysis
but do not include as a direct vulnerability feature in the initial model.
"""

from __future__ import annotations
import argparse
from pathlib import Path
import pandas as pd

# Explicit decisions are recorded by 1-based source column position.
DECISIONS = {
    37: ("Antenatal and maternal services", "Keep for primary model",
         "Measures early initiation of antenatal care; higher coverage generally indicates better access."),
    38: ("Antenatal and maternal services", "Keep for primary model",
         "Measures continuity of antenatal care through at least four visits; higher coverage generally indicates better service utilization."),
    39: ("Antenatal and maternal services", "Keep for primary model",
         "Measures protection against neonatal tetanus; higher coverage generally indicates better preventive maternal care."),
    40: ("Antenatal and maternal services", "Exclude from primary model",
         "The 180+ day IFA indicator (column 41) is a stricter nested threshold. Retain column 40 in the source data and consider it for sensitivity analysis, but avoid including both overlapping thresholds in the primary feature set."),
    41: ("Antenatal and maternal services", "Keep for primary model",
         "Selected instead of the nested 100+ day threshold to represent sustained IFA supplementation; higher coverage generally indicates better supplementation."),
    42: ("Antenatal and maternal services", "Keep for primary model",
         "Measures MCP card receipt among registered pregnancies; useful as a pregnancy documentation/contact indicator, but not a direct measure of care quality."),
    43: ("Antenatal and maternal services", "Keep for primary model",
         "Measures timely maternal postnatal care within two days; higher coverage generally indicates better post-delivery service contact."),
    44: ("Delivery expenditure / financial burden", "Keep for primary model",
         "Measures average out-of-pocket expenditure per public-facility delivery. Higher values may indicate greater financial burden, but must be interpreted with utilization and service context; inspect skewness and missingness."),
    45: ("Newborn postnatal care", "Exclude from primary model",
         "422 of 706 district values are suppressed/missing and many remaining estimates carry low-sample flags. Do not impute suppressed estimates; retain for carefully qualified descriptive analysis only."),
    46: ("Newborn postnatal care", "Keep for primary model",
         "Measures newborn postnatal care from health personnel within two days; available across districts and distinct from maternal postnatal care in column 43."),
    47: ("Institutional delivery and skilled attendance", "Keep for primary model",
         "Measures overall institutional delivery coverage; higher values generally indicate greater use of facility-based delivery care."),
    48: ("Institutional delivery and skilled attendance", "Keep for primary model",
         "Measures public-facility institutional births and adds information about public-sector delivery utilization. It overlaps with column 47, so correlation and redundancy checks are required."),
    49: ("Institutional delivery and skilled attendance", "Contextual only",
         "Measures skilled attendance specifically among home births. It is a narrow subgroup indicator; retain for descriptive analysis, but exclude from the initial primary clustering feature set."),
    50: ("Institutional delivery and skilled attendance", "Keep for primary model",
         "Measures skilled attendance across births irrespective of delivery location; conceptually distinct from institutional delivery, though related. Check correlation with columns 47–48."),
    51: ("Caesarean delivery", "Contextual only",
         "Overall caesarean-section rate has no simple higher-is-better or lower-is-better direction. It depends on clinical need and case mix; retain for contextual analysis, not direct vulnerability scoring."),
    52: ("Caesarean delivery", "Exclude from primary model",
         "Private-facility caesarean rate has 150 suppressed/missing district values and requires clinical and facility case-mix context. Retain for qualified descriptive analysis; do not impute suppressed values."),
    53: ("Caesarean delivery", "Contextual only",
         "Public-facility caesarean-section rate has no simple vulnerability direction and requires clinical/case-mix context; retain for contextual analysis."),
}

DIRECTIONS = {
    37: "Higher generally favorable",
    38: "Higher generally favorable",
    39: "Higher generally favorable",
    40: "Higher generally favorable",
    41: "Higher generally favorable",
    42: "Higher generally favorable; documentation proxy",
    43: "Higher generally favorable",
    44: "Higher may indicate greater financial burden; interpret cautiously",
    45: "Higher generally favorable; estimate reliability is limited",
    46: "Higher generally favorable",
    47: "Higher generally favorable",
    48: "Higher generally favorable for public-facility utilization; interpret with access context",
    49: "Higher generally favorable; narrow home-birth subgroup",
    50: "Higher generally favorable",
    51: "No monotonic direction; clinical context required",
    52: "No monotonic direction; clinical context required",
    53: "No monotonic direction; clinical context required",
}

def build_register(data: pd.DataFrame, flags: pd.DataFrame | None) -> pd.DataFrame:
    if data.shape[1] < 53:
        raise ValueError(f"Expected at least 53 columns; found {data.shape[1]}.")

    flag_counts = {}
    if flags is not None:
        required = {"indicator", "quality_flag"}
        if not required.issubset(flags.columns):
            raise ValueError(f"Quality flags file must contain columns: {sorted(required)}")
        flag_counts = (
            flags[flags["indicator"].isin(data.columns[36:53])]
            .groupby(["indicator", "quality_flag"])
            .size()
            .unstack(fill_value=0)
            .to_dict(orient="index")
        )

    rows = []
    for position in range(37, 54):
        name = str(data.columns[position - 1]).strip()
        category, status, reason = DECISIONS[position]
        values = data.iloc[:, position - 1]
        q = flag_counts.get(name, {})
        rows.append({
            "source_column_number": position,
            "indicator_name": name,
            "category": category,
            "decision_for_primary_clustering": status,
            "preliminary_vulnerability_direction": DIRECTIONS[position],
            "missing_or_suppressed_count_in_cleaned_data": int(values.isna().sum()),
            "available_numeric_observations": int(values.notna().sum()),
            "parenthesized_low_sample_flag_count": int(q.get("parenthesized", 0)),
            "suppressed_asterisk_flag_count": int(q.get("missing_marker", 0)),
            "decision_justification": reason,
            "verification_status": "Provisional — validate definitions, denominators and source footnotes",
        })
    return pd.DataFrame(rows)

def main():
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description="Generate RHPA maternal healthcare decision register.")
    parser.add_argument("--input", type=Path, default=root / "data/processed/step1_district_health_cleaned.csv")
    parser.add_argument("--flags", type=Path, default=root / "data/processed/step1_indicator_quality_flags.csv")
    parser.add_argument("--output-dir", type=Path, default=root / "outputs/reports")
    args = parser.parse_args()

    if not args.input.exists():
        raise FileNotFoundError(f"Cleaned input not found: {args.input}")
    data = pd.read_csv(args.input)

    flags = None
    if args.flags.exists():
        flags = pd.read_csv(args.flags)
    else:
        print(f"WARNING: quality-flags file not found at {args.flags}; quality-flag counts will be zero.")

    register = build_register(data, flags)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    xlsx_path = args.output_dir / "step2_2_maternal_decision_register.xlsx"

    summary = (
        register.groupby("decision_for_primary_clustering")
        .size().reset_index(name="indicator_count")
    )
    notes = pd.DataFrame([
        ["Scope", "Columns 37–53 in the current cleaned NFHS district fact-sheet dataset."],
        ["Keep for primary model", "Candidate feature retained for the primary maternal/overall feature set, subject to later correlation, reliability and scaling checks."],
        ["Contextual only", "Retain for descriptive/contextual analysis but do not use as a direct vulnerability feature in the initial primary clustering model."],
        ["Exclude from primary model", "Do not use in the initial primary feature set; retain original data and consider sensitivity/descriptive analysis where appropriate."],
        ["Missingness", "Counts are calculated from the cleaned CSV. Suppressed estimates remain missing; they are not zeros."],
        ["Quality flags", "Parenthesized flags indicate estimates based on 25–49 unweighted cases; asterisk suppression indicates fewer than 25 unweighted cases, subject to confirmation against official source notes."],
        ["Research caution", "These are provisional decisions, not clinical judgments. Validate official definitions, denominators, reference periods and comparability before model fitting."],
    ], columns=["term", "explanation"])

    with pd.ExcelWriter(xlsx_path, engine="openpyxl") as writer:
        register.to_excel(writer, index=False, sheet_name="Decision Register")
        summary.to_excel(writer, index=False, sheet_name="Decision Summary")
        notes.to_excel(writer, index=False, sheet_name="Method Notes")

    print("RHPA Step 2.2 decision register generated.")
    print(f"Input dataset: {args.input}")
    print(f"Quality flags: {args.flags if flags is not None else 'Not supplied'}")
    print(f"Indicators documented: {len(register)}")
    print(f"Excel output: {xlsx_path}")
    print("\\nDecision summary:")
    print(summary.to_string(index=False))

if __name__ == "__main__":
    main()
