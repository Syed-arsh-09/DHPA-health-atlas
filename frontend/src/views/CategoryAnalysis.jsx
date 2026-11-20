import React, { useState } from 'react';
import { 
  ChevronRight,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Heart,
  Baby,
  Apple,
  Users,
  Activity,
  Home,
  ChevronDown,
  ChevronUp
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
import { getIndicatorInfo } from '../data/indicatorMap';

export default function CategoryAnalysis({ districts, metadata, onSelectDistrict }) {
  const [selectedDomainKey, setSelectedDomainKey] = useState('maternal_newborn');
  const [selectedTierFilter, setSelectedTierFilter] = useState('all');
  const [districtSearch, setDistrictSearch] = useState('');
  const [expandedIndicator, setExpandedIndicator] = useState(null);

  // Clean, short feature name mapping
  const getCleanIndicatorName = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('antenatal check-up in the first trimester')) return '1st Trimester Check-up';
    if (lower.includes('at least 4 antenatal')) return '4+ Antenatal Visits';
    if (lower.includes('institutional birth')) return 'Hospital Deliveries';
    if (lower.includes('tetanus')) return 'Tetanus Injections';
    if (lower.includes('fully vaccinated')) return 'Full Child Immunisation';
    if (lower.includes('measles')) return 'Measles 2nd Dose';
    if (lower.includes('vitamin a')) return 'Child Vitamin A Dose';
    if (lower.includes('rotavirus')) return 'Rotavirus Vaccine';
    if (lower.includes('stunted')) return 'Child Stunting Rate';
    if (lower.includes('wasted')) return 'Child Wasting Rate';
    if (lower.includes('anaemic') && lower.includes('children')) return 'Childhood Anaemia';
    if (lower.includes('anaemic') && lower.includes('women')) return 'Maternal Anaemia';
    if (lower.includes('modern contraceptive')) return 'Modern Contraception';
    if (lower.includes('spacing')) return 'Spacing Methods Use';
    if (lower.includes('underage') || lower.includes('before age 18')) return 'Underage Marriage';
    if (lower.includes('teenage pregnancy')) return 'Teenage Pregnancy Rate';
    if (lower.includes('blood sugar') || lower.includes('glucose')) return 'Elevated Blood Sugar';
    if (lower.includes('hypertension') || lower.includes('blood pressure')) return 'High Blood Pressure';
    if (lower.includes('cervix') || lower.includes('cervical')) return 'Cervical Screening';
    if (lower.includes('breast')) return 'Breast Cancer Screening';
    if (lower.includes('oral')) return 'Oral Cavity Screening';
    if (lower.includes('sanitation')) return 'Clean Sanitation';
    if (lower.includes('cooking fuel') || lower.includes('clean fuel')) return 'Clean Cooking Fuel';
    if (lower.includes('drinking water')) return 'Treated Drinking Water';
    if (lower.includes('insurance')) return 'Health Insurance';
    if (lower.includes('electricity')) return 'Electricity Access';
    return name.length > 28 ? name.slice(0, 26) + '...' : name;
  };

  const domainConfigs = {
    maternal_newborn: {
      name: "Maternal & Newborn Care",
      icon: Heart,
      indicators: ["C37", "C38", "C39", "C41", "C42", "C43", "C44", "C47", "C48"],
      keyMetric: "C47",
      keyMetricName: "Hospital Deliveries",
      vulnerabilityPct: "28.2%",
      tier3Count: 199,
      description: "Tracks institutional childbirth, prenatal visits (4+ ANC), tetanus shots, and maternal safety."
    },
    child_immunisation: {
      name: "Child Vaccines & Prevention",
      icon: Baby,
      indicators: ["C54", "C60", "C61", "C63"],
      keyMetric: "C54",
      keyMetricName: "Full Child Immunisation",
      vulnerabilityPct: "36.7%",
      tier3Count: 259,
      description: "Measures basic routine vaccinations, measles follow-ups, and childhood Vitamin A coverage."
    },
    nutrition_anaemia: {
      name: "Nutrition & Anaemia",
      icon: Apple,
      indicators: ["C78", "C79", "C82", "C83", "C84", "C85", "C86", "C89"],
      keyMetric: "C78",
      keyMetricName: "Child Stunting Rate",
      vulnerabilityPct: "56.9%",
      tier3Count: 402,
      description: "Assesses severe child stunting, low body weight, and widespread iron deficiency among children and mothers."
    },
    family_planning: {
      name: "Family Health & Planning",
      icon: Users,
      indicators: ["C19", "C21", "C23", "C24", "C26", "C33", "C35"],
      keyMetric: "C26",
      keyMetricName: "Modern Contraceptive Use",
      vulnerabilityPct: "24.2%",
      tier3Count: 171,
      description: "Tracks modern family planning adoption, birth spacing, and reduction of underage marriage."
    },
    ncd_screening: {
      name: "Heart, Diabetes & Lifestyle",
      icon: Activity,
      indicators: ["C93", "C96", "C99", "C102", "C103", "C104", "C105"],
      keyMetric: "C93",
      keyMetricName: "Elevated Blood Sugar",
      vulnerabilityPct: "25.4%",
      tier3Count: 179,
      description: "Evaluates emerging chronic adult risks (blood pressure and glucose) alongside basic preventive screening."
    },
    household_amenities: {
      name: "Clean Water & Sanitation",
      icon: Home,
      indicators: ["C13", "C14", "C15", "C17"],
      keyMetric: "C14",
      keyMetricName: "Clean Sanitation Access",
      vulnerabilityPct: "25.4%",
      tier3Count: 179,
      description: "Basic living conditions: private toilet facilities, clean cooking fuel, and health insurance."
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

  // Calculate Tier Means for comparison graph using clean names
  const tierMeans = [1, 2, 3].map(t => {
    const tDistricts = districts.filter(d => d.domain_tiers[selectedDomainKey] === t);
    const count = tDistricts.length;
    const label = t === 1 ? 'Good (Tier 1)' : t === 2 ? 'Moderate (Tier 2)' : 'High Need (Tier 3)';
    
    const obj = { tier: label, count };
    currentConfig.indicators.slice(0, 4).forEach(code => {
      const meta = metadata.indicators.find(i => i.code === code);
      const info = getIndicatorInfo(code, meta ? meta.name : code);
      const cleanName = info.shortName;
      const avg = tDistricts.reduce((sum, d) => sum + (d.indicators[code] || 0), 0) / (count || 1);
      obj[cleanName] = Math.round(avg * 10) / 10;
    });
    return obj;
  });

  const chartKeys = currentConfig.indicators.slice(0, 4).map(code => {
    const meta = metadata.indicators.find(i => i.code === code);
    const info = getIndicatorInfo(code, meta ? meta.name : code);
    return info.shortName;
  });

  const barPalette = ['#38bdf8', '#34d399', '#fbbf24', '#f87171'];

  return (
    <div className="space-y-6 pb-20">
      
      {/* Category Navigation Bar */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h1 className="text-base font-bold text-white tracking-tight">
              Essential Healthcare Sectors
            </h1>
          </div>
          <span className="text-xs text-slate-400">Select sector to inspect</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {Object.entries(domainConfigs).map(([key, cfg]) => {
            const isSelected = selectedDomainKey === key;
            const Icon = cfg.icon;
            return (
              <button
                key={key}
                onClick={() => {
                  setSelectedDomainKey(key);
                  setSelectedTierFilter('all');
                }}
                className={`text-left p-3 rounded-xl border text-xs font-medium transition-all ${
                  isSelected 
                    ? 'bg-slate-800 text-white border-blue-500 shadow-sm' 
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold truncate">
                  <Icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{cfg.name}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  <strong className="text-rose-400">{cfg.tier3Count}</strong> urgent districts
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Domain Overview Strip (Cleaned, Algorithm Spec Removed) */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{currentConfig.name}</h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              {currentConfig.description}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">High Deficit Area</span>
              <span className="text-lg font-black text-rose-400 block">{currentConfig.tier3Count} Districts</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">National Share</span>
              <span className="text-sm font-bold text-white block">{currentConfig.vulnerabilityPct} of India</span>
            </div>
          </div>
        </div>

        {/* Short, Clean Indicator Chips (Tap to expand full definition) */}
        <div className="pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Key Indicators in this Sector:
            </span>
            <span className="text-[10px] text-slate-500">Tap indicator to expand</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {currentConfig.indicators.map(code => {
              const meta = metadata.indicators.find(i => i.code === code);
              if (!meta) return null;
              const info = getIndicatorInfo(code, meta.name);
              const isExpanded = expandedIndicator === code;

              return (
                <div 
                  key={code} 
                  onClick={() => setExpandedIndicator(isExpanded ? null : code)}
                  className={`bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-xl p-2.5 transition-all cursor-pointer text-xs space-y-1.5 ${
                    isExpanded ? 'ring-1 ring-blue-500/50 bg-slate-900 col-span-1 sm:col-span-2' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-white font-semibold truncate pr-1">
                      {info.shortName}
                    </span>
                    <span className="font-bold text-sky-400 shrink-0 text-[11px] tabular-nums">
                      {meta.national_mean} {meta.unit}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="pt-1.5 border-t border-slate-800 text-[11px] text-slate-300 space-y-1 animate-fade-in">
                      <div className="leading-relaxed">
                        <strong>Official Question:</strong> {info.fullName}
                      </div>
                      <div className="text-emerald-400 font-medium pt-0.5">
                        🏛️ {info.scheme}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cluster Comparison Graph */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-md">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Average Indicator Comparison Across Health Performance Tiers
          </h3>
          <p className="text-xs text-slate-400">
            Comparing Good (Tier 1), Moderate (Tier 2), and High Need (Tier 3) districts
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
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              {chartKeys.map((key, idx) => (
                <Bar 
                  key={key} 
                  dataKey={key} 
                  fill={barPalette[idx % barPalette.length]} 
                  radius={[3, 3, 0, 0]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* District Explorer Table */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Districts in this Sector ({domainDistricts.length})
            </h3>
            <p className="text-xs text-slate-400">
              Filter by urgency tier or search by district/state name
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Tier Filter */}
            <div className="flex rounded-lg bg-slate-950 border border-slate-800 p-0.5 text-xs">
              <button
                onClick={() => setSelectedTierFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${selectedTierFilter === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'}`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedTierFilter('3')}
                className={`px-2.5 py-1 rounded-md transition-colors ${selectedTierFilter === '3' ? 'bg-rose-900/60 text-rose-300 font-medium' : 'text-slate-400'}`}
              >
                High Need (Tier 3)
              </button>
              <button
                onClick={() => setSelectedTierFilter('2')}
                className={`px-2.5 py-1 rounded-md transition-colors ${selectedTierFilter === '2' ? 'bg-amber-900/60 text-amber-300 font-medium' : 'text-slate-400'}`}
              >
                Moderate (Tier 2)
              </button>
              <button
                onClick={() => setSelectedTierFilter('1')}
                className={`px-2.5 py-1 rounded-md transition-colors ${selectedTierFilter === '1' ? 'bg-emerald-900/60 text-emerald-300 font-medium' : 'text-slate-400'}`}
              >
                Good (Tier 1)
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search district..."
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-36 sm:w-44"
              />
            </div>
          </div>
        </div>

        {/* Clean Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-3">Sector Performance</th>
                <th className="py-2.5 px-3 text-right">Anchor Metric</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {domainDistricts.slice(0, 50).map(d => {
                const tier = d.domain_tiers[selectedDomainKey];
                const keyVal = d.indicators[currentConfig.keyMetric] || 0;

                return (
                  <tr 
                    key={d.id}
                    onClick={() => onSelectDistrict(d)}
                    className="hover:bg-slate-850 cursor-pointer transition-colors group"
                  >
                    <td className="py-2.5 px-3 font-bold text-white group-hover:text-blue-400 transition-colors">
                      {d.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {d.state}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        tier === 3 ? 'bg-rose-950 text-rose-300 border border-rose-800/60' :
                        tier === 2 ? 'bg-amber-950 text-amber-300 border border-amber-800/60' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                      }`}>
                        {tier === 3 ? 'High Deficit' : tier === 2 ? 'Moderate' : 'Good Performance'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-200 tabular-nums">
                      {keyVal}%
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-blue-400 group-hover:text-blue-300 font-semibold inline-flex items-center gap-0.5 text-[11px]">
                        Open <ChevronRight className="w-3 h-3" />
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
