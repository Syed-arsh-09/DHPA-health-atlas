import React, { useState } from 'react';
import { 
  ChevronRight,
  Search
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  CartesianGrid
} from 'recharts';

export default function CategoryAnalysis({ districts, metadata, onSelectDistrict }) {
  const [selectedDomainKey, setSelectedDomainKey] = useState('maternal_newborn');
  const [selectedTierFilter, setSelectedTierFilter] = useState('all');
  const [districtSearch, setDistrictSearch] = useState('');

  const domainConfigs = {
    maternal_newborn: {
      name: "Maternal & Newborn Care",
      indicators: ["C37", "C38", "C39", "C41", "C42", "C43", "C44", "C47", "C48"],
      keyMetric: "C47",
      keyMetricName: "Institutional Births",
      vulnerabilityPct: "28.2%",
      tier3Count: 199,
      description: "Captures institutional birth access, antenatal care adherence (4+ ANC), neonatal tetanus immunization, and out-of-pocket delivery expenses."
    },
    child_immunisation: {
      name: "Child Immunisation & Preventative Care",
      indicators: ["C54", "C60", "C61", "C63"],
      keyMetric: "C54",
      keyMetricName: "Full Child Immunisation",
      vulnerabilityPct: "36.7%",
      tier3Count: 259,
      description: "Measures full basic vaccination (12-23m), second dose measles follow-up (24-35m), rotavirus vaccine rollout, and child vitamin A supplementation."
    },
    nutrition_anaemia: {
      name: "Nutritional Status & Anaemia",
      indicators: ["C78", "C79", "C82", "C83", "C84", "C85", "C86", "C89"],
      keyMetric: "C78",
      keyMetricName: "Child Stunting (<5 yrs)",
      vulnerabilityPct: "56.9%",
      tier3Count: 402,
      description: "Assesses severe child stunting and wasting, adult BMI under-nutrition, obesity, and widespread child and maternal anaemia (<11g/dl and <12g/dl)."
    },
    family_planning: {
      name: "Reproductive Health & Family Planning",
      indicators: ["C19", "C21", "C23", "C24", "C26", "C33", "C35"],
      keyMetric: "C26",
      keyMetricName: "Modern Contraceptive Use",
      vulnerabilityPct: "24.2%",
      tier3Count: 171,
      description: "Tracks modern contraceptive prevalence, unmet family planning spacing/limiting needs, female underage marriage, teenage pregnancy, and menstrual hygiene."
    },
    ncd_screening: {
      name: "NCD Risk & Preventive Screening",
      indicators: ["C93", "C96", "C99", "C102", "C103", "C104", "C105"],
      keyMetric: "C93",
      keyMetricName: "Women High Blood Glucose",
      vulnerabilityPct: "25.4%",
      tier3Count: 179,
      description: "Evaluates emerging chronic metabolic risk (elevated blood glucose, adult hypertension) alongside preventive cancer screening (cervical, breast, oral)."
    },
    household_amenities: {
      name: "Household Amenities & Financing",
      indicators: ["C13", "C14", "C15", "C17"],
      keyMetric: "C14",
      keyMetricName: "Improved Sanitation",
      vulnerabilityPct: "25.4%",
      tier3Count: 179,
      description: "Gauges structural determinants of health: piped drinking water, improved private sanitation facilities, clean cooking fuel, and health insurance coverage."
    }
  };

  const currentConfig = domainConfigs[selectedDomainKey];

  // Filter districts for this domain
  const domainDistricts = districts.filter(d => {
    if (selectedTierFilter !== 'all' && d.domain_tiers[selectedDomainKey] !== parseInt(selectedTierFilter)) {
      return false;
    }
    if (districtSearch.trim().length > 0 && 
        !d.name.toLowerCase().includes(districtSearch.toLowerCase()) && 
        !d.state.toLowerCase().includes(districtSearch.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Calculate Tier Means for comparison graph
  const tierMeans = [1, 2, 3].map(t => {
    const tDistricts = districts.filter(d => d.domain_tiers[selectedDomainKey] === t);
    const count = tDistricts.length;
    const label = t === 1 ? 'Tier 1 (Low Deficit)' : t === 2 ? 'Tier 2 (Moderate)' : 'Tier 3 (High Deficit)';
    
    const obj = { tier: label, count };
    currentConfig.indicators.slice(0, 4).forEach(code => {
      const meta = metadata.indicators.find(i => i.code === code);
      const avg = tDistricts.reduce((sum, d) => sum + (d.indicators[code] || 0), 0) / (count || 1);
      obj[meta ? meta.name.slice(0, 24) : code] = Math.round(avg * 10) / 10;
    });
    return obj;
  });

  const chartKeys = currentConfig.indicators.slice(0, 4).map(code => {
    const meta = metadata.indicators.find(i => i.code === code);
    return meta ? meta.name.slice(0, 24) : code;
  });

  const barPalette = ['#38bdf8', '#34d399', '#fbbf24', '#f87171'];

  return (
    <div className="space-y-6 pb-16">
      
      {/* Category Navigation Bar */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex items-baseline justify-between mb-3">
          <h1 className="text-base font-bold text-white tracking-tight">
            Engine B — Functional Healthcare Domains
          </h1>
          <span className="text-xs text-slate-400">Select domain for deep-dive</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {Object.entries(domainConfigs).map(([key, cfg]) => {
            const isSelected = selectedDomainKey === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedDomainKey(key);
                  setSelectedTierFilter('all');
                }}
                className={`text-left p-3 rounded-lg border text-xs font-medium transition-colors ${
                  isSelected 
                    ? 'bg-slate-800 text-white border-slate-600 shadow-sm' 
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white'
                }`}
              >
                <div className="font-semibold truncate">{cfg.name}</div>
                <div className="text-[11px] text-slate-400 mt-1 tabular-nums">{cfg.tier3Count} in Tier 3</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Domain Overview & Algorithm Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{currentConfig.name}</h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                {currentConfig.description}
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-2xl font-bold text-rose-400 tabular-nums">{currentConfig.tier3Count}</span>
              <span className="text-xs text-slate-400 block tabular-nums">{currentConfig.vulnerabilityPct} of India in Tier 3</span>
            </div>
          </div>

          {/* Indicators in this category */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-slate-400 mb-2.5">
              Audited Domain Indicators ({currentConfig.indicators.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentConfig.indicators.map(code => {
                const meta = metadata.indicators.find(i => i.code === code);
                if (!meta) return null;
                return (
                  <div key={code} className="bg-slate-950 border border-slate-800 rounded-md p-2 flex items-center justify-between text-xs">
                    <span className="text-slate-300 truncate pr-2">{meta.name}</span>
                    <span className="font-medium text-white shrink-0 tabular-nums">
                      {meta.national_mean} {meta.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Algorithm & Evaluation Notes */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Domain Model Specification</h3>
            <div className="space-y-2 mt-3 text-xs text-slate-300 divide-y divide-slate-800">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Algorithm:</span>
                <span className="font-medium text-white">K-Means (k = 3)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Initialization:</span>
                <span className="font-medium text-white">k-means++ (n_init = 30)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Feature Scaling:</span>
                <span className="font-medium text-white">Z-score Standardized</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Vulnerability Anchor:</span>
                <span className="font-medium text-sky-400">{currentConfig.keyMetricName}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-white">Policy Directives: </span> 
            Tier 3 pinpoints districts where specific program machinery has stalled, independent of district wealth or geography.
          </div>
        </section>
      </div>

      {/* Cluster Comparison Graph */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Comparison Across Tiers on Core Domain Indicators
          </h2>
          <p className="text-xs text-slate-400">
            Average indicator values across Tier 1 (Low Deficit), Tier 2 (Moderate), and Tier 3 (High Deficit)
          </p>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tierMeans} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="tier" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '0.5rem', fontSize: '11px' }} 
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              {chartKeys.map((key, idx) => (
                <Bar key={key} dataKey={key} fill={barPalette[idx % barPalette.length]} radius={[2, 2, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* District Breakdown Table for this Domain */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              District Tier Classifications ({domainDistricts.length} Districts)
            </h2>
            <p className="text-xs text-slate-400">
              Filter by tier or search by district/state name
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search districts..."
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-md pl-7 pr-2.5 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 w-36 sm:w-44"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-md p-0.5 text-xs">
              <button
                onClick={() => setSelectedTierFilter('all')}
                className={`px-2 py-0.5 rounded ${selectedTierFilter === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedTierFilter('3')}
                className={`px-2 py-0.5 rounded ${selectedTierFilter === '3' ? 'bg-rose-950 text-rose-300 font-medium' : 'text-slate-400 hover:text-white'}`}
              >
                Tier 3 (Deficit)
              </button>
              <button
                onClick={() => setSelectedTierFilter('2')}
                className={`px-2 py-0.5 rounded ${selectedTierFilter === '2' ? 'bg-amber-950 text-amber-300 font-medium' : 'text-slate-400 hover:text-white'}`}
              >
                Tier 2
              </button>
              <button
                onClick={() => setSelectedTierFilter('1')}
                className={`px-2 py-0.5 rounded ${selectedTierFilter === '1' ? 'bg-emerald-950 text-emerald-300 font-medium' : 'text-slate-400 hover:text-white'}`}
              >
                Tier 1
              </button>
            </div>
          </div>
        </div>

        {/* District list */}
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-medium text-[11px] sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2 px-3">District</th>
                <th className="py-2 px-3">State</th>
                <th className="py-2 px-3">Domain Status</th>
                <th className="py-2 px-3">Anchor Metric ({currentConfig.keyMetricName})</th>
                <th className="py-2 px-3">Compound Vulnerability</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {domainDistricts.slice(0, 100).map(d => {
                const tier = d.domain_tiers[selectedDomainKey];
                const anchorVal = d.indicators[currentConfig.keyMetric];
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
                    <td className="py-2.5 px-3">
                      {tier === 3 ? (
                        <span className="text-[11px] font-semibold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">
                          Tier 3: High Deficit
                        </span>
                      ) : tier === 2 ? (
                        <span className="text-[11px] font-medium text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                          Tier 2: Moderate
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                          Tier 1: Low Deficit
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-white tabular-nums">
                      {anchorVal !== undefined && anchorVal !== null ? `${anchorVal}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums">
                      {d.compound_vulnerability.score} / 6 deficits
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-flex items-center gap-0.5 text-xs text-blue-400 group-hover:text-blue-300 font-medium">
                        Report <ChevronRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {domainDistricts.length > 100 && (
            <div className="text-center py-2 text-xs text-slate-400 bg-slate-950 border-t border-slate-800">
              Showing top 100 of {domainDistricts.length} matching districts. Use search above to narrow results.
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
