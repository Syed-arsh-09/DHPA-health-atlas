import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Filter, 
  Search, 
  ArrowUpDown, 
  ChevronRight,
  Layers,
  Flame,
  Check
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

export default function OverlappingVulnerabilities({ districts, metadata, onSelectDistrict }) {
  const [filterState, setFilterState] = useState('All');
  const [minScoreFilter, setMinScoreFilter] = useState('4'); // default to 4+ (Mission Mode)
  const [searchQuery, setSearchQuery] = useState('');

  // Compound score distribution data
  const scoreCounts = [0, 1, 2, 3, 4, 5, 6].map(score => {
    const count = districts.filter(d => d.compound_vulnerability.score === score).length;
    return {
      score: `${score} Deficits`,
      districts: count,
      label: score >= 4 ? 'Mission-Mode' : score >= 2 ? 'Moderate' : score === 1 ? 'Isolated' : 'Resilient'
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

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
          <Flame className="w-4 h-4 text-rose-500" />
          Compound Multi-Domain Overlap Detection
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Overlapping Vulnerabilities & Mission-Mode District Radar
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          While single-domain healthcare programs address vertical targets, districts experiencing <span className="text-white font-semibold">compound overlapping vulnerabilities</span> suffer systemic breakdowns across maternal care, child nutrition, routine immunisation, and environmental amenities simultaneously.
        </p>
      </div>

      {/* Distribution Chart & State Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Compound Score Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              National Compound Vulnerability Distribution (0 to 6 Deficit Domains)
            </h2>
            <p className="text-xs text-slate-400">
              Count of Indian districts by number of independent domains in High Vulnerability Tier 3
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreCounts} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="score" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }} 
                />
                <Bar dataKey="districts" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* State High-Burden Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Mission-Mode State Concentration
            </h2>
            <p className="text-xs text-slate-400 mt-1">States harboring the 100 most critical compound-crisis districts</p>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {missionModeByState.map(s => (
              <div key={s.state} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <span className="font-semibold text-slate-200">{s.state}</span>
                <span className="font-bold text-rose-400">{s.mission_mode_count} districts</span>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2">
            Over 72% of all Mission-Mode districts are concentrated across Uttar Pradesh and Bihar.
          </div>
        </div>

      </div>

      {/* Filterable Table: District Overlap Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Multi-Domain Deficit Matrix & Filter
            </h2>
            <p className="text-xs text-slate-400">
              Showing {filtered.length} matching districts • 🔴 Tier 3 Deficit | 🟡 Tier 2 Moderate | 🟢 Tier 1 Low
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <input 
              type="text"
              placeholder="Search district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            {/* State filter */}
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
            >
              <option value="All">All States</option>
              {metadata.states.map(s => (
                <option key={s.state} value={s.state}>{s.state}</option>
              ))}
            </select>

            {/* Score filter */}
            <select
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
            >
              <option value="All">All Scores (0–6)</option>
              <option value="4">Score ≥ 4 (Mission-Mode 100)</option>
              <option value="3">Score ≥ 3</option>
              <option value="2">Score ≥ 2</option>
            </select>
          </div>
        </div>

        {/* Heatmap Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-700">
              <tr>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-2 text-center">Score</th>
                <th className="py-2.5 px-2 text-center">Maternal</th>
                <th className="py-2.5 px-2 text-center">Immunisation</th>
                <th className="py-2.5 px-2 text-center">Nutrition</th>
                <th className="py-2.5 px-2 text-center">Family Plan.</th>
                <th className="py-2.5 px-2 text-center">NCDs</th>
                <th className="py-2.5 px-2 text-center">Amenities</th>
                <th className="py-2.5 px-3 text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(d => {
                const s = d.compound_vulnerability.score;
                const tiers = d.domain_tiers;

                const getTierBadge = (t) => {
                  if (t === 3) return <span className="inline-block w-4 h-4 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" title="Tier 3: Priority Deficit"></span>;
                  if (t === 2) return <span className="inline-block w-4 h-4 rounded-full bg-amber-500/60" title="Tier 2: Moderate"></span>;
                  return <span className="inline-block w-4 h-4 rounded-full bg-emerald-500/30" title="Tier 1: Low Deficit"></span>;
                };

                return (
                  <tr 
                    key={d.id}
                    onClick={() => onSelectDistrict(d)}
                    className="hover:bg-slate-800/60 cursor-pointer transition-colors group"
                  >
                    <td className="py-2.5 px-3 font-semibold text-white group-hover:text-blue-400">
                      {d.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{d.state}</td>
                    <td className="py-2.5 px-2 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        s >= 4 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                        s >= 2 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {s}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center">{getTierBadge(tiers.maternal_newborn)}</td>
                    <td className="py-2.5 px-2 text-center">{getTierBadge(tiers.child_immunisation)}</td>
                    <td className="py-2.5 px-2 text-center">{getTierBadge(tiers.nutrition_anaemia)}</td>
                    <td className="py-2.5 px-2 text-center">{getTierBadge(tiers.family_planning)}</td>
                    <td className="py-2.5 px-2 text-center">{getTierBadge(tiers.ncd_screening)}</td>
                    <td className="py-2.5 px-2 text-center">{getTierBadge(tiers.household_amenities)}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-[11px] font-semibold text-blue-400 group-hover:underline">
                        Profile →
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
