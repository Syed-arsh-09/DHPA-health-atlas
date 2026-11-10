import React from 'react';

export default function Methodology({ metadata }) {
  const benchmarkRows = metadata.benchmark || [];
  const pcaRows = metadata.pca?.variance_breakdown || [];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8">
        <div className="max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Methodology & Statistical Architecture
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            The DHPA framework is built on a dual-engine architecture adhering to strict epidemiological, dimensional, and statistical principles. Every cluster boundary, principal component loading, and service recommendation is mathematically traceable back to audited NFHS-5 micro-data.
          </p>
        </div>
      </section>

      {/* Analytical Workflow Steps */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            End-to-End Analytical Pipeline (Steps 1 to 5)
          </h2>
          <p className="text-xs text-slate-400">
            Chronological execution flow from raw NFHS-5 fact sheets to policy prescriptions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1.5">
            <span className="text-[11px] font-semibold text-sky-400 block">Step 1 & 2</span>
            <h3 className="text-xs font-bold text-white">Pipeline & Data Audit</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Standardized 706 districts × 109 raw indicators. Audited and locked all 104 feature indicators into Keep (54), Contextual (46), and Exclude (4).
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1.5">
            <span className="text-[11px] font-semibold text-emerald-400 block">Step 3</span>
            <h3 className="text-xs font-bold text-white">Redundancy & Scaling</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Computed 1,431 pairwise correlations. Reduced candidate features from 54 → 47 locked Keep features. Applied Yeo-Johnson transformations & Z-scores.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1.5">
            <span className="text-[11px] font-semibold text-amber-400 block">Step 4.1</span>
            <h3 className="text-xs font-bold text-white">PCA Diagnostics</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Decomposed 47 indicators into orthogonal axes. Identified 11 components under Kaiser criterion (λ ≥ 1) explaining 71.2% total variance.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1.5">
            <span className="text-[11px] font-semibold text-rose-400 block">Step 4.2 & 4.3</span>
            <h3 className="text-xs font-bold text-white">Engine A Profiling</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Benchmarked K-Means, Agglomerative, GMM (k=3..8). Validated 97.4% consensus between 47D and PCA space. Locked 4 national typologies.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1.5">
            <span className="text-[11px] font-semibold text-purple-400 block">Step 5.1 & 5.2</span>
            <h3 className="text-xs font-bold text-white">Engine B & Rules</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Domain-specific tri-tier clustering across 6 sectors. Quantified compound overlap (0 to 6) and mapped NHM flagship interventions.
            </p>
          </div>
        </div>
      </section>

      {/* Model Benchmark Table */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Clustering Algorithm Benchmarking (Standardized 47D Feature Space)
          </h2>
          <p className="text-xs text-slate-400">
            Systematic evaluation of cluster cohesion, separation, and size balance across candidate cluster counts
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-medium text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Algorithm</th>
                <th className="py-2.5 px-2 text-center">k</th>
                <th className="py-2.5 px-3 text-right">Silhouette (↑)</th>
                <th className="py-2.5 px-3 text-right">Davies–Bouldin (↓)</th>
                <th className="py-2.5 px-3 text-right">Calinski–Harabasz (↑)</th>
                <th className="py-2.5 px-3 text-right">Size Ratio (Max/Min)</th>
                <th className="py-2.5 px-3 text-center">Decision Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 tabular-nums">
              <tr className="bg-slate-850">
                <td className="py-2.5 px-3 font-semibold text-white">K-Means (Selected Model)</td>
                <td className="py-2.5 px-2 text-center font-bold text-sky-400">4</td>
                <td className="py-2.5 px-3 text-right font-medium text-white">0.1160</td>
                <td className="py-2.5 px-3 text-right font-medium text-white">2.2863</td>
                <td className="py-2.5 px-3 text-right font-medium text-white">88.43</td>
                <td className="py-2.5 px-3 text-right text-emerald-400 font-medium">4.06</td>
                <td className="py-2.5 px-3 text-center text-sky-400 font-medium">Locked Primary Solution (ARI = 0.974 vs PCA 11D)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-slate-300">K-Means</td>
                <td className="py-2.5 px-2 text-center">3</td>
                <td className="py-2.5 px-3 text-right">0.1495</td>
                <td className="py-2.5 px-3 text-right">2.0434</td>
                <td className="py-2.5 px-3 text-right">98.75</td>
                <td className="py-2.5 px-3 text-right text-slate-400">5.48</td>
                <td className="py-2.5 px-3 text-center text-slate-400">Coarse macro split, blurs Hill/NE distinctness</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-slate-300">K-Means</td>
                <td className="py-2.5 px-2 text-center">5</td>
                <td className="py-2.5 px-3 text-right">0.1005</td>
                <td className="py-2.5 px-3 text-right">2.4046</td>
                <td className="py-2.5 px-3 text-right">77.53</td>
                <td className="py-2.5 px-3 text-right text-slate-400">2.74</td>
                <td className="py-2.5 px-3 text-center text-slate-400">Splits Advanced Cluster without clinical variance</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-slate-300">Agglomerative (Ward)</td>
                <td className="py-2.5 px-2 text-center">4</td>
                <td className="py-2.5 px-3 text-right">0.0961</td>
                <td className="py-2.5 px-3 text-right">2.3069</td>
                <td className="py-2.5 px-3 text-right">75.25</td>
                <td className="py-2.5 px-3 text-right text-slate-400">4.61</td>
                <td className="py-2.5 px-3 text-center text-slate-400">Moderate agreement (ARI = 0.48)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-slate-300">Gaussian Mixture (GMM)</td>
                <td className="py-2.5 px-2 text-center">4</td>
                <td className="py-2.5 px-3 text-right">0.1062</td>
                <td className="py-2.5 px-3 text-right">2.4167</td>
                <td className="py-2.5 px-3 text-right">83.08</td>
                <td className="py-2.5 px-3 text-right text-slate-400">3.98</td>
                <td className="py-2.5 px-3 text-center text-slate-400">High consensus with K-Means (ARI = 0.70)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* PCA Diagnostics & Factor Loadings */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            PCA Dimensionality & Factor Loadings
          </h2>
          <p className="text-xs text-slate-400">
            Confirming that Indian district healthcare is inherently multi-dimensional (11 components required for 71.2% variance)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-sky-400">PC1 (21.84% Variance)</span>
              <span className="text-[11px] text-slate-400 tabular-nums">λ = 10.27</span>
            </div>
            <h3 className="text-xs font-semibold text-white">Socioeconomic & Nutrition Transition</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
              <strong className="text-emerald-400">Positive Pole:</strong> Female Literacy (+0.73), Clean Fuel (+0.74), Adult Obesity (+0.82).<br/>
              <strong className="text-rose-400">Negative Pole:</strong> Male Tobacco (-0.71), Child Stunting (-0.67), Early Marriage (-0.58).
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-emerald-400">PC2 (12.41% Variance)</span>
              <span className="text-[11px] text-slate-400 tabular-nums">λ = 5.83</span>
            </div>
            <h3 className="text-xs font-semibold text-white">Healthcare Delivery vs Financial Burden</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
              <strong className="text-emerald-400">Positive Pole:</strong> Delivery Out-of-Pocket (+0.62), Unmet Family Planning (+0.50).<br/>
              <strong className="text-rose-400">Negative Pole:</strong> Postnatal Care (-0.61), Tetanus Protection (-0.60), 4+ ANC (-0.57).
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-amber-400">PC3 (7.67% Variance)</span>
              <span className="text-[11px] text-slate-400 tabular-nums">λ = 3.60</span>
            </div>
            <h3 className="text-xs font-semibold text-white">Public Delivery vs Substance Consumption</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
              <strong className="text-emerald-400">Positive Pole:</strong> Adult Alcohol Use (+0.51), Public Facility Delivery (+0.50).<br/>
              <strong className="text-rose-400">Negative Pole:</strong> Improved Water Source (-0.47), Cancer Screening (-0.38).
            </p>
          </div>
        </div>
      </section>

      {/* Dataset & Limitations */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Data Source Conventions & Statistical Hygiene
          </h2>
          <p className="text-xs text-slate-400">
            Adherence to Ministry of Health & Family Welfare (MoHFW) standards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-white">Data Scope & Source</h3>
            <p className="leading-relaxed">
              All metrics originate from the official Ministry of Health and Family Welfare (MoHFW) National Family Health Survey 5 (NFHS-5, 2019-21) Fact Sheets. The pipeline evaluates all 706 surveyed districts across all 28 States and 8 Union Territories.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-white">Suppression & Reliability Audit</h3>
            <p className="leading-relaxed">
              In accordance with IIPS NFHS-5 reporting standards, parenthesized figures (based on 25–49 unweighted cases) are retained with quality flags. The 42 suppressed cells across 6 indicators (&lt;25 unweighted cases) were imputed using state-level medians or national medians with full indicator-level provenance.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
