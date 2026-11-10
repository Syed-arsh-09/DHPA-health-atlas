import React from 'react';
import { 
  Building2, 
  MapPin, 
  ShieldAlert, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  HeartPulse,
  Activity,
  Users
} from 'lucide-react';

export default function HomeOverview({ districts, metadata, onNavigateState, onNavigateDistrict }) {
  // Key Aggregates
  const totalDistricts = districts.length;
  const totalStates = metadata.states.length;
  const missionModeCount = districts.filter(d => d.compound_vulnerability.score >= 4).length;
  const moderateOverlapCount = districts.filter(d => [2, 3].includes(d.compound_vulnerability.score)).length;
  const isolatedCount = districts.filter(d => d.compound_vulnerability.score === 1).length;
  const resilientCount = districts.filter(d => d.compound_vulnerability.score === 0).length;

  const clusterCards = [
    {
      id: 1,
      title: "Cluster 1: Advanced & Lifestyle/NCD Risk",
      count: 205,
      pct: "29.0%",
      badge: "Advanced Transition",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      accent: "border-blue-500/40",
      bgGradient: "from-blue-950/40 to-slate-900",
      description: "Near-universal institutional delivery (96.8%) and 4+ ANC visits (75.0%), but emerging adult metabolic risks with female obesity at 35.5% and high blood glucose at 16.7%.",
      highlights: ["96.8% Institutional Births", "35.5% Adult Obesity", "16.7% High Glucose"]
    },
    {
      id: 2,
      title: "Cluster 2: Intermediate Progressing Tier",
      count: 256,
      pct: "36.3%",
      badge: "Transitioning Tier",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      accent: "border-emerald-500/40",
      bgGradient: "from-emerald-950/40 to-slate-900",
      description: "Leads national routine childhood immunisation (83.3%) and strong delivery coverage (91.3%), but characterized by widespread child anaemia (70.2%) and maternal anaemia (60.2%).",
      highlights: ["83.3% Full Immunisation", "91.3% Institutional Births", "70.2% Child Anaemia"]
    },
    {
      id: 3,
      title: "Cluster 3: Foundational Health Deficits",
      count: 182,
      pct: "25.8%",
      badge: "High Primary Care Need",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      accent: "border-amber-500/40",
      bgGradient: "from-amber-950/40 to-slate-900",
      description: "Severe overlapping primary care shortfalls: 4+ ANC visits lag at 40.9%, child stunting reaches 40.5%, underage marriage is 30.0%, and improved sanitation is only 59.5%.",
      highlights: ["40.9% 4+ ANC Visits", "40.5% Child Stunting", "59.5% Sanitation"]
    },
    {
      id: 4,
      title: "Cluster 4: Hill & Northeastern Geography",
      count: 63,
      pct: "8.9%",
      badge: "Geographic Bottleneck",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      accent: "border-purple-500/40",
      bgGradient: "from-purple-950/40 to-slate-900",
      description: "High social capital and sanitation (84.2%), but marked by physical access barriers, institutional delivery lagging at 69.1%, high out-of-pocket costs (₹7,513), and male tobacco at 55.5%.",
      highlights: ["69.1% Institutional Births", "₹7,513 Delivery Out-of-Pocket", "55.5% Male Tobacco"]
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 mb-3">
            <HeartPulse className="w-3.5 h-3.5 text-blue-400" />
            NFHS-5 District Evidence Engine
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            District Healthcare Inequality Detection & Service Priority Clustering
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            A dual-engine analytical framework synthesizing <span className="text-white font-semibold">47 validated indicators</span> across all <span className="text-white font-semibold">706 Indian districts</span> to identify macro healthcare typologies, unmask compound multi-domain vulnerabilities, and prescribe indicator-traceable National Health Mission interventions.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-700/60">
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-blue-400" />
              Districts Audited
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">706</div>
            <div className="text-xs text-slate-400 mt-0.5">Across 36 States & UTs</div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <Layers className="w-4 h-4 text-emerald-400" />
              Locked Indicators
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">47</div>
            <div className="text-xs text-slate-400 mt-0.5">In 14 Clinical Categories</div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Mission-Mode
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 mt-1">{missionModeCount}</div>
            <div className="text-xs text-slate-400 mt-0.5">4+ Overlapping Deficits</div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <Activity className="w-4 h-4 text-purple-400" />
              Engine A Typologies
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 mt-1">4</div>
            <div className="text-xs text-slate-400 mt-0.5">Distinct District Profiles</div>
          </div>
        </div>
      </div>

      {/* Analytical Finding: The 4 Macro Typologies (Engine A) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Engine A — National District Healthcare Typologies
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Macro classification capturing structural health system performance and transition stages
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800/60 border border-slate-700/60 px-3 py-1 rounded-full self-start">
            k = 4 K-Means • 47D Indicators
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clusterCards.map(c => (
            <div 
              key={c.id} 
              className={`rounded-2xl border ${c.accent} bg-gradient-to-br ${c.bgGradient} p-5 sm:p-6 shadow-lg space-y-3 transition-all hover:border-slate-500`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${c.badgeColor}`}>
                    {c.badge}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1.5">{c.title}</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-white">{c.count}</span>
                  <span className="text-xs text-slate-400 block">{c.pct} of India</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {c.description}
              </p>

              <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-2">
                {c.highlights.map((h, i) => (
                  <span key={i} className="text-[11px] font-medium bg-slate-800/80 text-slate-200 px-2 py-1 rounded border border-slate-700">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Compound Vulnerability Distribution (Engine B) */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            Engine B — Compound Multi-Domain Overlap Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Categorizing districts by the number of independent healthcare domains (out of 6) in High Vulnerability Tier 3
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-rose-500/30 rounded-xl p-4">
            <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Compound Crisis (4–6)</div>
            <div className="text-3xl font-extrabold text-white mt-1">{missionModeCount}</div>
            <div className="text-xs text-slate-400 mt-1">14.2% • Immediate Mission Mode</div>
            <p className="text-[11px] text-slate-400 mt-2">Simultaneous breakdown across maternal care, child nutrition, immunisation and amenities.</p>
          </div>

          <div className="bg-slate-800/50 border border-amber-500/30 rounded-xl p-4">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Moderate Overlap (2–3)</div>
            <div className="text-3xl font-extrabold text-white mt-1">{moderateOverlapCount}</div>
            <div className="text-xs text-slate-400 mt-1">40.7% • Multi-Sector Convergence</div>
            <p className="text-[11px] text-slate-400 mt-2">Requires joint convergence across 2 to 3 departments (Health, WCD, Sanitation).</p>
          </div>

          <div className="bg-slate-800/50 border border-blue-500/30 rounded-xl p-4">
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Isolated Deficit (1)</div>
            <div className="text-3xl font-extrabold text-white mt-1">{isolatedCount}</div>
            <div className="text-xs text-slate-400 mt-1">36.7% • Targeted Vertical Action</div>
            <p className="text-[11px] text-slate-400 mt-2">Strong baseline performance with a single focused vulnerability (e.g. NCDs or Anaemia).</p>
          </div>

          <div className="bg-slate-800/50 border border-emerald-500/30 rounded-xl p-4">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Zero Deficits (0)</div>
            <div className="text-3xl font-extrabold text-white mt-1">{resilientCount}</div>
            <div className="text-xs text-slate-400 mt-1">8.5% • System Maintenance</div>
            <p className="text-[11px] text-slate-400 mt-2">Benchmark districts with robust coverage across all 6 core functional domains.</p>
          </div>
        </div>
      </section>

      {/* State Quick Explorer Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-400" />
              State & UT Healthcare Portfolios
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Select any state to inspect district distributions, vulnerability rankings, and priority heatmaps
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {metadata.states.map(s => (
            <button
              key={s.state}
              onClick={() => onNavigateState(s.state)}
              className="group text-left bg-slate-900 border border-slate-800 hover:border-blue-500/60 hover:bg-slate-800/60 rounded-xl p-3.5 transition-all shadow-md"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                {s.state}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                <span>{s.district_count} dist.</span>
                {s.mission_mode_count > 0 ? (
                  <span className="text-rose-400 font-semibold">{s.mission_mode_count} urgent</span>
                ) : (
                  <span className="text-emerald-400 font-medium">0 urgent</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

    </div>
  );
}
