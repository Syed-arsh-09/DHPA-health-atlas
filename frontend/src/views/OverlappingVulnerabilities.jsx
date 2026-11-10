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
import { ChevronRight, Search } from 'lucide-react';

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
    <div className="space-y-6 pb-16">
      
      {/* Header Banner */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8">
        <div className="max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Compound Vulnerabilities & Priority Deficit Radar
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Districts experiencing compound multi-domain vulnerabilities face concurrent breakdowns across maternal care, child nutrition, routine immunisation, and household infrastructure. These 100 districts require comprehensive inter-departmental convergence rather than isolated vertical interventions.
          </p>
        </div>
      </section>

      {/* Distribution Chart & State Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Compound Score Distribution Bar Chart */}
        <section className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              National Compound Vulnerability Distribution (0 to 6 Deficit Domains)
            </h2>
            <p className="text-xs text-slate-400">
              Count of Indian districts by number of independent domains in High Vulnerability Tier 3
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreCounts} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="score" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '0.5rem', fontSize: '11px' }} 
                />
                <Bar dataKey="districts" fill="#f43f5e" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* State High-Burden Summary */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              State Burden Concentration
            </h2>
            <p className="text-xs text-slate-400">
              States harboring the 100 compound-crisis districts
            </p>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 divide-y divide-slate-800/80">
            {missionModeByState.map(s => (
              <div key={s.state} className="flex items-center justify-between text-xs py-1.5 pt-2">
                <span className="font-medium text-slate-200">{s.state}</span>
                <span className="font-semibold text-rose-400 tabular-nums">{s.mission_mode_count} districts</span>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-3">
            Over 72% of all Mission-Mode districts are concentrated across Uttar Pradesh, Bihar, and Assam.
          </div>
        </section>

      </div>

      {/* Filterable Table: District Overlap Matrix */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Multi-Domain Deficit Matrix ({filtered.length} Districts)
            </h2>
            <p className="text-xs text-slate-400">
              Evaluating individual vertical tiers across all 6 healthcare domains
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
                className="bg-slate-950 border border-slate-800 rounded-md pl-7 pr-2.5 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 w-36 sm:w-44"
              />
            </div>

            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All States</option>
              {metadata.states.map(s => (
                <option key={s.state} value={s.state}>{s.state}</option>
              ))}
            </select>

            <select
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Scores (0–6)</option>
              <option value="4">Score ≥ 4 (100 Mission-Mode)</option>
              <option value="3">Score ≥ 3</option>
              <option value="2">Score ≥ 2</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 py-1 border-b border-slate-800">
          <span>Domain Status:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Tier 3 (Deficit)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Tier 2 (Moderate)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Tier 1 (Low Deficit)</span>
          </span>
        </div>

        {/* Heatmap Table */}
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-medium text-[11px] sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2 px-3">District</th>
                <th className="py-2 px-3">State</th>
                <th className="py-2 px-2 text-center">Compound Score</th>
                <th className="py-2 px-2 text-center">Maternal</th>
                <th className="py-2 px-2 text-center">Immunisation</th>
                <th className="py-2 px-2 text-center">Nutrition</th>
                <th className="py-2 px-2 text-center">Family Plan.</th>
                <th className="py-2 px-2 text-center">NCDs</th>
                <th className="py-2 px-2 text-center">Amenities</th>
                <th className="py-2 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(d => {
                const s = d.compound_vulnerability.score;
                const tiers = d.domain_tiers;

                const getTierDot = (t) => {
                  if (t === 3) return <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500" title="Tier 3: Deficit"></span>;
                  if (t === 2) return <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" title="Tier 2: Moderate"></span>;
                  return <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" title="Tier 1: Low Deficit"></span>;
                };

                return (
                  <tr 
                    key={d.id}
                    onClick={() => onSelectDistrict(d)}
                    className="hover:bg-slate-850 cursor-pointer transition-colors group"
                  >
                    <td className="py-2.5 px-3 font-semibold text-white group-hover:text-blue-400">
                      {d.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{d.state}</td>
                    <td className="py-2.5 px-2 text-center font-bold tabular-nums">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-xs ${
                        s >= 4 ? 'text-rose-400' :
                        s >= 2 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {s} / 6
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center">{getTierDot(tiers.maternal_newborn)}</td>
                    <td className="py-2.5 px-2 text-center">{getTierDot(tiers.child_immunisation)}</td>
                    <td className="py-2.5 px-2 text-center">{getTierDot(tiers.nutrition_anaemia)}</td>
                    <td className="py-2.5 px-2 text-center">{getTierDot(tiers.family_planning)}</td>
                    <td className="py-2.5 px-2 text-center">{getTierDot(tiers.ncd_screening)}</td>
                    <td className="py-2.5 px-2 text-center">{getTierDot(tiers.household_amenities)}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-flex items-center gap-0.5 text-xs text-blue-400 group-hover:text-blue-300 font-medium">
                        View <ChevronRight className="w-3.5 h-3.5" />
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
