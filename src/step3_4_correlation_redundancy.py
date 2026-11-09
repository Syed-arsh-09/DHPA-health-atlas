"""
DHPA Project — Step 3.4: Correlation and Redundancy Analysis
=============================================================
Calculates pairwise correlations across all 54 Keep indicators,
reports pairwise sample sizes, identifies highly correlated pairs,
and produces a structured redundancy assessment.

Run from repository root:
    python src/step3_4_correlation_redundancy.py

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

print(f"Loaded cleaned CSV: {df.shape[0]} districts × {df.shape[1]} columns")
print(f"Loaded quality flags: {qf.shape[0]} rows")

# Assign stable 1-based column numbers (matching the handover document)
col_names = list(df.columns)
col_num_map = {name: i + 1 for i, name in enumerate(col_names)}

# ---------------------------------------------------------------------------
# 2. Define the 54 Keep indicators by column number
# ---------------------------------------------------------------------------
KEEP_COLUMNS = [
    # Cat 1: Education/Demographic
    6,
    # Cat 2: Household Amenities & Financial Protection
    13, 14, 15, 17,
    # Cat 3: Education/Demographic/Reproductive & Menstrual Hygiene
    19, 21, 23, 24,
    # Cat 4: Family Planning
    26, 33, 35,
    # Cat 5: Maternal and Newborn Health
    37, 38, 39, 41, 42, 43, 44, 46, 47, 48, 50,
    # Cat 6: Child Immunisation & Supplementation
    54, 56, 57, 58, 59, 60, 61, 63,
    # Cat 7: Child Illness
    66, 70,
    # Cat 8: Infant & Young Child Feeding
    72, 77,
    # Cat 9: Child Nutritional Status
    78, 79, 82,
    # Cat 10: Adult Nutritional Status
    83, 84, 85,
    # Cat 11: Anaemia
    86, 89,
    # Cat 12: Blood Glucose
    93, 96,
    # Cat 13: Blood Pressure
    99, 102,
    # Cat 14: Preventive Screening
    103, 104, 105,
    # Cat 15: Health Risk Behaviours
    106, 107, 108, 109,
]

assert len(KEEP_COLUMNS) == 54, f"Expected 54 Keep columns, got {len(KEEP_COLUMNS)}"

# Map column numbers to column names (0-indexed in df)
keep_col_names = [col_names[c - 1] for c in KEEP_COLUMNS]

print(f"\n54 Keep indicators identified. Column numbers: {KEEP_COLUMNS}")

# ---------------------------------------------------------------------------
# 3. Extract the Keep-only sub-dataframe
# ---------------------------------------------------------------------------
df_keep = df[keep_col_names].copy()

# Verify all are numeric
for c in keep_col_names:
    df_keep[c] = pd.to_numeric(df_keep[c], errors="coerce")

print(f"\nKeep sub-dataframe shape: {df_keep.shape}")
print(f"Total cells: {df_keep.shape[0] * df_keep.shape[1]}")
print(f"Missing cells: {df_keep.isna().sum().sum()}")
print(f"Available cells: {df_keep.notna().sum().sum()}")

# ---------------------------------------------------------------------------
# 4. Compute pairwise Pearson correlation matrix
# ---------------------------------------------------------------------------
# Using pairwise-complete observations (default pandas behavior)
corr_matrix = df_keep.corr(method="pearson")

print(f"\nCorrelation matrix shape: {corr_matrix.shape}")

# ---------------------------------------------------------------------------
# 5. Compute pairwise sample sizes (number of jointly non-missing pairs)
# ---------------------------------------------------------------------------
# For each pair (i, j), count rows where both are non-NaN
notna_matrix = df_keep.notna().astype(int)
pairwise_n = notna_matrix.T.dot(notna_matrix)

print(f"Pairwise sample-size matrix shape: {pairwise_n.shape}")
print(f"Min pairwise N: {pairwise_n.min().min()}")
print(f"Max pairwise N: {pairwise_n.max().max()}")

# ---------------------------------------------------------------------------
# 6. Extract upper-triangle pairs and classify by correlation strength
# ---------------------------------------------------------------------------
pairs = []
n_features = len(keep_col_names)
for i in range(n_features):
    for j in range(i + 1, n_features):
        col_i = keep_col_names[i]
        col_j = keep_col_names[j]
        r = corr_matrix.iloc[i, j]
        n = pairwise_n.iloc[i, j]
        pairs.append({
            "Column_A_Num": KEEP_COLUMNS[i],
            "Column_B_Num": KEEP_COLUMNS[j],
            "Column_A_Name": col_i,
            "Column_B_Name": col_j,
            "Pearson_r": round(r, 4) if not np.isnan(r) else np.nan,
            "Abs_r": round(abs(r), 4) if not np.isnan(r) else np.nan,
            "Pairwise_N": int(n),
        })

df_pairs = pd.DataFrame(pairs)

# Classify correlation strength
def classify_corr(abs_r):
    if pd.isna(abs_r):
        return "Unavailable"
    elif abs_r >= 0.90:
        return "Very Strong (≥0.90)"
    elif abs_r >= 0.80:
        return "Strong (0.80–0.89)"
    elif abs_r >= 0.70:
        return "Moderate-Strong (0.70–0.79)"
    elif abs_r >= 0.50:
        return "Moderate (0.50–0.69)"
    else:
        return "Weak/Negligible (<0.50)"

df_pairs["Strength"] = df_pairs["Abs_r"].apply(classify_corr)

# Sort by absolute correlation descending
df_pairs = df_pairs.sort_values("Abs_r", ascending=False).reset_index(drop=True)

print(f"\nTotal unique pairs: {len(df_pairs)}")
print("\nCorrelation strength distribution:")
print(df_pairs["Strength"].value_counts().to_string())

# ---------------------------------------------------------------------------
# 7. Category mapping for cross-category analysis
# ---------------------------------------------------------------------------
CATEGORY_MAP = {
    6: "Cat01_Education_Demo",
    13: "Cat02_Household", 14: "Cat02_Household", 15: "Cat02_Household", 17: "Cat02_Household",
    19: "Cat03_Edu_Repro_Hygiene", 21: "Cat03_Edu_Repro_Hygiene",
    23: "Cat03_Edu_Repro_Hygiene", 24: "Cat03_Edu_Repro_Hygiene",
    26: "Cat04_Family_Planning", 33: "Cat04_Family_Planning", 35: "Cat04_Family_Planning",
    37: "Cat05_Maternal_Newborn", 38: "Cat05_Maternal_Newborn", 39: "Cat05_Maternal_Newborn",
    41: "Cat05_Maternal_Newborn", 42: "Cat05_Maternal_Newborn", 43: "Cat05_Maternal_Newborn",
    44: "Cat05_Maternal_Newborn", 46: "Cat05_Maternal_Newborn", 47: "Cat05_Maternal_Newborn",
    48: "Cat05_Maternal_Newborn", 50: "Cat05_Maternal_Newborn",
    54: "Cat06_Child_Immun", 56: "Cat06_Child_Immun", 57: "Cat06_Child_Immun",
    58: "Cat06_Child_Immun", 59: "Cat06_Child_Immun", 60: "Cat06_Child_Immun",
    61: "Cat06_Child_Immun", 63: "Cat06_Child_Immun",
    66: "Cat07_Child_Illness", 70: "Cat07_Child_Illness",
    72: "Cat08_Infant_Feeding", 77: "Cat08_Infant_Feeding",
    78: "Cat09_Child_Nutrition", 79: "Cat09_Child_Nutrition", 82: "Cat09_Child_Nutrition",
    83: "Cat10_Adult_Nutrition", 84: "Cat10_Adult_Nutrition", 85: "Cat10_Adult_Nutrition",
    86: "Cat11_Anaemia", 89: "Cat11_Anaemia",
    93: "Cat12_Blood_Glucose", 96: "Cat12_Blood_Glucose",
    99: "Cat13_Blood_Pressure", 102: "Cat13_Blood_Pressure",
    103: "Cat14_Prev_Screening", 104: "Cat14_Prev_Screening", 105: "Cat14_Prev_Screening",
    106: "Cat15_Risk_Behaviours", 107: "Cat15_Risk_Behaviours",
    108: "Cat15_Risk_Behaviours", 109: "Cat15_Risk_Behaviours",
}

df_pairs["Category_A"] = df_pairs["Column_A_Num"].map(CATEGORY_MAP)
df_pairs["Category_B"] = df_pairs["Column_B_Num"].map(CATEGORY_MAP)
df_pairs["Cross_Category"] = df_pairs["Category_A"] != df_pairs["Category_B"]

# ---------------------------------------------------------------------------
# 8. Print key findings
# ---------------------------------------------------------------------------
THRESHOLDS = [0.90, 0.80, 0.70]

for thresh in THRESHOLDS:
    subset = df_pairs[df_pairs["Abs_r"] >= thresh]
    within = subset[~subset["Cross_Category"]]
    cross = subset[subset["Cross_Category"]]
    print(f"\n{'='*70}")
    print(f"|r| >= {thresh}: {len(subset)} pairs ({len(within)} within-category, {len(cross)} cross-category)")
    print(f"{'='*70}")
    if len(subset) > 0:
        for _, row in subset.iterrows():
            tag = "CROSS" if row["Cross_Category"] else "WITHIN"
            print(f"  [{tag}] Col {row['Column_A_Num']:>3d} × Col {row['Column_B_Num']:>3d}  "
                  f"r = {row['Pearson_r']:+.4f}  N = {row['Pairwise_N']:>4d}  "
                  f"({row['Category_A']} / {row['Category_B']})")

# ---------------------------------------------------------------------------
# 9. Distribution statistics for all 54 Keep features (verification)
# ---------------------------------------------------------------------------
stats_rows = []
for idx, col_num in enumerate(KEEP_COLUMNS):
    col_name = keep_col_names[idx]
    series = df_keep[col_name].dropna()
    n = len(series)
    if n == 0:
        stats_rows.append({
            "Column_Num": col_num, "Column_Name": col_name, "Available": 0,
            "Mean": np.nan, "Median": np.nan, "SD": np.nan,
            "Min": np.nan, "Q1": np.nan, "Q3": np.nan, "Max": np.nan,
            "IQR": np.nan, "Skewness": np.nan, "IQR_Outliers": 0,
        })
        continue
    q1 = series.quantile(0.25)
    q3 = series.quantile(0.75)
    iqr = q3 - q1
    lower = q1 - 1.5 * iqr
    upper = q3 + 1.5 * iqr
    outliers = int(((series < lower) | (series > upper)).sum())
    stats_rows.append({
        "Column_Num": col_num,
        "Column_Name": col_name,
        "Available": n,
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
print("\n" + "=" * 70)
print("DISTRIBUTION STATISTICS FOR 54 KEEP FEATURES")
print("=" * 70)
print(df_stats.to_string(index=False))

# ---------------------------------------------------------------------------
# 10. Quality flag summary for 54 Keep features
# ---------------------------------------------------------------------------
# Extract suppressed and parenthesized counts per indicator
# Quality flags CSV has: source_row_index, State/UT, District Names, indicator, original_value, flag_type
flag_summary = []
for col_num in KEEP_COLUMNS:
    col_name = col_names[col_num - 1]
    indicator_flags = qf[qf["indicator"] == col_name]
    suppressed = int((indicator_flags["quality_flag"] == "suppressed").sum())
    parenthesized = int((indicator_flags["quality_flag"] == "parenthesized").sum())
    flag_summary.append({
        "Column_Num": col_num,
        "Column_Name": col_name,
        "Suppressed": suppressed,
        "Parenthesized": parenthesized,
    })

df_flags = pd.DataFrame(flag_summary)
print("\n" + "=" * 70)
print("QUALITY FLAGS FOR 54 KEEP FEATURES")
print("=" * 70)
print(df_flags.to_string(index=False))

# ---------------------------------------------------------------------------
# 11. Save outputs to Excel
# ---------------------------------------------------------------------------
output_file = os.path.join(REPORT_DIR, "RHPA_Step3_4_Correlation_Redundancy.xlsx")

with pd.ExcelWriter(output_file, engine="openpyxl") as writer:
    # Sheet 1: Full correlation matrix (with column numbers as labels)
    corr_labeled = corr_matrix.copy()
    corr_labeled.index = [f"C{KEEP_COLUMNS[i]}" for i in range(n_features)]
    corr_labeled.columns = [f"C{KEEP_COLUMNS[i]}" for i in range(n_features)]
    corr_labeled.to_excel(writer, sheet_name="Correlation_Matrix")

    # Sheet 2: Pairwise sample sizes
    pn_labeled = pairwise_n.copy()
    pn_labeled.index = [f"C{KEEP_COLUMNS[i]}" for i in range(n_features)]
    pn_labeled.columns = [f"C{KEEP_COLUMNS[i]}" for i in range(n_features)]
    pn_labeled.to_excel(writer, sheet_name="Pairwise_N")

    # Sheet 3: All pairs sorted by |r|
    df_pairs.to_excel(writer, sheet_name="All_Pairs", index=False)

    # Sheet 4: High-correlation pairs only (|r| >= 0.70)
    df_high = df_pairs[df_pairs["Abs_r"] >= 0.70].copy()
    df_high.to_excel(writer, sheet_name="High_Correlation_Pairs", index=False)

    # Sheet 5: Distribution statistics
    df_stats.to_excel(writer, sheet_name="Distribution_Stats", index=False)

    # Sheet 6: Quality flags
    df_flags.to_excel(writer, sheet_name="Quality_Flags", index=False)

print(f"\n✅ Report saved to: {output_file}")
print(f"   Sheets: Correlation_Matrix, Pairwise_N, All_Pairs, High_Correlation_Pairs, Distribution_Stats, Quality_Flags")
