# DHPA – District Healthcare Profiling & Analytics (India)

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![React 18](https://img.shields.io/badge/React-18.3.1-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An unsupervised machine learning and public health informatics framework analyzing granular healthcare disparities across all **706 surveyed districts** in India using official **National Family Health Survey (NFHS-5)** microdata.

---

## Table of Contents

1. [Project Overview](#project-overview)
   - [The "Aggregation Trap"](#the-aggregation-trap)
   - [The Dual-Engine Innovation](#the-dual-engine-innovation)
   - [Key Objectives](#key-objectives)
2. [Prerequisites](#prerequisites)
3. [Dependencies](#dependencies)
   - [Python Analytics Pipeline](#python-analytics-pipeline)
   - [Frontend Decision Dashboard](#frontend-decision-dashboard)
4. [Installation & Setup](#installation--setup)
5. [Execution Instructions](#execution-instructions)
   - [Running the Analytics & ML Pipeline (Steps 1 to 5)](#1-running-the-analytics--ml-pipeline-steps-1-to-5)
   - [Exporting Production Datasets](#2-exporting-production-datasets-to-frontend)
   - [Running the Interactive Decision Dashboard](#3-running-the-interactive-decision-dashboard)
   - [Deploying to Vercel](#4-deploying-to-vercel)
6. [Repository Structure](#repository-structure)
7. [Analytical Methodology & Pipeline Architecture](#analytical-methodology--pipeline-architecture)
   - [Four National Healthcare Archetypes (Engine A)](#four-national-healthcare-archetypes-engine-a)
   - [Six Domain-Specific Sectors (Engine B)](#six-domain-specific-sectors-engine-b)
   - [The 100 Mission-Mode Districts & Recommendation Engine](#the-100-mission-mode-districts--recommendation-engine)
8. [Author & Academic Context](#author--academic-context)
9. [License](#license)

---

## Project Overview

India experiences severe regional disparities in healthcare infrastructure, clinical service adherence, maternal and child wellness, and disease burdens. Traditional public health planning relies heavily on state-level aggregates (e.g., comparing Kerala directly to Bihar). However, state-level averaging produces an **"Aggregation Trap"**:

### The "Aggregation Trap"
* **Intra-State Concealment:** Broad state averages mask 40–50% variance between neighboring districts within the same state. High-performing states often harbor deeply vulnerable tribal belts, while developing states contain resilient, well-equipped urban health systems.
* **Vertical Program Inefficiency:** Central health funding frequently mandates uniform vertical targets (e.g., pushing institutional delivery everywhere), misallocating resources to districts where institutional births already exceed 95%, while ignoring surging non-communicable disease (NCD) epidemics or widespread childhood anaemia.
* **Survey Suppression Neglect:** Official survey fact sheets contain sample suppression asterisks ($<25$ unweighted cases) and parenthesized estimates ($25\text{--}49$ cases). Naive models either drop sparse districts entirely or treat small sample sizes as definitive estimates.

### The Dual-Engine Innovation
DHPA resolves these systemic challenges through a decoupled **Dual-Engine Architecture**:
1. **Engine A (Macro-Level Archetypes):** Uses standardized multidimensional clustering ($k=4$, validated with an Adjusted Rand Index of $0.974$ against an 11-component PCA projection explaining $71.2\%$ variance) to establish high-level structural typologies across all 706 districts.
2. **Engine B (Sectoral Micro-Triage):** Concurrently audits 6 independent healthcare domains (Maternal, Child Immunisation, Nutrition & Anaemia, Family Planning, NCDs, and Household Infrastructure) into Tri-Tier Vulnerability categories (Low, Moderate, High), unmasking critical vulnerabilities obscured by macro aggregates.
3. **Compound Vulnerability Index:** Identifies the **100 "Mission-Mode" districts** experiencing concurrent systemic crises across $\ge 4$ domains.
4. **Deterministic Policy Recommendation Engine:** Evaluates natural indicator metrics against national clinical safety thresholds to output root-cause-traceable action prescriptions mapped directly to **National Health Mission (NHM)** flagship schemes (PMSMA, IMI, POSHAN Abhiyaan, Anaemia Mukt Bharat, NP-NCD, Ayushman Arogya Mandir).

### Key Objectives
* Build a reproducible, audit-trailed data pipeline adhering to MoHFW / IIPS suppression standards.
* Eliminate high-dimensional collinearity and distributional skewness across survey variables.
* Prove that Indian district health performance is inherently multidimensional via PCA factor loadings.
* Segment districts into operationally meaningful archetypes rather than abstract cluster numbers.
* Deliver an interactive, zero-latency React decision dashboard for administrators and researchers.

---

## Prerequisites

Ensure the following runtimes and tools are installed on your workstation:

* **Python:** `v3.10` or higher (`3.11` / `3.12` / `3.14` supported)
* **Node.js:** `v18.0.0` or higher (`v20+` recommended)
* **Package Managers:** `pip` (Python) and `npm` (Node.js)
* **Git:** For version control and repository cloning

---

## Dependencies

### Python Analytics Pipeline
Defined in [`requirements.txt`](requirements.txt):
* **`pandas >= 2.0.0`**: High-performance data manipulation, dataframe transformations, and tabular auditing.
* **`numpy >= 1.24.0`**: Vectorized numerical computing and linear algebra operations.
* **`scipy >= 1.10.0`**: Statistical distributions and Yeo-Johnson power transformations.
* **`scikit-learn >= 1.3.0`**: PCA dimensionality reduction, K-Means clustering, Agglomerative Hierarchical clustering, Gaussian Mixture Models, and validation metrics (Silhouette, Davies–Bouldin, Calinski–Harabasz, ARI, NMI).
* **`openpyxl >= 3.1.0`**: Generation of multi-tab Excel decision registers and audit reports.
* **`matplotlib >= 3.7.0`**: Publication-grade statistical visualization, scree plots, and diagnostic charts.
* **`seaborn >= 0.12.0`**: Heatmaps and correlation matrices.

### Frontend Decision Dashboard
Defined in [`frontend/package.json`](frontend/package.json):
* **`react` & `react-dom` (`^18.3.1`)**: Component-based user interface architecture.
* **`vite` (`^6.1.0`)**: Next-generation client bundler and rapid HMR development server.
* **`tailwindcss` (`^3.4.17`)**: Utility-first CSS styling and custom color token design system.
* **`recharts` (`^2.15.1`)**: Responsive SVG charting library for interactive multi-domain radars, distribution charts, and trends.
* **`lucide-react` (`^0.475.0`)**: Comprehensive iconography for health indicators, navigational states, and urgency tiers.
* **`clsx` & `tailwind-merge`**: Dynamic, collision-free Tailwind class composition.

---

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Syed-arsh-09/DHPA-health-atlas.git
cd DHPA-health-atlas
```

### 2. Set Up Python Environment
Create and activate a virtual environment:

* **Windows (PowerShell):**
  ```powershell
  python -m venv .venv
  .venv\Scripts\Activate.ps1
  ```
* **macOS / Linux:**
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  ```

Install Python dependencies:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Set Up Frontend Environment
Navigate to the `frontend/` directory and install npm packages:
```bash
cd frontend
npm install
cd ..
```

---

## Execution Instructions

The project is architected in two decoupled layers: the offline **Python Machine Learning Pipeline** (`src/`) and the **Interactive Web Decision Dashboard** (`frontend/`).

### 1. Running the Analytics & ML Pipeline (Steps 1 to 5)
Run the pipeline scripts sequentially from the repository root:

```bash
# Step 1: Clean raw NFHS-5 factsheets, audit missingness, and establish suppression flags
python src/step1_data_pipeline.py

# Step 2: Build the master indicator decision register (Keep: 54, Contextual: 46, Exclude: 4)
python src/build_master_decision_register.py

# Step 3.1: Audit 1,431 pairwise correlations and prune collinear redundancies
python src/step3_4_correlation_redundancy.py

# Step 3.2: Lock the final 47 core analytical indicators
python src/step3_5_final_feature_selection.py

# Step 3.3: Apply Yeo-Johnson variance stabilization and Z-score standardization
python src/step3_6_preprocessing.py

# Step 4.1: Compute PCA diagnostics, Scree plot, Kaiser criterion, and factor loadings
python src/step4_1_pca_diagnostics.py

# Step 4.2: Benchmark K-Means vs Agglomerative vs GMM across k=3 to 8
python src/step4_2_clustering_benchmark.py

# Step 4.3: Fit final Engine A model (k=4) and profile national archetypes
python src/step4_3_cluster_profiling.py

# Step 5.1: Execute Engine B tri-tier clustering across 6 domains & calculate compound scores
python src/step5_1_category_clustering.py

# Step 5.2: Generate deterministic, indicator-traceable NHM policy recommendations
python src/step5_2_recommendation_engine.py
```

### 2. Exporting Production Datasets to Frontend
Consolidate the analytical outputs into optimized JSON files for the web application:
```bash
python src/export_frontend_data.py
```
*Outputs generated:*
* `frontend/src/data/districts.json`: Full records for all 706 districts (cluster IDs, PCA coordinates, compound scores, domain tiers, indicator values, and rule triggers).
* `frontend/src/data/metadata.json`: National benchmarks, state-level aggregations, indicator definitions, and PCA variance tables.

### 3. Running the Interactive Decision Dashboard

#### Start Development Server:
```bash
cd frontend
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

#### Build for Production:
```bash
cd frontend
npm run build
```
The compiled, minified production assets will be output to `frontend/dist/`.

#### Preview Production Build Locally:
```bash
cd frontend
npm run preview
```

### 4. Deploying to Vercel
The repository is pre-configured for Vercel Services via [`vercel.json`](vercel.json):
* **Frontend Service (`frontend`):** Built automatically via the Vite framework preset.
* **Backend Service (`app`):** Python WSGI entrypoint defined in [`main.py`](main.py) for `/api` health and metadata endpoints.
* **Top-Level Rewrites:** Directs `/api/(.*)` to the Python service and `/(.*)` to the React frontend SPA.

To deploy using the [Vercel CLI](https://vercel.com/docs/cli):
```bash
vercel
```

---

## Repository Structure

```text
DHPA-health-atlas/
├── data/
│   ├── raw/
│   │   └── NFHS(factSheet).csv                # Raw MoHFW / IIPS district factsheet dataset
│   └── processed/
│       ├── step1_district_health_cleaned.csv  # Standardized 706-district tabular data
│       ├── step3_6_analysis_ready.csv         # 47D Yeo-Johnson & Z-score standardized matrix
│       ├── step3_6_imputed.csv                # Natural-scale matrix with audited median imputations
│       ├── step4_1_pca_transformed.csv        # Orthogonal PCA coordinates (PC1 to PC47)
│       ├── step4_3_district_cluster_assignments.csv # Engine A macro cluster classifications
│       ├── step5_1_engine_b_domain_clusters.csv    # Engine B domain tiers & compound scores
│       └── step5_2_district_recommendations.csv    # Deterministic NHM policy action triggers
├── frontend/                                  # React 18 + Vite decision platform
│   ├── public/
│   ├── src/
│   │   ├── components/                        # UI components (Navbar, Cursor, Badges)
│   │   ├── data/                              # Pre-compiled JSON datasets
│   │   │   ├── districts.json                 # 706 district profiles (zero-latency client query)
│   │   │   └── metadata.json                  # National averages, states, and benchmark stats
│   │   ├── views/                             # Primary analytical dashboard views
│   │   │   ├── HomeOverview.jsx               # National KPI aggregates & 4-cluster cards
│   │   │   ├── DistrictProfile.jsx            # Deep-dive district audit, radar & rule logs
│   │   │   ├── CategoryAnalysis.jsx           # Domain-by-domain sector explorer
│   │   │   ├── OverlappingVulnerabilities.jsx # Radar tracking 100 Mission-Mode districts
│   │   │   ├── StateAnalysis.jsx              # Intra-state district divergence explorer
│   │   │   └── Methodology.jsx                # Statistical architecture documentation
│   │   ├── App.jsx                            # Main application layout and view router
│   │   ├── index.css                          # Tailwind design system & styling rules
│   │   └── main.jsx                           # React DOM mount point
│   ├── package.json                           # Node dependencies and build scripts
│   ├── tailwind.config.js                     # DHPA custom color palette & typography
│   └── vite.config.js                         # Bundler configuration
├── outputs/
│   ├── reports/                               # Comprehensive Excel audit registers
│   │   ├── RHPA_Master_Feature_Decision_Register.xlsx
│   │   ├── RHPA_Step3_4_Correlation_Redundancy.xlsx
│   │   ├── RHPA_Step3_5_Final_Feature_Selection.xlsx
│   │   ├── RHPA_Step3_6_Preprocessing.xlsx
│   │   ├── RHPA_Step4_1_PCA_Diagnostics.xlsx
│   │   ├── RHPA_Step4_2_Clustering_Benchmark.xlsx
│   │   ├── RHPA_Step4_3_Cluster_Profiles.xlsx
│   │   ├── RHPA_Step5_1_Engine_B_Analysis.xlsx
│   │   └── RHPA_Step5_2_Service_Recommendations.xlsx
│   └── visuals/                               # High-resolution diagnostic charts & plots
│       ├── step4_1_scree_plot.png
│       ├── step4_2_clustering_metrics.png
│       ├── step4_3_cluster_radar_chart.png
│       ├── step5_1_domain_vulnerability_heatmap.png
│       └── step5_1_compound_vulnerability_dist.png
├── src/                                       # Modular Python data science pipeline
│   ├── step1_data_pipeline.py                 # Ingestion, validation & quality flags
│   ├── build_master_decision_register.py      # Feature curation register
│   ├── step3_4_correlation_redundancy.py      # Spearman/Pearson collinearity pruning
│   ├── step3_5_final_feature_selection.py     # 47-indicator feature lock
│   ├── step3_6_preprocessing.py               # Yeo-Johnson transform & Z-standardization
│   ├── step4_1_pca_diagnostics.py             # PCA decomposition & factor loadings
│   ├── step4_2_clustering_benchmark.py        # Algorithm evaluation (K-Means, Ward, GMM)
│   ├── step4_3_cluster_profiling.py           # Engine A profiling & natural unit gaps
│   ├── step5_1_category_clustering.py         # Engine B domain clustering & overlap analysis
│   ├── step5_2_recommendation_engine.py       # Deterministic NHM policy rule triggers
│   ├── generate_dark_visuals.py               # Dark-themed presentation graphics generator
│   └── export_frontend_data.py                # JSON pipeline compiler for web dashboard
├── .gitignore                                 # Git ignore patterns (Python, Node, agent caches)
├── LICENSE                                    # MIT License
├── main.py                                    # WSGI Python API service entrypoint
├── requirements.txt                           # Core Python dependencies
├── vercel.json                                # Multi-service Vercel deployment configuration
└── README.md                                  # Project documentation
```

---

## Analytical Methodology & Pipeline Architecture

```
NFHS-5 District Data (706 Districts × 109 Indicators)
  │
  ├─▶ Step 1 & 2: Audit & Imputation (54 Keep, 46 Contextual, 4 Exclude; 42 Median Imputations)
  │
  ├─▶ Step 3: Statistical Hygiene (1,431 Correlations Checked ➔ 47 Core Indicators ➔ Yeo-Johnson + Z-Score)
  │
  ├─▶ Step 4.1: PCA Diagnostics (11 Components Explain 71.2% Variance under Kaiser Criterion λ ≥ 1)
  │
  ├─▶ Step 4.2 & 4.3: Engine A Macro Typology (K-Means k=4, Silhouette: 0.1160, ARI: 0.974 vs PCA)
  │     ├── Cluster 1: Advanced Infrastructure & Emerging Lifestyle / NCD Risk (205 Districts, 29.0%)
  │     ├── Cluster 2: Intermediate / Progressing Health Profile (256 Districts, 36.3%)
  │     ├── Cluster 3: High Foundational Healthcare Vulnerability (182 Districts, 25.8%)
  │     └── Cluster 4: Distinct Hill & Northeastern Health Geography (63 Districts, 8.9%)
  │
  ├─▶ Step 5.1: Engine B Domain Micro-Triage (Independent Tri-Tier Clustering across 6 Sectors)
  │     └── Compound Vulnerability Score (0 to 6 Deficit Count across Sectors)
  │           └── Identifies the 100 Mission-Mode Districts (Score ≥ 4)
  │
  └─▶ Step 5.2: Recommendation Engine (Deterministic Threshold Triggers ➔ Mapped to NHM Schemes)
```

### Four National Healthcare Archetypes (Engine A)
1. **Cluster 1: Advanced Infrastructure & Emerging Lifestyle/NCD Risk ($N=205$, $29.0\%$)**
   * *Profile:* Near-universal institutional delivery ($96.8\%$), high 4+ ANC adherence ($75.0\%$), and robust sanitation ($88.5\%$).
   * *Emerging Deficit:* Elevated female obesity ($35.5\%$) and adult high blood glucose ($16.7\%$). Requires secondary screening clinics rather than basic delivery subsidies.
2. **Cluster 2: Intermediate / Progressing Health Profile ($N=256$, $36.3\%$)**
   * *Profile:* Strong routine childhood vaccination ($83.3\%$) and delivery coverage ($91.3\%$).
   * *Bottleneck:* Widespread nutritional and micronutrient shortfalls: child anaemia ($70.2\%$) and maternal anaemia ($60.2\%$).
3. **Cluster 3: High Foundational Healthcare Vulnerability ($N=182$, $25.8\%$)**
   * *Profile:* Severe overlapping primary care deficits: 4+ ANC visits under $41\%$, child stunting at $40.5\%$, underage female marriage at $30.0\%$, and sanitation at $59.5\%$. Concentrated in the central/northern plains and tribal corridors.
4. **Cluster 4: Distinct Hill & Northeastern Health Geography ($N=63$, $8.9\%$)**
   * *Profile:* High female literacy ($88.2\%$) and clean water access ($84.2\%$), but severe geographic barriers: institutional deliveries drop to $69.1\%$, out-of-pocket delivery costs peak at ₹7,513, and male tobacco consumption reaches $55.5\%$.

### Six Domain-Specific Sectors (Engine B)
To prevent strong performance in one area from masking failures in another, Engine B clusters each district into **Tier 1 (Low)**, **Tier 2 (Moderate)**, and **Tier 3 (High Vulnerability)** across six domains:
1. *Maternal & Newborn Care* (9 indicators; anchor: institutional births)
2. *Child Immunisation & Preventative Care* (4 indicators; anchor: full vaccination 12–23m)
3. *Nutritional Status & Anaemia* (8 indicators; anchor: child stunting $<5$ yrs)
4. *Reproductive Health & Family Planning* (7 indicators; anchor: modern contraceptive usage)
5. *NCD Risk & Preventive Screening* (7 indicators; anchor: adult blood glucose / hypertension)
6. *Household Amenities & Healthcare Financing* (4 indicators; anchor: health insurance coverage)

*Key Finding:* **31 districts** classified as "Advanced" in Engine A harbor severe **Tier 3 High Vulnerability** in chronic NCD screening or reproductive care (e.g., Nicobars district exhibits $96\%$ institutional births but has $47\%$ male elevated blood pressure and only $2.7\%$ insurance coverage).

### The 100 Mission-Mode Districts & Recommendation Engine
The **Compound Multi-Domain Vulnerability Score** ($0\text{--}6$) tallies how many times a district enters Tier 3. Exactly **100 districts** in India suffer from compound scores of 4, 5, or 6, representing systemic multi-sector collapse.

The **Deterministic Recommendation Engine** audits indicator values against clinical benchmarks and assigns actionable directives mapped directly to National Health Mission programs:
* **Maternal Deficits ($<80\%$ delivery, $<50\%$ 4+ ANC):** Mobilize Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA), Janani Suraksha Yojana (JSY), and LaQshya facility upgrades.
* **Immunisation Deficits ($<70\%$ full vaccination, $<25\%$ Measles dose 2):** Launch Intensified Mission Indradhanush (IMI) catch-up drives with U-WIN digital tracking.
* **Nutritional Deficits ($>35\%$ stunting, $>65\%$ child anaemia):** Intensify POSHAN Abhiyaan counseling, community NRCs, and Anaemia Mukt Bharat point-of-care digital Hb-meters with bi-weekly IFA syrup.
* **NCD Burden ($>25\%$ hypertension, $>16\%$ high glucose):** Transition PHCs into Ayushman Arogya Mandirs (Health & Wellness Centres) and enforce India Hypertension Control Initiative (IHCI) protocols.
* **Financial Burden ($>₹5,000$ out-of-pocket delivery expense):** Conduct Ayushman Bharat PM-JAY card saturation camps and audit JSSK entitlements.

---

## Author & Academic Context

* **Author:** Syed Arsh Ahmad
* **Program:** B.Tech — Computer Science & Engineering
* **Course:** INT-396 (Capstone Project)
* **GitHub Repository:** [Syed-arsh-09/DHPA-health-atlas](https://github.com/Syed-arsh-09/DHPA-health-atlas)

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for complete details.

---

## Acknowledgements

* **Ministry of Health and Family Welfare (MoHFW), Government of India**
* **International Institute for Population Sciences (IIPS), Mumbai** for conducting and publishing the NFHS-5 survey dataset.
* Open-source contributors in the Python and React developer ecosystems.
