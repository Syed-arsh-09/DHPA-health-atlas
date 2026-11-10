import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  ShieldAlert, 
  Layers, 
  ArrowRight,
  AlertCircle,
  Activity,
  Search
} from 'lucide-react';

export default function HomeOverview({ districts, metadata, onNavigateState, onNavigateDistrict }) {
  const [stateSearch, setStateSearch] = useState('');

  // Key Aggregates
  const totalDistricts = districts.length;
  const totalStates = metadata.states.length;
  const missionModeCount = districts.filter(d => d.compound_vulnerability.score >= 4).length;
  const moderateOverlapCount = districts.filter(d => [2, 3].includes(d.compound_vulnerability.score)).length;
  const isolatedCount = districts.filter(d => d.compound_vulnerability.score === 1).length;
  const resilientCount = districts.filter(d => d.compound_vulnerability.score === 0).length;

  const clusterProfiles = [
    {
      id: 1,
      title: "Cluster 1: Advanced & Lifestyle / NCD Risk",
      count: 205,
      pct: "29.0%",
      status: "Epidemiological Transition",
      statusColor: "text-sky-400 bg-sky-950/50 border-sky-800/60",
      description: "Near-universal maternal and delivery access, but high burden of adult metabolic risks requiring specialized non-communicable disease screening and clinical management.",
      metrics: [
        { label: "Institutional Deliveries", val: "96.8%" },
        { label: "4+ Antenatal Visits", val: "75.0%" },
        { label: "Female Obesity (BMI ≥ 25)", val: "35.5%" },
        { label: "High Blood Glucose", val: "16.7%" }
      ]
    },
    {
      id: 2,
      title: "Cluster 2: Intermediate Progressing Profile",
      count: 256,
      pct: "36.3%",
      status: "Transitioning Primary Care",
      statusColor: "text-emerald-400 bg-emerald-950/50 border-emerald-800/60",
      description: "Strong childhood routine immunisation and hospital delivery rates, yet compromised by widespread nutritional shortfalls, chronic child anaemia, and maternal micronutrient gaps.",
      metrics: [
        { label: "Full Child Immunisation", val: "83.3%" },
        { label: "Institutional Deliveries", val: "91.3%" },
        { label: "Child Anaemia (<11 g/dl)", val: "70.2%" },
        { label: "Maternal Anaemia", val: "60.2%" }
      ]
    },
    {
      id: 3,
      title: "Cluster 3: Foundational Primary Care Deficits",
      count: 182,
      pct: "25.8%",
      status: "High Foundational Vulnerability",
      statusColor: "text-rose-400 bg-rose-950/50 border-rose-800/60",
      description: "Severe overlapping basic deficits across maternal care adherence, child stunting, adolescent marriage, and basic household sanitation. Requires comprehensive foundational health systems investments.",
      metrics: [
        { label: "4+ Antenatal Visits", val: "40.9%" },
        { label: "Child Stunting (<5 yrs)", val: "40.5%" },
        { label: "Underage Female Marriage", val: "30.0%" },
        { label: "Improved Sanitation", val: "59.5%" }
      ]
    },
    {
      id: 4,
      title: "Cluster 4: Hill & Northeastern Health Geography",
      count: 63,
      pct: "8.9%",
      status: "Geographic & Financial Bottleneck",
      statusColor: "text-amber-400 bg-amber-950/50 border-amber-800/60",
      description: "High female literacy and sanitation paired with physical topography barriers, delayed institutional delivery, steep out-of-pocket expenses, and elevated male tobacco consumption.",
      metrics: [
        { label: "Institutional Deliveries", val: "69.1%" },
        { label: "Avg Delivery Out-of-Pocket", val: "₹7,513" },
        { label: "Male Tobacco Consumption", val: "55.5%" },
        { label: "Improved Sanitation", val: "84.2%" }
      ]
    }
  ];

  const filteredStates = metadata.states.filter(s => 
    s.state.toLowerCase().includes(stateSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      
      {/* Executive Overview Header */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8">
        <div className="max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            District Healthcare Inequality & Priority Atlas
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            A dual-engine analytical framework synthesizing 47 audited NFHS-5 clinical and infrastructure indicators across 706 districts to establish macro healthcare typologies, detect compound multi-domain deficits, and prescribe indicator-traceable National Health Mission interventions.
          </p>
        </div>

        {/* Unified National Metric Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div className="pr-4">
            <span className="text-xs text-slate-400 block font-medium">Districts Evaluated</span>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1 tabular-nums">706</div>
            <div className="text-xs text-slate-400 mt-0.5">36 States & Union Territories</div>
          </div>

          <div className="pr-4 border-l-0 lg:border-l border-slate-800 lg:pl-6">
            <span className="text-xs text-slate-400 block font-medium">Validated Indicators</span>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1 tabular-nums">47</div>
            <div className="text-xs text-slate-400 mt-0.5">Across 14 Clinical Categories</div>
          </div>

          <div className="pr-4 border-l-0 lg:border-l border-slate-800 lg:pl-6">
            <span className="text-xs text-slate-400 block font-medium">Compound Crisis Districts</span>
            <div className="text-2xl sm:text-3xl font-bold text-rose-400 mt-1 tabular-nums">{missionModeCount}</div>
            <div className="text-xs text-slate-400 mt-0.5">≥4 Deficit Domains (Mission Mode)</div>
          </div>

          <div className="border-l-0 lg:border-l border-slate-800 lg:pl-6">
            <span className="text-xs text-slate-400 block font-medium">Engine A Typologies</span>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1 tabular-nums">4</div>
            <div className="text-xs text-slate-400 mt-0.5">Structural Healthcare Archetypes</div>
          </div>
        </div>
      </section>

      {/* Engine A: The 4 Macro Typologies */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Engine A — National District Healthcare Typologies
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Macro classification capturing foundational health system capacity and transition stages (k = 4 K-Means)
            </p>
          </div>
          <span className="text-xs text-slate-400 tabular-nums">706 Districts • 47D Standardized Space</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {clusterProfiles.map(c => (
            <div 
              key={c.id} 
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${c.statusColor}`}>
                      {c.status}
                    </span>
                    <h3 className="text-base font-bold text-white mt-2">{c.title}</h3>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-bold text-white tabular-nums">{c.count}</span>
                    <span className="text-xs text-slate-400 block tabular-nums">{c.pct} of India</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-3">
                  {c.description}
                </p>
              </div>

              {/* Indicator Metrics Table */}
              <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-slate-800">
                {c.metrics.map((m, idx) => (
                  <div key={idx} className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400 block truncate">{m.label}</span>
                    <span className="text-sm font-semibold text-white mt-0.5 block tabular-nums">{m.val}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Engine B: Compound Multi-Domain Overlap Distribution */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Engine B — Compound Multi-Domain Overlap Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Categorizing districts by the number of independent functional domains (out of 6) in High Vulnerability Tier 3
          </p>
        </div>

        {/* Proportional Spectrum Bar */}
        <div className="space-y-2">
          <div className="flex h-3 w-full rounded-md overflow-hidden bg-slate-950 border border-slate-800">
            <div style={{ width: '14.2%' }} className="bg-rose-500" title="Compound Crisis (14.2%)"></div>
            <div style={{ width: '40.7%' }} className="bg-amber-500" title="Moderate Overlap (40.7%)"></div>
            <div style={{ width: '36.7%' }} className="bg-sky-500" title="Isolated Deficit (36.7%)"></div>
            <div style={{ width: '8.5%' }} className="bg-emerald-500" title="Resilient (8.5%)"></div>
          </div>
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Compound Crisis (14.2%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Moderate Overlap (40.7%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <span>Isolated Deficit (36.7%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Resilient Baseline (8.5%)</span>
            </span>
          </div>
        </div>

        {/* 4 Urgency Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-rose-400">Tier 1 • Compound Crisis</span>
              <span className="text-xl font-bold text-white tabular-nums">{missionModeCount}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              4 to 6 deficit domains. Severe simultaneous breakdown across maternal care, child nutrition, routine immunisation, and sanitation.
            </p>
            <div className="text-[11px] text-slate-400 font-medium pt-1">
              Action: Immediate Mission Mode
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-amber-400">Tier 2 • Moderate Overlap</span>
              <span className="text-xl font-bold text-white tabular-nums">{moderateOverlapCount}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              2 to 3 deficit domains. Requires inter-departmental convergence between Health, Women & Child Development, and Jal Jeevan Mission.
            </p>
            <div className="text-[11px] text-slate-400 font-medium pt-1">
              Action: Multi-Sector Convergence
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-sky-400">Tier 3 • Isolated Deficit</span>
              <span className="text-xl font-bold text-white tabular-nums">{isolatedCount}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              1 deficit domain. Strong baseline system performance with a single isolated clinical vulnerability (e.g. Adult NCDs or Anaemia).
            </p>
            <div className="text-[11px] text-slate-400 font-medium pt-1">
              Action: Targeted Vertical Program
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-emerald-400">Tier 4 • Resilient Baseline</span>
              <span className="text-xl font-bold text-white tabular-nums">{resilientCount}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              0 deficit domains. High-performing benchmark districts with sustained maternal, child, preventive, and infrastructural coverage.
            </p>
            <div className="text-[11px] text-slate-400 font-medium pt-1">
              Action: Prevent Quality Erosion
            </div>
          </div>
        </div>
      </section>

      {/* State & Union Territory Directory */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              State & Union Territory Directory
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Select any state to open detailed district vulnerability rankings and domain heatmaps
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter states..."
              value={stateSearch}
              onChange={(e) => setStateSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {filteredStates.map(s => (
            <button
              key={s.state}
              onClick={() => onNavigateState(s.state)}
              className="text-left bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 rounded-lg p-3 transition-colors group"
            >
              <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                {s.state}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                <span className="tabular-nums">{s.district_count} dist.</span>
                {s.mission_mode_count > 0 ? (
                  <span className="text-rose-400 font-medium tabular-nums">{s.mission_mode_count} urgent</span>
                ) : (
                  <span className="text-slate-400 tabular-nums">0 urgent</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

    </div>
  );
}
