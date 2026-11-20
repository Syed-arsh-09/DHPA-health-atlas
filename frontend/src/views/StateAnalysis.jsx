import React, { useState } from 'react';
import { 
  ChevronRight, 
  ArrowUpDown,
  Search,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  LayoutGrid,
  List,
  Sparkles,
  Map as MapIcon
} from 'lucide-react';
import IndiaMap from '../components/IndiaMap';

export default function StateAnalysis({ 
  districts, 
  metadata, 
  selectedState, 
  setSelectedState, 
  onSelectDistrict 
}) {
  const [districtSearch, setDistrictSearch] = useState('');
  const [sortField, setSortField] = useState('compound'); // 'compound' | 'name'
  const [sortAsc, setSortAsc] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [showMap, setShowMap] = useState(true);

  const stateData = metadata.states.find(s => s.state === selectedState) || metadata.states[0];
  const stateDistricts = districts.filter(d => d.state === selectedState);

  // Filter & sort districts
  const filteredAndSortedDistricts = stateDistricts
    .filter(d => d.name.toLowerCase().includes(districtSearch.toLowerCase()))
    .sort((a, b) => {
      let comp = 0;
      if (sortField === 'compound') {
        comp = a.compound_vulnerability.score - b.compound_vulnerability.score;
      } else if (sortField === 'name') {
        comp = a.name.localeCompare(b.name);
      }
      return sortAsc ? comp : -comp;
    });

  // Short health summary for this state
  const stateAssessment = (() => {
    const avg = stateData.avg_compound_score || 0;
    if (avg >= 3.0) {
      return {
        pill: '🔴 High Priority State',
        text: `Several districts in ${selectedState} have multiple healthcare needs across maternal and child nutrition programs.`
      };
    } else if (avg >= 1.5) {
      return {
        pill: '🟡 Progressing Healthcare',
        text: `${selectedState} shows solid primary clinic coverage; community outreach will strengthen child nutrition.`
      };
    } else {
      return {
        pill: '🟢 Strong Health Foundation',
        text: `${selectedState} maintains high hospital delivery rates and strong immunisation coverage.`
      };
    }
  })();

  return (
    <div className="space-y-6 pb-20">
      
      {/* State Header Card */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                {stateAssessment.pill}
              </span>
              <span className="text-xs text-slate-400">
                {stateDistricts.length} Districts
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {selectedState}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {stateAssessment.text}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-slate-950 p-3.5 rounded-xl border border-slate-800 shrink-0">
            <div className="text-center px-3">
              <span className="text-[11px] text-slate-400 block font-medium">Districts</span>
              <span className="text-xl font-bold text-white mt-0.5 block">
                {stateDistricts.length}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center px-3">
              <span className="text-[11px] text-slate-400 block font-medium">Avg Deficits</span>
              <span className="text-xl font-bold text-white mt-0.5 block">
                {stateData.avg_compound_score} <span className="text-xs text-slate-500 font-normal">/ 6</span>
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center px-3">
              <span className="text-[11px] text-slate-400 block font-medium">Urgent Focus</span>
              <span className={`text-xl font-bold mt-0.5 block ${
                stateData.mission_mode_count > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {stateData.mission_mode_count}
              </span>
            </div>
          </div>
        </div>

        {/* State Map Toggle Button */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
          <span className="text-xs text-slate-400">
            Map of district boundaries in {selectedState}:
          </span>
          <button
            onClick={() => setShowMap(!showMap)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <MapIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
          </button>
        </div>
      </section>

      {/* Interactive Map (Drilled into State) */}
      {showMap && (
        <section className="animate-fade-in">
          <IndiaMap
            selectedState={selectedState}
            onSelectState={(st) => setSelectedState(st)}
            onSelectDistrict={(d) => onSelectDistrict(d)}
            districtsData={districts}
            initialZoomToState={true}
          />
        </section>
      )}

      {/* District Explorer Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Districts in {selectedState} ({stateDistricts.length})
            </h2>
            <p className="text-xs text-slate-400">
              Click any district to view its health report card
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Find district..."
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-36 sm:w-44"
              />
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() => {
                if (sortField === 'compound') {
                  setSortAsc(!sortAsc);
                } else {
                  setSortField('compound');
                  setSortAsc(false);
                }
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors flex items-center gap-1.5"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
              <span>{sortField === 'compound' ? (sortAsc ? 'Least Need' : 'Highest Need') : 'Name'}</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Card View (Decluttered, Uncrowded, Breathable) */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAndSortedDistricts.map(d => {
              const score = d.compound_vulnerability.score;
              const isUrgent = score >= 4;
              const isMod = score >= 2;
              const isIso = score === 1;

              return (
                <div
                  key={d.id}
                  onClick={() => onSelectDistrict(d)}
                  className="bg-slate-900 border border-slate-800 hover:border-blue-500/60 hover:bg-slate-850/80 rounded-xl p-4 cursor-pointer transition-all shadow-sm group flex flex-col justify-between space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                      {d.name}
                    </h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      isUrgent ? 'bg-rose-950 text-rose-300 border border-rose-800/60' :
                      isMod ? 'bg-amber-950 text-amber-300 border border-amber-800/60' :
                      isIso ? 'bg-sky-950 text-sky-300 border border-sky-800/60' :
                      'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                    }`}>
                      {isUrgent ? 'Urgent Need' : isMod ? 'Moderate' : isIso ? 'Focused' : 'Good'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 truncate">
                    Focus: <span className="text-slate-200 font-medium">{d.recommendations.primary_priority}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/70 flex items-center justify-end text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform text-[11px] gap-0.5">
                    <span>View Report</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3.5">District</th>
                  <th className="py-2.5 px-3.5">Healthcare Status</th>
                  <th className="py-2.5 px-3.5">Primary Priority</th>
                  <th className="py-2.5 px-3.5 text-right">Action</th>
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
                      <td className="py-2.5 px-3.5 font-bold text-white group-hover:text-blue-400 transition-colors">
                        {d.name}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          score >= 4 ? 'bg-rose-950 text-rose-300 border border-rose-800/60' :
                          score >= 2 ? 'bg-amber-950 text-amber-300 border border-amber-800/60' :
                          score === 1 ? 'bg-sky-950 text-sky-300 border border-sky-800/60' :
                          'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                        }`}>
                          {score >= 4 ? 'Urgent Need' : score >= 2 ? 'Moderate' : score === 1 ? 'Focused' : 'Good'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-200 font-medium">
                        {d.recommendations.primary_priority}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <span className="text-blue-400 group-hover:text-blue-300 font-semibold inline-flex items-center gap-0.5">
                          Open <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}
