"""
DHPA Project — Export Frontend Data
===================================
Consolidates all analytical models, district indicators, clustering assignments,
PCA coordinates, and policy recommendations into structured JSON files for the
React + Tailwind frontend dashboard.

Outputs:
  data/processed/frontend_districts.json
  data/processed/frontend_metadata.json

Run from repository root:
    python src/export_frontend_data.py
"""

import os
import json
import warnings
import numpy as np
import pandas as pd

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED_DIR = os.path.join(REPO_ROOT, "data", "processed")
REPORT_DIR = os.path.join(REPO_ROOT, "outputs", "reports")

REC_CSV = os.path.join(PROCESSED_DIR, "step5_2_district_recommendations.csv")
IMPUTED_CSV = os.path.join(PROCESSED_DIR, "step3_6_imputed.csv")
PCA_CSV = os.path.join(PROCESSED_DIR, "step4_1_pca_transformed.csv")
ENG_A_CSV = os.path.join(PROCESSED_DIR, "step4_3_district_cluster_assignments.csv")
ENG_B_CSV = os.path.join(PROCESSED_DIR, "step5_1_engine_b_domain_clusters.csv")

PREPROC_REPORT_XLSX = os.path.join(REPORT_DIR, "RHPA_Step3_6_Preprocessing.xlsx")
PCA_REPORT_XLSX = os.path.join(REPORT_DIR, "RHPA_Step4_1_PCA_Diagnostics.xlsx")
BENCHMARK_REPORT_XLSX = os.path.join(REPORT_DIR, "RHPA_Step4_2_Clustering_Benchmark.xlsx")


def main():
    print("Consolidating frontend datasets...")

    df_rec = pd.read_csv(REC_CSV)
    df_imp = pd.read_csv(IMPUTED_CSV)
    df_pca = pd.read_csv(PCA_CSV)
    df_eng_a = pd.read_csv(ENG_A_CSV)
    df_eng_b = pd.read_csv(ENG_B_CSV)

    # 1. Indicator Metadata & National/State Benchmarks
    mapping_df = pd.read_excel(PREPROC_REPORT_XLSX, sheet_name="Column_Mapping")
    feat_cols = [c for c in df_imp.columns if c not in ["District Names", "State/UT"]]
    
    # Category mapping for indicators
    cat_map = {
        "C13": "Household Amenities & Financing", "C14": "Household Amenities & Financing",
        "C15": "Household Amenities & Financing", "C17": "Household Amenities & Financing",
        "C19": "Reproductive Health & Family Planning", "C21": "Reproductive Health & Family Planning",
        "C23": "Reproductive Health & Family Planning", "C24": "Reproductive Health & Family Planning",
        "C26": "Reproductive Health & Family Planning", "C33": "Reproductive Health & Family Planning",
        "C35": "Reproductive Health & Family Planning",
        "C37": "Maternal & Newborn Care", "C38": "Maternal & Newborn Care", "C39": "Maternal & Newborn Care",
        "C41": "Maternal & Newborn Care", "C42": "Maternal & Newborn Care", "C43": "Maternal & Newborn Care",
        "C44": "Maternal & Newborn Care", "C47": "Maternal & Newborn Care", "C48": "Maternal & Newborn Care",
        "C54": "Child Immunisation & Preventative Care", "C60": "Child Immunisation & Preventative Care",
        "C61": "Child Immunisation & Preventative Care", "C63": "Child Immunisation & Preventative Care",
        "C66": "Child Health & Illness", "C70": "Child Health & Illness",
        "C72": "Infant Feeding & Nutrition", "C77": "Infant Feeding & Nutrition",
        "C78": "Nutritional Status & Anaemia", "C79": "Nutritional Status & Anaemia",
        "C82": "Nutritional Status & Anaemia", "C83": "Nutritional Status & Anaemia",
        "C84": "Nutritional Status & Anaemia", "C85": "Nutritional Status & Anaemia",
        "C86": "Nutritional Status & Anaemia", "C89": "Nutritional Status & Anaemia",
        "C93": "NCD Risk & Preventive Screening", "C96": "NCD Risk & Preventive Screening",
        "C99": "NCD Risk & Preventive Screening", "C102": "NCD Risk & Preventive Screening",
        "C103": "NCD Risk & Preventive Screening", "C104": "NCD Risk & Preventive Screening",
        "C105": "NCD Risk & Preventive Screening",
        "C106": "Health Risk Behaviours", "C107": "Health Risk Behaviours",
        "C108": "Health Risk Behaviours", "C109": "Health Risk Behaviours"
    }

    # Desirable direction: "high" = higher is better; "low" = lower is better (e.g. stunting, mortality, out of pocket)
    direction_map = {
        "C13": "high", "C14": "high", "C15": "high", "C17": "high", "C19": "high",
        "C21": "low", "C23": "low", "C24": "high", "C26": "high", "C33": "low", "C35": "high",
        "C37": "high", "C38": "high", "C39": "high", "C41": "high", "C42": "high", "C43": "high",
        "C44": "low", "C47": "high", "C48": "high",
        "C54": "high", "C60": "high", "C61": "high", "C63": "high",
        "C66": "low", "C70": "low", "C72": "high", "C77": "high",
        "C78": "low", "C79": "low", "C82": "low", "C83": "low", "C84": "low", "C85": "low",
        "C86": "low", "C89": "low", "C93": "low", "C96": "low", "C99": "low", "C102": "low",
        "C103": "high", "C104": "high", "C105": "high", "C106": "low", "C107": "low",
        "C108": "low", "C109": "low"
    }

    indicators_meta = []
    nat_means = df_imp[feat_cols].mean().round(2).to_dict()
    nat_stds = df_imp[feat_cols].std().round(2).to_dict()

    for _, r in mapping_df.iterrows():
        code = r["Short_Name"]
        indicators_meta.append({
            "code": code,
            "column_num": int(r["Column_Num"]),
            "name": r["Original_Name"],
            "category": cat_map.get(code, "Other"),
            "direction": direction_map.get(code, "high"),
            "national_mean": nat_means.get(code, 0),
            "national_std": nat_stds.get(code, 0),
            "unit": "Rs." if code == "C44" else "%"
        })

    # Compute State averages for all indicators
    state_means = df_imp.groupby("State/UT")[feat_cols].mean().round(2).to_dict(orient="index")

    # 2. Build Districts Array
    districts = []
    for idx, row in df_rec.iterrows():
        dist_name = row["District Names"]
        state_name = row["State/UT"]

        # Indicator values
        ind_vals = df_imp.iloc[idx][feat_cols].to_dict()
        ind_clean = {k: round(float(v), 2) for k, v in ind_vals.items()}

        dist_obj = {
            "id": idx + 1,
            "name": dist_name,
            "state": state_name,
            "cluster_a": {
                "id": int(row["Engine_A_Cluster_ID"]),
                "name": row["Engine_A_Typology"],
                "distance": round(float(df_eng_a.iloc[idx]["Distance_to_Centroid"]), 3),
                "silhouette": round(float(df_eng_a.iloc[idx]["Silhouette_Score"]), 3)
            },
            "compound_vulnerability": {
                "score": int(row["Compound_Vulnerability_Score"]),
                "level": row["Compound_Vulnerability_Level"],
                "urgency_tier": row["Action_Urgency_Tier"],
                "urgency_rank": int(row["Action_Urgency_Rank"])
            },
            "recommendations": {
                "primary_priority": row["Primary_Service_Priority"],
                "secondary_priorities": "" if pd.isna(row["Secondary_Service_Priorities"]) else row["Secondary_Service_Priorities"],
                "triggers": "" if pd.isna(row["Root_Cause_Indicator_Triggers"]) else row["Root_Cause_Indicator_Triggers"],
                "interventions": "" if pd.isna(row["Key_Actionable_Interventions"]) else row["Key_Actionable_Interventions"]
            },
            "pca": {
                "pc1": round(float(df_pca.iloc[idx]["PC1"]), 3),
                "pc2": round(float(df_pca.iloc[idx]["PC2"]), 3),
                "pc3": round(float(df_pca.iloc[idx]["PC3"]), 3)
            },
            "domain_tiers": {
                "maternal_newborn": int(df_eng_b.iloc[idx]["Maternal_Newborn_Tier"]),
                "child_immunisation": int(df_eng_b.iloc[idx]["Child_Immunisation_Tier"]),
                "nutrition_anaemia": int(df_eng_b.iloc[idx]["Nutrition_Anaemia_Tier"]),
                "family_planning": int(df_eng_b.iloc[idx]["FamilyPlanning_Repro_Tier"]),
                "ncd_screening": int(df_eng_b.iloc[idx]["NCD_Screening_Tier"]),
                "household_amenities": int(df_eng_b.iloc[idx]["Household_Amenities_Tier"])
            },
            "indicators": ind_clean
        }
        districts.append(dist_obj)

    # 3. Build Metadata JSON
    # State summary
    state_list = []
    for state, group in df_rec.groupby("State/UT"):
        c_scores = group["Compound_Vulnerability_Score"]
        state_list.append({
            "state": state,
            "district_count": len(group),
            "avg_compound_score": round(float(c_scores.mean()), 2),
            "mission_mode_count": int((c_scores >= 4).sum()),
            "cluster_breakdown": group["Engine_A_Cluster_ID"].value_counts().to_dict(),
            "indicator_means": state_means.get(state, {})
        })
    state_list.sort(key=lambda x: x["state"])

    # Cluster A Profiles
    cluster_a_meta = {
        1: {
            "name": "Cluster 1: Advanced Infrastructure & Emerging Lifestyle/NCD Risk",
            "short_name": "Advanced / NCD Risk",
            "count": int((df_rec["Engine_A_Cluster_ID"] == 1).sum()),
            "color": "#2b5c8f",
            "description": "High institutional delivery (>96%), strong sanitation and literacy, but elevated adult obesity (35.5%) and diabetes/hypertension risks."
        },
        2: {
            "name": "Cluster 2: Intermediate / Progressing Health Profile",
            "short_name": "Intermediate / Progressing",
            "count": int((df_rec["Engine_A_Cluster_ID"] == 2).sum()),
            "color": "#1b9e77",
            "description": "Highest childhood routine immunization (83.3%), strong delivery coverage, but persistent child and maternal anaemia (>60%)."
        },
        3: {
            "name": "Cluster 3: High Foundational Healthcare Vulnerability",
            "short_name": "High Foundational Vulnerability",
            "count": int((df_rec["Engine_A_Cluster_ID"] == 3).sum()),
            "color": "#d95f02",
            "description": "Severe primary care deficits: 4+ ANC visits under 41%, child stunting at 40.5%, early marriage (30%), and low sanitation (59.5%)."
        },
        4: {
            "name": "Cluster 4: Distinct Hill & Northeastern Health Geography",
            "short_name": "Hill & Northeastern Geography",
            "count": int((df_rec["Engine_A_Cluster_ID"] == 4).sum()),
            "color": "#7570b3",
            "description": "High social capital and sanitation (>84%), but severe institutional delivery gaps (69%), extreme out-of-pocket delivery costs, and high substance use."
        }
    }

    # PCA metadata
    df_var = pd.read_excel(PCA_REPORT_XLSX, sheet_name="Variance_Explained")
    pca_meta = {
        "pc1_var": float(df_var.loc[0, "Variance_Explained_Pct"]),
        "pc2_var": float(df_var.loc[1, "Variance_Explained_Pct"]),
        "pc3_var": float(df_var.loc[2, "Variance_Explained_Pct"]),
        "kaiser_count": int((df_var["Eigenvalue"] >= 1.0).sum()),
        "top5_cum_var": float(df_var.loc[4, "Cumulative_Variance_Pct"]),
        "variance_breakdown": df_var.head(11).to_dict(orient="records")
    }

    # Clustering benchmark summary
    df_bench = pd.read_excel(BENCHMARK_REPORT_XLSX, sheet_name="Summary_47D_Standardized")
    df_bench = df_bench.replace({np.nan: None})
    benchmark_meta = df_bench.to_dict(orient="records")

    metadata = {
        "project_name": "DHPA — District Healthcare Inequality Detection & Service Priority Clustering",
        "dataset_name": "NFHS-5 (2019-21) District Fact Sheet",
        "total_districts": 706,
        "total_states": len(state_list),
        "total_indicators": len(indicators_meta),
        "indicators": indicators_meta,
        "clusters_a": cluster_a_meta,
        "states": state_list,
        "pca": pca_meta,
        "benchmark": benchmark_meta,
        "categories": sorted(list(set(cat_map.values())))
    }

    # Save JSON files
    dist_out = os.path.join(PROCESSED_DIR, "frontend_districts.json")
    meta_out = os.path.join(PROCESSED_DIR, "frontend_metadata.json")

    with open(dist_out, "w", encoding="utf-8") as f:
        json.dump(districts, f, ensure_ascii=False)
    print(f"✅ Saved frontend districts: {dist_out} ({os.path.getsize(dist_out)/1024:.1f} KB)")

    with open(meta_out, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False)
    print(f"✅ Saved frontend metadata:  {meta_out} ({os.path.getsize(meta_out)/1024:.1f} KB)")


if __name__ == "__main__":
    main()

