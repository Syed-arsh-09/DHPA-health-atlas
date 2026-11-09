"""
DHPA Project — Step 4.2: Engine A Overall Clustering Benchmark
=============================================================
Benchmarks clustering algorithms on the preprocessed 706-district dataset:
  - Algorithms: K-Means, Agglomerative Hierarchical (Ward), GMM
  - Feature spaces:
      1. Full 47D standardized indicators (analysis-ready)
      2. Top 11 PCs (Kaiser criterion: 71.2% variance)
      3. Top 5 PCs (Macro gradients: 52.7% variance)
  - Cluster range: k = 3, 4, 5, 6, 7, 8
  - Evaluation metrics:
      * Silhouette Score (separation & cohesion)
      * Davies–Bouldin Index (cluster compactness / separation)
      * Calinski–Harabasz Index (variance ratio criterion)
      * Cluster Size Distribution (balance / degeneracy detection)
      * Cross-algorithm consensus (Adjusted Rand Index, NMI)

Outputs:
  outputs/reports/RHPA_Step4_2_Clustering_Benchmark.xlsx
  outputs/visuals/step4_2_clustering_metrics.png
  outputs/visuals/step4_2_elbow_curve.png
  outputs/visuals/step4_2_algorithm_agreement.png

Run from repository root:
    python src/step4_2_clustering_benchmark.py
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

from sklearn.cluster import KMeans, AgglomerativeClustering
from sklearn.mixture import GaussianMixture
from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score
from sklearn.metrics import adjusted_rand_score, normalized_mutual_info_score

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
PCA_COORDS_CSV = os.path.join(PROCESSED_DIR, "step4_1_pca_transformed.csv")


def load_datasets():
    """Load both 47D standardized and PCA-transformed coordinates."""
    df_raw = pd.read_csv(ANALYSIS_READY_CSV)
    df_pca = pd.read_csv(PCA_COORDS_CSV)

    identifiers = df_raw[["District Names", "State/UT"]].copy()
    X_47d = df_raw.drop(columns=["District Names", "State/UT"]).copy()

    # PCA spaces: Top 11 (Kaiser) and Top 5
    pc_cols_11 = [f"PC{i+1}" for i in range(11)]
    pc_cols_5 = [f"PC{i+1}" for i in range(5)]

    X_pca11 = df_pca[pc_cols_11].copy()
    X_pca5 = df_pca[pc_cols_5].copy()

    print(f"Loaded: {df_raw.shape[0]} districts")
    print(f"  Feature space 1 (Standardized 47D): {X_47d.shape}")
    print(f"  Feature space 2 (PCA Top 11 - 71% var): {X_pca11.shape}")
    print(f"  Feature space 3 (PCA Top 5 - 53% var):  {X_pca5.shape}")

    return identifiers, {"47D_Standardized": X_47d, "PCA_11D": X_pca11, "PCA_5D": X_pca5}


def evaluate_clustering(spaces_dict, k_range=range(3, 9)):
    """Run benchmark across spaces, algorithms, and k values."""
    records = []
    cluster_labels_dict = {}
    kmeans_inertia = {space_name: [] for space_name in spaces_dict}

    for space_name, X in spaces_dict.items():
        X_mat = X.values

        for k in k_range:
            # 1. K-Means
            km = KMeans(n_clusters=k, n_init=25, random_state=42)
            km_labels = km.fit_predict(X_mat)
            kmeans_inertia[space_name].append((k, km.inertia_))
            cluster_labels_dict[(space_name, "K-Means", k)] = km_labels

            sil_km = silhouette_score(X_mat, km_labels)
            db_km = davies_bouldin_score(X_mat, km_labels)
            ch_km = calinski_harabasz_score(X_mat, km_labels)
            counts_km = pd.Series(km_labels).value_counts().sort_index().values
            min_c_km = counts_km.min()
            max_c_km = counts_km.max()

            records.append({
                "Space": space_name,
                "Algorithm": "K-Means",
                "k": k,
                "Silhouette_Score": round(sil_km, 4),
                "Davies_Bouldin_Index": round(db_km, 4),
                "Calinski_Harabasz_Index": round(ch_km, 2),
                "Inertia_WCSS": round(km.inertia_, 2),
                "Min_Cluster_Size": min_c_km,
                "Max_Cluster_Size": max_c_km,
                "Size_Ratio_Max_Min": round(max_c_km / min_c_km, 2),
                "Cluster_Sizes": str(list(counts_km))
            })

            # 2. Agglomerative (Ward)
            agg = AgglomerativeClustering(n_clusters=k, linkage="ward")
            agg_labels = agg.fit_predict(X_mat)
            cluster_labels_dict[(space_name, "Agglomerative_Ward", k)] = agg_labels

            sil_agg = silhouette_score(X_mat, agg_labels)
            db_agg = davies_bouldin_score(X_mat, agg_labels)
            ch_agg = calinski_harabasz_score(X_mat, agg_labels)
            counts_agg = pd.Series(agg_labels).value_counts().sort_index().values
            min_c_agg = counts_agg.min()
            max_c_agg = counts_agg.max()

            records.append({
                "Space": space_name,
                "Algorithm": "Agglomerative_Ward",
                "k": k,
                "Silhouette_Score": round(sil_agg, 4),
                "Davies_Bouldin_Index": round(db_agg, 4),
                "Calinski_Harabasz_Index": round(ch_agg, 2),
                "Inertia_WCSS": np.nan,
                "Min_Cluster_Size": min_c_agg,
                "Max_Cluster_Size": max_c_agg,
                "Size_Ratio_Max_Min": round(max_c_agg / min_c_agg, 2),
                "Cluster_Sizes": str(list(counts_agg))
            })

            # 3. Gaussian Mixture Models (GMM)
            gmm = GaussianMixture(n_components=k, covariance_type="full", random_state=42, n_init=5)
            gmm_labels = gmm.fit_predict(X_mat)
            cluster_labels_dict[(space_name, "GMM", k)] = gmm_labels

            sil_gmm = silhouette_score(X_mat, gmm_labels)
            db_gmm = davies_bouldin_score(X_mat, gmm_labels)
            ch_gmm = calinski_harabasz_score(X_mat, gmm_labels)
            counts_gmm = pd.Series(gmm_labels).value_counts().sort_index().values
            min_c_gmm = counts_gmm.min()
            max_c_gmm = counts_gmm.max()

            records.append({
                "Space": space_name,
                "Algorithm": "GMM",
                "k": k,
                "Silhouette_Score": round(sil_gmm, 4),
                "Davies_Bouldin_Index": round(db_gmm, 4),
                "Calinski_Harabasz_Index": round(ch_gmm, 2),
                "Inertia_WCSS": np.nan,
                "Min_Cluster_Size": min_c_gmm,
                "Max_Cluster_Size": max_c_gmm,
                "Size_Ratio_Max_Min": round(max_c_gmm / min_c_gmm, 2),
                "Cluster_Sizes": str(list(counts_gmm))
            })

    results_df = pd.DataFrame(records)
    return results_df, cluster_labels_dict, kmeans_inertia


def compute_algorithm_agreement(cluster_labels_dict, space_name="47D_Standardized", k_values=(3, 4, 5, 6)):
    """Evaluate cross-algorithm consensus (ARI and NMI) for key k values."""
    agreement_rows = []

    for k in k_values:
        km = cluster_labels_dict.get((space_name, "K-Means", k))
        agg = cluster_labels_dict.get((space_name, "Agglomerative_Ward", k))
        gmm = cluster_labels_dict.get((space_name, "GMM", k))

        # K-Means vs Agglomerative
        ari_km_agg = adjusted_rand_score(km, agg)
        nmi_km_agg = normalized_mutual_info_score(km, agg)

        # K-Means vs GMM
        ari_km_gmm = adjusted_rand_score(km, gmm)
        nmi_km_gmm = normalized_mutual_info_score(km, gmm)

        # Agglomerative vs GMM
        ari_agg_gmm = adjusted_rand_score(agg, gmm)
        nmi_agg_gmm = normalized_mutual_info_score(agg, gmm)

        agreement_rows.append({
            "Space": space_name,
            "k": k,
            "Pair": "K-Means vs Agglomerative (Ward)",
            "Adjusted_Rand_Index": round(ari_km_agg, 4),
            "Normalized_Mutual_Info": round(nmi_km_agg, 4)
        })
        agreement_rows.append({
            "Space": space_name,
            "k": k,
            "Pair": "K-Means vs GMM",
            "Adjusted_Rand_Index": round(ari_km_gmm, 4),
            "Normalized_Mutual_Info": round(nmi_km_gmm, 4)
        })
        agreement_rows.append({
            "Space": space_name,
            "k": k,
            "Pair": "Agglomerative vs GMM",
            "Adjusted_Rand_Index": round(ari_agg_gmm, 4),
            "Normalized_Mutual_Info": round(nmi_agg_gmm, 4)
        })

    return pd.DataFrame(agreement_rows)


def plot_metrics(results_df):
    """Plot multi-panel metric comparison curves across k for all algorithms."""
    fig, axes = plt.subplots(1, 3, figsize=(16, 5), dpi=200)

    # Filter to 47D Standardized for main visualization
    df_plot = results_df[results_df["Space"] == "47D_Standardized"]
    algos = ["K-Means", "Agglomerative_Ward", "GMM"]
    colors = {"K-Means": "#2b5c8f", "Agglomerative_Ward": "#d95f02", "GMM": "#7570b3"}
    markers = {"K-Means": "o", "Agglomerative_Ward": "s", "GMM": "^"}

    # 1. Silhouette Score
    ax1 = axes[0]
    for algo in algos:
        sub = df_plot[df_plot["Algorithm"] == algo]
        ax1.plot(sub["k"], sub["Silhouette_Score"], label=algo, color=colors[algo],
                 marker=markers[algo], linewidth=2, markersize=6)
    ax1.set_title("Silhouette Score (Higher is Better)", fontsize=11, fontweight="bold")
    ax1.set_xlabel("Number of Clusters (k)", fontsize=10)
    ax1.set_ylabel("Silhouette Score", fontsize=10)
    ax1.grid(True, linestyle=":", alpha=0.5)
    ax1.legend(frameon=True)

    # 2. Davies–Bouldin Index
    ax2 = axes[1]
    for algo in algos:
        sub = df_plot[df_plot["Algorithm"] == algo]
        ax2.plot(sub["k"], sub["Davies_Bouldin_Index"], label=algo, color=colors[algo],
                 marker=markers[algo], linewidth=2, markersize=6)
    ax2.set_title("Davies–Bouldin Index (Lower is Better)", fontsize=11, fontweight="bold")
    ax2.set_xlabel("Number of Clusters (k)", fontsize=10)
    ax2.set_ylabel("Davies–Bouldin Index", fontsize=10)
    ax2.grid(True, linestyle=":", alpha=0.5)

    # 3. Calinski–Harabasz Index
    ax3 = axes[2]
    for algo in algos:
        sub = df_plot[df_plot["Algorithm"] == algo]
        ax3.plot(sub["k"], sub["Calinski_Harabasz_Index"], label=algo, color=colors[algo],
                 marker=markers[algo], linewidth=2, markersize=6)
    ax3.set_title("Calinski–Harabasz Index (Higher is Better)", fontsize=11, fontweight="bold")
    ax3.set_xlabel("Number of Clusters (k)", fontsize=10)
    ax3.set_ylabel("Calinski–Harabasz Index", fontsize=10)
    ax3.grid(True, linestyle=":", alpha=0.5)

    plt.suptitle("DHPA — Clustering Metric Benchmarks (Standardized 47D Feature Space)",
                 fontsize=13, fontweight="bold", y=1.02)
    fig.tight_layout()

    out_path = os.path.join(VISUAL_DIR, "step4_2_clustering_metrics.png")
    plt.savefig(out_path, bbox_inches="tight")
    plt.close()
    print(f"✅ Saved clustering metrics plot: {out_path}")


def plot_elbow_curve(kmeans_inertia):
    """Plot K-Means inertia / WCSS elbow curve across feature spaces."""
    fig, ax = plt.subplots(figsize=(8, 5), dpi=200)

    colors = {"47D_Standardized": "#2b5c8f", "PCA_11D": "#d95f02", "PCA_5D": "#1b9e77"}
    labels = {
        "47D_Standardized": "Standardized 47D Features",
        "PCA_11D": "PCA 11D (71% Variance)",
        "PCA_5D": "PCA 5D (53% Variance)"
    }

    for space, inertias in kmeans_inertia.items():
        ks = [x[0] for x in inertias]
        vals = [x[1] for x in inertias]
        # Normalize relative to k=3 to show comparative rate of decrease
        vals_norm = [v / vals[0] * 100 for v in vals]
        ax.plot(ks, vals_norm, label=labels[space], color=colors[space],
                marker="o", linewidth=2, markersize=6)

    ax.set_title("DHPA — K-Means Elbow Curve (% of WCSS at k=3)", fontsize=12, fontweight="bold")
    ax.set_xlabel("Number of Clusters (k)", fontsize=10, fontweight="bold")
    ax.set_ylabel("Normalized Inertia / WCSS (%)", fontsize=10, fontweight="bold")
    ax.grid(True, linestyle=":", alpha=0.5)
    ax.legend(frameon=True)

    fig.tight_layout()
    out_path = os.path.join(VISUAL_DIR, "step4_2_elbow_curve.png")
    plt.savefig(out_path, bbox_inches="tight")
    plt.close()
    print(f"✅ Saved elbow curve: {out_path}")


def main():
    print("=" * 75)
    print("DHPA — Step 4.2: Engine A Overall Clustering Benchmark")
    print("=" * 75)

    identifiers, spaces_dict = load_datasets()

    print("\n--- Running clustering grid search (k=3..8 across 3 algorithms & 3 spaces) ---")
    results_df, cluster_labels_dict, kmeans_inertia = evaluate_clustering(spaces_dict)

    # Cross-algorithm consensus
    agreement_df = compute_algorithm_agreement(cluster_labels_dict, space_name="47D_Standardized")

    # Save Excel report
    report_xlsx = os.path.join(REPORT_DIR, "RHPA_Step4_2_Clustering_Benchmark.xlsx")
    with pd.ExcelWriter(report_xlsx, engine="openpyxl") as writer:
        results_df.to_excel(writer, sheet_name="Benchmark_All", index=False)
        agreement_df.to_excel(writer, sheet_name="Algorithm_Agreement", index=False)

        # Summary for 47D
        df_47 = results_df[results_df["Space"] == "47D_Standardized"].sort_values(
            by=["Algorithm", "k"]
        )
        df_47.to_excel(writer, sheet_name="Summary_47D_Standardized", index=False)

    print(f"\n✅ Excel benchmark report: {report_xlsx}")

    # Generate visual charts
    plot_metrics(results_df)
    plot_elbow_curve(kmeans_inertia)

    # Print summary highlights to console
    print("\n" + "=" * 75)
    print("BENCHMARK SUMMARY (47D Standardized Space)")
    print("=" * 75)
    summary_print = results_df[results_df["Space"] == "47D_Standardized"][
        ["Algorithm", "k", "Silhouette_Score", "Davies_Bouldin_Index", "Calinski_Harabasz_Index", "Size_Ratio_Max_Min", "Cluster_Sizes"]
    ]
    print(summary_print.to_string(index=False))

    print("\n" + "=" * 75)
    print("ALGORITHM AGREEMENT (Adjusted Rand Index & NMI in 47D Space)")
    print("=" * 75)
    print(agreement_df.to_string(index=False))

    print("\n" + "=" * 75)
    print("STEP 4.2 BENCHMARK COMPLETE")
    print("=" * 75)


if __name__ == "__main__":
    main()

