"""
DHPA Project — Step 4.3: Engine A Deep Cluster Profiling & Characterisation
===========================================================================
Profiles the optimal k=4 Engine A healthcare clusters across all 706 districts:
  1. Fits final K-Means (k=4) on 47D standardized data (step3_6_analysis_ready.csv).
  2. Computes natural-unit cluster statistics (% and Rs) using step3_6_imputed.csv.
  3. Calculates relative health gaps (deficits/strengths) against national benchmarks.
  4. Cross-tabulates state and regional compositions.
  5. Audits estimate reliability (parenthesized/imputed) per cluster.
  6. Generates multi-domain radar charts, deficit profiles, and geographic charts.

Outputs:
  data/processed/step4_3_district_cluster_assignments.csv
  outputs/reports/RHPA_Step4_3_Cluster_Profiles.xlsx
  outputs/visuals/step4_3_cluster_radar_chart.png
  outputs/visuals/step4_3_cluster_deficits_barchart.png
  outputs/visuals/step4_3_state_distribution.png
  outputs/visuals/step4_3_clusters_pca_scatter.png

Run from repository root:
    python src/step4_3_cluster_profiling.py
"""

import os
import sys
import warnings
import numpy as np
import pandas as pd

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.environ["MPLCONFIGDIR"] = os.path.join(REPO_ROOT, "outputs", ".mpl_cache")
os.makedirs(os.environ["MPLCONFIGDIR"], exist_ok=True)

import matplotlib.pyplot as plt
import matplotlib
matplotlib.use("Agg")

from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_samples

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# Directories & Paths
# ---------------------------------------------------------------------------
PROCESSED_DIR = os.path.join(REPO_ROOT, "data", "processed")
REPORT_DIR = os.path.join(REPO_ROOT, "outputs", "reports")
VISUAL_DIR = os.path.join(REPO_ROOT, "outputs", "visuals")

os.makedirs(REPORT_DIR, exist_ok=True)
os.makedirs(VISUAL_DIR, exist_ok=True)

ANALYSIS_READY_CSV = os.path.join(PROCESSED_DIR, "step3_6_analysis_ready.csv")
IMPUTED_NATURAL_CSV = os.path.join(PROCESSED_DIR, "step3_6_imputed.csv")
RELIABILITY_CSV = os.path.join(PROCESSED_DIR, "step3_6_reliability_matrix.csv")
PCA_COORDS_CSV = os.path.join(PROCESSED_DIR, "step4_1_pca_transformed.csv")
PREPROC_REPORT_XLSX = os.path.join(REPORT_DIR, "RHPA_Step3_6_Preprocessing.xlsx")


# ---------------------------------------------------------------------------
# 1. Load Data & Fit Final k=4 Model
# ---------------------------------------------------------------------------
def load_and_cluster():
    df_ready = pd.read_csv(ANALYSIS_READY_CSV)
    df_imputed = pd.read_csv(IMPUTED_NATURAL_CSV)
    df_rel = pd.read_csv(RELIABILITY_CSV)
    df_pca = pd.read_csv(PCA_COORDS_CSV)

    identifiers = df_ready[["District Names", "State/UT"]].copy()
    X_std = df_ready.drop(columns=["District Names", "State/UT"]).copy()
    feature_cols = list(X_std.columns)

    # Column mapping
    mapping_df = pd.read_excel(PREPROC_REPORT_XLSX, sheet_name="Column_Mapping")
    name_map = dict(zip(mapping_df["Short_Name"], mapping_df["Original_Name"]))

    # Fit final K-Means (k=4)
    km = KMeans(n_clusters=4, n_init=50, random_state=42)
    raw_labels = km.fit_predict(X_std)

    # Distance to centroid & silhouette
    centroids = km.cluster_centers_
    distances = np.linalg.norm(X_std.values - centroids[raw_labels], axis=1)
    sil_values = silhouette_samples(X_std.values, raw_labels)

    # Map raw cluster IDs to ordered, substantive 1-indexed clusters:
    # We inspect the mean stunting (C78) and institutional delivery (C47) to assign intuitive IDs
    temp_df = pd.DataFrame({"raw": raw_labels, "C47": df_imputed["C47"], "C107": df_imputed["C107"], "C78": df_imputed["C78"]})
    means = temp_df.groupby("raw").mean()
    
    # 1: Advanced (High C47 > 95%, lowest C78)
    # 2: Intermediate (C47 ~ 90%, moderate C78)
    # 3: High Vulnerability (Lowest C47, highest C78)
    # 4: Hill / Northeastern (High C107 > 50%, low C47 < 75%)
    id_map = {}
    for raw_id in means.index:
        c47 = means.loc[raw_id, "C47"]
        c107 = means.loc[raw_id, "C107"]
        if c107 > 50:
            id_map[raw_id] = 4  # Hill / Northeast
        elif c47 > 95:
            id_map[raw_id] = 1  # Advanced
        elif c47 > 88:
            id_map[raw_id] = 2  # Intermediate
        else:
            id_map[raw_id] = 3  # High Vulnerability

    cluster_ids = np.array([id_map[r] for r in raw_labels])

    cluster_names = {
        1: "Cluster 1: Advanced Infrastructure & Emerging Lifestyle/NCD Risk",
        2: "Cluster 2: Intermediate / Progressing Health Profile",
        3: "Cluster 3: High Foundational Healthcare Vulnerability",
        4: "Cluster 4: Distinct Hill & Northeastern Health Geography"
    }

    assignments_df = identifiers.copy()
    assignments_df["Cluster_ID"] = cluster_ids
    assignments_df["Cluster_Name"] = [cluster_names[c] for c in cluster_ids]
    assignments_df["Distance_to_Centroid"] = np.round(distances, 4)
    assignments_df["Silhouette_Score"] = np.round(sil_values, 4)

    return assignments_df, df_imputed, df_rel, df_pca, feature_cols, name_map, cluster_names


# ---------------------------------------------------------------------------
# 2. Compute Natural-Unit Profiles & Deficits
# ---------------------------------------------------------------------------
def compute_cluster_profiles(assignments_df, df_imputed, feature_cols, name_map, cluster_names):
    df_comb = df_imputed.copy()
    df_comb["Cluster_ID"] = assignments_df["Cluster_ID"]

    profile_records = []
    nat_means = df_imputed[feature_cols].mean()

    for feat in feature_cols:
        nat_mean = nat_means[feat]
        col_name = name_map.get(feat, feat)

        row = {
            "Short_Name": feat,
            "Indicator_Name": col_name,
            "National_Mean": round(nat_mean, 2)
        }

        for c_id in sorted(cluster_names.keys()):
            c_vals = df_comb[df_comb["Cluster_ID"] == c_id][feat]
            c_mean = c_vals.mean()
            diff = c_mean - nat_mean
            row[f"Cluster_{c_id}_Mean"] = round(c_mean, 2)
            row[f"Cluster_{c_id}_Diff_vs_National"] = round(diff, 2)

        profile_records.append(row)

    profile_df = pd.DataFrame(profile_records)
    return profile_df


# ---------------------------------------------------------------------------
# 3. State & Reliability Cross-Tabulations
# ---------------------------------------------------------------------------
def cross_tabulations(assignments_df, df_rel, cluster_names):
    # State distribution
    state_ct = pd.crosstab(
        assignments_df["State/UT"],
        assignments_df["Cluster_Name"],
        margins=True,
        margins_name="Total_Districts"
    )

    # Reliability breakdown per cluster
    rel_feat = df_rel.drop(columns=["District Names", "State/UT"])
    # 0 = clean, 1 = parenthesized, 2 = suppressed/imputed
    paren_counts = (rel_feat == 1).sum(axis=1)
    supp_counts = (rel_feat == 2).sum(axis=1)

    rel_summary = pd.DataFrame({
        "Cluster_ID": assignments_df["Cluster_ID"],
        "Parenthesized_Cells": paren_counts,
        "Imputed_Cells": supp_counts
    })

    rel_by_cluster = rel_summary.groupby("Cluster_ID").agg(
        Districts=("Parenthesized_Cells", "count"),
        Total_Parenthesized=("Parenthesized_Cells", "sum"),
        Mean_Parenthesized_Per_District=("Parenthesized_Cells", "mean"),
        Total_Imputed=("Imputed_Cells", "sum"),
        Mean_Imputed_Per_District=("Imputed_Cells", "mean")
    ).round(2).reset_index()

    rel_by_cluster["Cluster_Name"] = rel_by_cluster["Cluster_ID"].map(cluster_names)

    return state_ct, rel_by_cluster


# ---------------------------------------------------------------------------
# 4. Visualizations
# ---------------------------------------------------------------------------
def plot_radar(profile_df, cluster_names):
    """Multi-domain radar chart comparing the 4 clusters across key dimensions."""
    # Select 8 representative key indicators across major domains
    radar_feats = [
        ("C14", "Sanitation (%)"),
        ("C19", "Female Literacy (%)"),
        ("C38", "ANC 4+ Visits (%)"),
        ("C47", "Institutional Delivery (%)"),
        ("C54", "Full Immunisation (%)"),
        ("C78", "Child Stunting (%)"),
        ("C84", "Women Obesity (%)"),
        ("C93", "High Blood Glucose (%)"),
    ]

    categories = [rf[1] for rf in radar_feats]
    N = len(categories)
    angles = [n / float(N) * 2 * np.pi for n in range(N)]
    angles += angles[:1]  # Complete loop

    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(polar=True), dpi=200)
    plt.xticks(angles[:-1], categories, color="#333333", size=10, fontweight="bold")
    ax.set_rlabel_position(30)
    plt.yticks([20, 40, 60, 80, 100], ["20%", "40%", "60%", "80%", "100%"], color="gray", size=8)
    plt.ylim(0, 105)

    colors = {1: "#2b5c8f", 2: "#1b9e77", 3: "#d95f02", 4: "#7570b3"}
    cluster_short = {
        1: "Cluster 1: Advanced / NCD Risk (N=205)",
        2: "Cluster 2: Intermediate / Progressing (N=256)",
        3: "Cluster 3: High Foundational Deficits (N=182)",
        4: "Cluster 4: Hill / Northeastern System (N=63)"
    }

    for c_id in [1, 2, 3, 4]:
        values = []
        for feat_code, _ in radar_feats:
            val = profile_df.loc[profile_df["Short_Name"] == feat_code, f"Cluster_{c_id}_Mean"].values[0]
            values.append(val)
        values += values[:1]
        ax.plot(angles, values, linewidth=2, linestyle="solid", label=cluster_short[c_id], color=colors[c_id])
        ax.fill(angles, values, color=colors[c_id], alpha=0.12)

    plt.title("DHPA — Comparative Healthcare Profiles Across 4 Clusters", size=13, fontweight="bold", pad=25)
    plt.legend(loc="upper right", bbox_to_anchor=(1.35, 1.1), frameon=True, fontsize=9)

    out_path = os.path.join(VISUAL_DIR, "step4_3_cluster_radar_chart.png")
    plt.savefig(out_path, bbox_inches="tight")
    plt.close()
    print(f"✅ Saved radar profile: {out_path}")


def plot_deficits_barchart(profile_df):
    """Bar chart showing relative percentage-point difference vs national benchmark."""
    # Key indicator deficits for Cluster 3 (Vulnerable) vs Cluster 1 (Advanced)
    key_indicators = [
        ("C47", "Institutional Births"),
        ("C38", "4+ ANC Visits"),
        ("C54", "Full Immunisation"),
        ("C14", "Improved Sanitation"),
        ("C19", "Female Literacy"),
        ("C78", "Child Stunting (Inverted)"),  # negative diff is good
        ("C84", "Women Obesity"),
        ("C93", "Blood Glucose High"),
        ("C107", "Men Tobacco Use"),
    ]

    fig, axes = plt.subplots(2, 2, figsize=(14, 10), dpi=200)
    clusters = [
        (1, "Cluster 1: Advanced Infrastructure & NCD Risk", axes[0, 0], "#2b5c8f"),
        (2, "Cluster 2: Intermediate / Progressing Tier", axes[0, 1], "#1b9e77"),
        (3, "Cluster 3: High Foundational Healthcare Vulnerability", axes[1, 0], "#d95f02"),
        (4, "Cluster 4: Hill & Northeastern Health Geography", axes[1, 1], "#7570b3")
    ]

    for c_id, title, ax, color in clusters:
        y_labels = [k[1] for k in key_indicators]
        diffs = [profile_df.loc[profile_df["Short_Name"] == k[0], f"Cluster_{c_id}_Diff_vs_National"].values[0] for k in key_indicators]
        
        y_pos = np.arange(len(diffs))
        bar_colors = [color if v >= 0 else "#999999" for v in diffs]
        ax.barh(y_pos, diffs, color=bar_colors, alpha=0.85, height=0.6)
        ax.set_yticks(y_pos)
        ax.set_yticklabels(y_labels, fontsize=9)
        ax.axvline(0, color="black", linestyle="--", linewidth=0.8)
        ax.set_xlabel("Percentage Point Difference vs. National Mean", fontsize=9, fontweight="bold")
        ax.set_title(title, fontsize=10, fontweight="bold")
        ax.grid(True, linestyle=":", alpha=0.4, axis="x")

    plt.suptitle("DHPA — Cluster Deviations from National Averages (% Points)", fontsize=13, fontweight="bold", y=1.02)
    fig.tight_layout()

    out_path = os.path.join(VISUAL_DIR, "step4_3_cluster_deficits_barchart.png")
    plt.savefig(out_path, bbox_inches="tight")
    plt.close()
    print(f"✅ Saved deficits barchart: {out_path}")


def plot_clusters_pca_scatter(assignments_df, df_pca):
    """Plot the 4 clusters on PC1 and PC2 axes."""
    fig, ax = plt.subplots(figsize=(9, 6), dpi=200)

    pc1 = df_pca["PC1"].values
    pc2 = df_pca["PC2"].values
    clusters = assignments_df["Cluster_ID"].values

    colors = {1: "#2b5c8f", 2: "#1b9e77", 3: "#d95f02", 4: "#7570b3"}
    labels = {
        1: "Cluster 1: Advanced / NCD Risk (N=205)",
        2: "Cluster 2: Intermediate (N=256)",
        3: "Cluster 3: Foundational Deficits (N=182)",
        4: "Cluster 4: Hill / Northeast (N=63)"
    }

    for c_id in [1, 2, 3, 4]:
        idx = np.where(clusters == c_id)[0]
        ax.scatter(pc1[idx], pc2[idx], label=labels[c_id], color=colors[c_id],
                   alpha=0.65, s=35, edgecolors="none")

    ax.axhline(0, color="black", linestyle="--", linewidth=0.8, alpha=0.4)
    ax.axvline(0, color="black", linestyle="--", linewidth=0.8, alpha=0.4)
    ax.set_xlabel("PC1: Socioeconomic & Nutritional Transition (21.8% Var)", fontsize=10, fontweight="bold")
    ax.set_ylabel("PC2: Healthcare Access vs Out-of-Pocket Burden (12.4% Var)", fontsize=10, fontweight="bold")
    ax.set_title("DHPA — 706 Districts Partitioned into 4 Healthcare Clusters", fontsize=12, fontweight="bold", pad=12)
    ax.legend(frameon=True, fontsize=9)
    ax.grid(True, linestyle=":", alpha=0.4)

    fig.tight_layout()
    out_path = os.path.join(VISUAL_DIR, "step4_3_clusters_pca_scatter.png")
    plt.savefig(out_path, bbox_inches="tight")
    plt.close()
    print(f"✅ Saved cluster PCA scatter: {out_path}")


# ---------------------------------------------------------------------------
# 5. Main Execution
# ---------------------------------------------------------------------------
def main():
    print("=" * 75)
    print("DHPA — Step 4.3: Engine A Deep Cluster Profiling & Characterisation")
    print("=" * 75)

    # 1. Fit & Map Clusters
    assignments_df, df_imputed, df_rel, df_pca, feature_cols, name_map, cluster_names = load_and_cluster()

    # Save assignments CSV
    out_csv = os.path.join(PROCESSED_DIR, "step4_3_district_cluster_assignments.csv")
    assignments_df.to_csv(out_csv, index=False)
    print(f"\n✅ District assignments saved: {out_csv}")
    print("\nCluster Size Counts:")
    for c_id, name in cluster_names.items():
        cnt = (assignments_df["Cluster_ID"] == c_id).sum()
        pct = cnt / len(assignments_df) * 100
        print(f"  {name}: {cnt} districts ({pct:.1f}%)")

    # 2. Compute Natural Profiles
    profile_df = compute_cluster_profiles(assignments_df, df_imputed, feature_cols, name_map, cluster_names)

    # 3. Cross-Tabulations
    state_ct, rel_by_cluster = cross_tabulations(assignments_df, df_rel, cluster_names)

    # 4. Save Comprehensive Excel Report
    report_xlsx = os.path.join(REPORT_DIR, "RHPA_Step4_3_Cluster_Profiles.xlsx")
    with pd.ExcelWriter(report_xlsx, engine="openpyxl") as writer:
        assignments_df.to_excel(writer, sheet_name="District_Assignments", index=False)
        profile_df.to_excel(writer, sheet_name="Indicator_Profiles_All47", index=False)
        state_ct.to_excel(writer, sheet_name="State_Distribution")
        rel_by_cluster.to_excel(writer, sheet_name="Reliability_By_Cluster", index=False)

    print(f"✅ Excel cluster profiles report: {report_xlsx}")

    # 5. Generate Visuals
    plot_radar(profile_df, cluster_names)
    plot_deficits_barchart(profile_df)
    plot_clusters_pca_scatter(assignments_df, df_pca)

    print("\n" + "=" * 75)
    print("STEP 4.3 PROFILING COMPLETE")
    print("=" * 75)


if __name__ == "__main__":
    main()

