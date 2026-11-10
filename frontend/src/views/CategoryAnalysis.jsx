import React, { useState } from 'react';
import { 
  Layers, 
  BarChart3, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

export default function CategoryAnalysis({ districts, metadata, onSelectDistrict }) {
  const [selectedDomainKey, setSelectedDomainKey] = useState('maternal_newborn');
  const [selectedTierFilter, setSelectedTierFilter] = useState('all');

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
      name: "Child Immunisation & Supplementation",
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
    if (selectedTierFilter === 'all') return true;
    return d.domain_tiers[selectedDomainKey] === parseInt(selectedTierFilter);
  });

  // Calculate Tier Means for comparison graph
  const tierMeans = [1, 2, 3].map(t => {
    const tDistricts = districts.filter(d => d.domain_tiers[selectedDomainKey] === t);
    const count = tDistricts.length;
    const label = t === 1 ? 'Tier 1: Low Deficit' : t === 2 ? 'Tier 2: Moderate' : 'Tier 3: High Deficit';
    
    const obj = { tier: label, count };
    currentConfig.indicators.slice(0, 5).forEach(code => {
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

  const barColors = ['#2b5c8f', '#1b9e77', '#d95f02', '#7570b3'];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Category Navigation Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Select Healthcare Domain (Engine B)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {Object.entries(domainConfigs).map(([key, cfg]) => {
            const isSelected = selectedDomainKey === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedDomainKey(key);
                  setSelectedTierFilter('all');
                }}
                className={`text-left p-3 rounded-xl border text-xs font-medium transition-all ${
                  isSelected 
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20' 
                    : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="font-bold truncate">{cfg.name}</div>
                <div className="text-[11px] opacity-80 mt-1">{cfg.tier3Count} in Tier 3</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Domain Overview & Model Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 rounded">
                Engine B Domain Model
              </span>
              <h1 className="text-2xl font-extrabold text-white mt-1.5">{currentConfig.name}</h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                {currentConfig.description}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-extrabold text-rose-400">{currentConfig.tier3Count}</span>
              <span className="text-xs text-slate-400 block">{currentConfig.vulnerabilityPct} of India in Tier 3</span>
            </div>
          </div>

          {/* Indicators in this category */}
          <div className="pt-3 border-t border-slate-800">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Audited Indicators ({currentConfig.indicators.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentConfig.indicators.map(code => {
                const meta = metadata.indicators.find(i => i.code === code);
                if (!meta) return null;
                return (
                  <div key={code} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-2.5 flex items-center justify-between text-xs">
                    <span className="text-slate-300 truncate pr-2 font-medium">{meta.name}</span>
                    <span className="font-bold text-white shrink-0">
                      {meta.national_mean} {meta.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Algorithm & Evaluation Notes */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              Domain Model Evaluation
            </div>
            <h2 className="text-base font-bold text-white mt-1">K-Means Tri-Tier Clustering</h2>
            <div className="space-y-2.5 mt-3 text-xs text-slate-300">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Cluster Algorithm:</span>
                <span className="font-semibold text-white">K-Means (k=3)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Initialization:</span>
                <span className="font-semibold text-white">k-means++ (n_init=30)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Scaling Space:</span>
                <span className="font-semibold text-white">Standardized Z-Score</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Vulnerability Anchor:</span>
                <span className="font-semibold text-blue-400">{currentConfig.keyMetricName}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 text-[11px] text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-200">Policy Relevance:</span> Tier 3 identifies districts with statistically significant under-delivery in this vertical domain, regardless of their broad macroeconomic standing.
          </div>
        </div>
      </div>

      {/* Cluster Comparison Graph */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            Comparison Across Tiers on Key Indicators ({currentConfig.name})
          </h2>
          <p className="text-xs text-slate-400">
            Average natural indicator percentages across Tier 1 (Low Deficit), Tier 2 (Moderate), and Tier 3 (High Deficit)
          </p>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tierMeans} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="tier" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }} 
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
              {chartKeys.map((key, i) => (
                <Bar key={key} dataKey={key} fill={barColors[i % barColors.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* District Tier Filter & List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Districts in {currentConfig.name} ({domainDistricts.length})
            </h2>
            <p className="text-xs text-slate-400">Click any district to inspect complete profile and NHM recommendations</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter by Tier:</span>
            <div className="flex gap-1">
              <button 
                onClick={() => setSelectedTierFilter('all')}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${selectedTierFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                All
              </button>
              <button 
                onClick={() => setSelectedTierFilter('3')}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${selectedTierFilter === '3' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-rose-400 hover:text-white'}`}
              >
                Tier 3 (High Deficit)
              </button>
              <button 
                onClick={() => setSelectedTierFilter('2')}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${selectedTierFilter === '2' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-amber-400 hover:text-white'}`}
              >
                Tier 2 (Moderate)
              </button>
              <button 
                onClick={() => setSelectedTierFilter('1')}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${selectedTierFilter === '1' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-emerald-400 hover:text-white'}`}
              >
                Tier 1 (Low Deficit)
              </button>
            </div>
          </div>
        </div>

        {/* District Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-96 overflow-y-auto pr-1">
          {domainDistricts.slice(0, 150).map(d => {
            const tier = d.domain_tiers[selectedDomainKey];
            const badgeColor = tier === 3 ? 'border-rose-500/40 text-rose-300 bg-rose-500/10' :
                               tier === 2 ? 'border-amber-500/40 text-amber-300 bg-amber-500/10' :
                                            'border-emerald-500/40 text-emerald-300 bg-emerald-500/10';
            return (
              <button
                key={d.id}
                onClick={() => onSelectDistrict(d)}
                className={`text-left p-2.5 rounded-xl border bg-slate-800/40 hover:bg-slate-800 hover:border-slate-600 transition-all group ${badgeColor}`}
              >
                <div className="text-xs font-bold text-white group-hover:text-blue-400 truncate">{d.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{d.state}</div>
                <div className="flex items-center justify-between text-[10px] mt-1.5 pt-1 border-t border-slate-700/40">
                  <span>Tier {tier}</span>
                  <span className="font-semibold">{d.indicators[currentConfig.keyMetric]}%</span>
                </div>
              </button>
            );
          })}
        </div>
        {domainDistricts.length > 150 && (
          <div className="text-center text-xs text-slate-400 pt-2">
            Showing first 150 of {domainDistricts.length} districts. Use search or State view for specific lookups.
          </div>
        )}
      </div>

    </div>
  );
}
