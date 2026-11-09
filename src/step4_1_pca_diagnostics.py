"""
DHPA Project — Step 4.1: PCA Diagnostics & Dimensionality Exploration
======================================================================
Fits Principal Component Analysis (PCA) on the 47 locked, preprocessed
healthcare indicators for 706 districts.

Evaluates:
  1. Eigenvalues, explained variance ratios, and cumulative variance.
  2. Kaiser-Guttman criterion (eigenvalue > 1.0) and scree elbow.
  3. Loadings and public health interpretation of top principal components.
  4. 2D projection (PC1 vs PC2) of Indian districts.

Outputs:
  data/processed/step4_1_pca_transformed.csv
  outputs/reports/RHPA_Step4_1_PCA_Diagnostics.xlsx
  outputs/visuals/step4_1_scree_plot.png
  outputs/visuals/step4_1_pc1_pc2_scatter.png
  outputs/visuals/step4_1_top_loadings.png

Run from repository root:
    python src/step4_1_pca_diagnostics.py
"""

import os
import sys
import warnings
import numpy as np
import pandas as pd

# Set Matplotlib cache dir before importing pyplot to avoid permission warnings
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.environ["MPLCONFIGDIR"] = os.path.join(REPO_ROOT, "outputs", ".mpl_cache")
os.makedirs(os.environ["MPLCONFIGDIR"], exist_ok=True)

import matplotlib.pyplot as plt
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend

from sklearn.decomposition import PCA

warnings.filterwarnings("ignore", category=FutureWarning)

# ---------------------------------------------------------------------------
# 0. Paths & Directories
# ---------------------------------------------------------------------------
PROCESSED_DIR = os.path.join(REPO_ROOT, "data", "processed")
REPORT_DIR = os.path.join(REPO_ROOT, "outputs", "reports")
VISUAL_DIR = os.path.join(REPO_ROOT, "outputs", "visuals")

os.makedirs(REPORT_DIR, exist_ok=True)
os.makedirs(VISUAL_DIR, exist_ok=True)

ANALYSIS_READY_CSV = os.path.join(PROCESSED_DIR, "step3_6_analysis_ready.csv")
PREPROC_REPORT_XLSX = os.path.join(REPORT_DIR, "RHPA_Step3_6_Preprocessing.xlsx")


def load_data():
    """Load analysis-ready standardized dataset and column mapping."""
    df = pd.read_csv(ANALYSIS_READY_CSV)
    print(f"Loaded analysis-ready data: {df.shape[0]} districts × {df.shape[1]} columns")

    identifiers = df[["District Names", "State/UT"]].copy()
    features = df.drop(columns=["District Names", "State/UT"]).copy()

    # Load column mapping
    mapping_df = pd.read_excel(PREPROC_REPORT_XLSX, sheet_name="Column_Mapping")
    mapping_dict = dict(zip(mapping_df["Short_Name"], mapping_df["Original_Name"]))

    return identifiers, features, mapping_df, mapping_dict


def run_pca(features):
    """Fit full PCA and return model, transformed coords, and variance summary."""
    n_features = features.shape[1]
    pca = PCA(n_components=n_features, random_state=42)
    pca_coords = pca.fit_transform(features)

    eigenvalues = pca.explained_variance_
    var_ratio = pca.explained_variance_ratio_ * 100
    cum_var_ratio = np.cumsum(var_ratio)

    pc_names = [f"PC{i+1}" for i in range(n_features)]

    variance_df = pd.DataFrame({
        "Component": pc_names,
        "Eigenvalue": np.round(eigenvalues, 4),
        "Variance_Explained_Pct": np.round(var_ratio, 2),
        "Cumulative_Variance_Pct": np.round(cum_var_ratio, 2),
    })

    return pca, pca_coords, variance_df, pc_names


def extract_loadings(pca, features, mapping_df, pc_names):
    """
    Extract eigenvector weights and correlation loadings.
    Correlation loading = eigenvector * sqrt(eigenvalue)
    """
    feature_cols = list(features.columns)

    # Eigenvector matrix (features x components)
    eigenvectors = pd.DataFrame(
        pca.components_.T,
        index=feature_cols,
        columns=pc_names
    )

    # Correlation loadings (r between feature and PC)
    corr_loadings = pd.DataFrame(
        pca.components_.T * np.sqrt(pca.explained_variance_),
        index=feature_cols,
        columns=pc_names
    )

    # Add descriptive columns
    eigenvectors.insert(0, "Original_Name", [mapping_df.loc[mapping_df["Short_Name"] == c, "Original_Name"].values[0] for c in feature_cols])
    eigenvectors.insert(0, "Column_Num", [mapping_df.loc[mapping_df["Short_Name"] == c, "Column_Num"].values[0] for c in feature_cols])
    eigenvectors.insert(0, "Short_Name", feature_cols)

    corr_loadings.insert(0, "Original_Name", [mapping_df.loc[mapping_df["Short_Name"] == c, "Original_Name"].values[0] for c in feature_cols])
    corr_loadings.insert(0, "Column_Num", [mapping_df.loc[mapping_df["Short_Name"] == c, "Column_Num"].values[0] for c in feature_cols])
    corr_loadings.insert(0, "Short_Name", feature_cols)

    return eigenvectors, corr_loadings


def get_top_loadings_summary(corr_loadings, n_top=5, n_pcs=5):
    """Summarise top positive and negative loading indicators for top PCs."""
    summary_rows = []

    for i in range(1, n_pcs + 1):
        pc_col = f"PC{i}"
        sorted_pc = corr_loadings.sort_values(by=pc_col, ascending=False)

        top_pos = sorted_pc.head(n_top)
        top_neg = sorted_pc.tail(n_top).iloc[::-1]  # Most negative first

        for rank, (_, row) in enumerate(top_pos.iterrows(), 1):
            summary_rows.append({
                "Component": pc_col,
                "Direction": "Positive (+)",
                "Rank": rank,
                "Short_Name": row["Short_Name"],
                "Column_Num": row["Column_Num"],
                "Correlation_Loading": round(row[pc_col], 4),
                "Indicator_Name": row["Original_Name"]
            })

        for rank, (_, row) in enumerate(top_neg.iterrows(), 1):
            summary_rows.append({
                "Component": pc_col,
                "Direction": "Negative (-)",
                "Rank": rank,
                "Short_Name": row["Short_Name"],
                "Column_Num": row["Column_Num"],
                "Correlation_Loading": round(row[pc_col], 4),
                "Indicator_Name": row["Original_Name"]
            })

    return pd.DataFrame(summary_rows)


def plot_scree(variance_df):
    """Plot dual-axis scree plot with Kaiser-Guttman criterion."""
    fig, ax1 = plt.subplots(figsize=(10, 5), dpi=200)

    x = np.arange(1, len(variance_df) + 1)
    y_var = variance_df["Variance_Explained_Pct"].values
    y_cum = variance_df["Cumulative_Variance_Pct"].values
    eigenvalues = variance_df["Eigenvalue"].values

    # Bar plot for individual variance
    bars = ax1.bar(x, y_var, color="#2b5c8f", alpha=0.75, width=0.6, label="Variance Explained (%)")
    ax1.set_xlabel("Principal Component", fontsize=11, fontweight="bold")
    ax1.set_ylabel("Variance Explained per Component (%)", color="#2b5c8f", fontsize=11, fontweight="bold")
    ax1.tick_params(axis="y", labelcolor="#2b5c8f")
    ax1.set_xlim(0, len(variance_df) + 1)
    ax1.set_ylim(0, max(y_var) + 5)

    # Line plot for cumulative variance
    ax2 = ax1.twinx()
    ax2.plot(x, y_cum, color="#d95f02", marker="o", markersize=4, linewidth=2, label="Cumulative Variance (%)")
    ax2.set_ylabel("Cumulative Variance Explained (%)", color="#d95f02", fontsize=11, fontweight="bold")
    ax2.tick_params(axis="y", labelcolor="#d95f02")
    ax2.set_ylim(0, 105)

    # Horizontal benchmark lines for cumulative variance
    ax2.axhline(70, color="gray", linestyle="--", alpha=0.6, label="70% Benchmark")
    ax2.axhline(80, color="dimgray", linestyle=":", alpha=0.6, label="80% Benchmark")

    # Kaiser line on secondary plot or annotation
    kaiser_count = (eigenvalues >= 1.0).sum()
    ax1.axvline(kaiser_count + 0.5, color="#7570b3", linestyle="-.", linewidth=1.5,
                label=f"Kaiser Criterion (Eigenvalue ≥ 1.0: {kaiser_count} PCs)")

    plt.title("DHPA — PCA Scree Plot (47 Preprocessed Healthcare Indicators)", fontsize=13, fontweight="bold", pad=12)
    fig.tight_layout()

    out_path = os.path.join(VISUAL_DIR, "step4_1_scree_plot.png")
    plt.savefig(out_path, bbox_inches="tight")
    plt.close()
    print(f"✅ Saved scree plot: {out_path}")


def plot_pc1_pc2_scatter(identifiers, pca_coords, variance_df):
    """Plot 2D district projection on PC1 vs PC2."""
    fig, ax = plt.subplots(figsize=(10, 7), dpi=200)

    pc1 = pca_coords[:, 0]
    pc2 = pca_coords[:, 1]
    var1 = variance_df.loc[0, "Variance_Explained_Pct"]
    var2 = variance_df.loc[1, "Variance_Explained_Pct"]

    # Assign broad regional groupings for visual clarity
    states = identifiers["State/UT"].values
    
    # Define broad regional mapping for India's 36 States/UTs
    region_map = {
        "Jammu & Kashmir": "North", "Himachal Pradesh": "North", "Punjab": "North", "Uttarakhand": "North",
        "Haryana": "North", "Delhi": "North", "Chandigarh": "North", "Ladakh": "North", "Rajasthan": "North",
        "Uttar Pradesh": "Central", "Madhya Pradesh": "Central", "Chhattisgarh": "Central",
        "Bihar": "East", "Jharkhand": "East", "West Bengal": "East", "Odisha": "East",
        "Assam": "Northeast", "Sikkim": "Northeast", "Meghalaya": "Northeast", "Tripura": "Northeast",
        "Mizoram": "Northeast", "Manipur": "Northeast", "Nagaland": "Northeast", "Arunachal Pradesh": "Northeast",
        "Gujarat": "West", "Maharastra": "West", "Goa": "West", "Dadra & Nagar Haveli and Daman & Diu": "West",
        "Andhra Pradesh": "South", "Karnataka": "South", "Kerala": "South", "Tamil Nadu": "South",
        "Telangana": "South", "Puducherry": "South", "Lakshadweep": "South", "Andaman & Nicobar Islands": "South"
    }
    
    regions = [region_map.get(s, "Other") for s in states]
    unique_regions = sorted(list(set(regions)))
    colors = {"North": "#377eb8", "Central": "#e41a1c", "East": "#ff7f00", 
              "Northeast": "#984ea3", "West": "#4daf4a", "South": "#a65628", "Other": "#999999"}

    for r in unique_regions:
        idx = [i for i, reg in enumerate(regions) if reg == r]
        ax.scatter(pc1[idx], pc2[idx], label=r, color=colors.get(r, "#333333"), alpha=0.6, s=35, edgecolors="none")

    ax.axhline(0, color="black", linestyle="--", linewidth=0.8, alpha=0.5)
    ax.axvline(0, color="black", linestyle="--", linewidth=0.8, alpha=0.5)

    ax.set_xlabel(f"Principal Component 1 ({var1:.1f}% Variance)", fontsize=11, fontweight="bold")
    ax.set_ylabel(f"Principal Component 2 ({var2:.1f}% Variance)", fontsize=11, fontweight="bold")
    ax.set_title("DHPA — 706 Districts Projected onto PC1 and PC2", fontsize=13, fontweight="bold", pad=12)
    ax.legend(title="Geographic Region", bbox_to_anchor=(1.02, 1), loc="upper left", frameon=True)
    ax.grid(True, linestyle=":", alpha=0.4)

    fig.tight_layout()
    out_path = os.path.join(VISUAL_DIR, "step4_1_pc1_pc2_scatter.png")
    plt.savefig(out_path, bbox_inches="tight")
    plt.close()
    print(f"✅ Saved PC1-PC2 scatter plot: {out_path}")


def plot_top_loadings(corr_loadings, n_top=6):
    """Plot horizontal bar charts of top positive and negative loadings for PC1 and PC2."""
    fig, axes = plt.subplots(1, 2, figsize=(14, 6), dpi=200)

    for idx, pc in enumerate(["PC1", "PC2"]):
        ax = axes[idx]
        sorted_pc = corr_loadings.sort_values(by=pc, ascending=False)
        
        top_pos = sorted_pc.head(n_top)
        top_neg = sorted_pc.tail(n_top)
        combined = pd.concat([top_neg, top_pos])
        
        y_labels = [f"{row['Short_Name']}: {row['Original_Name'][:38]}..." if len(row['Original_Name']) > 38 
                    else f"{row['Short_Name']}: {row['Original_Name']}" for _, row in combined.iterrows()]
        values = combined[pc].values
        bar_colors = ["#d95f02" if v < 0 else "#1b9e77" for v in values]

        y_pos = np.arange(len(values))
        ax.barh(y_pos, values, color=bar_colors, alpha=0.8, height=0.6)
        ax.set_yticks(y_pos)
        ax.set_yticklabels(y_labels, fontsize=8)
        ax.axvline(0, color="black", linestyle="-", linewidth=0.8)
        ax.set_xlabel("Correlation Loading (r with PC)", fontsize=10, fontweight="bold")
        ax.set_title(f"Dominant Indicator Loadings on {pc}", fontsize=11, fontweight="bold")
        ax.grid(True, linestyle=":", alpha=0.4, axis="x")

    plt.suptitle("DHPA — Indicator Factor Loadings on Dominant Axes", fontsize=13, fontweight="bold", y=1.02)
    fig.tight_layout()

    out_path = os.path.join(VISUAL_DIR, "step4_1_top_loadings.png")
    plt.savefig(out_path, bbox_inches="tight")
    plt.close()
    print(f"✅ Saved top loadings plot: {out_path}")


def main():
    print("=" * 75)
    print("DHPA — Step 4.1: PCA Diagnostics & Dimensionality Exploration")
    print("=" * 75)

    # 1. Load data
    identifiers, features, mapping_df, mapping_dict = load_data()

    # 2. Run PCA
    pca, pca_coords, variance_df, pc_names = run_pca(features)

    # Key variance metrics
    kaiser_count = int((variance_df["Eigenvalue"] >= 1.0).sum())
    p50_count = int((variance_df["Cumulative_Variance_Pct"] < 50.0).sum()) + 1
    p60_count = int((variance_df["Cumulative_Variance_Pct"] < 60.0).sum()) + 1
    p70_count = int((variance_df["Cumulative_Variance_Pct"] < 70.0).sum()) + 1
    p80_count = int((variance_df["Cumulative_Variance_Pct"] < 80.0).sum()) + 1

    print("\n--- Variance Explained Breakdown ---")
    print(f"  Total indicators:       47")
    print(f"  PC1 Explained Variance: {variance_df.loc[0, 'Variance_Explained_Pct']:.2f}% (Eigenvalue = {variance_df.loc[0, 'Eigenvalue']:.2f})")
    print(f"  PC2 Explained Variance: {variance_df.loc[1, 'Variance_Explained_Pct']:.2f}% (Eigenvalue = {variance_df.loc[1, 'Eigenvalue']:.2f})")
    print(f"  PC3 Explained Variance: {variance_df.loc[2, 'Variance_Explained_Pct']:.2f}% (Eigenvalue = {variance_df.loc[2, 'Eigenvalue']:.2f})")
    print(f"  PC4 Explained Variance: {variance_df.loc[3, 'Variance_Explained_Pct']:.2f}% (Eigenvalue = {variance_df.loc[3, 'Eigenvalue']:.2f})")
    print(f"  PC5 Explained Variance: {variance_df.loc[4, 'Variance_Explained_Pct']:.2f}% (Eigenvalue = {variance_df.loc[4, 'Eigenvalue']:.2f})")
    print(f"  Top 5 PCs Cumulative:   {variance_df.loc[4, 'Cumulative_Variance_Pct']:.2f}%")
    print(f"  Kaiser-Guttman (λ ≥ 1): {kaiser_count} components (capturing {variance_df.loc[kaiser_count-1, 'Cumulative_Variance_Pct']:.1f}% variance)")
    print(f"  Components for ≥ 50%:   {p50_count} PCs ({variance_df.loc[p50_count-1, 'Cumulative_Variance_Pct']:.1f}%)")
    print(f"  Components for ≥ 60%:   {p60_count} PCs ({variance_df.loc[p60_count-1, 'Cumulative_Variance_Pct']:.1f}%)")
    print(f"  Components for ≥ 70%:   {p70_count} PCs ({variance_df.loc[p70_count-1, 'Cumulative_Variance_Pct']:.1f}%)")
    print(f"  Components for ≥ 80%:   {p80_count} PCs ({variance_df.loc[p80_count-1, 'Cumulative_Variance_Pct']:.1f}%)")

    # 3. Loadings analysis
    eigenvectors, corr_loadings = extract_loadings(pca, features, mapping_df, pc_names)
    loadings_summary = get_top_loadings_summary(corr_loadings, n_top=5, n_pcs=5)

    print("\n--- Substantive Meaning of Top Components ---")
    for i in range(1, 4):
        pc = f"PC{i}"
        pos = loadings_summary[(loadings_summary["Component"] == pc) & (loadings_summary["Direction"] == "Positive (+)")]
        neg = loadings_summary[(loadings_summary["Component"] == pc) & (loadings_summary["Direction"] == "Negative (-)")]
        print(f"\n{pc} ({variance_df.loc[i-1, 'Variance_Explained_Pct']:.1f}% of variance):")
        print("  Top Positive Loadings:")
        for _, r in pos.head(3).iterrows():
            print(f"    + {r['Short_Name']} (r = {r['Correlation_Loading']:+.3f}): {r['Indicator_Name'][:60]}")
        print("  Top Negative Loadings:")
        for _, r in neg.head(3).iterrows():
            print(f"    - {r['Short_Name']} (r = {r['Correlation_Loading']:+.3f}): {r['Indicator_Name'][:60]}")

    # 4. Save Transformed PCA Coordinates
    pca_coords_df = pd.concat([
        identifiers.reset_index(drop=True),
        pd.DataFrame(np.round(pca_coords, 4), columns=pc_names)
    ], axis=1)

    out_pca_csv = os.path.join(PROCESSED_DIR, "step4_1_pca_transformed.csv")
    pca_coords_df.to_csv(out_pca_csv, index=False)
    print(f"\n✅ PCA transformed coordinates: {out_pca_csv}")

    # 5. Save Diagnostic Visualizations
    plot_scree(variance_df)
    plot_pc1_pc2_scatter(identifiers, pca_coords, variance_df)
    plot_top_loadings(corr_loadings)

    # 6. Save Excel Report
    report_xlsx = os.path.join(REPORT_DIR, "RHPA_Step4_1_PCA_Diagnostics.xlsx")
    with pd.ExcelWriter(report_xlsx, engine="openpyxl") as writer:
        variance_df.to_excel(writer, sheet_name="Variance_Explained", index=False)
        loadings_summary.to_excel(writer, sheet_name="Top_Loadings_Summary", index=False)
        corr_loadings.to_excel(writer, sheet_name="Correlation_Loadings", index=False)
        eigenvectors.to_excel(writer, sheet_name="Eigenvector_Weights", index=False)
        pca_coords_df.iloc[:, :12].to_excel(writer, sheet_name="District_Coordinates_Top10", index=False)

    print(f"✅ Excel diagnostic report:    {report_xlsx}")
    print("\n" + "=" * 75)
    print("STEP 4.1 DIAGNOSTICS COMPLETE")
    print("=" * 75)


if __name__ == "__main__":
    main()

