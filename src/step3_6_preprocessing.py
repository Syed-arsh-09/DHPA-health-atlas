"""
DHPA Project — Step 3.6: Preprocessing and Feature Engineering
===============================================================
Handles missing values, applies transformations for skewed features,
standardises all indicators, and produces the analysis-ready dataset.

Run from repository root:
    python src/step3_6_preprocessing.py

Outputs:
    data/processed/step3_6_analysis_ready.csv
    data/processed/step3_6_reliability_matrix.csv
    outputs/reports/RHPA_Step3_6_Preprocessing.xlsx
"""

import os
import warnings
import numpy as np
import pandas as pd
from scipy import stats as scipy_stats

warnings.filterwarnings("ignore", category=FutureWarning)

# ═══════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLEANED_CSV = os.path.join(REPO_ROOT, "data", "processed",
                           "step1_district_health_cleaned.csv")
FLAGS_CSV = os.path.join(REPO_ROOT, "data", "processed",
                         "step1_indicator_quality_flags.csv")
REPORT_DIR = os.path.join(REPO_ROOT, "outputs", "reports")
PROCESSED_DIR = os.path.join(REPO_ROOT, "data", "processed")
os.makedirs(REPORT_DIR, exist_ok=True)

# Locked 47 Keep columns (approved Step 3.5)
KEEP_COLUMNS = [
    13, 14, 15, 17, 19, 21, 23, 24,            # Cats 2-3
    26, 33, 35,                                  # Cat 4
    37, 38, 39, 41, 42, 43, 44, 47, 48,         # Cat 5
    54, 60, 61, 63,                              # Cat 6
    66, 70,                                      # Cat 7
    72, 77,                                      # Cat 8
    78, 79, 82,                                  # Cat 9
    83, 84, 85,                                  # Cat 10
    86, 89,                                      # Cat 11
    93, 96,                                      # Cat 12
    99, 102,                                     # Cat 13
    103, 104, 105,                               # Cat 14
    106, 107, 108, 109,                          # Cat 15
]

# Skewness threshold for applying transformation
SKEW_THRESHOLD = 2.0


# ═══════════════════════════════════════════════════════════════════════
# 1. LOAD DATA
# ═══════════════════════════════════════════════════════════════════════

def load_data():
    """Load cleaned CSV and quality flags."""
    df = pd.read_csv(CLEANED_CSV)
    qf = pd.read_csv(FLAGS_CSV)
    print(f"Loaded: {df.shape[0]} districts × {df.shape[1]} columns")
    return df, qf


# ═══════════════════════════════════════════════════════════════════════
# 2. EXTRACT KEEP FEATURES
# ═══════════════════════════════════════════════════════════════════════

def extract_keep_features(df):
    """
    Extract the 47 locked Keep features and the two identifier columns.
    Returns the feature dataframe and the identifier dataframe.
    """
    col_names = list(df.columns)
    keep_names = [col_names[c - 1] for c in KEEP_COLUMNS]

    # Identifiers
    identifiers = df[["District Names", "State/UT"]].copy()

    # Features
    features = df[keep_names].copy()
    for col in features.columns:
        features[col] = pd.to_numeric(features[col], errors="coerce")

    # Rename columns to stable short names: C13, C14, ...
    col_rename = {keep_names[i]: f"C{KEEP_COLUMNS[i]}" for i in range(len(KEEP_COLUMNS))}
    features = features.rename(columns=col_rename)

    print(f"Extracted {features.shape[1]} Keep features for {features.shape[0]} districts")
    print(f"Missing cells: {features.isna().sum().sum()}")

    return identifiers, features, col_rename


# ═══════════════════════════════════════════════════════════════════════
# 3. BUILD RELIABILITY MATRIX
# ═══════════════════════════════════════════════════════════════════════

def build_reliability_matrix(df, qf, identifiers):
    """
    Create a district × feature reliability matrix.

    Values:
        0 = clean (unparenthesized, non-missing)
        1 = parenthesized (based on 25-49 unweighted cases)
        2 = suppressed (fewer than 25 unweighted cases → NaN)
    """
    col_names = list(df.columns)
    keep_names = [col_names[c - 1] for c in KEEP_COLUMNS]

    reliability = pd.DataFrame(0, index=range(len(df)),
                               columns=[f"C{c}" for c in KEEP_COLUMNS])

    for i, col_num in enumerate(KEEP_COLUMNS):
        col_name = keep_names[i]
        short_name = f"C{col_num}"

        # Mark suppressed / missing marker
        suppressed_flags = qf[(qf["indicator"] == col_name) &
                              (qf["quality_flag"].isin(["suppressed", "missing_marker"]))]
        for _, row in suppressed_flags.iterrows():
            idx = row["source_row_index"]
            if 0 <= idx < len(df):
                reliability.loc[idx, short_name] = 2

        # Mark parenthesized
        paren_flags = qf[(qf["indicator"] == col_name) &
                         (qf["quality_flag"] == "parenthesized")]
        for _, row in paren_flags.iterrows():
            idx = row["source_row_index"]
            if 0 <= idx < len(df):
                reliability.loc[idx, short_name] = 1

    # Attach identifiers
    reliability = pd.concat([identifiers.reset_index(drop=True),
                             reliability.reset_index(drop=True)], axis=1)

    # Summary
    total_cells = len(KEEP_COLUMNS) * len(df)
    clean_count = (reliability.iloc[:, 2:] == 0).sum().sum()
    paren_count = (reliability.iloc[:, 2:] == 1).sum().sum()
    supp_count = (reliability.iloc[:, 2:] == 2).sum().sum()

    print(f"\nReliability matrix: {total_cells} cells")
    print(f"  Clean (unparenthesized): {clean_count} ({clean_count/total_cells*100:.1f}%)")
    print(f"  Parenthesized:          {paren_count} ({paren_count/total_cells*100:.1f}%)")
    print(f"  Suppressed (NaN):       {supp_count} ({supp_count/total_cells*100:.1f}%)")

    return reliability


# ═══════════════════════════════════════════════════════════════════════
# 4. HANDLE MISSING VALUES
# ═══════════════════════════════════════════════════════════════════════

def handle_missing_values(features, identifiers, df):
    """
    Impute missing values using state-level median.
    Falls back to national median if the state has no valid observations.

    Only 42 cells are missing (Cols 54, 60, 61 — 13-14 districts each),
    all due to NFHS suppression (< 25 unweighted cases).
    """
    imputed = features.copy()
    states = df["State/UT"].values
    impute_log = []

    missing_before = imputed.isna().sum()
    cols_with_missing = missing_before[missing_before > 0]

    if len(cols_with_missing) == 0:
        print("\nNo missing values to impute.")
        return imputed, pd.DataFrame(impute_log)

    print(f"\nImputing {int(missing_before.sum())} missing cells across "
          f"{len(cols_with_missing)} features...")

    for col in cols_with_missing.index:
        national_median = imputed[col].median()

        missing_mask = imputed[col].isna()
        missing_indices = imputed.index[missing_mask]

        for idx in missing_indices:
            state = states[idx]
            district = identifiers.iloc[idx]["District Names"]

            # State-level median (excluding current district)
            state_mask = (pd.Series(states) == state) & (~imputed[col].isna())
            state_values = imputed.loc[state_mask, col]

            if len(state_values) >= 3:
                fill_value = round(state_values.median(), 2)
                method = "state_median"
            else:
                fill_value = round(national_median, 2)
                method = "national_median"

            imputed.at[idx, col] = fill_value

            impute_log.append({
                "District": district,
                "State": state,
                "Feature": col,
                "Imputed_Value": fill_value,
                "Method": method,
                "State_N": len(state_values),
                "National_Median": round(national_median, 2),
            })

    df_log = pd.DataFrame(impute_log)
    missing_after = imputed.isna().sum().sum()

    print(f"  State-median imputations: {len(df_log[df_log['Method'] == 'state_median'])}")
    print(f"  National-median fallback: {len(df_log[df_log['Method'] == 'national_median'])}")
    print(f"  Remaining missing: {missing_after}")

    return imputed, df_log


# ═══════════════════════════════════════════════════════════════════════
# 5. ASSESS AND APPLY TRANSFORMATIONS
# ═══════════════════════════════════════════════════════════════════════

def assess_skewness(features):
    """Identify features requiring transformation based on skewness."""
    skew_data = []
    for col in features.columns:
        series = features[col].dropna()
        skew = round(series.skew(), 2)
        needs_transform = abs(skew) > SKEW_THRESHOLD
        skew_data.append({
            "Feature": col,
            "Skewness": skew,
            "Abs_Skewness": abs(skew),
            "Needs_Transform": needs_transform,
        })

    df_skew = pd.DataFrame(skew_data).sort_values("Abs_Skewness", ascending=False)
    transform_needed = df_skew[df_skew["Needs_Transform"]]

    print(f"\nSkewness assessment (threshold = {SKEW_THRESHOLD}):")
    print(f"  Features needing transformation: {len(transform_needed)}")
    if len(transform_needed) > 0:
        for _, row in transform_needed.iterrows():
            print(f"    {row['Feature']}: skewness = {row['Skewness']}")

    return df_skew


def apply_yeo_johnson(features, skew_info):
    """
    Apply Yeo-Johnson power transformation to highly skewed features.

    Yeo-Johnson is preferred over log because:
    - It handles zero values (log does not without adding a constant).
    - It handles both positive and negative skew.
    - It optimises the power parameter automatically.
    """
    transformed = features.copy()
    transform_log = []

    to_transform = skew_info[skew_info["Needs_Transform"]]["Feature"].tolist()

    for col in to_transform:
        original = transformed[col].values
        skew_before = round(pd.Series(original).skew(), 4)

        # Fit Yeo-Johnson
        result, lmbda = scipy_stats.yeojohnson(original)
        transformed[col] = result
        skew_after = round(pd.Series(result).skew(), 4)

        transform_log.append({
            "Feature": col,
            "Method": "Yeo-Johnson",
            "Lambda": round(lmbda, 4),
            "Skewness_Before": skew_before,
            "Skewness_After": skew_after,
        })

        print(f"  {col}: skew {skew_before:+.2f} → {skew_after:+.2f} (λ={lmbda:.4f})")

    df_transform_log = pd.DataFrame(transform_log)
    return transformed, df_transform_log


# ═══════════════════════════════════════════════════════════════════════
# 6. STANDARDISE FEATURES
# ═══════════════════════════════════════════════════════════════════════

def standardise_zscore(features):
    """
    Apply z-score standardisation: (x - mean) / std.

    Z-score is standard for clustering and PCA because:
    - Each feature contributes equally regardless of original scale.
    - Preserves relative distances between observations.
    - Compatible with Euclidean distance metrics.
    """
    standardised = features.copy()
    scaling_params = []

    for col in standardised.columns:
        mean = standardised[col].mean()
        std = standardised[col].std()

        if std == 0:
            print(f"  WARNING: {col} has zero variance — skipping standardisation")
            scaling_params.append({
                "Feature": col, "Mean": mean, "Std": std, "Note": "ZERO VARIANCE"
            })
            continue

        standardised[col] = (standardised[col] - mean) / std
        scaling_params.append({
            "Feature": col, "Mean": round(mean, 4), "Std": round(std, 4), "Note": ""
        })

    df_params = pd.DataFrame(scaling_params)

    # Verify
    print(f"\nStandardisation complete:")
    print(f"  Mean range: [{standardised.mean().min():.6f}, {standardised.mean().max():.6f}]")
    print(f"  Std range:  [{standardised.std().min():.6f}, {standardised.std().max():.6f}]")

    return standardised, df_params


# ═══════════════════════════════════════════════════════════════════════
# 7. PRE-TRANSFORMATION DISTRIBUTION SNAPSHOT
# ═══════════════════════════════════════════════════════════════════════

def compute_distribution_stats(features, label=""):
    """Compute descriptive statistics for all features."""
    stats_rows = []
    for col in features.columns:
        series = features[col].dropna()
        n = len(series)
        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        outliers = int(((series < lower) | (series > upper)).sum())

        stats_rows.append({
            "Feature": col,
            "N": n,
            "Mean": round(series.mean(), 4),
            "Median": round(series.median(), 4),
            "SD": round(series.std(), 4),
            "Min": round(series.min(), 4),
            "Q1": round(q1, 4),
            "Q3": round(q3, 4),
            "Max": round(series.max(), 4),
            "IQR": round(iqr, 4),
            "Skewness": round(series.skew(), 4),
            "Kurtosis": round(series.kurtosis(), 4),
            "IQR_Outliers": outliers,
        })

    return pd.DataFrame(stats_rows)


# ═══════════════════════════════════════════════════════════════════════
# 8. MAIN PIPELINE
# ═══════════════════════════════════════════════════════════════════════

def main():
    print("=" * 70)
    print("DHPA — Step 3.6: Preprocessing and Feature Engineering")
    print("=" * 70)

    # --- Load ---
    df, qf = load_data()
    identifiers, features, col_rename = extract_keep_features(df)

    # --- Pre-imputation stats ---
    print("\n--- Pre-imputation distribution snapshot ---")
    stats_pre = compute_distribution_stats(features, "pre-imputation")

    # --- Reliability matrix ---
    print("\n--- Building reliability matrix ---")
    reliability = build_reliability_matrix(df, qf, identifiers)

    # --- Imputation ---
    print("\n--- Missing value imputation ---")
    imputed, impute_log = handle_missing_values(features, identifiers, df)

    # Verify no remaining missing
    assert imputed.isna().sum().sum() == 0, "Imputation incomplete!"

    # --- Post-imputation stats ---
    stats_post_impute = compute_distribution_stats(imputed, "post-imputation")

    # --- Skewness assessment ---
    print("\n--- Skewness assessment ---")
    skew_info = assess_skewness(imputed)

    # --- Transformation ---
    print("\n--- Applying Yeo-Johnson to highly skewed features ---")
    transformed, transform_log = apply_yeo_johnson(imputed, skew_info)

    # --- Post-transformation stats ---
    stats_post_transform = compute_distribution_stats(transformed, "post-transformation")

    # --- Standardisation ---
    print("\n--- Z-score standardisation ---")
    standardised, scaling_params = standardise_zscore(transformed)

    # --- Post-standardisation stats ---
    stats_final = compute_distribution_stats(standardised, "final")

    # ─────────────────────────────────────────────────────────────────
    # Save outputs
    # ─────────────────────────────────────────────────────────────────

    # 1. Analysis-ready CSV (standardised)
    analysis_ready = pd.concat([identifiers.reset_index(drop=True),
                                standardised.reset_index(drop=True)], axis=1)
    analysis_ready_path = os.path.join(PROCESSED_DIR, "step3_6_analysis_ready.csv")
    analysis_ready.to_csv(analysis_ready_path, index=False)
    print(f"\n✅ Analysis-ready dataset: {analysis_ready_path}")
    print(f"   Shape: {analysis_ready.shape}")

    # 2. Imputed (pre-standardisation) CSV — for interpretability
    imputed_named = pd.concat([identifiers.reset_index(drop=True),
                               imputed.reset_index(drop=True)], axis=1)
    imputed_path = os.path.join(PROCESSED_DIR, "step3_6_imputed.csv")
    imputed_named.to_csv(imputed_path, index=False)
    print(f"✅ Imputed dataset:        {imputed_path}")

    # 3. Reliability matrix CSV
    reliability_path = os.path.join(PROCESSED_DIR, "step3_6_reliability_matrix.csv")
    reliability.to_csv(reliability_path, index=False)
    print(f"✅ Reliability matrix:     {reliability_path}")

    # 4. Excel report
    report_path = os.path.join(REPORT_DIR, "RHPA_Step3_6_Preprocessing.xlsx")
    with pd.ExcelWriter(report_path, engine="openpyxl") as writer:
        # Sheet 1: Pre-imputation stats
        stats_pre.to_excel(writer, sheet_name="Stats_Pre_Imputation", index=False)

        # Sheet 2: Imputation log
        if len(impute_log) > 0:
            impute_log.to_excel(writer, sheet_name="Imputation_Log", index=False)

        # Sheet 3: Skewness assessment
        skew_info.to_excel(writer, sheet_name="Skewness_Assessment", index=False)

        # Sheet 4: Transformation log
        if len(transform_log) > 0:
            transform_log.to_excel(writer, sheet_name="Transformation_Log", index=False)

        # Sheet 5: Scaling parameters
        scaling_params.to_excel(writer, sheet_name="Scaling_Parameters", index=False)

        # Sheet 6: Post-imputation stats
        stats_post_impute.to_excel(writer, sheet_name="Stats_Post_Imputation", index=False)

        # Sheet 7: Post-transformation stats
        stats_post_transform.to_excel(writer, sheet_name="Stats_Post_Transform", index=False)

        # Sheet 8: Final (standardised) stats
        stats_final.to_excel(writer, sheet_name="Stats_Final", index=False)

        # Sheet 9: Column name mapping
        mapping_df = pd.DataFrame([
            {"Short_Name": f"C{c}", "Column_Num": c,
             "Original_Name": list(col_rename.keys())[i]}
            for i, c in enumerate(KEEP_COLUMNS)
        ])
        mapping_df.to_excel(writer, sheet_name="Column_Mapping", index=False)

    print(f"✅ Preprocessing report:   {report_path}")

    # ─────────────────────────────────────────────────────────────────
    # Summary
    # ─────────────────────────────────────────────────────────────────
    print("\n" + "=" * 70)
    print("PREPROCESSING PIPELINE SUMMARY")
    print("=" * 70)
    print(f"  Input:           706 districts × 47 features")
    print(f"  Missing before:  {features.isna().sum().sum()} cells")
    print(f"  Missing after:   {imputed.isna().sum().sum()} cells")
    print(f"  Transformed:     {len(transform_log)} features (Yeo-Johnson)")
    print(f"  Standardised:    All 47 features (z-score)")
    print(f"  Output shape:    {analysis_ready.shape}")
    print(f"  Ready for:       Clustering (Step 4)")


if __name__ == "__main__":
    main()

