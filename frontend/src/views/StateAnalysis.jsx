import React, { useState } from 'react';
import { 
  MapPin, 
  ChevronRight, 
  Layers, 
  AlertTriangle, 
  ShieldCheck, 
  Building, 
  ArrowUpDown,
  Filter
} from 'lucide-react';

export default function StateAnalysis({ 
  districts, 
  metadata, 
  selectedState, 
  setSelectedState, 
  onSelectDistrict 
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortField, setSortField] = useState('compound'); // 'compound' | 'name' | 'maternal' | 'immunisation' | 'nutrition'
  const [sortAsc, setSortAsc] = useState(false);

  const stateData = metadata.states.find(s => s.state === selectedState) || metadata.states[0];
  const stateDistricts = districts.filter(d => d.state === selectedState);

  // Category options for filtering/viewing
  const domainKeys = [
    { key: 'All', label: 'All Domains' },
    { key: 'maternal_newborn', label: 'Maternal & Newborn Care' },
    { key: 'child_immunisation', label: 'Child Immunisation' },
    { key: 'nutrition_anaemia', label: 'Nutrition & Anaemia' },
    { key: 'family_planning', label: 'Family Planning' },
    { key: 'ncd_screening', label: 'NCDs & Screening' },
    { key: 'household_amenities', label: 'Household Amenities' },
  ];

  // Cluster colors & badges
  const clusterBadges = {
    1: { label: 'Cluster 1: Advanced / NCD', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    2: { label: 'Cluster 2: Intermediate', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    3: { label: 'Cluster 3: Foundational Deficits', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    4: { label: 'Cluster 4: Hill / Northeast', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  };

  // Sort districts
  const sortedDistricts = [...stateDistricts].sort((a, b) => {
    let comp = 0;
    if (sortField === 'compound') {
      comp = a.compound_vulnerability.score - b.compound_vulnerability.score;
    } else if (sortField === 'name') {
      comp = a.name.localeCompare(b.name);
    } else if (domainKeys.some(d => d.key === sortField)) {
      comp = a.domain_tiers[sortField] - b.domain_tiers[sortField];
    }
    return sortAsc ? comp : -comp;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* State Header & Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              State & Union Territory Deep-Dive
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {selectedState}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {stateDistricts.length} administrative districts audited • Average Compound Score: <span className="font-bold text-white">{stateData.avg_compound_score} / 6</span>
            </p>
          </div>

          {/* State Dropdown */}
          <div className="w-full sm:w-72">
            <label className="text-xs font-semibold text-slate-400 block mb-1">Switch State / UT</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {metadata.states.map(s => (
                <option key={s.state} value={s.state}>
                  {s.state} ({s.district_count} districts)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* State Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/40">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Districts</span>
            <div className="text-xl font-bold text-white mt-0.5">{stateDistricts.length}</div>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/40">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Mission-Mode (4+)</span>
            <div className={`text-xl font-bold mt-0.5 ${stateData.mission_mode_count > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {stateData.mission_mode_count}
            </div>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/40">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Avg Deficit Score</span>
            <div className="text-xl font-bold text-white mt-0.5">{stateData.avg_compound_score} <span className="text-xs text-slate-400 font-normal">/ 6</span></div>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/40">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Dominant Cluster</span>
            <div className="text-sm font-bold text-blue-400 mt-1 truncate">
              {Object.entries(stateData.cluster_breakdown).sort((a,b) => b[1] - a[1])[0] 
                ? metadata.clusters_a[Object.entries(stateData.cluster_breakdown).sort((a,b) => b[1] - a[1])[0][0]]?.short_name 
                : 'Mixed'}
            </div>
          </div>
        </div>
      </div>

      {/* Cluster Distribution in State */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          Engine A Cluster Distribution within {selectedState}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(cId => {
            const count = stateDistricts.filter(d => d.cluster_a.id === cId).length;
            const pct = stateDistricts.length > 0 ? (count / stateDistricts.length * 100).toFixed(1) : 0;
            const meta = metadata.clusters_a[cId];
            return (
              <div key={cId} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">{meta.short_name}</span>
                  <span className="text-sm font-bold text-white">{count}</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ width: `${pct}%`, backgroundColor: meta.color }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">{pct}% of state</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* District Vulnerability Rankings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              District Vulnerability & Priority Rankings
            </h2>
            <p className="text-xs text-slate-400">
              Click any district row to view its comprehensive Report Card and NHM action plan
            </p>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Sort by:</span>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
            >
              <option value="compound">Compound Vulnerability</option>
              <option value="name">District Name</option>
              <option value="maternal_newborn">Maternal Tier</option>
              <option value="nutrition_anaemia">Nutrition Tier</option>
              <option value="child_immunisation">Immunisation Tier</option>
            </select>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="p-1 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
              title="Toggle sort direction"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-700">
              <tr>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Typology (Engine A)</th>
                <th className="py-2.5 px-3 text-center">Deficit Domains</th>
                <th className="py-2.5 px-3">Urgency Tier</th>
                <th className="py-2.5 px-3">Primary Focus Area</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedDistricts.map(d => {
                const score = d.compound_vulnerability.score;
                return (
                  <tr 
                    key={d.id}
                    onClick={() => onSelectDistrict(d)}
                    className="hover:bg-slate-800/60 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3 font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {d.name}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${clusterBadges[d.cluster_a.id].bg}`}>
                        {metadata.clusters_a[d.cluster_a.id].short_name}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        score >= 4 
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                          : score >= 2 
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                          : score === 1
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {score}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[11px] font-medium ${
                        d.compound_vulnerability.urgency_rank === 1 ? 'text-rose-400 font-semibold' :
                        d.compound_vulnerability.urgency_rank === 2 ? 'text-amber-400' :
                        d.compound_vulnerability.urgency_rank === 3 ? 'text-blue-400' : 'text-emerald-400'
                      }`}>
                        {d.compound_vulnerability.urgency_tier.split(':')[0]}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-medium">
                      {d.recommendations.primary_priority}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 group-hover:underline">
                        View Report <ChevronRight className="w-3.5 h-3.5" />
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
