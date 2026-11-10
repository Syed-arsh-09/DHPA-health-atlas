import React, { useState } from 'react';
import { 
  ChevronRight, 
  ArrowUpDown,
  Search
} from 'lucide-react';

export default function StateAnalysis({ 
  districts, 
  metadata, 
  selectedState, 
  setSelectedState, 
  onSelectDistrict 
}) {
  const [districtSearch, setDistrictSearch] = useState('');
  const [sortField, setSortField] = useState('compound'); // 'compound' | 'name' | 'cluster'
  const [sortAsc, setSortAsc] = useState(false);

  const stateData = metadata.states.find(s => s.state === selectedState) || metadata.states[0];
  const stateDistricts = districts.filter(d => d.state === selectedState);

  // Cluster colors & labels
  const clusterBadges = {
    1: { label: 'Cluster 1: Advanced / NCD', color: 'text-sky-400 bg-sky-950/60 border-sky-800/80' },
    2: { label: 'Cluster 2: Intermediate', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80' },
    3: { label: 'Cluster 3: Foundational Deficits', color: 'text-rose-400 bg-rose-950/60 border-rose-800/80' },
    4: { label: 'Cluster 4: Hill / Northeast', color: 'text-amber-400 bg-amber-950/60 border-amber-800/80' },
  };

  // Filter & sort districts
  const filteredAndSortedDistricts = stateDistricts
    .filter(d => d.name.toLowerCase().includes(districtSearch.toLowerCase()))
    .sort((a, b) => {
      let comp = 0;
      if (sortField === 'compound') {
        comp = a.compound_vulnerability.score - b.compound_vulnerability.score;
      } else if (sortField === 'name') {
        comp = a.name.localeCompare(b.name);
      } else if (sortField === 'cluster') {
        comp = a.cluster_a.id - b.cluster_a.id;
      }
      return sortAsc ? comp : -comp;
    });

  const getDomainTierBadge = (tier) => {
    if (tier === 3) return <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500" title="Tier 3: Severe Deficit" />;
    if (tier === 2) return <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" title="Tier 2: Moderate" />;
    return <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" title="Tier 1: Low Deficit" />;
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* State Header & Administrative Overview */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {selectedState}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              State-level aggregation across {stateDistricts.length} administrative districts. Average multi-domain compound deficit score: <span className="font-semibold text-white tabular-nums">{stateData.avg_compound_score} / 6</span>.
            </p>
          </div>

          {/* State Switcher Dropdown */}
          <div className="w-full md:w-72 shrink-0">
            <label htmlFor="state-select" className="text-xs text-slate-400 block mb-1.5 font-medium">
              Select State / UT
            </label>
            <select
              id="state-select"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              {metadata.states.map(s => (
                <option key={s.state} value={s.state}>
                  {s.state} ({s.district_count} districts)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* State KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Districts Evaluated</span>
            <div className="text-2xl font-bold text-white mt-1 tabular-nums">{stateDistricts.length}</div>
          </div>

          <div className="border-l-0 sm:border-l border-slate-800 sm:pl-6">
            <span className="text-xs text-slate-400 block font-medium">Mission Mode Districts (≥4)</span>
            <div className={`text-2xl font-bold mt-1 tabular-nums ${stateData.mission_mode_count > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
              {stateData.mission_mode_count}
            </div>
          </div>

          <div className="border-l-0 sm:border-l border-slate-800 sm:pl-6">
            <span className="text-xs text-slate-400 block font-medium">Average Vulnerability</span>
            <div className="text-2xl font-bold text-white mt-1 tabular-nums">
              {stateData.avg_compound_score} <span className="text-xs text-slate-400 font-normal">/ 6</span>
            </div>
          </div>

          <div className="border-l-0 sm:border-l border-slate-800 sm:pl-6">
            <span className="text-xs text-slate-400 block font-medium">Dominant Typology</span>
            <div className="text-sm font-semibold text-sky-400 mt-2 truncate">
              {Object.entries(stateData.cluster_breakdown).sort((a,b) => b[1] - a[1])[0] 
                ? metadata.clusters_a[Object.entries(stateData.cluster_breakdown).sort((a,b) => b[1] - a[1])[0][0]]?.short_name 
                : 'Mixed'}
            </div>
          </div>
        </div>
      </section>

      {/* Cluster Distribution in State */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <h2 className="text-base font-bold text-white tracking-tight">
            Engine A Typology Distribution in {selectedState}
          </h2>
          <span className="text-xs text-slate-400">Share of administrative districts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(cId => {
            const count = stateDistricts.filter(d => d.cluster_a.id === cId).length;
            const pct = stateDistricts.length > 0 ? (count / stateDistricts.length * 100).toFixed(1) : 0;
            const meta = metadata.clusters_a[cId];
            return (
              <div key={cId} className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-medium text-slate-300 truncate pr-2">{meta.short_name}</span>
                  <span className="text-sm font-bold text-white tabular-nums">{count}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all" 
                    style={{ width: `${pct}%`, backgroundColor: meta.color }}
                  ></div>
                </div>
                <span className="text-[11px] text-slate-400 block tabular-nums">{pct}% of state</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* District Vulnerability Rankings Table */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              District Priority & Vulnerability Audit
            </h2>
            <p className="text-xs text-slate-400">
              Click any district to inspect its comprehensive 47-indicator report card
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* District Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter districts..."
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-md pl-7 pr-2.5 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 w-36 sm:w-44"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="compound">Sort: Vulnerability Score</option>
              <option value="name">Sort: District Name</option>
              <option value="cluster">Sort: Macro Typology</option>
            </select>

            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Toggle sort direction"
              aria-label="Toggle sort direction"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Legend for 6 Domains */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1 pb-1 border-b border-slate-800">
          <span>Domain Status Indicators:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Tier 3 (High Deficit)</span>
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

        {/* High-Density Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-medium text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Typology (Engine A)</th>
                <th className="py-2.5 px-3 text-center">Deficit Domains</th>
                <th className="py-2.5 px-3">Domain Profiles (M • I • N • FP • NCD • H)</th>
                <th className="py-2.5 px-3">Priority Focus</th>
                <th className="py-2.5 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAndSortedDistricts.map(d => {
                const score = d.compound_vulnerability.score;
                return (
                  <tr 
                    key={d.id}
                    onClick={() => onSelectDistrict(d)}
                    className="hover:bg-slate-850 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3 font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {d.name}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${clusterBadges[d.cluster_a.id].color}`}>
                        {metadata.clusters_a[d.cluster_a.id].short_name}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center tabular-nums">
                      <span className={`inline-block font-semibold ${
                        score >= 4 ? 'text-rose-400 font-bold' :
                        score >= 2 ? 'text-amber-400' :
                        score === 1 ? 'text-sky-400' : 'text-emerald-400'
                      }`}>
                        {score} / 6
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span title="Maternal">{getDomainTierBadge(d.domain_tiers.maternal_newborn)}</span>
                        <span title="Immunisation">{getDomainTierBadge(d.domain_tiers.child_immunisation)}</span>
                        <span title="Nutrition">{getDomainTierBadge(d.domain_tiers.nutrition_anaemia)}</span>
                        <span title="Family Planning">{getDomainTierBadge(d.domain_tiers.family_planning)}</span>
                        <span title="NCDs">{getDomainTierBadge(d.domain_tiers.ncd_screening)}</span>
                        <span title="Amenities">{getDomainTierBadge(d.domain_tiers.household_amenities)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-medium">
                      {d.recommendations.primary_priority}
                    </td>
                    <td className="py-3 px-3 text-right">
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
