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
  Info,
  Compass,
  TrendingUp,
  Stethoscope
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
      title: "Advanced Care & Lifestyle Risk",
      badge: "29.0% of India",
      count: 205,
      icon: Building2,
      statusColor: "text-sky-400 bg-sky-950/60 border-sky-800/80",
      accent: "border-sky-500/30",
      keyMetrics: [
        { label: "Hospital Deliveries", val: "96.8%", good: true },
        { label: "Prenatal Checkups", val: "75.0%", good: true },
        { label: "High Blood Sugar / BP", val: "Screening Needed", good: false }
      ]
    },
    {
      id: 2,
      title: "Progressing Care & Child Nutrition",
      badge: "36.3% of India",
      count: 256,
      icon: Baby,
      statusColor: "text-emerald-400 bg-emerald-950/60 border-emerald-800/80",
      accent: "border-emerald-500/30",
      keyMetrics: [
        { label: "Child Vaccines", val: "83.3%", good: true },
        { label: "Institutional Births", val: "91.3%", good: true },
        { label: "Childhood Anaemia", val: "High Burden", good: false }
      ]
    },
    {
      id: 3,
      title: "High Priority & Foundational Gaps",
      badge: "25.8% of India",
      count: 182,
      icon: ShieldAlert,
      statusColor: "text-rose-400 bg-rose-950/60 border-rose-800/80",
      accent: "border-rose-500/30",
      keyMetrics: [
        { label: "Regular Pregnancy Care", val: "40.9%", good: false },
        { label: "Child Stunting Rate", val: "40.5%", good: false },
        { label: "Sanitation Access", val: "59.5%", good: false }
      ]
    },
    {
      id: 4,
      title: "Hills & Remote Geography",
      badge: "8.9% of India",
      count: 63,
      icon: Compass,
      statusColor: "text-amber-400 bg-amber-950/60 border-amber-800/80",
      accent: "border-amber-500/30",
      keyMetrics: [
        { label: "Sanitation & Water", val: "84.2%", good: true },
        { label: "Hospital Delivery Access", val: "69.1%", good: false },
        { label: "Travel & Expense", val: "High Barrier", good: false }
      ]
    }
  ];

  const filteredStates = metadata.states.filter(s => 
    s.state.toLowerCase().includes(stateSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      
      {/* Friendly Hero Banner */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Interactive Health Atlas</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            India District Healthcare Explorer
          </h1>
          
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Select any state or district on the map to explore hospital access, childhood immunisation, and maternal care in simple terms.
          </p>
        </div>

        {/* 4 Stat Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 relative z-10">
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/60">
            <span className="text-[11px] text-slate-400 font-medium block">Total Districts</span>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">706</div>
            <div className="text-[10px] text-slate-500">36 States & UTs</div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/60">
            <span className="text-[11px] text-slate-400 font-medium block">Performing Well</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
              {resilientCount + isolatedCount}
            </div>
            <div className="text-[10px] text-slate-500">Low health deficits</div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/60">
            <span className="text-[11px] text-slate-400 font-medium block">Moderate Support</span>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">
              {moderateOverlapCount}
            </div>
            <div className="text-[10px] text-slate-500">Focused health areas</div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/60">
            <span className="text-[11px] text-slate-400 font-medium block">Urgent Priority</span>
            <div className="text-xl sm:text-2xl font-black text-rose-400 mt-0.5">
              {missionModeCount}
            </div>
            <div className="text-[10px] text-slate-500">Mission-mode focus</div>
          </div>
        </div>
      </section>

      {/* Primary Feature: The Interactive India Map */}
      <section className="space-y-3">
        <IndiaMap
          districtsData={districts}
          onSelectDistrict={(d) => onNavigateDistrict(d)}
          onSelectState={(st) => onNavigateState(st)}
        />
      </section>

      {/* 4 Intuitive District Health Archetypes (Crisp, Visual, Minimal Text) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            4 Main Healthcare Realities in India
          </h2>
          <p className="text-xs text-slate-400">
            National overview of regional healthcare patterns across 706 districts
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {clusterProfiles.map(c => {
            const Icon = c.icon;
            return (
              <div 
                key={c.id} 
                className={`bg-slate-900 border ${c.accent} rounded-2xl p-5 sm:p-6 space-y-4 flex flex-col justify-between shadow-md`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-white">
                      <Icon className="w-4.5 h-4.5 text-blue-400" />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${c.statusColor}`}>
                      {c.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white leading-snug">
                      {c.title}
                    </h3>
                    <div className="text-[11px] text-slate-400 mt-1 font-medium">
                      {c.count} Districts
                    </div>
                  </div>
                </div>

                {/* Key Metrics Chips with ample padding */}
                <div className="space-y-2 pt-3 border-t border-slate-800/80">
                  {c.keyMetrics.map((m, idx) => (
                    <div key={idx} className="bg-slate-950 px-3 py-2 rounded-xl flex items-center justify-between text-[11px] border border-slate-800/60">
                      <span className="text-slate-400 truncate pr-2">{m.label}</span>
                      <span className={`font-semibold shrink-0 ${m.good ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {m.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick State Health Explorer Grid */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Explore by State / UT (36)
            </h2>
            <p className="text-xs text-slate-400">
              Click any state to inspect its districts
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter states..."
              value={stateSearch}
              onChange={(e) => setStateSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* State Card Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
          {filteredStates.map(s => {
            const isNeed = s.avg_compound_score >= 3;
            const isMod = s.avg_compound_score >= 1.5;

            return (
              <button
                key={s.state}
                onClick={() => onNavigateState(s.state)}
                className="bg-slate-950 border border-slate-800 hover:border-blue-500/60 hover:bg-slate-900 rounded-xl p-3 text-left transition-all group flex items-center justify-between gap-2"
              >
                <div className="truncate">
                  <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                    {s.state}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {s.district_count} districts
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${
                    isNeed ? 'bg-rose-500' : isMod ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

    </div>
  );
}
