import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { ChevronRight, Search, ShieldAlert, Sparkles, Filter } from 'lucide-react';

export default function OverlappingVulnerabilities({ districts, metadata, onSelectDistrict }) {
  const [filterState, setFilterState] = useState('All');
  const [minScoreFilter, setMinScoreFilter] = useState('4'); // default to 4+ (Mission Mode)
  const [searchQuery, setSearchQuery] = useState('');

  // Compound score distribution data
  const scoreCounts = [0, 1, 2, 3, 4, 5, 6].map(score => {
    const count = districts.filter(d => d.compound_vulnerability.score === score).length;
    return {
      score: `${score} Gaps`,
      districts: count,
      label: score >= 4 ? 'Urgent' : score >= 2 ? 'Moderate' : score === 1 ? 'Isolated' : 'Good'
    };
  });

  // Filtered districts
  const filtered = districts.filter(d => {
    if (filterState !== 'All' && d.state !== filterState) return false;
    if (minScoreFilter !== 'All' && d.compound_vulnerability.score < parseInt(minScoreFilter)) return false;
    if (searchQuery.trim().length > 0 && !d.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => b.compound_vulnerability.score - a.compound_vulnerability.score);

  // States with high counts of Mission Mode districts
  const missionModeByState = metadata.states
    .filter(s => s.mission_mode_count > 0)
    .sort((a, b) => b.mission_mode_count - a.mission_mode_count);

  const maxStateCount = missionModeByState[0]?.mission_mode_count || 1;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Banner (Concise & Visual) */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="max-w-2xl space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-800/60 text-rose-300 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Priority Healthcare Belts</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            High Priority & Multi-Domain Deficit Districts
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Districts facing concurrent challenges across maternal care, childhood vaccines, nutrition, and clean sanitation.
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center gap-4 shrink-0">
          <div className="text-center px-2">
            <span className="text-[10px] text-slate-400 block font-medium">Mission Mode</span>
            <span className="text-2xl font-black text-rose-400 mt-0.5 block">100</span>
          </div>
          <div className="h-7 w-px bg-slate-800" />
          <div className="text-left px-1">
            <span className="text-[10px] text-slate-400 block font-medium">Criterion</span>
            <span className="text-xs font-bold text-white mt-0.5 block">≥ 4 Deficit Areas</span>
          </div>
        </div>
      </section>

      {/* Distribution Chart & State Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Compound Score Distribution Bar Chart */}
        <section className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              National Distribution by Number of Health Deficits
            </h2>
            <p className="text-xs text-slate-400">
              Count of Indian districts facing 0 to 6 concurrent health gaps
            </p>
          </div>

          <div className="h-60 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreCounts} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="score" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '0.5rem', fontSize: '11px' }} 
                />
                <Bar dataKey="districts" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* State High-Burden Summary (Visual Progress Bars) */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              State Burden Concentration
            </h2>
            <p className="text-xs text-slate-400">
              States with highest number of priority districts
            </p>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {missionModeByState.slice(0, 7).map(s => {
              const pct = (s.mission_mode_count / maxStateCount) * 100;
              return (
                <div key={s.state} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 truncate pr-2">{s.state}</span>
                    <span className="font-bold text-rose-400 tabular-nums shrink-0">{s.mission_mode_count}</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                    <div 
                      className="bg-rose-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 text-center">
            72% of priority districts are in UP, Bihar & Assam
          </div>
        </section>

      </div>

      {/* Filterable Table: District Overlap Matrix */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Priority Districts Audit ({filtered.length})
            </h2>
            <p className="text-xs text-slate-400">
              Health status across all 6 core pillars
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input 
                type="text"
                placeholder="Search district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-36 sm:w-44"
              />
            </div>

            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All States</option>
              {metadata.states.map(s => (
                <option key={s.state} value={s.state}>{s.state}</option>
              ))}
            </select>

            <select
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Scores (0–6)</option>
              <option value="4">Urgent (≥ 4 Deficits)</option>
              <option value="3">Moderate (≥ 3 Deficits)</option>
              <option value="2">Mild (≥ 2 Deficits)</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-slate-400 py-1 border-b border-slate-800/80">
          <span>Domain Status:</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>High Need</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Moderate</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Good</span>
          </span>
        </div>

        {/* Heatmap Table */}
        <div className="overflow-x-auto max-h-[460px] rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold text-[11px] sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-2 text-center">Gaps</th>
                <th className="py-2.5 px-2 text-center">Maternal</th>
                <th className="py-2.5 px-2 text-center">Vaccines</th>
                <th className="py-2.5 px-2 text-center">Nutrition</th>
                <th className="py-2.5 px-2 text-center">Planning</th>
                <th className="py-2.5 px-2 text-center">NCDs</th>
                <th className="py-2.5 px-2 text-center">Toilets</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {filtered.map(d => {
                const s = d.compound_vulnerability.score;
                const tiers = d.domain_tiers;

                const getTierDot = (t) => {
                  if (t === 3) return <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500" title="High Need" />;
                  if (t === 2) return <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" title="Moderate" />;
                  return <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" title="Good" />;
                };

                return (
                  <tr 
                    key={d.id}
                    onClick={() => onSelectDistrict(d)}
                    className="hover:bg-slate-850 cursor-pointer transition-colors group"
                  >
                    <td className="py-2 px-3 font-bold text-white group-hover:text-blue-400 transition-colors">
                      {d.name}
                    </td>
                    <td className="py-2 px-3 text-slate-400">{d.state}</td>
                    <td className="py-2 px-2 text-center font-bold tabular-nums">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-xs ${
                        s >= 4 ? 'text-rose-400 font-extrabold' :
                        s >= 2 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {s} / 6
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">{getTierDot(tiers.maternal_newborn)}</td>
                    <td className="py-2 px-2 text-center">{getTierDot(tiers.child_immunisation)}</td>
                    <td className="py-2 px-2 text-center">{getTierDot(tiers.nutrition_anaemia)}</td>
                    <td className="py-2 px-2 text-center">{getTierDot(tiers.family_planning)}</td>
                    <td className="py-2 px-2 text-center">{getTierDot(tiers.ncd_screening)}</td>
                    <td className="py-2 px-2 text-center">{getTierDot(tiers.household_amenities)}</td>
                    <td className="py-2 px-3 text-right">
                      <span className="inline-flex items-center gap-0.5 text-xs text-blue-400 group-hover:text-blue-300 font-semibold">
                        View <ChevronRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
