"""
DHPA Project — Step 5.2: Transparent, Indicator-Traceable Recommendation Engine
==============================================================================
Synthesizes Engine A (Overall Typologies) and Engine B (Domain-Specific Tiers)
to generate transparent, rule-based, indicator-traceable health service
recommendations for all 706 Indian districts.

Key Features:
  - Traceable root-cause indicator triggers (comparing natural values to national benchmarks).
  - Aligned with National Health Mission (NHM) flagship programs (PMSMA, Mission Indradhanush,
    POSHAN Abhiyaan, Anaemia Mukt Bharat, NP-NCD, Ayushman Arogya Mandir).
  - Categorizes districts into 4 Action Urgency Tiers:
      1. Immediate Mission-Mode Intervention (Compound Crisis, 4+ Deficit Domains)
      2. High Priority Multi-Domain Convergence (2–3 Deficit Domains)
      3. Targeted Vertical Program Priority (1 Isolated Deficit Domain)
      4. System Maintenance & Chronic NCD / Lifestyle Focus (0 Major Primary Deficits)

Outputs:
  data/processed/step5_2_district_recommendations.csv
  outputs/reports/RHPA_Step5_2_Service_Recommendations.xlsx
  outputs/visuals/step5_2_primary_priority_distribution.png
  outputs/visuals/step5_2_urgency_tier_distribution.png
  outputs/visuals/step5_2_state_dominant_priorities.png

Run from repository root:
    python src/step5_2_recommendation_engine.py
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

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# Directories & Paths
# ---------------------------------------------------------------------------
PROCESSED_DIR = os.path.join(REPO_ROOT, "data", "processed")
REPORT_DIR = os.path.join(REPO_ROOT, "outputs", "reports")
VISUAL_DIR = os.path.join(REPO_ROOT, "outputs", "visuals")

os.makedirs(REPORT_DIR, exist_ok=True)
os.makedirs(VISUAL_DIR, exist_ok=True)

IMPUTED_NATURAL_CSV = os.path.join(PROCESSED_DIR, "step3_6_imputed.csv")
ENGINE_A_CSV = os.path.join(PROCESSED_DIR, "step4_3_district_cluster_assignments.csv")
ENGINE_B_CSV = os.path.join(PROCESSED_DIR, "step5_1_engine_b_domain_clusters.csv")
PREPROC_REPORT_XLSX = os.path.join(REPORT_DIR, "RHPA_Step3_6_Preprocessing.xlsx")

# ---------------------------------------------------------------------------
# Programmatic Action Rules & Indicator Thresholds
# ---------------------------------------------------------------------------
DOMAIN_RULES = {
    "Maternal_Newborn": {
        "domain_name": "Maternal & Newborn Care",
        "program_alignment": "PMSMA, JSY, LaQshya, MCP Card Tracking",
        "triggers": [
            ("C47", "Institutional Births", "<", 80.0, "Strengthen 24x7 PHC/CHC delivery facilities, mobilize ASHA birth transport incentives (JSY)"),
            ("C38", "4+ ANC Visits", "<", 50.0, "Intensify Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA) fixed-day antenatal clinics"),
            ("C37", "First Trimester ANC", "<", 65.0, "Deploy community early pregnancy detection drives and early MCP card issuance"),
            ("C41", "IFA 100+ Days", "<", 40.0, "Address supply-chain stockouts of Iron-Folic Acid tablets; monitor ASHA home delivery"),
            ("C44", "Out-of-Pocket Delivery Cost (Rs.)", ">", 5000.0, "Audit Janani Shishu Suraksha Karyakram (JSSK) entitlements to eliminate out-of-pocket costs")
        ]
    },
    "Child_Immunisation": {
        "domain_name": "Child Immunisation & Preventative Care",
        "program_alignment": "Intensified Mission Indradhanush (IMI), Universal Immunization Programme (UIP)",
        "triggers": [
            ("C54", "Full Immunisation (12-23m)", "<", 70.0, "Launch Intensified Mission Indradhanush catch-up drives in low-coverage sub-centre areas"),
            ("C60", "Measles 2nd Dose", "<", 25.0, "Implement digital tracking (U-WIN) for 2nd year booster follow-ups to curb dropouts"),
            ("C61", "Rotavirus Vaccine (3 doses)", "<", 30.0, "Expand cold-chain infrastructure and rotavirus vaccine supply-chain coverage"),
            ("C63", "Vitamin A Supplementation", "<", 65.0, "Organize biannual Vitamin A bi-monthly saturation rounds through Anganwadis")
        ]
    },
    "Nutrition_Anaemia": {
        "domain_name": "Nutritional Status & Anaemia",
        "program_alignment": "POSHAN Abhiyaan, Anaemia Mukt Bharat (AMB), ICDS Anganwadi Services",
        "triggers": [
            ("C78", "Child Stunting (<5 yrs)", ">", 35.0, "Prioritize first-1000-days nutrition counseling and supplementary nutrition feeding"),
            ("C79", "Child Wasting (<5 yrs)", ">", 20.0, "Establish Community Nutrition Rehabilitation Centres (NRCs) for severe acute malnutrition"),
            ("C86", "Child Anaemia (<11 g/dl)", ">", 65.0, "Intensify Anaemia Mukt Bharat prophylactic bi-weekly IFA syrup and deworming"),
            ("C89", "Women Anaemia (<12 g/dl)", ">", 60.0, "Deploy point-of-care digital haemoglobinometers and reproductive-age IFA supplementation"),
            ("C83", "Women Low BMI (<18.5)", ">", 20.0, "Target food-ration fortificaton and adolescent maternal nutritional support")
        ]
    },
    "FamilyPlanning_Repro": {
        "domain_name": "Reproductive Health & Family Planning",
        "program_alignment": "Mission Parivar Vikas (MPV), Rashtriya Kishor Swasthya Karyakram (RKSK)",
        "triggers": [
            ("C26", "Modern Contraceptive Use", "<", 50.0, "Expand cafeteria choice of reversible modern spacing methods (Antara, Chhaya)"),
            ("C33", "Unmet Need for Family Planning", ">", 11.0, "Mobilize ASHA home delivery of contraceptives and post-partum family planning counseling"),
            ("C21", "Female Marriage Before 18", ">", 25.0, "Inter-sectoral convergence with Beti Bachao Beti Padhao; community adolescent tracking"),
            ("C24", "Menstrual Hygiene", "<", 70.0, "Subsidized sanitary napkin distribution and school menstrual hygiene counseling")
        ]
    },
    "NCD_Screening": {
        "domain_name": "NCD Risk & Preventive Screening",
        "program_alignment": "National Programme for Prevention and Control of NCDs (NP-NCD), Ayushman Arogya Mandirs",
        "triggers": [
            ("C93", "Women High Blood Glucose", ">", 14.0, "Operationalize population-based NCD screening camps and free metformin supply at HWCs"),
            ("C96", "Men High Blood Glucose", ">", 16.0, "Community workplace NCD screening and metabolic health counseling"),
            ("C99", "Women Elevated Blood Pressure", ">", 24.0, "Establish standardized India Hypertension Control Initiative (IHCI) protocols"),
            ("C102", "Men Elevated Blood Pressure", ">", 28.0, "Hypertension treatment protocol adherence and community blood pressure monitoring"),
            ("C103", "Cervical Cancer Screening", "<", 1.5, "Scale up VIA (Visual Inspection with Acetic Acid) screening at primary health facilities"),
            ("C104", "Breast Cancer Screening", "<", 1.0, "Clinical breast examination training for Lady Health Visitors (LHVs) and ANMs")
        ]
    },
    "Household_Amenities": {
        "domain_name": "Household Amenities & Financing",
        "program_alignment": "Swachh Bharat Mission (Grameen), Jal Jeevan Mission, PM-JAY (Ayushman Bharat)",
        "triggers": [
            ("C14", "Improved Sanitation", "<", 65.0, "Repair retrofitted community toilets and behavior-change communication for ODF sustainability"),
            ("C15", "Clean Cooking Fuel", "<", 50.0, "Facilitate PM Ujjwala refill affordability and indoor air pollution awareness"),
            ("C17", "Health Insurance Coverage", "<", 35.0, "Intensify Ayushman Bharat PM-JAY golden card saturation drives at CSCs")
        ]
    }
}


def load_all_data():
    df_imp = pd.read_csv(IMPUTED_NATURAL_CSV)
    df_eng_a = pd.read_csv(ENGINE_A_CSV)
    df_eng_b = pd.read_csv(ENGINE_B_CSV)

    mapping_df = pd.read_excel(PREPROC_REPORT_XLSX, sheet_name="Column_Mapping")
    name_map = dict(zip(mapping_df["Short_Name"], mapping_df["Original_Name"]))

    return df_imp, df_eng_a, df_eng_b, name_map


def build_recommendations(df_imp, df_eng_a, df_eng_b, name_map):
    """Generate rule-based, indicator-traceable recommendations for all 706 districts."""
    results = []
    nat_means = df_imp.drop(columns=["District Names", "State/UT"]).mean()

    for idx, row in df_imp.iterrows():
        dist = row["District Names"]
        state = row["State/UT"]

        # Engine A info
        eng_a_row = df_eng_a.iloc[idx]
        eng_a_cid = eng_a_row["Cluster_ID"]
        eng_a_name = eng_a_row["Cluster_Name"]

        # Engine B info
        eng_b_row = df_eng_b.iloc[idx]
        comp_score = eng_b_row["Compound_Vulnerability_Score"]
        comp_level = eng_b_row["Compound_Vulnerability_Level"]

        # Determine urgency tier
        if comp_score >= 4:
            urgency = "Tier 1: Immediate Mission-Mode Intervention (Compound Crisis)"
            urgency_rank = 1
        elif comp_score in [2, 3]:
            urgency = "Tier 2: High Priority Multi-Domain Convergence"
            urgency_rank = 2
        elif comp_score == 1:
            urgency = "Tier 3: Targeted Single-Program Priority"
            urgency_rank = 3
        else:
            urgency = "Tier 4: System Maintenance & Chronic NCD Focus"
            urgency_rank = 4

        # Evaluate domain-level deficits & find primary priority
        domain_gaps = []
        domain_triggers = {}
        domain_actions = {}

        for dom_key, dom_cfg in DOMAIN_RULES.items():
            tier_val = eng_b_row[f"{dom_key}_Tier"]
            dom_name = dom_cfg["domain_name"]

            triggered_indicators = []
            action_items = []

            for col_code, label, op, cutoff, action in dom_cfg["triggers"]:
                val = row[col_code]
                nat_val = nat_means[col_code]

                is_triggered = False
                if op == "<" and val < cutoff:
                    is_triggered = True
                elif op == ">" and val > cutoff:
                    is_triggered = True

                if is_triggered:
                    triggered_indicators.append(f"{label} ({val:.1f}% vs {nat_val:.1f}% nat)")
                    action_items.append(action)

            # Measure severity gap: if Tier 3, this is an active deficit domain
            is_tier3 = (tier_val == 3)
            domain_gaps.append({
                "domain_key": dom_key,
                "domain_name": dom_name,
                "is_tier3": is_tier3,
                "n_triggers": len(triggered_indicators)
            })

            domain_triggers[dom_key] = triggered_indicators
            domain_actions[dom_key] = action_items

        # Rank domains to pick Primary Priority:
        # Prioritize Tier 3 domains with the most triggered deficit indicators
        tier3_domains = [d for d in domain_gaps if d["is_tier3"]]
        tier3_domains.sort(key=lambda x: x["n_triggers"], reverse=True)

        if len(tier3_domains) > 0:
            primary_domain = tier3_domains[0]["domain_name"]
            primary_key = tier3_domains[0]["domain_key"]
            secondary_domains = [d["domain_name"] for d in tier3_domains[1:]]
        else:
            # If no Tier 3 domain, check if NCD or Lifestyle has triggers
            if eng_a_cid == 1:
                primary_domain = "NCD Risk & Chronic Disease Management"
                primary_key = "NCD_Screening"
            else:
                primary_domain = "Preventive Health Maintenance & Routine Tracking"
                primary_key = "Child_Immunisation"
            secondary_domains = ["General Primary Care Quality"]

        # Compile triggers and action bullets
        all_triggers_list = domain_triggers.get(primary_key, [])
        for sec in tier3_domains[1:]:
            sec_k = sec["domain_key"]
            all_triggers_list.extend(domain_triggers.get(sec_k, [])[:2])

        all_actions_list = domain_actions.get(primary_key, [])
        for sec in tier3_domains[1:]:
            sec_k = sec["domain_key"]
            all_actions_list.extend(domain_actions.get(sec_k, [])[:1])

        # If empty (benchmark district), provide maintenance action
        if len(all_actions_list) == 0:
            all_actions_list = [
                "Maintain Universal Immunisation coverage and routine cold-chain audits",
                "Expand Ayushman Arogya Mandir adult wellness and annual NCD screening"
            ]
            all_triggers_list = ["Baseline coverage exceeds national thresholds across primary indicators"]

        results.append({
            "District Names": dist,
            "State/UT": state,
            "Engine_A_Cluster_ID": eng_a_cid,
            "Engine_A_Typology": eng_a_name,
            "Compound_Vulnerability_Score": comp_score,
            "Compound_Vulnerability_Level": comp_level,
            "Action_Urgency_Tier": urgency,
            "Action_Urgency_Rank": urgency_rank,
            "Primary_Service_Priority": primary_domain,
            "Secondary_Service_Priorities": "; ".join(secondary_domains) if secondary_domains else "None",
            "Root_Cause_Indicator_Triggers": " | ".join(all_triggers_list[:5]),
            "Key_Actionable_Interventions": " • " + " • ".join(all_actions_list[:4])
        })

    rec_df = pd.DataFrame(results)
    return rec_df


def plot_primary_priorities(rec_df):
    """Bar chart of primary service priorities across all 706 districts."""
    fig, ax = plt.subplots(figsize=(10, 5), dpi=200)

    counts = rec_df["Primary_Service_Priority"].value_counts()
    names = counts.index
    vals = counts.values

    colors = ["#d95f02", "#1b9e77", "#2b5c8f", "#7570b3", "#e6ab02", "#e7298a", "#66a61e"]
    bar_colors = [colors[i % len(colors)] for i in range(len(names))]

    y_pos = np.arange(len(names))
    bars = ax.barh(y_pos, vals, color=bar_colors, alpha=0.85, height=0.6)
    ax.set_yticks(y_pos)
    ax.set_yticklabels(names, fontsize=9, fontweight="bold")
    ax.set_xlabel("Number of Districts Assigned as Primary Focus Area", fontsize=10, fontweight="bold")
    ax.set_title("DHPA — Distribution of Primary Healthcare Service Priorities Across India", fontsize=12, fontweight="bold", pad=12)
    ax.grid(True, linestyle=":", alpha=0.4, axis="x")
    ax.set_xlim(0, max(vals) + 35)

    for i, bar in enumerate(bars):
        w = bar.get_width()
        ax.annotate(f"{w} ({w/706*100:.1f}%)",
                    xy=(w, bar.get_y() + bar.get_height() / 2),
                    xytext=(5, 0), textcoords="offset points",
                    ha="left", va="center", fontsize=8, fontweight="bold")

    fig.tight_layout()
    out_path = os.path.join(VISUAL_DIR, "step5_2_primary_priority_distribution.png")
    plt.savefig(out_path, bbox_inches="tight")
    plt.close()
    print(f"✅ Saved primary priority distribution plot: {out_path}")


def plot_urgency_tiers(rec_df):
    """Bar chart of district counts by Action Urgency Tier."""
    fig, ax = plt.subplots(figsize=(8, 5), dpi=200)

    counts = rec_df["Action_Urgency_Tier"].value_counts().sort_index()
    labels = [
        "Tier 1: Immediate Mission-Mode (100 Dist.)",
        "Tier 2: High Priority Convergence (287 Dist.)",
        "Tier 3: Targeted Single-Program (259 Dist.)",
        "Tier 4: System Maintenance / NCD (60 Dist.)"
    ]
    vals = [counts.get(k, 0) for k in sorted(counts.index)]
    colors = ["#e41a1c", "#ff7f00", "#1b9e77", "#2b5c8f"]

    y_pos = np.arange(len(labels))
    bars = ax.barh(y_pos, vals, color=colors, alpha=0.85, height=0.55)
    ax.set_yticks(y_pos)
    ax.set_yticklabels(labels, fontsize=9, fontweight="bold")
    ax.set_xlabel("Number of Districts", fontsize=10, fontweight="bold")
    ax.set_title("DHPA — Action Urgency Tiers for District Healthcare Allocation", fontsize=12, fontweight="bold", pad=12)
    ax.set_xlim(0, max(vals) + 40)
    ax.grid(True, linestyle=":", alpha=0.4, axis="x")

    for i, bar in enumerate(bars):
        w = bar.get_width()
        ax.annotate(f"{w} districts ({w/706*100:.1f}%)",
                    xy=(w, bar.get_y() + bar.get_height() / 2),
                    xytext=(5, 0), textcoords="offset points",
                    ha="left", va="center", fontsize=8, fontweight="bold")

    fig.tight_layout()
    out_path = os.path.join(VISUAL_DIR, "step5_2_urgency_tier_distribution.png")
    plt.savefig(out_path, bbox_inches="tight")
    plt.close()
    print(f"✅ Saved urgency tier plot: {out_path}")


def plot_state_priorities(rec_df):
    """Stacked bar of primary service priority proportions for top 12 states."""
    top_states = rec_df["State/UT"].value_counts().head(12).index
    sub = rec_df[rec_df["State/UT"].isin(top_states)]

    ct = pd.crosstab(sub["State/UT"], sub["Primary_Service_Priority"])
    ct_pct = ct.div(ct.sum(axis=1), axis=0) * 100

    fig, ax = plt.subplots(figsize=(12, 7), dpi=200)
    ct_pct.plot(kind="barh", stacked=True, ax=ax, colormap="tab10", alpha=0.85, width=0.65)

    ax.set_xlabel("Proportion of Districts in State (%)", fontsize=10, fontweight="bold")
    ax.set_title("DHPA — Dominant Healthcare Priorities Across Top 12 States", fontsize=12, fontweight="bold", pad=12)
    ax.legend(title="Primary Priority", bbox_to_anchor=(0.5, -0.15), loc="upper center", ncol=3, frameon=True, fontsize=8)
    ax.set_ylabel("")
    ax.grid(True, linestyle=":", alpha=0.4, axis="x")

    fig.tight_layout()
    out_path = os.path.join(VISUAL_DIR, "step5_2_state_dominant_priorities.png")
    plt.savefig(out_path, bbox_inches="tight")
    plt.close()
    print(f"✅ Saved state dominant priorities plot: {out_path}")


def main():
    print("=" * 75)
    print("DHPA — Step 5.2: Transparent, Indicator-Traceable Recommendation Engine")
    print("=" * 75)

    # 1. Load inputs
    df_imp, df_eng_a, df_eng_b, name_map = load_all_data()

    # 2. Build recommendations
    rec_df = build_recommendations(df_imp, df_eng_a, df_eng_b, name_map)

    # 3. Save recommendations CSV
    out_csv = os.path.join(PROCESSED_DIR, "step5_2_district_recommendations.csv")
    rec_df.to_csv(out_csv, index=False)
    print(f"\n✅ All-district recommendations saved: {out_csv}")

    # 4. State Summary Crosstab
    state_summary = pd.crosstab(
        rec_df["State/UT"],
        rec_df["Action_Urgency_Tier"],
        margins=True,
        margins_name="Total_Districts"
    )

    # Priority Ranking (Sorted by Urgency Rank, Compound Score descending)
    priority_ranking = rec_df.sort_values(
        by=["Action_Urgency_Rank", "Compound_Vulnerability_Score"],
        ascending=[True, False]
    )[["District Names", "State/UT", "Action_Urgency_Tier", "Compound_Vulnerability_Score",
       "Primary_Service_Priority", "Secondary_Service_Priorities", "Root_Cause_Indicator_Triggers"]]

    # 5. Save Comprehensive Excel Report
    report_xlsx = os.path.join(REPORT_DIR, "RHPA_Step5_2_Service_Recommendations.xlsx")
    with pd.ExcelWriter(report_xlsx, engine="openpyxl") as writer:
        rec_df.to_excel(writer, sheet_name="District_Recommendations", index=False)
        priority_ranking.head(100).to_excel(writer, sheet_name="Top100_MissionMode_Districts", index=False)
        state_summary.to_excel(writer, sheet_name="State_Urgency_Summary")

        # Documentation of rules
        rules_data = []
        for dom, cfg in DOMAIN_RULES.items():
            for code, name, op, cut, act in cfg["triggers"]:
                rules_data.append({
                    "Domain": cfg["domain_name"],
                    "Program_Alignment": cfg["program_alignment"],
                    "Indicator_Code": code,
                    "Indicator_Name": name,
                    "Trigger_Condition": f"{op} {cut}",
                    "Prescribed_Action": act
                })
        pd.DataFrame(rules_data).to_excel(writer, sheet_name="Rule_Definitions", index=False)

    print(f"✅ Excel recommendation report:        {report_xlsx}")

    # 6. Generate Visuals
    plot_primary_priorities(rec_df)
    plot_urgency_tiers(rec_df)
    plot_state_priorities(rec_df)

    # Print summary highlights to console
    print("\n" + "=" * 75)
    print("ACTION URGENCY TIER BREAKDOWN")
    print("=" * 75)
    for tier, cnt in rec_df["Action_Urgency_Tier"].value_counts().sort_index().items():
        pct = cnt / len(rec_df) * 100
        print(f"  {tier:<65}: {cnt} districts ({pct:.1f}%)")

    print("\n" + "=" * 75)
    print("PRIMARY SERVICE PRIORITY BREAKDOWN")
    print("=" * 75)
    for prio, cnt in rec_df["Primary_Service_Priority"].value_counts().items():
        pct = cnt / len(rec_df) * 100
        print(f"  {prio:<45}: {cnt} districts ({pct:.1f}%)")

    print("\n" + "=" * 75)
    print("SAMPLE RECOMMENDATIONS FOR TOP PRIORITY DISTRICTS")
    print("=" * 75)
    sample_top = rec_df[rec_df["Action_Urgency_Rank"] == 1].head(3)
    for _, r in sample_top.iterrows():
        print(f"\n📍 District: {r['District Names']} ({r['State/UT']})")
        print(f"   Urgency: {r['Action_Urgency_Tier']} | Deficit Score: {r['Compound_Vulnerability_Score']}/6")
        print(f"   Primary Priority:   {r['Primary_Service_Priority']}")
        print(f"   Secondary Focus:    {r['Secondary_Service_Priorities']}")
        print(f"   Indicator Triggers: {r['Root_Cause_Indicator_Triggers']}")
        print(f"   Prescribed Action:  {r['Key_Actionable_Interventions']}")

    print("\n" + "=" * 75)
    print("STEP 5.2 RECOMMENDATION ENGINE COMPLETE")
    print("=" * 75)


if __name__ == "__main__":
    main()
