"""
DHPA Project — Step 3.5: Final Feature Selection
=================================================
Applies approved Step 3.4 redundancy changes (7 cols Keep → Contextual),
performs sensitivity analysis on deferred borderline pairs,
assesses category balance, and produces the definitive feature set.

Run from repository root:
    python src/step3_5_final_feature_selection.py

Outputs saved to: outputs/reports/
"""

import os
import sys
import warnings
import numpy as np
import pandas as pd

warnings.filterwarnings("ignore", category=FutureWarning)

# ---------------------------------------------------------------------------
# 0. Paths
# ---------------------------------------------------------------------------
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLEANED_CSV = os.path.join(REPO_ROOT, "data", "processed", "step1_district_health_cleaned.csv")
FLAGS_CSV = os.path.join(REPO_ROOT, "data", "processed", "step1_indicator_quality_flags.csv")
REPORT_DIR = os.path.join(REPO_ROOT, "outputs", "reports")
os.makedirs(REPORT_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# 1. Load data
# ---------------------------------------------------------------------------
df = pd.read_csv(CLEANED_CSV)
qf = pd.read_csv(FLAGS_CSV)
col_names = list(df.columns)

print(f"Loaded cleaned CSV: {df.shape[0]} districts × {df.shape[1]} columns")

# ---------------------------------------------------------------------------
# 2. Define the UPDATED feature classification after Step 3.4
# ---------------------------------------------------------------------------

# Original 54 Keep columns
ORIGINAL_KEEP = [
    6, 13, 14, 15, 17, 19, 21, 23, 24, 26, 33, 35,
    37, 38, 39, 41, 42, 43, 44, 46, 47, 48, 50,
    54, 56, 57, 58, 59, 60, 61, 63,
    66, 70, 72, 77, 78, 79, 82, 83, 84, 85, 86, 89,
    93, 96, 99, 102, 103, 104, 105, 106, 107, 108, 109,
]

# Step 3.4 approved moves: Keep → Contextual
STEP34_MOVES = [6, 46, 50, 56, 57, 58, 59]

# Updated 47 Keep columns
KEEP_COLUMNS = [c for c in ORIGINAL_KEEP if c not in STEP34_MOVES]
assert len(KEEP_COLUMNS) == 47, f"Expected 47 Keep columns, got {len(KEEP_COLUMNS)}"

print(f"\n47 Keep indicators after Step 3.4: {KEEP_COLUMNS}")

# Category mapping for all 47
CATEGORY_MAP = {
    # Cat 2: Household Amenities & Financial Protection (Col 6 moved to Contextual)
    13: ("Cat02", "Household Amenities & Financial Protection"),
    14: ("Cat02", "Household Amenities & Financial Protection"),
    15: ("Cat02", "Household Amenities & Financial Protection"),
    17: ("Cat02", "Household Amenities & Financial Protection"),
    # Cat 3: Education/Demographic/Reproductive & Menstrual Hygiene
    19: ("Cat03", "Education, Demographic/Reproductive & Menstrual Hygiene"),
    21: ("Cat03", "Education, Demographic/Reproductive & Menstrual Hygiene"),
    23: ("Cat03", "Education, Demographic/Reproductive & Menstrual Hygiene"),
    24: ("Cat03", "Education, Demographic/Reproductive & Menstrual Hygiene"),
    # Cat 4: Family Planning
    26: ("Cat04", "Family Planning"),
    33: ("Cat04", "Family Planning"),
    35: ("Cat04", "Family Planning"),
    # Cat 5: Maternal and Newborn Health (Cols 46, 50 moved to Contextual)
    37: ("Cat05", "Maternal & Newborn Health"),
    38: ("Cat05", "Maternal & Newborn Health"),
    39: ("Cat05", "Maternal & Newborn Health"),
    41: ("Cat05", "Maternal & Newborn Health"),
    42: ("Cat05", "Maternal & Newborn Health"),
    43: ("Cat05", "Maternal & Newborn Health"),
    44: ("Cat05", "Maternal & Newborn Health"),
    47: ("Cat05", "Maternal & Newborn Health"),
    48: ("Cat05", "Maternal & Newborn Health"),
    # Cat 6: Child Immunisation (Cols 56, 57, 58, 59 moved to Contextual)
    54: ("Cat06", "Child Immunisation & Supplementation"),
    60: ("Cat06", "Child Immunisation & Supplementation"),
    61: ("Cat06", "Child Immunisation & Supplementation"),
    63: ("Cat06", "Child Immunisation & Supplementation"),
    # Cat 7: Child Illness
    66: ("Cat07", "Child Illness"),
    70: ("Cat07", "Child Illness"),
    # Cat 8: Infant & Young Child Feeding
    72: ("Cat08", "Infant & Young Child Feeding"),
    77: ("Cat08", "Infant & Young Child Feeding"),
    # Cat 9: Child Nutritional Status
    78: ("Cat09", "Child Nutritional Status"),
    79: ("Cat09", "Child Nutritional Status"),
    82: ("Cat09", "Child Nutritional Status"),
    # Cat 10: Adult Nutritional Status
    83: ("Cat10", "Adult Nutritional Status"),
    84: ("Cat10", "Adult Nutritional Status"),
    85: ("Cat10", "Adult Nutritional Status"),
    # Cat 11: Anaemia
    86: ("Cat11", "Anaemia"),
    89: ("Cat11", "Anaemia"),
    # Cat 12: Blood Glucose
    93: ("Cat12", "Blood Glucose"),
    96: ("Cat12", "Blood Glucose"),
    # Cat 13: Blood Pressure
    99: ("Cat13", "Blood Pressure"),
    102: ("Cat13", "Blood Pressure"),
    # Cat 14: Preventive Screening
    103: ("Cat14", "Preventive Health Screening"),
    104: ("Cat14", "Preventive Health Screening"),
    105: ("Cat14", "Preventive Health Screening"),
    # Cat 15: Health Risk Behaviours
    106: ("Cat15", "Health Risk Behaviours"),
    107: ("Cat15", "Health Risk Behaviours"),
    108: ("Cat15", "Health Risk Behaviours"),
    109: ("Cat15", "Health Risk Behaviours"),
}

# ---------------------------------------------------------------------------
# 3. Category balance analysis
# ---------------------------------------------------------------------------
print("\n" + "=" * 70)
print("CATEGORY BALANCE — 47 KEEP FEATURES")
print("=" * 70)

cat_counts = {}
for col_num in KEEP_COLUMNS:
    cat_id, cat_name = CATEGORY_MAP[col_num]
    if cat_id not in cat_counts:
        cat_counts[cat_id] = {"name": cat_name, "count": 0, "columns": []}
    cat_counts[cat_id]["count"] += 1
    cat_counts[cat_id]["columns"].append(col_num)

balance_rows = []
for cat_id in sorted(cat_counts.keys()):
    info = cat_counts[cat_id]
    pct = info["count"] / 47 * 100
    balance_rows.append({
        "Category": cat_id,
        "Name": info["name"],
        "Keep_Count": info["count"],
        "Pct_of_47": round(pct, 1),
        "Columns": str(info["columns"]),
    })
    print(f"  {cat_id} — {info['name']}: {info['count']} features ({pct:.1f}%)  {info['columns']}")

df_balance = pd.DataFrame(balance_rows)

# ---------------------------------------------------------------------------
# 4. Extract data for the 47 Keep features
# ---------------------------------------------------------------------------
keep_col_names = [col_names[c - 1] for c in KEEP_COLUMNS]
df_keep = df[keep_col_names].copy()
for c in keep_col_names:
    df_keep[c] = pd.to_numeric(df_keep[c], errors="coerce")

print(f"\nKeep sub-dataframe: {df_keep.shape}")
print(f"Missing cells: {df_keep.isna().sum().sum()}")

# ---------------------------------------------------------------------------
# 5. Correlation matrix for the 47 Keep features
# ---------------------------------------------------------------------------
corr_matrix = df_keep.corr(method="pearson")

# Pairwise sample sizes
notna_matrix = df_keep.notna().astype(int)
pairwise_n = notna_matrix.T.dot(notna_matrix)

# ---------------------------------------------------------------------------
# 6. SENSITIVITY ANALYSIS: Deferred borderline pairs
# ---------------------------------------------------------------------------
print("\n" + "=" * 70)
print("SENSITIVITY ANALYSIS — DEFERRED BORDERLINE PAIRS")
print("=" * 70)

deferred_pairs = [
    (37, 38, "First-trimester ANC check-up", "4+ ANC visits"),
    (38, 43, "4+ ANC visits", "Maternal postnatal care within 2 days"),
    (43, 47, "Maternal postnatal care within 2 days", "Institutional births"),
]

for col_a, col_b, label_a, label_b in deferred_pairs:
    name_a = col_names[col_a - 1]
    name_b = col_names[col_b - 1]
    series_a = df[name_a].dropna()
    series_b = df[name_b].dropna()

    # Pairwise correlation
    both_valid = df[[name_a, name_b]].dropna()
    r = both_valid[name_a].corr(both_valid[name_b])
    n = len(both_valid)

    # Statistics
    print(f"\n--- Col {col_a} × Col {col_b}: r = {r:.4f}, N = {n} ---")
    print(f"  Col {col_a}: {label_a}")
    print(f"    Mean={series_a.mean():.2f}, SD={series_a.std():.2f}, "
          f"Range=[{series_a.min():.1f}, {series_a.max():.1f}]")
    print(f"  Col {col_b}: {label_b}")
    print(f"    Mean={series_b.mean():.2f}, SD={series_b.std():.2f}, "
          f"Range=[{series_b.min():.1f}, {series_b.max():.1f}]")

    # What does retaining vs removing each pair member tell us?
    # Check how many other high correlations each has
    for col_num, label in [(col_a, label_a), (col_b, label_b)]:
        idx = KEEP_COLUMNS.index(col_num)
        high_corrs = []
        for j, other_num in enumerate(KEEP_COLUMNS):
            if j == idx:
                continue
            r_val = corr_matrix.iloc[idx, j]
            if abs(r_val) >= 0.60:
                high_corrs.append((other_num, r_val))
        high_corrs.sort(key=lambda x: abs(x[1]), reverse=True)
        print(f"  Col {col_num} correlations |r| >= 0.60 with other Keep features:")
        for other, rv in high_corrs:
            print(f"    Col {other:>3d}: r = {rv:+.4f}")

# ---------------------------------------------------------------------------
# 7. Extended correlation network for Cat 5 (Maternal/Newborn)
# ---------------------------------------------------------------------------
print("\n" + "=" * 70)
print("CATEGORY 5 CORRELATION SUB-MATRIX (9 KEEP FEATURES)")
print("=" * 70)

cat5_cols = [37, 38, 39, 41, 42, 43, 44, 47, 48]
cat5_names = [col_names[c - 1] for c in cat5_cols]
cat5_corr = df[cat5_names].corr()

# Print compact correlation matrix
print("\nCorrelation matrix (Cat 5 — Maternal/Newborn):")
header = "       " + "  ".join([f"C{c:>3d}" for c in cat5_cols])
print(header)
for i, col_i in enumerate(cat5_cols):
    row_vals = []
    for j, col_j in enumerate(cat5_cols):
        if j <= i:
            row_vals.append(f"{cat5_corr.iloc[i, j]:+.3f}")
        else:
            row_vals.append("     ")
    print(f"C{col_i:>3d}  " + "  ".join(row_vals))

# ---------------------------------------------------------------------------
# 8. Check remaining |r| >= 0.70 pairs after Step 3.4 reductions
# ---------------------------------------------------------------------------
print("\n" + "=" * 70)
print("REMAINING HIGH-CORRELATION PAIRS (|r| >= 0.70) IN 47 KEEP SET")
print("=" * 70)

remaining_high = []
n_feat = len(KEEP_COLUMNS)
for i in range(n_feat):
    for j in range(i + 1, n_feat):
        r = corr_matrix.iloc[i, j]
        if abs(r) >= 0.70:
            remaining_high.append({
                "Col_A": KEEP_COLUMNS[i],
                "Col_B": KEEP_COLUMNS[j],
                "r": round(r, 4),
                "Cat_A": CATEGORY_MAP[KEEP_COLUMNS[i]][0],
                "Cat_B": CATEGORY_MAP[KEEP_COLUMNS[j]][0],
                "Cross": CATEGORY_MAP[KEEP_COLUMNS[i]][0] != CATEGORY_MAP[KEEP_COLUMNS[j]][0],
                "N": int(pairwise_n.iloc[i, j]),
            })

df_remaining_high = pd.DataFrame(remaining_high).sort_values("r", key=abs, ascending=False)
print(f"\nTotal pairs with |r| >= 0.70: {len(df_remaining_high)}")
for _, row in df_remaining_high.iterrows():
    tag = "CROSS" if row["Cross"] else "WITHIN"
    print(f"  [{tag}] Col {row['Col_A']:>3d} × Col {row['Col_B']:>3d}  "
          f"r = {row['r']:+.4f}  N = {row['N']:>4d}  "
          f"({row['Cat_A']} / {row['Cat_B']})")

# ---------------------------------------------------------------------------
# 9. Distribution statistics for all 47 Keep features
# ---------------------------------------------------------------------------
stats_rows = []
for idx, col_num in enumerate(KEEP_COLUMNS):
    col_name = keep_col_names[idx]
    series = df_keep[col_name].dropna()
    n = len(series)
    q1 = series.quantile(0.25)
    q3 = series.quantile(0.75)
    iqr = q3 - q1
    lower = q1 - 1.5 * iqr
    upper = q3 + 1.5 * iqr
    outliers = int(((series < lower) | (series > upper)).sum())

    # Get quality flags
    indicator_flags = qf[qf["indicator"] == col_name]
    suppressed = int((indicator_flags["quality_flag"] == "suppressed").sum())
    parenthesized = int((indicator_flags["quality_flag"] == "parenthesized").sum())

    cat_id, cat_name = CATEGORY_MAP[col_num]

    stats_rows.append({
        "Column_Num": col_num,
        "Category": cat_id,
        "Category_Name": cat_name,
        "Column_Name": col_name,
        "Decision": "Keep",
        "Available": n,
        "Suppressed": suppressed,
        "Parenthesized": parenthesized,
        "Mean": round(series.mean(), 2),
        "Median": round(series.median(), 2),
        "SD": round(series.std(), 2),
        "Min": round(series.min(), 2),
        "Q1": round(q1, 2),
        "Q3": round(q3, 2),
        "Max": round(series.max(), 2),
        "IQR": round(iqr, 2),
        "Skewness": round(series.skew(), 2),
        "IQR_Outliers": outliers,
    })

df_stats = pd.DataFrame(stats_rows)

# ---------------------------------------------------------------------------
# 10. Complete classification of all 109 columns (updated)
# ---------------------------------------------------------------------------

# Original Exclude columns
EXCLUDE_COLS = [40, 45, 52, 62]

# Structural/metadata columns
STRUCTURAL_COLS = [1, 2, 3, 4, 5]

# Original contextual (from Step 2) + Step 3.4 moves
ORIGINAL_CONTEXTUAL = [
    7, 8, 9, 10, 11, 12, 16, 18, 20, 22, 25, 27, 28, 29, 30, 31, 32, 34, 36,
    49, 51, 53, 55, 64, 65, 67, 68, 69, 71, 73, 74, 75, 76, 80, 81,
    87, 88, 90, 91, 92, 94, 95, 97, 98, 100, 101,
]
CONTEXTUAL_COLS = sorted(set(ORIGINAL_CONTEXTUAL + STEP34_MOVES))

# Verify all 109 accounted for
all_classified = sorted(KEEP_COLUMNS + CONTEXTUAL_COLS + EXCLUDE_COLS + STRUCTURAL_COLS)
assert len(all_classified) == 109, f"Expected 109, got {len(all_classified)}"
assert all_classified == list(range(1, 110)), "Not all columns accounted for!"

full_class_rows = []
for col_num in range(1, 110):
    col_name = col_names[col_num - 1]
    if col_num in STRUCTURAL_COLS:
        decision = "Structural/Metadata"
    elif col_num in KEEP_COLUMNS:
        decision = "Keep"
    elif col_num in EXCLUDE_COLS:
        decision = "Exclude"
    elif col_num in CONTEXTUAL_COLS:
        decision = "Contextual"
        # Mark those moved in Step 3.4
        if col_num in STEP34_MOVES:
            decision = "Contextual (was Keep; moved Step 3.4)"
    else:
        decision = "UNCLASSIFIED"

    full_class_rows.append({
        "Column_Num": col_num,
        "Column_Name": col_name,
        "Decision": decision,
    })

df_full_class = pd.DataFrame(full_class_rows)

print("\n" + "=" * 70)
print("UPDATED CLASSIFICATION SUMMARY")
print("=" * 70)
print(df_full_class["Decision"].value_counts().to_string())

# ---------------------------------------------------------------------------
# 11. Save outputs
# ---------------------------------------------------------------------------
output_file = os.path.join(REPORT_DIR, "RHPA_Step3_5_Final_Feature_Selection.xlsx")

with pd.ExcelWriter(output_file, engine="openpyxl") as writer:
    # Sheet 1: Final 47 Keep features with full statistics
    df_stats.to_excel(writer, sheet_name="Final_47_Keep_Features", index=False)

    # Sheet 2: Category balance
    df_balance.to_excel(writer, sheet_name="Category_Balance", index=False)

    # Sheet 3: Remaining high correlations in 47-feature set
    if len(df_remaining_high) > 0:
        df_remaining_high.to_excel(writer, sheet_name="Remaining_High_Correlations", index=False)

    # Sheet 4: Updated 47x47 correlation matrix
    corr_labeled = corr_matrix.copy()
    corr_labeled.index = [f"C{KEEP_COLUMNS[i]}" for i in range(n_feat)]
    corr_labeled.columns = [f"C{KEEP_COLUMNS[i]}" for i in range(n_feat)]
    corr_labeled.to_excel(writer, sheet_name="Correlation_Matrix_47")

    # Sheet 5: Full 109-column classification (updated)
    df_full_class.to_excel(writer, sheet_name="Full_Classification_109", index=False)

    # Sheet 6: Step 3.4 changes log
    changes_log = pd.DataFrame([
        {"Column": c, "From": "Keep", "To": "Contextual",
         "Step": "3.4", "Reason": reason}
        for c, reason in [
            (6, "r=0.927 with Col 19 (literacy); Col 19 covers reproductive-age population"),
            (46, "r=0.946 with Col 43 (maternal PNC); same-encounter redundancy"),
            (50, "r=0.946 with Col 47 (institutional births); near-definitional overlap"),
            (56, "r=0.707 with Col 58; BCG is subset of full vaccination (Col 54)"),
            (57, "r=0.966 with Col 54; polio-3 is subset of full vaccination"),
            (58, "r=0.869 with Col 54; Penta/DPT-3 is subset of full vaccination"),
            (59, "r=0.856 with Col 54; MCV-1 is subset of full vaccination"),
        ]
    ])
    changes_log.to_excel(writer, sheet_name="Step34_Changes_Log", index=False)

print(f"\n✅ Report saved to: {output_file}")
print(f"   Sheets: Final_47_Keep_Features, Category_Balance, Remaining_High_Correlations,")
print(f"           Correlation_Matrix_47, Full_Classification_109, Step34_Changes_Log")

