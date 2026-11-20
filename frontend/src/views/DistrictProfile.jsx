import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Search,
  CheckCircle2, 
  AlertTriangle,
  ShieldAlert,
  Heart,
  Baby,
  Apple,
  Users,
  Activity,
  Home,
  Sparkles,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Info,
  Building,
  Target
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
import { getIndicatorInfo, resolveGovernmentScheme } from '../data/indicatorMap';

export default function DistrictProfile({ 
  districts, 
  metadata, 
  selectedDistrict, 
  setSelectedDistrict 
}) {
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('All');
  const [showDetailedIndicators, setShowDetailedIndicators] = useState(false);
  const [indicatorSearch, setIndicatorSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [expandedInsight, setExpandedInsight] = useState(null);
  const [expandedTableRow, setExpandedTableRow] = useState(null);

  const district = selectedDistrict || districts[0];
  const stateMeta = metadata.states.find(s => s.state === district.state);
  const stateMeans = stateMeta ? stateMeta.indicator_means : {};

  // Human-friendly overall health assessment
  const healthAssessment = useMemo(() => {
    const score = district.compound_vulnerability.score;
    if (score === 0) {
      return {
        badge: '🟢 Strong Healthcare System',
        title: 'High Overall Coverage',
        summary: `Strong hospital deliveries, routine child vaccination, and established clinics with low immediate gaps.`,
        color: 'emerald'
      };
    } else if (score === 1) {
      return {
        badge: '🔵 Good Healthcare Baseline',
        title: 'Solid Baseline with Focused Need',
        summary: `Performs well in most health areas; priority attention needed for ${district.recommendations.primary_priority.toLowerCase()}.`,
        color: 'sky'
      };
    } else if (score <= 3) {
      return {
        badge: '🟡 Moderate Healthcare Need',
        title: 'Developing Health Coverage',
        summary: `Good hospital access, but moderate deficits in nutrition and maternal community outreach.`,
        color: 'amber'
      };
    } else {
      return {
        badge: '🔴 Urgent Priority',
        title: 'Multiple Critical Gaps',
        summary: `Faces concurrent challenges across maternal care, child nutrition, and primary healthcare delivery. Immediate priority focus under National Health Mission programs.`,
        color: 'rose'
      };
    }
  }, [district]);

  // Radar Data: comparing District vs National Benchmark across 7 intuitive pillars
  const radarData = useMemo(() => {
    const metrics = [
      { code: 'C47', label: 'Hospital Births' },
      { code: 'C38', label: '4+ Prenatal Visits' },
      { code: 'C54', label: 'Child Vaccines' },
      { code: 'C78', label: 'Child Growth', invert: true },
      { code: 'C14', label: 'Sanitation' },
      { code: 'C26', label: 'Family Planning' },
      { code: 'C97', label: 'Healthy BP', invert: true },
    ];

    return metrics.map(m => {
      const rawDist = district.indicators[m.code] || 0;
      const rawNat = metadata.indicators.find(i => i.code === m.code)?.national_mean || 50;
      
      const distScore = m.invert ? Math.max(0, 100 - rawDist) : rawDist;
      const natScore = m.invert ? Math.max(0, 100 - rawNat) : rawNat;

      return {
        metric: m.label,
        District: Math.round(distScore),
        National: Math.round(natScore)
      };
    });
  }, [district, metadata]);

  // 6 Life-domain simplified status pillars
  const healthPillars = [
    {
      id: 'maternal',
      name: 'Maternal Care',
      icon: Heart,
      tier: district.domain_tiers.maternal_newborn,
      stat: `${district.indicators['C47'] || '--'}%`,
      statLabel: 'Hospital Deliveries',
      note: district.domain_tiers.maternal_newborn === 1 ? 'High institutional delivery' : 'Needs antenatal checkup boost'
    },
    {
      id: 'child',
      name: 'Child Vaccines',
      icon: Baby,
      tier: district.domain_tiers.child_immunisation,
      stat: `${district.indicators['C54'] || '--'}%`,
      statLabel: 'Full Immunisation',
      note: district.domain_tiers.child_immunisation === 1 ? 'Universal routine coverage' : 'Booster doses need tracking'
    },
    {
      id: 'nutrition',
      name: 'Nutrition & Iron',
      icon: Apple,
      tier: district.domain_tiers.nutrition_anaemia,
      stat: `${district.indicators['C80'] ? district.indicators['C80'] : '--'}%`,
      statLabel: 'Child Anaemia Rate',
      note: district.domain_tiers.nutrition_anaemia === 1 ? 'Good nutritional stability' : 'Iron supplements needed'
    },
    {
      id: 'family',
      name: 'Family Planning',
      icon: Users,
      tier: district.domain_tiers.family_planning,
      stat: `${district.indicators['C26'] || '--'}%`,
      statLabel: 'Modern Methods',
      note: district.domain_tiers.family_planning === 1 ? 'Strong reproductive access' : 'Spacing counseling needed'
    },
    {
      id: 'ncd',
      name: 'BP & Blood Sugar',
      icon: Activity,
      tier: district.domain_tiers.ncd_screening,
      stat: `${district.indicators['C97'] ? (100 - district.indicators['C97']).toFixed(0) : '--'}%`,
      statLabel: 'Normal Blood Pressure',
      note: district.domain_tiers.ncd_screening === 1 ? 'Low chronic disease burden' : 'Routine screening recommended'
    },
    {
      id: 'amenities',
      name: 'Clean Water & Toilets',
      icon: Home,
      tier: district.domain_tiers.household_amenities,
      stat: `${district.indicators['C14'] || '--'}%`,
      statLabel: 'Sanitation Access',
      note: district.domain_tiers.household_amenities === 1 ? 'High household amenities' : 'Sanitation coverage priority'
    }
  ];

  // Distinct multi-domain action cards ensuring no scheme is ever repeated
  const actionItems = useMemo(() => {
    const raw = district.recommendations.interventions || '';
    const parts = raw
      .split(/[\u2022•\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 6);

    const seenSchemes = new Set();
    const items = [];

    // 1. Process district's custom interventions, ensuring no scheme is repeated
    for (const text of parts) {
      const scheme = resolveGovernmentScheme(text, district.recommendations.primary_priority);
      if (!seenSchemes.has(scheme.name)) {
        seenSchemes.add(scheme.name);
        items.push({ text, scheme });
        if (items.length === 3) break;
      }
    }

    // 2. If fewer than 3 unique schemes were found, look at other critical deficit domains
    if (items.length < 3) {
      // Prioritize domains by highest deficit in this district (Tier 3 = High Deficit, Tier 2 = Moderate)
      const tiers = district.domain_tiers || {};
      const domainPriority = [
        'maternal_newborn',
        'child_immunisation',
        'nutrition_anaemia',
        'ncd_screening',
        'household_amenities',
        'family_planning'
      ].sort((a, b) => (tiers[b] || 1) - (tiers[a] || 1));

      // Domain-specific actionable interventions with distinct official schemes
      const domainActions = {
        maternal_newborn: {
          text: 'Intensify Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA) fixed-day antenatal clinics and early high-risk screening.',
          scheme: resolveGovernmentScheme('pmsma antenatal clinics')
        },
        child_immunisation: {
          text: 'Deploy Intensified Mission Indradhanush (IMI 5.0) special session catch-up drives in low-coverage sub-centre areas.',
          scheme: resolveGovernmentScheme('indradhanush catch-up drives')
        },
        nutrition_anaemia: {
          text: 'Strengthen POSHAN Abhiyaan supplementary nutrition feeding and Anganwadi growth monitoring for children and mothers.',
          scheme: resolveGovernmentScheme('first-1000-days supplementary nutrition poshan')
        },
        ncd_screening: {
          text: 'Operationalize Ayushman Arogya Mandir screening camps and free hypertension and diabetes medication distribution.',
          scheme: resolveGovernmentScheme('ncd screening camps metformin')
        },
        household_amenities: {
          text: 'Accelerate Swachh Bharat Mission community sanitation upgrades and behavior-change drives for ODF sustainability.',
          scheme: resolveGovernmentScheme('toilets sanitation swachh')
        },
        family_planning: {
          text: 'Expand Mission Parivar Vikas voluntary spacing method counseling and ASHA home delivery of contraceptives.',
          scheme: resolveGovernmentScheme('family planning spacing methods')
        }
      };

      for (const dom of domainPriority) {
        const candidate = domainActions[dom];
        if (candidate && !seenSchemes.has(candidate.scheme.name)) {
          seenSchemes.add(candidate.scheme.name);
          items.push(candidate);
          if (items.length === 3) break;
        }
      }
    }

    // Fallback safety: ensure always at least 3 items with distinct schemes
    if (items.length < 3) {
      const genericFallbacks = [
        {
          text: 'Strengthen primary health center infrastructure, diagnostics, and essential medicine availability under NHM.',
          scheme: resolveGovernmentScheme('', 'National Health Mission')
        },
        {
          text: 'Intensify Ayushman Bharat PM-JAY golden card saturation drives for catastrophic health expenditure protection.',
          scheme: resolveGovernmentScheme('pm-jay golden card')
        },
        {
          text: 'Scale up Jal Jeevan Mission piped drinking water access and rural community water quality monitoring.',
          scheme: resolveGovernmentScheme('jal jeevan drinking water')
        }
      ];
      for (const fallback of genericFallbacks) {
        if (!seenSchemes.has(fallback.scheme.name)) {
          seenSchemes.add(fallback.scheme.name);
          items.push(fallback);
          if (items.length === 3) break;
        }
      }
    }

    return items;
  }, [district]);

  // Parse root-cause triggers into clean individual items
  const rootCauses = useMemo(() => {
    const raw = district.recommendations.triggers || '';
    return raw.split('|').map(s => s.trim()).filter(Boolean);
  }, [district]);

  // Derive top 2 strengths and top 2 areas of concern with complete definitions and distinct schemes
  const keyInsights = useMemo(() => {
    const scoredIndicators = metadata.indicators.map(ind => {
      const info = getIndicatorInfo(ind.code, ind.name);
      const val = district.indicators[ind.code] || 0;
      const nat = ind.national_mean || 0;
      const diff = ind.direction === 'high' ? val - nat : nat - val;
      return {
        ...ind,
        shortName: info.shortName,
        fullName: info.fullName,
        scheme: info.scheme,
        val,
        nat,
        diff
      };
    });

    const sortedByAdvantage = [...scoredIndicators].sort((a, b) => b.diff - a.diff);
    const sortedByDeficit = [...scoredIndicators].sort((a, b) => a.diff - b.diff);

    // Pick top 2 strengths ensuring distinct schemes
    const strengths = [];
    const seenStrengthSchemes = new Set();
    for (const item of sortedByAdvantage) {
      if (!seenStrengthSchemes.has(item.scheme)) {
        seenStrengthSchemes.add(item.scheme);
        strengths.push(item);
        if (strengths.length === 2) break;
      }
    }
    if (strengths.length < 2) {
      for (const item of sortedByAdvantage) {
        if (!strengths.includes(item)) {
          strengths.push(item);
          if (strengths.length === 2) break;
        }
      }
    }

    // Pick top 2 concerns ensuring distinct schemes so both cards don't repeat the same scheme
    const concerns = [];
    const seenConcernSchemes = new Set();
    for (const item of sortedByDeficit) {
      if (!seenConcernSchemes.has(item.scheme)) {
        seenConcernSchemes.add(item.scheme);
        concerns.push(item);
        if (concerns.length === 2) break;
      }
    }
    if (concerns.length < 2) {
      for (const item of sortedByDeficit) {
        if (!concerns.includes(item)) {
          concerns.push(item);
          if (concerns.length === 2) break;
        }
      }
    }

    return {
      strengths,
      concerns
    };
  }, [district, metadata]);

  // Filtered districts for switcher
  const filteredDistricts = districtSearch.trim().length > 0 
    ? districts.filter(d => 
        d.name.toLowerCase().includes(districtSearch.toLowerCase()) ||
        d.state.toLowerCase().includes(districtSearch.toLowerCase())
      ).slice(0, 6)
    : [];

  // Categories for detailed table
  const categories = [
    'All',
    'Maternal & Newborn Care',
    'Child Immunisation & Preventative Care',
    'Nutritional Status & Anaemia',
    'Reproductive Health & Family Planning',
    'NCD Risk & Preventive Screening',
    'Household Amenities & Financing'
  ];

  const filteredIndicators = metadata.indicators.filter(ind => {
    const matchesCategory = selectedCategoryTab === 'All' || ind.category === selectedCategoryTab;
    const info = getIndicatorInfo(ind.code, ind.name);
    const matchesSearch = !indicatorSearch || 
      info.shortName.toLowerCase().includes(indicatorSearch.toLowerCase()) || 
      info.fullName.toLowerCase().includes(indicatorSearch.toLowerCase()) ||
      ind.code.toLowerCase().includes(indicatorSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top District Selector Bar */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">District Report Card</span>
              <span className="text-xs font-semibold text-sky-400 bg-sky-950 px-2.5 py-0.5 rounded-full border border-sky-800/60">
                {district.state}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              {district.name}
            </h1>
          </div>
        </div>

        {/* Quick District Switcher */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Switch to another district..."
            value={districtSearch}
            onChange={(e) => setDistrictSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          {filteredDistricts.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-800/80">
              {filteredDistricts.map(d => (
                <button
                  key={d.id}
                  onClick={() => {
                    setSelectedDistrict(d);
                    setDistrictSearch('');
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-800 transition-colors flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-white">{d.name}</span>
                  <span className="text-slate-400 text-[11px]">{d.state}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Friendly District Health Card */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-950 text-slate-200 border border-slate-800">
              {healthAssessment.badge}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight pt-1">
              {healthAssessment.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {healthAssessment.summary}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 rounded-xl p-3.5 shrink-0">
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 block font-medium">Deficit Areas</span>
              <span className={`text-xl font-black mt-0.5 block ${
                district.compound_vulnerability.score >= 4 ? 'text-rose-400' :
                district.compound_vulnerability.score >= 2 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {district.compound_vulnerability.score} / 6
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-left px-2 max-w-[150px]">
              <span className="text-[10px] text-slate-400 block font-medium">Top Priority</span>
              <span className="text-xs font-bold text-white mt-0.5 block truncate">
                {district.recommendations.primary_priority}
              </span>
            </div>
          </div>
        </div>

        {/* Unclustered Action Plan with Direct Government Schemes References */}
        <div className="space-y-3.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Prescribed Health Actions & Support</span>
          </div>

          {/* Root-cause triggers in clean distinct tags */}
          {rootCauses.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-950/70 border border-rose-900/30 rounded-xl">
              <span className="text-[11px] font-semibold text-rose-300 flex items-center gap-1 shrink-0">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Root Causes:
              </span>
              {rootCauses.map((trigger, idx) => (
                <span key={idx} className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-900 text-slate-200 border border-slate-800 font-medium">
                  {trigger}
                </span>
              ))}
            </div>
          )}

          {/* Individual spacious action cards with Government Scheme Tag */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
            {actionItems.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3 shadow-sm transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.scheme.badgeColor}`}>
                      🏛️ {item.scheme.name}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-slate-100 leading-relaxed pt-1">
                    {item.text}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Target className="w-3 h-3 text-blue-400 shrink-0" />
                  <span className="truncate">{item.scheme.actionType}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Section: Radar Chart (Comparison) & 6 Healthcare Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        
        {/* Radar Chart (District vs National Benchmark) */}
        <section className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-md">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Health Performance Radar
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {district.name} (Blue) vs. National Benchmark (Gray)
            </p>
          </div>

          <div className="h-64 w-full my-auto pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                <Radar name={district.name} dataKey="District" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.4} />
                <Radar name="National Benchmark" dataKey="National" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '0.5rem', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] text-slate-400 text-center border-t border-slate-800/80 pt-2">
            Outer edge (100) = best health performance
          </div>
        </section>

        {/* 6 Key Life Healthcare Pillars */}
        <section className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-3 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Core Healthcare Indicators
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Status across 6 essential family healthcare areas
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {healthPillars.map(pillar => {
              const Icon = pillar.icon;
              const isGood = pillar.tier === 1;
              const isFair = pillar.tier === 2;

              return (
                <div 
                  key={pillar.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs font-semibold text-slate-200 truncate">{pillar.name}</span>
                    </div>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      isGood ? 'bg-emerald-500' : isFair ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                  </div>

                  <div>
                    <span className="text-base font-extrabold text-white block">{pillar.stat}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{pillar.statLabel}</span>
                  </div>

                  <div className="text-[10px] text-slate-400 truncate pt-1 border-t border-slate-800/60">
                    {pillar.note}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
            Primary Goal: <strong className="text-white">{district.recommendations.primary_priority}</strong>
          </div>
        </section>

      </div>

      {/* Interactive Strengths & Priority Gaps (Tap to expand full survey definition) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Strengths */}
        <div className="bg-slate-900 border border-emerald-900/30 rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Key Strengths (Above National Average)</span>
            </div>
            <span className="text-[10px] text-slate-500">Tap to expand</span>
          </div>

          <div className="space-y-2.5">
            {keyInsights.strengths.map(item => {
              const isExpanded = expandedInsight === item.code;
              return (
                <div 
                  key={item.code} 
                  onClick={() => setExpandedInsight(isExpanded ? null : item.code)}
                  className="bg-slate-950 hover:bg-slate-850 rounded-xl p-3 border border-slate-800/80 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-white text-xs group-hover:text-emerald-400 transition-colors">
                      {item.shortName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold text-xs">+{item.diff.toFixed(1)}%</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded official survey description */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1.5 animate-fade-in">
                      <div className="text-slate-300 leading-relaxed font-normal">
                        <strong>Official Survey Indicator:</strong> {item.fullName}
                      </div>
                      <div className="flex items-center justify-between text-slate-400 pt-1">
                        <span>District: <strong className="text-white">{item.val} {item.unit}</strong> (National: {item.nat} {item.unit})</span>
                        <span className="text-emerald-400 font-medium">🏛️ {item.scheme}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Areas */}
        <div className="bg-slate-900 border border-rose-900/30 rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Priority Areas (Needs Focus)</span>
            </div>
            <span className="text-[10px] text-slate-500">Tap to expand</span>
          </div>

          <div className="space-y-2.5">
            {keyInsights.concerns.map(item => {
              const isExpanded = expandedInsight === item.code;
              return (
                <div 
                  key={item.code} 
                  onClick={() => setExpandedInsight(isExpanded ? null : item.code)}
                  className="bg-slate-950 hover:bg-slate-850 rounded-xl p-3 border border-slate-800/80 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-white text-xs group-hover:text-rose-400 transition-colors">
                      {item.shortName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-rose-400 font-bold text-xs">{item.diff.toFixed(1)}%</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded official survey description */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1.5 animate-fade-in">
                      <div className="text-slate-300 leading-relaxed font-normal">
                        <strong>Official Survey Indicator:</strong> {item.fullName}
                      </div>
                      <div className="flex items-center justify-between text-slate-400 pt-1">
                        <span>District: <strong className="text-white">{item.val} {item.unit}</strong> (Benchmark: {item.nat} {item.unit})</span>
                        <span className="text-rose-400 font-medium">🏛️ {item.scheme}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </section>

      {/* Collapsible Full Indicator Table (Click row to expand complete survey description) */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Detailed Clinical & Survey Indicator Audit
            </h3>
            <p className="text-xs text-slate-400">
              Click any indicator to expand full official NFHS-5 definition
            </p>
          </div>

          <button
            onClick={() => setShowDetailedIndicators(!showDetailedIndicators)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <span>{showDetailedIndicators ? 'Hide Table' : 'Show 47 Indicators'}</span>
            {showDetailedIndicators ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showDetailedIndicators && (
          <div className="space-y-3 pt-3 border-t border-slate-800 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex flex-wrap gap-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryTab(cat)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      selectedCategoryTab === cat 
                        ? 'bg-blue-600 text-white font-semibold' 
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat === 'All' ? 'All' : cat.split(' ')[0]}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter indicators..."
                  value={indicatorSearch}
                  onChange={(e) => setIndicatorSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Indicator Name (Tap to expand)</th>
                    <th className="py-2.5 px-3 text-right">{district.name}</th>
                    <th className="py-2.5 px-3 text-right">{district.state} Avg</th>
                    <th className="py-2.5 px-3 text-right">National</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {filteredIndicators.map(ind => {
                    const info = getIndicatorInfo(ind.code, ind.name);
                    const val = district.indicators[ind.code];
                    const natVal = ind.national_mean;
                    const stateVal = stateMeans[ind.code] || natVal;
                    const isBetter = ind.direction === 'high' ? val >= natVal : val <= natVal;
                    const isExpanded = expandedTableRow === ind.code;

                    return (
                      <React.Fragment key={ind.code}>
                        <tr 
                          onClick={() => setExpandedTableRow(isExpanded ? null : ind.code)}
                          className="hover:bg-slate-800/60 cursor-pointer transition-colors group"
                        >
                          <td className="py-2.5 px-3 font-semibold text-white group-hover:text-blue-400 transition-colors flex items-center justify-between gap-2">
                            <span>{info.shortName}</span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              {isExpanded ? '▲' : '▼'}
                            </span>
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
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-block font-semibold text-[10px] px-2 py-0.5 rounded-full ${
                              isBetter 
                                ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60' 
                                : 'text-rose-400 bg-rose-950/60 border border-rose-800/60'
                            }`}>
                              {isBetter ? 'Above Avg' : 'Below Avg'}
                            </span>
                          </td>
                        </tr>

                        {/* Inline expanded drawer for complete understandable name & survey definition */}
                        {isExpanded && (
                          <tr className="bg-slate-900/90 text-[11px] text-slate-300">
                            <td colSpan={5} className="py-2.5 px-4 space-y-1.5 border-b border-slate-800">
                              <div className="flex items-start gap-2">
                                <span className="font-bold text-sky-400">Complete Survey Definition ({ind.code}):</span>
                                <span className="leading-relaxed">{info.fullName}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-slate-400 pt-0.5">
                                <span>Category: <strong className="text-slate-200">{info.category}</strong></span>
                                <span>Target Program: <strong className="text-emerald-400">{info.scheme}</strong></span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
