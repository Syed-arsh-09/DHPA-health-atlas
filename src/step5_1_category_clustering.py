"""
DHPA Project — Step 5.1: Engine B Category-Specific Clustering & Overlap Analysis
================================================================================
Implements Engine B: Independent domain-specific clustering across 6 core domains:
  1. Maternal & Newborn Health (9 indicators)
  2. Child Immunisation & Preventative Care (4 indicators)
  3. Child & Adult Nutrition / Anaemia (8 indicators)
  4. Family Planning & Reproductive Health (7 indicators)
  5. NCDs & Preventive Screening (7 indicators)
  6. Household Amenities & Healthcare Financing (4 indicators)

Key Operations:
  - Clusters districts within each domain into 3 tiers:
      * Low Vulnerability (Tier 1: High Performance)
      * Moderate Vulnerability (Tier 2: Intermediate)
      * High Vulnerability (Tier 3: Priority Deficit)
  - Computes the Compound Multi-Domain Vulnerability Index (count of Tier 3 domains, 0 to 6).
  - Cross-tabulates Engine A overall clusters with Engine B domain vulnerabilities.
  - Detects hidden vulnerabilities in seemingly advanced or intermediate districts.

Outputs:
  data/processed/step5_1_engine_b_domain_clusters.csv
  outputs/reports/RHPA_Step5_1_Engine_B_Analysis.xlsx
  outputs/visuals/step5_1_compound_vulnerability_dist.png
  outputs/visuals/step5_1_domain_vulnerability_heatmap.png
  outputs/visuals/step5_1_engine_a_vs_b_crosstab.png

Run from repository root:
    python src/step5_1_category_clustering.py
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
ENGINE_A_CSV = os.path.join(PROCESSED_DIR, "step4_3_district_cluster_assignments.csv")
PREPROC_REPORT_XLSX = os.path.join(REPORT_DIR, "RHPA_Step3_6_Preprocessing.xlsx")

# ---------------------------------------------------------------------------
# Domain Definitions (Engine B)
# ---------------------------------------------------------------------------
DOMAINS = {
    "Maternal_Newborn": {
        "features": ["C37", "C38", "C39", "C41", "C42", "C43", "C44", "C47", "C48"],
        "name": "Maternal & Newborn Care",
        # Defining positive vs deficit orientation:
        # Lower C47, C38, C43, C39, C41, C42 indicates vulnerability
        "vulnerability_anchor": "C47",  # Institutional delivery: lowest = highest vulnerability
        "vulnerability_direction": "low"
    },
    "Child_Immunisation": {
        "features": ["C54", "C60", "C61", "C63"],
        "name": "Child Immunisation & Supplementation",
        "vulnerability_anchor": "C54",  # Full vaccination: lowest = highest vulnerability
        "vulnerability_direction": "low"
    },
    "Nutrition_Anaemia": {
        "features": ["C78", "C79", "C82", "C83", "C84", "C85", "C86", "C89"],
        "name": "Nutritional Status & Anaemia",
        "vulnerability_anchor": "C78",  # Stunting: highest = highest vulnerability
        "vulnerability_direction": "high"
    },
    "FamilyPlanning_Repro": {
        "features": ["C19", "C21", "C23", "C24", "C26", "C33", "C35"],
        "name": "Reproductive Health & Family Planning",
        "vulnerability_anchor": "C26",  # Modern contraceptive use: lowest = highest vulnerability
        "vulnerability_direction": "low"
    },
    "NCD_Screening": {
        "features": ["C93", "C96", "C99", "C102", "C103", "C104", "C105"],
        "name": "NCD Risk & Preventive Screening",
        # In NCDs, vulnerability represents high chronic disease burden (C93, C99) and low screening (C103)
        "vulnerability_anchor": "C93",  # High blood glucose: highest = highest chronic risk
        "vulnerability_direction": "high"
    },
    "Household_Amenities": {
        "features": ["C13", "C14", "C15", "C17"],
        "name": "Household Amenities & Financing",
        "vulnerability_anchor": "C14",  # Sanitation: lowest = highest vulnerability
        "vulnerability_direction": "low"
    }
}


def load_inputs():
    df_ready = pd.read_csv(ANALYSIS_READY_CSV)
    df_imputed = pd.read_csv(IMPUTED_NATURAL_CSV)
    df_engine_a = pd.read_csv(ENGINE_A_CSV)

    identifiers = df_ready[["District Names", "State/UT"]].copy()
    return identifiers, df_ready, df_imputed, df_engine_a


def run_domain_clustering(identifiers, df_ready, df_imputed):
    """Run k=3 K-Means independently for each domain and orient tiers."""
    domain_results = identifiers.copy()
    domain_profiles = {}

    for domain_key, domain_cfg in DOMAINS.items():
        feats = domain_cfg["features"]
        anchor = domain_cfg["vulnerability_anchor"]
        direction = domain_cfg["vulnerability_direction"]
        domain_name = domain_cfg["name"]

        X_dom = df_ready[feats].values

        # Fit K-Means k=3
        km = KMeans(n_clusters=3, n_init=30, random_state=42)
        raw_labels = km.fit_predict(X_dom)

        # Orient tiers: Tier 1 (Low Vulnerability), Tier 2 (Moderate), Tier 3 (High Vulnerability)
        temp_df = pd.DataFrame({"raw": raw_labels, "anchor": df_imputed[anchor]})
        anchor_means = temp_df.groupby("raw")["anchor"].mean()

        if direction == "low":
            # Lowest anchor value = highest vulnerability (Tier 3)
            sorted_raw = anchor_means.sort_values(ascending=False).index.tolist()
            # sorted_raw[0] = highest anchor (Tier 1: Low Vuln)
            # sorted_raw[1] = intermediate (Tier 2: Moderate Vuln)
            # sorted_raw[2] = lowest anchor (Tier 3: High Vuln)
        else:
            # Highest anchor value = highest vulnerability (Tier 3)
            sorted_raw = anchor_means.sort_values(ascending=True).index.tolist()
            # sorted_raw[0] = lowest anchor (Tier 1: Low Vuln)
            # sorted_raw[1] = intermediate (Tier 2: Moderate Vuln)
            # sorted_raw[2] = highest anchor (Tier 3: High Vuln)

        tier_map = {sorted_raw[0]: 1, sorted_raw[1]: 2, sorted_raw[2]: 3}
        domain_tiers = np.array([tier_map[r] for r in raw_labels])

        col_tier = f"{domain_key}_Tier"
        col_status = f"{domain_key}_Status"
        domain_results[col_tier] = domain_tiers

        status_map = {
            1: "Low Vulnerability (High Performance)",
            2: "Moderate Vulnerability",
            3: "High Vulnerability (Priority Need)"
        }
        domain_results[col_status] = [status_map[t] for t in domain_tiers]

        # Compute cluster natural profiles
        temp_prof = df_imputed[feats].copy()
        temp_prof["Tier"] = domain_tiers
        means_by_tier = temp_prof.groupby("Tier").mean().round(2)
        means_by_tier.insert(0, "Domain", domain_name)
        domain_profiles[domain_key] = means_by_tier

    # Compute Compound Vulnerability Index (Count of Tier 3 domains, 0 to 6)
    tier_cols = [f"{k}_Tier" for k in DOMAINS.keys()]
    compound_score = (domain_results[tier_cols] == 3).sum(axis=1)
    domain_results["Compound_Vulnerability_Score"] = compound_score

    # Category of compound vulnerability
    def assign_compound_label(score):
        if score == 0:
            return "No Severe Domain Deficits"
        elif score == 1:
            return "Isolated Single-Domain Deficit"
        elif score in [2, 3]:
            return "Moderate Multi-Domain Overlap"
        else:
            return "Severe Compound Health Crisis (4+ Domains)"

    domain_results["Compound_Vulnerability_Level"] = domain_results["Compound_Vulnerability_Score"].apply(assign_compound_label)

    return domain_results, domain_profiles


def cross_tabulate_engine_a_and_b(domain_results, df_engine_a):
    """Link Engine A clusters with Engine B compound vulnerabilities."""
    merged = domain_results.copy()
    merged["Engine_A_Cluster"] = df_engine_a["Cluster_ID"]
    merged["Engine_A_Name"] = df_engine_a["Cluster_Name"]

    # Crosstab
    crosstab_counts = pd.crosstab(
        merged["Engine_A_Name"],
        merged["Compound_Vulnerability_Level"],
        margins=True,
        margins_name="Total_Districts"
    )

    # Average compound score per Engine A cluster
    avg_scores = merged.groupby("Engine_A_Name")["Compound_Vulnerability_Score"].agg(["count", "mean", "min", "max"]).round(2)

    return merged, crosstab_counts, avg_scores


def plot_compound_distribution(domain_results):
    """Bar chart of district counts across compound vulnerability scores."""
    fig, ax = plt.subplots(figsize=(8, 5), dpi=200)

    counts = domain_results["Compound_Vulnerability_Score"].value_counts().sort_index()
    scores = counts.index
    vals = counts.values

    colors = ["#2b5c8f", "#1b9e77", "#e6ab02", "#e7298a", "#d95f02", "#e41a1c", "#7f0000"]
    bar_colors = [colors[s] if s < len(colors) else "#333333" for s in scores]

    bars = ax.bar(scores, vals, color=bar_colors, width=0.6, alpha=0.85, edgecolor="none")
    ax.set_xticks(scores)
    ax.set_xlabel("Compound Vulnerability Score (Number of High-Deficit Domains, 0 to 6)", fontsize=10, fontweight="bold")
    ax.set_ylabel("Number of Districts", fontsize=10, fontweight="bold")
    ax.set_title("DHPA — Distribution of Compound Healthcare Vulnerabilities Across India", fontsize=12, fontweight="bold", pad=12)
    ax.grid(True, linestyle=":", alpha=0.4, axis="y")

    # Add count labels on bars
    for bar in bars:
        h = bar.get_height()
        ax.annotate(f"{h}\n({h/706*100:.1f}%)",
                    xy=(bar.get_x() + bar.get_width() / 2, h),
                    xytext=(0, 3), textcoords="offset points",
                    ha="center", va="bottom", fontsize=8, fontweight="bold")

    fig.tight_layout()
    out_path = os.path.join(VISUAL_DIR, "step5_1_compound_vulnerability_dist.png")
    plt.savefig(out_path, bbox_inches="tight")
    plt.close()
    print(f"✅ Saved compound vulnerability distribution plot: {out_path}")


def plot_domain_vulnerability_bars(domain_results):
    """Compare national prevalence of Tier 3 vulnerability across the 6 domains."""
    fig, ax = plt.subplots(figsize=(9, 5), dpi=200)

    domain_counts = {}
    for k, v in DOMAINS.items():
        cnt = (domain_results[f"{k}_Tier"] == 3).sum()
        pct = cnt / len(domain_results) * 100
        domain_counts[v["name"]] = (cnt, pct)

    names = list(domain_counts.keys())
    pcts = [domain_counts[n][1] for n in names]
    raw_cnts = [domain_counts[n][0] for n in names]

    y_pos = np.arange(len(names))
    bars = ax.barh(y_pos, pcts, color="#d95f02", alpha=0.8, height=0.55)
    ax.set_yticks(y_pos)
    ax.set_yticklabels(names, fontsize=9, fontweight="bold")
    ax.set_xlabel("Districts in High Vulnerability Tier 3 (%)", fontsize=10, fontweight="bold")
    ax.set_title("DHPA — Prevalence of Severe Vulnerability Across Healthcare Domains", fontsize=12, fontweight="bold", pad=12)
    ax.set_xlim(0, max(pcts) + 12)
    ax.grid(True, linestyle=":", alpha=0.4, axis="x")

    for i, bar in enumerate(bars):
        w = bar.get_width()
        ax.annotate(f"{raw_cnts[i]} dist. ({w:.1f}%)",
                    xy=(w, bar.get_y() + bar.get_height() / 2),
                    xytext=(5, 0), textcoords="offset points",
                    ha="left", va="center", fontsize=8, fontweight="bold")

    fig.tight_layout()
    out_path = os.path.join(VISUAL_DIR, "step5_1_domain_vulnerability_heatmap.png")
    plt.savefig(out_path, bbox_inches="tight")
    plt.close()
    print(f"✅ Saved domain vulnerability bar chart: {out_path}")


def plot_engine_a_vs_b(crosstab_counts):
    """Plot stacked bar chart of Compound Vulnerability Level across Engine A clusters."""
    fig, ax = plt.subplots(figsize=(10, 6), dpi=200)

    # Exclude marginal total row/col
    sub = crosstab_counts.iloc[:-1, :-1].copy()
    
    # Calculate row percentage
    sub_pct = sub.div(sub.sum(axis=1), axis=0) * 100

    order = [
        "No Severe Domain Deficits",
        "Isolated Single-Domain Deficit",
        "Moderate Multi-Domain Overlap",
        "Severe Compound Health Crisis (4+ Domains)"
    ]
    sub_pct = sub_pct[[col for col in order if col in sub_pct.columns]]

    colors = ["#2b5c8f", "#1b9e77", "#e6ab02", "#d95f02"]
    sub_pct.plot(kind="barh", stacked=True, color=colors, ax=ax, alpha=0.85, width=0.6)

    ax.set_xlabel("Percentage of Districts in Cluster (%)", fontsize=10, fontweight="bold")
    ax.set_title("DHPA — Cross-Engine Synthesis: Multi-Domain Overlap within Engine A Clusters", fontsize=12, fontweight="bold", pad=12)
    ax.legend(title="Engine B Compound Vulnerability", bbox_to_anchor=(0.5, -0.15), loc="upper center", ncol=2, frameon=True, fontsize=8)
    ax.set_ylabel("")
    ax.grid(True, linestyle=":", alpha=0.4, axis="x")

    fig.tight_layout()
    out_path = os.path.join(VISUAL_DIR, "step5_1_engine_a_vs_b_crosstab.png")
    plt.savefig(out_path, bbox_inches="tight")
    plt.close()
    print(f"✅ Saved Engine A vs B synthesis chart: {out_path}")


def main():
    print("=" * 75)
    print("DHPA — Step 5.1: Engine B Category-Specific Clustering & Overlap Analysis")
    print("=" * 75)

    # 1. Load inputs
    identifiers, df_ready, df_imputed, df_engine_a = load_inputs()

    # 2. Run domain clustering
    print("\n--- Clustering across 6 specific healthcare domains ---")
    domain_results, domain_profiles = run_domain_clustering(identifiers, df_ready, df_imputed)

    # 3. Cross-tabulate with Engine A
    merged, crosstab_counts, avg_scores = cross_tabulate_engine_a_and_b(domain_results, df_engine_a)

    # 4. Save CSV
    out_csv = os.path.join(PROCESSED_DIR, "step5_1_engine_b_domain_clusters.csv")
    merged.to_csv(out_csv, index=False)
    print(f"\n✅ Engine B assignments saved: {out_csv}")

    # 5. Save Excel Report
    report_xlsx = os.path.join(REPORT_DIR, "RHPA_Step5_1_Engine_B_Analysis.xlsx")
    with pd.ExcelWriter(report_xlsx, engine="openpyxl") as writer:
        merged.to_excel(writer, sheet_name="District_Domain_Tiers", index=False)
        crosstab_counts.to_excel(writer, sheet_name="Engine_A_vs_B_Crosstab")
        avg_scores.to_excel(writer, sheet_name="Avg_Score_By_Engine_A")

        for k, prof in domain_profiles.items():
            prof.to_excel(writer, sheet_name=f"Prof_{k[:25]}")

    print(f"✅ Excel Engine B report:      {report_xlsx}")

    # 6. Generate Visuals
    plot_compound_distribution(domain_results)
    plot_domain_vulnerability_bars(domain_results)
    plot_engine_a_vs_b(crosstab_counts)

    # Print summary highlights to console
    print("\n" + "=" * 75)
    print("ENGINE B DOMAIN VULNERABILITY PREVALENCE (Tier 3 - High Deficit)")
    print("=" * 75)
    for k, v in DOMAINS.items():
        cnt = (domain_results[f"{k}_Tier"] == 3).sum()
        pct = cnt / len(domain_results) * 100
        print(f"  {v['name']:<42}: {cnt} districts ({pct:.1f}%)")

    print("\n" + "=" * 75)
    print("COMPOUND MULTI-DOMAIN OVERLAP DISTRIBUTION")
    print("=" * 75)
    comp_counts = domain_results["Compound_Vulnerability_Level"].value_counts()
    for level, cnt in comp_counts.items():
        pct = cnt / len(domain_results) * 100
        print(f"  {level:<42}: {cnt} districts ({pct:.1f}%)")

    print("\n" + "=" * 75)
    print("AVERAGE COMPOUND SCORE BY ENGINE A CLUSTER (0 to 6)")
    print("=" * 75)
    print(avg_scores.to_string())

    print("\n" + "=" * 75)
    print("STEP 5.1 ENGINE B CLUSTERING COMPLETE")
    print("=" * 75)


if __name__ == "__main__":
    main()

