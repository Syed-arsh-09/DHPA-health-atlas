import React from 'react';
import { 
  BookOpen, 
  Layers, 
  Activity, 
  CheckCircle2, 
  HelpCircle, 
  Cpu, 
  Database,
  BarChart2,
  FileSpreadsheet
} from 'lucide-react';

export default function Methodology({ metadata }) {
  const benchmarkRows = metadata.benchmark || [];
  const pcaRows = metadata.pca?.variance_breakdown || [];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          Reproducible Analytical Architecture
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Data Science Methodology, Model Evaluation & Limitations
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          The DHPA framework is built on a dual-engine architecture adhering to strict epidemiological, dimensional, and statistical principles. Every cluster boundary and recommendation is mathematically audited and verifiable.
        </p>
      </div>

      {/* Analytical Workflow Steps */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            End-to-End Analytical Pipeline (Steps 1 to 5)
          </h2>
          <p className="text-xs text-slate-400">Chronological execution flow from raw NFHS-5 fact sheets to policy prescriptions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Phase 1 & 2</span>
            <h3 className="text-sm font-bold text-white">Data Pipeline & Audit</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Standardized 706 districts × 109 raw indicators. Audited and locked all 104 feature indicators into Keep (54), Contextual (46), and Exclude (4).
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Phase 3</span>
            <h3 className="text-sm font-bold text-white">Redundancy & Scaling</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Calculated 1,431 pairwise correlations. Reduced candidate features from 54 → 47 locked Keep features. Applied Yeo-Johnson transformations & Z-scores.
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Step 4.1</span>
            <h3 className="text-sm font-bold text-white">PCA Diagnostics</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Decomposed 47 indicators into orthogonal axes. Identified 11 components under Kaiser criterion (λ ≥ 1) explaining 71.2% total variance.
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Step 4.2 & 4.3</span>
            <h3 className="text-sm font-bold text-white">Engine A Profiling</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Benchmarked K-Means, Agglomerative, GMM (k=3..8). Validated 97.4% consensus between 47D and PCA space. Locked 4 national typologies.
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Step 5.1 & 5.2</span>
            <h3 className="text-sm font-bold text-white">Engine B & Action Rules</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Domain-specific tri-tier clustering across 6 sectors. Quantified compound overlap (0 to 6) and mapped NHM flagship interventions.
            </p>
          </div>
        </div>
      </section>

      {/* Model Benchmark Table */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-emerald-400" />
            Clustering Algorithm Benchmarking (Standardized 47D Feature Space)
          </h2>
          <p className="text-xs text-slate-400">
            Systematic evaluation of cluster cohesion, separation, and size balance across candidate cluster counts
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Algorithm</th>
                <th className="py-2.5 px-2 text-center">k</th>
                <th className="py-2.5 px-3 text-right">Silhouette Score (↑)</th>
                <th className="py-2.5 px-3 text-right">Davies–Bouldin (↓)</th>
                <th className="py-2.5 px-3 text-right">Calinski–Harabasz (↑)</th>
                <th className="py-2.5 px-3 text-right">Size Ratio (Max/Min)</th>
                <th className="py-2.5 px-3 text-center">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              <tr className="bg-blue-950/20 font-sans">
                <td className="py-2.5 px-3 font-bold text-white">K-Means (Optimal)</td>
                <td className="py-2.5 px-2 text-center font-bold text-blue-400">4</td>
                <td className="py-2.5 px-3 text-right font-bold text-white">0.1160</td>
                <td className="py-2.5 px-3 text-right font-bold text-white">2.2863</td>
                <td className="py-2.5 px-3 text-right font-bold text-white">88.43</td>
                <td className="py-2.5 px-3 text-right text-emerald-400">4.06</td>
                <td className="py-2.5 px-3 text-center text-blue-400 font-semibold">Selected Primary Solution</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-slate-300">K-Means</td>
                <td className="py-2.5 px-2 text-center">3</td>
                <td className="py-2.5 px-3 text-right">0.1495</td>
                <td className="py-2.5 px-3 text-right">2.0434</td>
                <td className="py-2.5 px-3 text-right">98.75</td>
                <td className="py-2.5 px-3 text-right text-slate-400">5.48</td>
                <td className="py-2.5 px-3 text-center text-slate-400 font-sans">Coarse macro split</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-slate-300">K-Means</td>
                <td className="py-2.5 px-2 text-center">5</td>
                <td className="py-2.5 px-3 text-right">0.1005</td>
                <td className="py-2.5 px-3 text-right">2.4046</td>
                <td className="py-2.5 px-3 text-right">77.53</td>
                <td className="py-2.5 px-3 text-right text-slate-400">2.74</td>
                <td className="py-2.5 px-3 text-center text-slate-400 font-sans">Splits Advanced Cluster</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-slate-300">Agglomerative (Ward)</td>
                <td className="py-2.5 px-2 text-center">4</td>
                <td className="py-2.5 px-3 text-right">0.0961</td>
                <td className="py-2.5 px-3 text-right">2.3069</td>
                <td className="py-2.5 px-3 text-right">75.25</td>
                <td className="py-2.5 px-3 text-right text-slate-400">4.61</td>
                <td className="py-2.5 px-3 text-center text-slate-400 font-sans">Good agreement (ARI=0.48)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-slate-300">Gaussian Mixture (GMM)</td>
                <td className="py-2.5 px-2 text-center">4</td>
                <td className="py-2.5 px-3 text-right">0.1062</td>
                <td className="py-2.5 px-3 text-right">2.4167</td>
                <td className="py-2.5 px-3 text-right">83.08</td>
                <td className="py-2.5 px-3 text-right text-slate-400">3.98</td>
                <td className="py-2.5 px-3 text-center text-slate-400 font-sans">Strong consensus (ARI=0.70)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* PCA Diagnostics & Factor Loadings */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            PCA Dimensionality & Factor Loadings
          </h2>
          <p className="text-xs text-slate-400">
            Confirming that Indian district healthcare is inherently multi-dimensional (11 components required for 71% variance)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-blue-400">PC1 (21.84% Variance)</span>
              <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded">λ = 10.27</span>
            </div>
            <h3 className="text-sm font-bold text-white">Socioeconomic & Nutrition Transition</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <strong className="text-emerald-400">Positive Pole:</strong> Female Literacy (+0.73), Clean Fuel (+0.74), Adult Obesity (+0.82).<br/>
              <strong className="text-rose-400">Negative Pole:</strong> Male Tobacco (-0.71), Child Stunting (-0.67), Early Marriage (-0.58).
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-400">PC2 (12.41% Variance)</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded">λ = 5.83</span>
            </div>
            <h3 className="text-sm font-bold text-white">Healthcare Delivery vs Financial Burden</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <strong className="text-emerald-400">Positive Pole:</strong> Delivery Out-of-Pocket (+0.62), Unmet Family Planning (+0.50).<br/>
              <strong className="text-rose-400">Negative Pole:</strong> Postnatal Care (-0.61), Tetanus Protection (-0.60), 4+ ANC (-0.57).
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-purple-400">PC3 (7.67% Variance)</span>
              <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded">λ = 3.60</span>
            </div>
            <h3 className="text-sm font-bold text-white">Regional Risk & Public Facility Reliance</h3>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <strong className="text-emerald-400">Positive Pole:</strong> Adult Alcohol Use (+0.51), Public Facility Delivery (+0.50).<br/>
              <strong className="text-rose-400">Negative Pole:</strong> Improved Water Source (-0.47), Cancer Screening (-0.38).
            </p>
          </div>
        </div>
      </section>

      {/* Dataset & Limitations */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            Data Source Conventions & Official Limitations
          </h2>
          <p className="text-xs text-slate-400">
            Key survey design nuances governing interpretation of NFHS-5 district estimates
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Dataset Scope (Rural + Urban)
            </h3>
            <p className="leading-relaxed">
              The dataset represents the official NFHS-5 District Fact Sheet covering combined rural and urban populations for 706 districts. It must not be characterized as rural-only unless filtered explicitly.
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              Separation of Missingness vs. Reliability
            </h3>
            <p className="leading-relaxed">
              Asterisk values (&lt;25 unweighted cases) represent data suppression and were imputed hierarchically using state/national medians. Parenthesized values (25-49 cases) are retained as numeric estimates with separate quality audit flags.
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              Traceable Recommendations
            </h3>
            <p className="leading-relaxed">
              Service recommendations are rule-based and transparent, mapping to actual indicator deficits and National Health Mission programs (PMSMA, Mission Indradhanush, POSHAN Abhiyaan, NP-NCD).
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2">
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              Non-Causal Interpretation
            </h3>
            <p className="leading-relaxed">
              Cluster assignments identify statistical proximity and potential service priorities. They do not represent causal clinical proof or formal government designations.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
