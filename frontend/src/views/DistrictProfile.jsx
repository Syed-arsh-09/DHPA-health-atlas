import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Compass,
  FileCheck2
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
  const [searchDistrictText, setSearchDistrictText] = useState('');

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
    1: { name: 'Cluster 1: Advanced / NCD Risk', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    2: { name: 'Cluster 2: Intermediate Progressing', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    3: { name: 'Cluster 3: Foundational Deficits', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    4: { name: 'Cluster 4: Hill & Northeastern', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  };

  const urgencyColors = {
    1: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    2: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    3: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    4: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Search & Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-bold text-white">Select District for Report Card:</span>
        </div>

        <div className="w-full sm:w-80">
          <select
            value={district.id}
            onChange={(e) => {
              const d = districts.find(x => x.id === parseInt(e.target.value));
              if (d) setSelectedDistrict(d);
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {districts.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.state}) — Score {d.compound_vulnerability.score}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* District Header Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${clusterBadges[district.cluster_a.id].bg}`}>
                {clusterBadges[district.cluster_a.id].name}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${urgencyColors[district.compound_vulnerability.urgency_rank]}`}>
                {district.compound_vulnerability.urgency_tier}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mt-2">{district.name}</h1>
            <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1.5">
              <span>{district.state}</span> • 
              <span>Distance to Cluster Centroid: {district.cluster_a.distance}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 shrink-0">
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Deficit Domains</span>
              <span className={`text-2xl font-black ${
                district.compound_vulnerability.score >= 4 ? 'text-rose-400' :
                district.compound_vulnerability.score >= 2 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {district.compound_vulnerability.score} <span className="text-xs text-slate-400 font-normal">/ 6</span>
              </span>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Primary Priority</span>
              <span className="text-xs font-bold text-white block mt-1 max-w-[140px] truncate">
                {district.recommendations.primary_priority}
              </span>
            </div>
          </div>
        </div>

        {/* Actionable Service Recommendations Box */}
        <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Prescribed National Health Mission (NHM) Interventions
          </div>

          {district.recommendations.triggers && (
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-rose-300">Root-Cause Triggers: </span>
              {district.recommendations.triggers}
            </div>
          )}

          <div className="text-xs text-slate-200 leading-relaxed font-medium bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            {district.recommendations.interventions}
          </div>
        </div>
      </div>

      {/* Radar Profile & Multi-Domain Health Geometry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              Multi-Domain Health Radar
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {district.name} (Blue) vs. National Benchmark (Gray)
            </p>
          </div>

          <div className="h-64 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={8} />
                <Radar name={district.name} dataKey="District" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                <Radar name="National Benchmark" dataKey="National" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-400 text-center border-t border-slate-800 pt-2">
            Values scaled to desirable direction (100 = best national health performance)
          </div>
        </div>

        {/* Domain Tier Status Cards */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              Engine B Healthcare Domain Performance
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Independent vertical health sector evaluation (Tier 1 = High, Tier 2 = Moderate, Tier 3 = High Deficit)
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
                  className={`rounded-xl p-3 border transition-all ${
                    isT3 ? 'bg-rose-500/10 border-rose-500/30' :
                    isT2 ? 'bg-amber-500/10 border-amber-500/30' :
                           'bg-emerald-500/10 border-emerald-500/30'
                  }`}
                >
                  <div className="text-[11px] font-medium text-slate-400 truncate">{item.label}</div>
                  <div className={`text-base font-bold mt-1 ${isT3 ? 'text-rose-400' : isT2 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    Tier {item.tier}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {isT3 ? '⚠️ Priority Deficit' : isT2 ? 'Progressing' : '✓ High Delivery'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Guidance Box */}
          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 text-xs text-slate-300">
            <span className="font-semibold text-white">Secondary Focus Areas: </span>
            {district.recommendations.secondary_priorities || 'None. Domain coverage remains stable.'}
          </div>
        </div>

      </div>

      {/* Complete 47 Indicator Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Complete Indicator Health Report Card (47 Audited Features)
            </h2>
            <p className="text-xs text-slate-400">
              Benchmarking {district.name} against {district.state} state average and national mean
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-none">
            {categories.slice(0, 5).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryTab(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategoryTab === cat 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Indicator Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Indicator Name</th>
                <th className="py-2.5 px-3 text-right">District Value</th>
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
                  <tr key={ind.code} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-medium text-slate-200">
                      {ind.name}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">
                      {val} {ind.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">
                      {stateVal} {ind.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">
                      {natVal} {ind.unit}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                        isBetter 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {isBetter ? '+' : ''}{diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)}
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
