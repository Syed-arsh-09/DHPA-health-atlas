import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  ShieldAlert, 
  Layers, 
  ArrowRight,
  AlertCircle,
  Activity,
  Search,
  Heart,
  Baby,
  Apple,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
import IndiaMap from '../components/IndiaMap';

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
      title: "Advanced Care • Emerging Lifestyle & NCD Risks",
      badge: "Urban & High Facility Access",
      count: 205,
      pct: "29.0%",
      statusColor: "text-sky-400 bg-sky-950/60 border-sky-800/80",
      description: "Nearly universal hospital deliveries (97%) and strong clinic access. The main upcoming challenge is managing adult lifestyle conditions like high blood pressure and diabetes.",
      highlights: [
        { label: "Hospital Deliveries", val: "97% (High)" },
        { label: "Prenatal Checkups", val: "75% (Strong)" },
        { label: "Adult Blood Pressure/Sugar", val: "Needs Screening" }
      ]
    },
    {
      id: 2,
      title: "Progressing Healthcare • Childhood Nutrition Gaps",
      badge: "Solid Child Vaccination",
      count: 256,
      pct: "36.3%",
      statusColor: "text-emerald-400 bg-emerald-950/60 border-emerald-800/80",
      description: "Strong child vaccination coverage (83%) and safe institutional births, but children and mothers still face widespread nutritional gaps and anaemia that need community nutrition programs.",
      highlights: [
        { label: "Full Child Vaccines", val: "83% (High)" },
        { label: "Hospital Deliveries", val: "91% (Good)" },
        { label: "Child Anaemia Burden", val: "Urgent Nutrition Focus" }
      ]
    },
    {
      id: 3,
      title: "Foundational Care Gaps • Priority Assistance Needed",
      badge: "High Priority Support",
      count: 182,
      pct: "25.8%",
      statusColor: "text-rose-400 bg-rose-950/60 border-rose-800/80",
      description: "Districts facing multiple basic healthcare shortages across hospital deliveries, childhood stunting, and sanitation. These districts receive top priority under National Health Mission programs.",
      highlights: [
        { label: "Regular Pregnancy Care", val: "41% (Critical)" },
        { label: "Childhood Stunting", val: "Needs Nutrition Care" },
        { label: "Sanitation & Water", val: "Infrastructure Priority" }
      ]
    },
    {
      id: 4,
      title: "Hill & Northeastern Healthcare Geography",
      badge: "Geographic Bottlenecks",
      count: 63,
      pct: "8.9%",
      statusColor: "text-amber-400 bg-amber-950/60 border-amber-800/80",
      description: "High female literacy and clean living conditions, but difficult mountain terrain makes reaching specialized district hospitals challenging, leading to out-of-pocket travel costs.",
      highlights: [
        { label: "Hospital Access", val: "69% (Travel Barrier)" },
        { label: "Clean Sanitation", val: "84% (Very High)" },
        { label: "Primary Need", val: "Mobile Health Units" }
      ]
    }
  ];

  const filteredStates = metadata.states.filter(s => 
    s.state.toLowerCase().includes(stateSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      
      {/* Friendly Hero Banner */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Background ambient gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Interactive Public Health Explorer for India</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Explore Healthcare Delivery Across India
          </h1>
          
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Click on any state to zoom in and see its districts. Check hospital availability, childhood vaccines, mother and newborn care, and clear recommendations in simple words.
          </p>
        </div>

        {/* 4 Key Friendly Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80 relative z-10">
          <div className="pr-4">
            <span className="text-xs text-slate-400 font-medium block">Districts Analyzed</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">706</div>
            <div className="text-xs text-slate-400 mt-0.5">Across all 36 States & UTs</div>
          </div>

          <div className="pr-4 border-l-0 sm:border-l border-slate-800 sm:pl-6">
            <span className="text-xs text-slate-400 font-medium block">Performing Well</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
              {resilientCount + isolatedCount}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Low healthcare deficits</div>
          </div>

          <div className="pr-4 border-l-0 lg:border-l border-slate-800 lg:pl-6">
            <span className="text-xs text-slate-400 font-medium block">Moderate Support</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1">
              {moderateOverlapCount}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">2-3 healthcare focus areas</div>
          </div>

          <div className="border-l-0 lg:border-l border-slate-800 lg:pl-6">
            <span className="text-xs text-slate-400 font-medium block">Priority Mission Mode</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 mt-1">
              {missionModeCount}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Districts requiring urgent focus</div>
          </div>
        </div>
      </section>

      {/* Primary Feature: The Interactive India Map */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 px-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Interactive Map of India</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Click any state to zoom in and browse its districts. Click any district to see its friendly health profile.
            </p>
          </div>
        </div>

        <IndiaMap
          districtsData={districts}
          onSelectDistrict={(d) => onNavigateDistrict(d)}
          onSelectState={(st) => onNavigateState(st)}
        />
      </section>

      {/* 4 Intuitive District Health Archetypes */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            4 Main Healthcare Realities in India
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            How healthcare needs differ across different parts of our country
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clusterProfiles.map(c => (
            <div 
              key={c.id} 
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between transition-all shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${c.statusColor}`}>
                      {c.badge}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-2">
                      {c.title}
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-black text-white">{c.count}</span>
                    <span className="text-xs text-slate-400 block">{c.pct} of districts</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {c.description}
                </p>
              </div>

              {/* Highlights Strip */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-800">
                {c.highlights.map((h, idx) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block truncate">{h.label}</span>
                    <span className="text-xs font-bold text-slate-200 mt-1 block truncate">{h.val}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick State Health Explorer Grid */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Browse All 36 States & Union Territories
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Select any state to open its district-level health overview
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search state..."
              value={stateSearch}
              onChange={(e) => setStateSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* State Card Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-1">
          {filteredStates.map(s => {
            const isNeed = s.avg_compound_score >= 3;
            const isMod = s.avg_compound_score >= 1.5;

            return (
              <button
                key={s.state}
                onClick={() => onNavigateState(s.state)}
                className="bg-slate-950 border border-slate-800 hover:border-blue-500/60 hover:bg-slate-900/90 rounded-xl p-3.5 text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                      {s.state}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 shrink-0 transition-colors" />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {s.district_count} districts
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className={`font-semibold ${
                    isNeed ? 'text-rose-400' : isMod ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {isNeed ? 'Needs Attention' : isMod ? 'Moderate Gaps' : 'Performing Well'}
                  </span>
                  {s.mission_mode_count > 0 && (
                    <span className="text-rose-400 font-bold">
                      {s.mission_mode_count} urgent
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

    </div>
  );
}
