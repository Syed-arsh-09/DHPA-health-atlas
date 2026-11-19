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
  Map,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';
import IndiaMap from '../components/IndiaMap';

export default function DistrictProfile({ 
  districts, 
  metadata, 
  selectedDistrict, 
  setSelectedDistrict 
}) {
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('All');
  const [showMap, setShowMap] = useState(true);
  const [showDetailedIndicators, setShowDetailedIndicators] = useState(false);
  const [indicatorSearch, setIndicatorSearch] = useState('');

  const district = selectedDistrict || districts[0];
  const stateMeta = metadata.states.find(s => s.state === district.state);
  const stateMeans = stateMeta ? stateMeta.indicator_means : {};

  // Human-friendly overall health assessment
  const healthAssessment = useMemo(() => {
    const score = district.compound_vulnerability.score;
    if (score === 0) {
      return {
        badge: '🟢 Excellent Healthcare Performance',
        title: 'Strong Healthcare Foundation',
        summary: `${district.name} maintains high clinical coverage, strong institutional child delivery, and robust community immunisation with low immediate system deficits.`,
        color: 'emerald'
      };
    } else if (score === 1) {
      return {
        badge: '🔵 Good Performance • Isolated Deficit',
        title: 'Solid Healthcare Delivery with Focused Gap',
        summary: `${district.name} performs well in most healthcare dimensions, but requires targeted intervention in ${district.recommendations.primary_priority.toLowerCase()}.`,
        color: 'sky'
      };
    } else if (score <= 3) {
      return {
        badge: '🟡 Moderate Need • Multiple Focus Areas',
        title: 'Developing Health Systems',
        summary: `${district.name} shows progress in hospital access, yet exhibits moderate deficits across ${score} healthcare domains, notably in ${district.recommendations.primary_priority.toLowerCase()}.`,
        color: 'amber'
      };
    } else {
      return {
        badge: '🔴 High Priority • Mission-Mode Urgency',
        title: 'Critical Health Gaps Requiring Priority Support',
        summary: `${district.name} faces concurrent challenges across ${score} out of 6 key healthcare sectors. Immediate administrative focus and central resources are urgently required.`,
        color: 'rose'
      };
    }
  }, [district]);

  // 6 Life-domain simplified status pillars
  const healthPillars = [
    {
      id: 'maternal',
      name: 'Maternal & Pregnancy Care',
      icon: Heart,
      tier: district.domain_tiers.maternal_newborn,
      keyStat: `${district.indicators['C47'] || '--'}%`,
      keyStatLabel: 'Hospital Deliveries',
      secondStat: `${district.indicators['C38'] || '--'}% 4+ Checkups`,
      description: district.domain_tiers.maternal_newborn === 1 
        ? 'High adherence to pregnancy checkups & institutional childbirth.'
        : district.domain_tiers.maternal_newborn === 2
        ? 'Moderate delivery coverage; early pregnancy registration needs boost.'
        : 'Substantial home deliveries and low antenatal care coverage.'
    },
    {
      id: 'child',
      name: 'Childhood Protection & Vaccines',
      icon: Baby,
      tier: district.domain_tiers.child_immunisation,
      keyStat: `${district.indicators['C54'] || '--'}%`,
      keyStatLabel: 'Full Child Immunisation',
      secondStat: `${district.indicators['C48'] || '--'}% Vitamin A`,
      description: district.domain_tiers.child_immunisation === 1
        ? 'Universal childhood routine vaccine coverage and post-natal care.'
        : district.domain_tiers.child_immunisation === 2
        ? 'Majority immunised; booster doses require tracking outreach.'
        : 'Critical vaccination dropout rates; urgent village immunization camps needed.'
    },
    {
      id: 'nutrition',
      name: 'Nutrition & Anaemia Control',
      icon: Apple,
      tier: district.domain_tiers.nutrition_anaemia,
      keyStat: `${district.indicators['C78'] ? (100 - district.indicators['C78']).toFixed(0) : '--'}%`,
      keyStatLabel: 'Children Without Stunting',
      secondStat: `${district.indicators['C80'] ? district.indicators['C80'] : '--'}% Child Anaemia`,
      description: district.domain_tiers.nutrition_anaemia === 1
        ? 'Relatively low rates of malnutrition and high dietary diversity.'
        : district.domain_tiers.nutrition_anaemia === 2
        ? 'Widespread iron deficiency in children & mothers; targeted IFA needed.'
        : 'Severe childhood stunting and maternal anaemia burden.'
    },
    {
      id: 'family',
      name: 'Family Health & Spacing',
      icon: Users,
      tier: district.domain_tiers.family_planning,
      keyStat: `${district.indicators['C26'] || '--'}%`,
      keyStatLabel: 'Modern Family Planning',
      secondStat: `${district.indicators['C27'] || '--'}% Spacing Methods`,
      description: district.domain_tiers.family_planning === 1
        ? 'Strong access to modern reproductive health choices and spacing methods.'
        : district.domain_tiers.family_planning === 2
        ? 'Average family planning adoption; spacing methods need promotion.'
        : 'High unmet need for family planning; adolescent marriage counseling needed.'
    },
    {
      id: 'ncd',
      name: 'Heart, Diabetes & Lifestyle',
      icon: Activity,
      tier: district.domain_tiers.ncd_screening,
      keyStat: `${district.indicators['C97'] ? (100 - district.indicators['C97']).toFixed(0) : '--'}%`,
      keyStatLabel: 'Healthy Blood Pressure',
      secondStat: `${district.indicators['C91'] || '--'}% Blood Sugar Risk`,
      description: district.domain_tiers.ncd_screening === 1
        ? 'Low chronic disease burden and routine community wellness screening.'
        : district.domain_tiers.ncd_screening === 2
        ? 'Emerging hypertension and elevated sugar levels among adults.'
        : 'High non-communicable disease burden; community screening essential.'
    },
    {
      id: 'amenities',
      name: 'Clean Water & Living Conditions',
      icon: Home,
      tier: district.domain_tiers.household_amenities,
      keyStat: `${district.indicators['C14'] || '--'}%`,
      keyStatLabel: 'Improved Sanitation',
      secondStat: `${district.indicators['C15'] || '--'}% Clean Cooking Fuel`,
      description: district.domain_tiers.household_amenities === 1
        ? 'High access to treated drinking water, sanitation, and electricity.'
        : district.domain_tiers.household_amenities === 2
        ? 'Moderate sanitation coverage; clean cooking fuel adoption in progress.'
        : 'Significant deficits in basic toilet facilities and clean energy.'
    }
  ];

  // Derive top 2 strengths and top 2 areas of concern
  const keyInsights = useMemo(() => {
    const scoredIndicators = metadata.indicators.map(ind => {
      const val = district.indicators[ind.code] || 0;
      const nat = ind.national_mean || 0;
      const diff = ind.direction === 'high' ? val - nat : nat - val;
      return {
        ...ind,
        val,
        nat,
        diff
      };
    });

    const sortedByAdvantage = [...scoredIndicators].sort((a, b) => b.diff - a.diff);
    const sortedByDeficit = [...scoredIndicators].sort((a, b) => a.diff - b.diff);

    return {
      strengths: sortedByAdvantage.slice(0, 3),
      concerns: sortedByDeficit.slice(0, 3)
    };
  }, [district, metadata]);

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
    const matchesSearch = !indicatorSearch || 
      ind.name.toLowerCase().includes(indicatorSearch.toLowerCase()) || 
      ind.code.toLowerCase().includes(indicatorSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20">
      
      {/* Interactive Map Header Bar */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Active District Explorer</span>
              <span className="text-xs font-semibold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800/60">
                {district.state}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {district.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowMap(!showMap)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
              showMap 
                ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20' 
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>{showMap ? 'Hide Map Selector' : '🗺️ Open Map to Select District'}</span>
            {showMap ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </section>

      {/* Interactive Map Drawer (The Primary Visual District Selector) */}
      {showMap && (
        <section className="transition-all duration-300 animate-fade-in">
          <IndiaMap
            selectedState={district.state}
            selectedDistrict={district}
            onSelectDistrict={(d) => setSelectedDistrict(d)}
            onSelectState={(st) => {
              const dInState = districts.find(x => x.state === st);
              if (dInState) setSelectedDistrict(dInState);
            }}
            districtsData={districts}
            initialZoomToState={true}
          />
        </section>
      )}

      {/* Main Friendly District Health Card */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-200">
                {healthAssessment.badge}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800/80 text-slate-400">
                District #{district.id} of 706
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {healthAssessment.title}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {healthAssessment.summary}
            </p>
          </div>

          {/* Quick Life Gauge Summary */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex items-center gap-6 shrink-0 shadow-inner">
            <div className="text-center px-3">
              <span className="text-xs text-slate-400 font-medium block">Health Deficits</span>
              <div className={`text-3xl font-black mt-1 ${
                district.compound_vulnerability.score >= 4 ? 'text-rose-400' :
                district.compound_vulnerability.score >= 2 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {district.compound_vulnerability.score}
                <span className="text-xs text-slate-500 font-normal"> / 6 areas</span>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-800" />

            <div className="text-left px-2 max-w-[180px]">
              <span className="text-xs text-slate-400 font-medium block">Urgent Focus</span>
              <div className="text-sm font-bold text-white mt-1 truncate">
                {district.recommendations.primary_priority}
              </div>
              <span className="text-[11px] text-sky-400 font-medium block">
                NHM Targeted Scheme
              </span>
            </div>
          </div>
        </div>

        {/* Actionable Government Interventions in Plain Language */}
        <div className="bg-slate-950/90 border border-blue-900/40 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Prescribed Health Actions & Support</span>
          </div>

          {district.recommendations.triggers && (
            <div className="text-xs text-slate-300">
              <strong className="text-rose-400 font-semibold">Key Root Causes: </strong>
              <span>{district.recommendations.triggers}</span>
            </div>
          )}

          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-900/80 p-4 rounded-lg border border-slate-800">
            {district.recommendations.interventions}
          </div>
        </div>
      </section>

      {/* 6 Key Life Healthcare Pillars (Clean Cards with Friendly Gauges) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            6 Healthcare Pillars at a Glance
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            How {district.name} is performing across everyday family and community health needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthPillars.map(pillar => {
            const Icon = pillar.icon;
            const isGood = pillar.tier === 1;
            const isFair = pillar.tier === 2;
            const isNeed = pillar.tier === 3;

            return (
              <div 
                key={pillar.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-3.5 transition-all shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isGood ? 'bg-emerald-500/20 text-emerald-400' :
                        isFair ? 'bg-amber-500/20 text-amber-400' :
                        'bg-rose-500/20 text-rose-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-white">
                        {pillar.name}
                      </h3>
                    </div>

                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isGood ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' :
                      isFair ? 'bg-amber-950 text-amber-300 border border-amber-800/60' :
                      'bg-rose-950 text-rose-300 border border-rose-800/60'
                    }`}>
                      {isGood ? 'Healthy' : isFair ? 'Moderate' : 'Needs Work'}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400 block truncate">{pillar.keyStatLabel}</span>
                      <span className="text-base font-extrabold text-white mt-0.5 block">{pillar.keyStat}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block truncate">Status Indicator</span>
                      <span className="text-xs font-semibold text-slate-300 mt-1 block truncate">{pillar.secondStat}</span>
                    </div>
                  </div>
                </div>

                {/* Plain-English summary */}
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Balanced Strengths & Challenges Card */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strengths */}
        <div className="bg-slate-900 border border-emerald-900/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3>District Strengths (Performing Above National Average)</h3>
          </div>

          <div className="space-y-3">
            {keyInsights.strengths.map(item => (
              <div key={item.code} className="bg-slate-950 rounded-xl p-3.5 border border-slate-800/80 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-white">{item.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    District: <strong className="text-emerald-400">{item.val} {item.unit}</strong> • National: {item.nat} {item.unit}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold shrink-0">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{item.diff.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Challenges */}
        <div className="bg-slate-900 border border-rose-900/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h3>Priority Gaps (Needs Targeted Improvement)</h3>
          </div>

          <div className="space-y-3">
            {keyInsights.concerns.map(item => (
              <div key={item.code} className="bg-slate-950 rounded-xl p-3.5 border border-slate-800/80 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-white">{item.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    District: <strong className="text-rose-400">{item.val} {item.unit}</strong> • Benchmark: {item.nat} {item.unit}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-rose-400 text-xs font-bold shrink-0">
                  <TrendingDown className="w-4 h-4" />
                  <span>{item.diff.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Progressive Disclosure: Detailed Statistical & Indicator Table */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Detailed Clinical & Survey Indicator Audit
            </h3>
            <p className="text-xs text-slate-400">
              For public health researchers, epidemiologists, and clinical administrators
            </p>
          </div>

          <button
            onClick={() => setShowDetailedIndicators(!showDetailedIndicators)}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <span>{showDetailedIndicators ? 'Hide Indicator Table' : '📊 Show Complete 47-Feature Audit'}</span>
            {showDetailedIndicators ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showDetailedIndicators && (
          <div className="space-y-4 pt-4 border-t border-slate-800 animate-fade-in">
            {/* Filter and Category Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryTab(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategoryTab === cat 
                        ? 'bg-blue-600 text-white font-semibold' 
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter by indicator name or code..."
                  value={indicatorSearch}
                  onChange={(e) => setIndicatorSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3.5">Code</th>
                    <th className="py-3 px-3.5">Indicator Name</th>
                    <th className="py-3 px-3.5 text-right">{district.name}</th>
                    <th className="py-3 px-3.5 text-right">{district.state} Avg</th>
                    <th className="py-3 px-3.5 text-right">National Mean</th>
                    <th className="py-3 px-3.5 text-center">Status vs. Benchmark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {filteredIndicators.map(ind => {
                    const val = district.indicators[ind.code];
                    const natVal = ind.national_mean;
                    const stateVal = stateMeans[ind.code] || natVal;
                    const isBetter = ind.direction === 'high' ? val >= natVal : val <= natVal;
                    const diff = val - natVal;

                    return (
                      <tr key={ind.code} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 px-3.5 font-mono text-slate-400 text-[11px]">
                          {ind.code}
                        </td>
                        <td className="py-2.5 px-3.5 font-medium text-slate-200">
                          {ind.name}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-bold text-white tabular-nums">
                          {val} {ind.unit}
                        </td>
                        <td className="py-2.5 px-3.5 text-right text-slate-400 tabular-nums">
                          {stateVal} {ind.unit}
                        </td>
                        <td className="py-2.5 px-3.5 text-right text-slate-400 tabular-nums">
                          {natVal} {ind.unit}
                        </td>
                        <td className="py-2.5 px-3.5 text-center tabular-nums">
                          <span className={`inline-block font-semibold text-[11px] px-2 py-0.5 rounded-full ${
                            isBetter 
                              ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60' 
                              : 'text-rose-400 bg-rose-950/60 border border-rose-800/60'
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
          </div>
        )}
      </section>

    </div>
  );
}
