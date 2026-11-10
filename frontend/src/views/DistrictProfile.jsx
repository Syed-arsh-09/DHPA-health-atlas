import React, { useState } from 'react';
import { 
  MapPin, 
  Search,
  CheckCircle2, 
  AlertTriangle
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

export default function DistrictProfile({ 
  districts, 
  metadata, 
  selectedDistrict, 
  setSelectedDistrict 
}) {
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('All');
  const [districtSearchTerm, setDistrictSearchTerm] = useState('');

  const district = selectedDistrict || districts[0];
  const stateMeta = metadata.states.find(s => s.state === district.state);
  const stateMeans = stateMeta ? stateMeta.indicator_means : {};

  // Group indicators by category
  const categories = [
    'All',
    'Maternal & Newborn Care',
    'Child Immunisation & Preventative Care',
    'Nutritional Status & Anaemia',
    'Reproductive Health & Family Planning',
    'NCD Risk & Preventive Screening',
    'Household Amenities & Financing',
    'Health Risk Behaviours'
  ];

  const filteredIndicators = metadata.indicators.filter(ind => {
    if (selectedCategoryTab === 'All') return true;
    return ind.category === selectedCategoryTab;
  });

  // Radar data for this district vs national average
  const radarMetrics = [
    { code: 'C47', label: 'Institutional Births' },
    { code: 'C38', label: '4+ ANC Visits' },
    { code: 'C54', label: 'Full Immunisation' },
    { code: 'C78', label: 'Child Stunting (Inv)', invert: true },
    { code: 'C14', label: 'Sanitation' },
    { code: 'C19', label: 'Female Literacy' },
    { code: 'C84', label: 'Low Adult Obesity', invert: true },
    { code: 'C107', label: 'Low Tobacco Use', invert: true },
  ];

  const radarData = radarMetrics.map(m => {
    const rawDist = district.indicators[m.code] || 0;
    const rawNat = m.code === 'C78' || m.code === 'C84' || m.code === 'C107'
      ? 100 - (metadata.indicators.find(i => i.code === m.code)?.national_mean || 0)
      : (metadata.indicators.find(i => i.code === m.code)?.national_mean || 0);
    
    const distVal = m.invert ? Math.max(0, 100 - rawDist) : rawDist;

    return {
      metric: m.label,
      District: Math.round(distVal),
      National: Math.round(rawNat)
    };
  });

  const clusterBadges = {
    1: { name: 'Cluster 1: Advanced / NCD Risk', color: 'text-sky-400 bg-sky-950/60 border-sky-800/80' },
    2: { name: 'Cluster 2: Intermediate Progressing', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80' },
    3: { name: 'Cluster 3: Foundational Deficits', color: 'text-rose-400 bg-rose-950/60 border-rose-800/80' },
    4: { name: 'Cluster 4: Hill & Northeastern', color: 'text-amber-400 bg-amber-950/60 border-amber-800/80' },
  };

  const urgencyColors = {
    1: 'text-rose-400 bg-rose-950/60 border-rose-800/80',
    2: 'text-amber-400 bg-amber-950/60 border-amber-800/80',
    3: 'text-sky-400 bg-sky-950/60 border-sky-800/80',
    4: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80',
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* District Selector Header */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 block font-medium">Active District Report Card</span>
          <div className="text-base font-bold text-white">{district.name}, {district.state}</div>
        </div>

        <div className="w-full sm:w-80">
          <label htmlFor="district-select" className="sr-only">Choose District</label>
          <select
            id="district-select"
            value={district.id}
            onChange={(e) => {
              const d = districts.find(x => x.id === parseInt(e.target.value));
              if (d) setSelectedDistrict(d);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            {districts.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.state}) — Score {d.compound_vulnerability.score}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* District Summary Card */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded border ${clusterBadges[district.cluster_a.id].color}`}>
                {clusterBadges[district.cluster_a.id].name}
              </span>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded border ${urgencyColors[district.compound_vulnerability.urgency_rank]}`}>
                {district.compound_vulnerability.urgency_tier}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{district.name}</h1>
            <p className="text-xs sm:text-sm text-slate-400 tabular-nums">
              {district.state} • Distance to Typology Centroid: {district.cluster_a.distance}
            </p>
          </div>

          {/* Quick Score Strip */}
          <div className="flex items-center gap-6 bg-slate-950 border border-slate-800 rounded-lg p-3.5 shrink-0">
            <div className="text-center px-2">
              <span className="text-[11px] text-slate-400 block font-medium">Deficit Domains</span>
              <span className={`text-2xl font-bold tabular-nums ${
                district.compound_vulnerability.score >= 4 ? 'text-rose-400' :
                district.compound_vulnerability.score >= 2 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {district.compound_vulnerability.score} <span className="text-xs text-slate-400 font-normal">/ 6</span>
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="text-center px-2">
              <span className="text-[11px] text-slate-400 block font-medium">Primary Priority</span>
              <span className="text-xs font-semibold text-white block mt-1 max-w-[150px] truncate">
                {district.recommendations.primary_priority}
              </span>
            </div>
          </div>
        </div>

        {/* Actionable Service Recommendations Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
          <h2 className="text-xs font-semibold text-sky-400 tracking-wide">
            Prescribed National Health Mission (NHM) Interventions
          </h2>

          {district.recommendations.triggers && (
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-rose-300">Root-Cause Triggers: </span>
              {district.recommendations.triggers}
            </div>
          )}

          <div className="text-xs text-slate-200 leading-relaxed bg-slate-900 p-3 rounded border border-slate-800">
            {district.recommendations.interventions}
          </div>
        </div>
      </section>

      {/* Radar Profile & Multi-Domain Health Geometry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radar Chart */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Multi-Domain Health Radar
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {district.name} (Blue) vs. National Benchmark (Gray)
            </p>
          </div>

          <div className="h-64 w-full my-auto pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                <Radar name={district.name} dataKey="District" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.35} />
                <Radar name="National Benchmark" dataKey="National" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '0.5rem', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-400 text-center border-t border-slate-800 pt-2">
            Values scaled to desirable direction (100 = best national health performance)
          </div>
        </section>

        {/* Domain Tier Status Cards */}
        <section className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Engine B Healthcare Domain Performance
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Independent vertical health sector evaluation (Tier 1 = Low Deficit, Tier 2 = Moderate, Tier 3 = High Deficit)
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { key: 'maternal_newborn', label: 'Maternal & Newborn', tier: district.domain_tiers.maternal_newborn },
              { key: 'child_immunisation', label: 'Child Immunisation', tier: district.domain_tiers.child_immunisation },
              { key: 'nutrition_anaemia', label: 'Nutrition & Anaemia', tier: district.domain_tiers.nutrition_anaemia },
              { key: 'family_planning', label: 'Family Planning', tier: district.domain_tiers.family_planning },
              { key: 'ncd_screening', label: 'NCDs & Screening', tier: district.domain_tiers.ncd_screening },
              { key: 'household_amenities', label: 'Household Amenities', tier: district.domain_tiers.household_amenities },
            ].map(item => {
              const isT3 = item.tier === 3;
              const isT2 = item.tier === 2;
              return (
                <div 
                  key={item.key} 
                  className="bg-slate-950 rounded-lg p-3 border border-slate-800 space-y-1.5"
                >
                  <div className="text-xs font-medium text-slate-300 truncate">{item.label}</div>
                  <div className={`text-sm font-bold ${isT3 ? 'text-rose-400' : isT2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    Tier {item.tier}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {isT3 ? 'High Deficit' : isT2 ? 'Moderate Progress' : 'Low Deficit'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
            <span className="font-semibold text-white">Secondary Priorities: </span>
            {district.recommendations.secondary_priorities || 'None. Domain coverage remains stable.'}
          </div>
        </section>

      </div>

      {/* Complete 47 Indicator Breakdown Table */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Indicator Health Audit (47 Audited Features)
            </h2>
            <p className="text-xs text-slate-400">
              Benchmarking {district.name} against {district.state} state average and national mean
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryTab(cat)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedCategoryTab === cat 
                    ? 'bg-slate-800 text-white font-medium border border-slate-700' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                {cat === 'All' ? 'All' : cat.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Indicator Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-medium text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Indicator Name</th>
                <th className="py-2.5 px-3 text-right">District</th>
                <th className="py-2.5 px-3 text-right">State Avg</th>
                <th className="py-2.5 px-3 text-right">National Mean</th>
                <th className="py-2.5 px-3 text-center">Status vs. National</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredIndicators.map(ind => {
                const val = district.indicators[ind.code];
                const natVal = ind.national_mean;
                const stateVal = stateMeans[ind.code] || natVal;
                
                const isBetter = ind.direction === 'high' ? val >= natVal : val <= natVal;
                const diff = val - natVal;

                return (
                  <tr key={ind.code} className="hover:bg-slate-850">
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                      {ind.code}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-200">
                      {ind.name}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-white tabular-nums">
                      {val} {ind.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 tabular-nums">
                      {stateVal} {ind.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 tabular-nums">
                      {natVal} {ind.unit}
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums">
                      <span className={`inline-block font-semibold text-[11px] ${
                        isBetter ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} {ind.unit}
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
