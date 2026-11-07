"""
RHPA Step 2.3 — Child Immunization Decision Register
Creates an XLSX documentation artifact. Run from the project root:
    python src/step2_3_child_immunization_decision_register.py
Requires: openpyxl
"""
from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

OUTPUT = Path("outputs/reports/RHPA_Step2_3_Child_Immunization_Decision_Register.xlsx")
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

rows = [
    [54, "Full basic vaccination coverage (card or mother's recall)", "Child Immunization", "Keep", 706, 693, 13, 232, 38.3, 78.0, 100.0, 77.68, None, "Broad coverage measure; compare with selected individual vaccines to assess redundancy."],
    [55, "Full vaccination coverage (card only)", "Child Immunization", "Contextual only", 706, 684, 22, 323, 45.0, 84.95, 100.0, 84.02, None, "Conditional denominator based on children whose vaccination card was shown."],
    [56, "BCG vaccination", "Child Immunization", "Keep", 706, 693, 13, 232, 65.9, 96.0, 100.0, 95.01, 4.59, "Important vaccine-specific coverage; check low variation during feature selection."],
    [57, "Three doses of polio vaccine", "Child Immunization", "Keep", 706, 693, 13, 232, 47.6, 82.2, 100.0, 81.50, 10.55, "Meaningful district variation; may overlap with overall coverage."],
    [58, "Three doses of pentavalent or DPT vaccine", "Child Immunization", "Keep", 706, 693, 13, 232, 53.3, 88.8, 100.0, 87.34, 8.45, "Compare with Column 62; exact official definitions need verification."],
    [59, "First dose of measles-containing vaccine (MCV)", "Child Immunization", "Keep", 706, 693, 13, 232, 53.2, 89.6, 100.0, 88.46, 8.22, "First MCV dose, ages 12–23 months."],
    [60, "Second dose of measles-containing vaccine (MCV)", "Child Immunization", "Keep", 706, 693, 13, 232, 2.8, 31.4, 63.8, 31.87, 11.34, "Second MCV dose, ages 24–35 months; distinct schedule stage."],
    [61, "Three doses of rotavirus vaccine", "Child Immunization", "Keep", 706, 693, 13, 232, 0.0, 39.9, 100.0, 39.13, 32.18, "Large district variation and low median."],
    [62, "Three doses of pentavalent or hepatitis B vaccine", "Child Immunization", "Exclude", 706, 693, 13, 232, 39.5, 86.3, 100.0, 84.66, 9.93, "Pearson r with Column 58 ≈0.934; verify definitions before assuming equivalence."],
    [63, "Vitamin A dose in last six months (children aged 9–35 months)", "Child Preventive Supplementation", "Keep", 706, 705, 1, 5, 27.5, 73.0, 98.1, 72.27, 13.44, "Not a vaccine; separate category."],
    [64, "Most vaccinations received in a public facility", "Vaccination Provider Utilization", "Contextual only", 706, 690, 16, 252, 67.1, 97.3, 100.0, 95.70, 4.89, "Utilization pattern, not direct coverage or service quality; approved contextual only."],
    [65, "Most vaccinations received in a private facility", "Vaccination Provider Utilization", "Contextual only", 706, 690, 16, 252, 0.0, 1.6, 32.9, 3.21, 4.50, "Utilization pattern, not direct coverage or service quality; approved contextual only."],
]
headers = ["NFHS column", "Indicator", "Category", "Decision", "District records", "Available", "Suppressed/missing", "Parenthesized estimates", "Minimum (%)", "Median (%)", "Maximum (%)", "Mean (%)", "Std. dev.", "Decision rationale"]

wb = Workbook()
ws = wb.active
ws.title = "Decision Register"
ws.append(headers)
for row in rows:
    ws.append(row)

summary = wb.create_sheet("Summary")
for row in [
    ["Scope", "Keep", "Exclude", "Contextual only", "Total"],
    ["Child Immunization (54–62)", 7, 1, 1, 9],
    ["Child Preventive Supplementation (63)", 1, 0, 0, 1],
    ["Vaccination Provider Utilization (64–65)", 0, 0, 2, 2],
    ["All reviewed columns (54–65)", 8, 1, 3, 12],
    [],
    ["Count correction", "Seven immunization Keeps are listed: 54, 56, 57, 58, 59, 60, 61. Column 63 is a separate-category Keep, making eight Keeps overall."],
    [],
    ["Known correlation", "Pearson r"],
    ["Column 58 vs 62", 0.934],
    ["Column 59 vs 60", 0.584],
    ["Column 64 vs 65", -0.898],
    ["Column 58 vs 61", 0.192],
    ["Column 61 vs 62", 0.253],
]:
    summary.append(row)

notes = wb.create_sheet("Modelling Notes")
for row in [
    ["Topic", "Note"],
    ["Overall vs individual vaccination", "Compare Column 54 alone against selected individual vaccine indicators; do not automatically include every overlapping indicator."],
    ["Column 58 vs 62", "Correlation is high (≈0.934), but verify exact official definitions before treating them as interchangeable."],
    ["Measles doses", "Columns 59 and 60 cover different age groups/stages; r≈0.584 does not alone justify removing either."],
    ["Provider utilization", "Columns 64 and 65 are Contextual only; r≈−0.898. Neither direction automatically indicates better healthcare."],
    ["Reliability", "Retain parenthesized numeric estimates with a lower-reliability flag. Suppressed values remain missing; do not turn them into zero or automatically impute."],
    ["Provisional status", "Keep means candidate, not guaranteed final feature. Reassess redundancy, missingness, variation, category balance, and model performance later."],
    ["Category separation", "Column 63 belongs to Child Preventive Supplementation, not Child Immunization."],
]:
    notes.append(row)

for sheet in wb.worksheets:
    sheet.freeze_panes = "A2"
    sheet.auto_filter.ref = sheet.dimensions
    for cell in sheet[1]:
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = PatternFill("solid", fgColor="244062")
    for col in sheet.columns:
        max_len = max((len(str(c.value)) if c.value is not None else 0) for c in col)
        sheet.column_dimensions[get_column_letter(col[0].column)].width = min(max(max_len + 2, 14), 58)
    for row in sheet.iter_rows():
        for cell in row:
            cell.alignment = Alignment(wrap_text=True, vertical="top")

wb.save(OUTPUT)
print(f"Created: {OUTPUT}")

