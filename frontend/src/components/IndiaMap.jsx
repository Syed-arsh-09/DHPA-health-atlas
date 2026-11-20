import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronRight, 
  MapPin, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import mapData from '../data/india_map_paths.json';

export default function IndiaMap({
  selectedState = 'Uttar Pradesh',
  selectedDistrict = null,
  onSelectState = () => {},
  onSelectDistrict = () => {},
  districtsData = [],
  className = '',
  initialZoomToState = false
}) {
  // Navigation level: 'country' or 'state'
  const [currentLevel, setCurrentLevel] = useState(initialZoomToState ? 'state' : 'country');
  const [activeStateName, setActiveStateName] = useState(selectedState || 'Uttar Pradesh');
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [districtSearch, setDistrictSearch] = useState('');
  const [customZoom, setCustomZoom] = useState(1);
  const containerRef = useRef(null);

  // Sync with prop changes
  useEffect(() => {
    if (selectedState && selectedState !== activeStateName) {
      setActiveStateName(selectedState);
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedDistrict && selectedDistrict.state) {
      setActiveStateName(selectedDistrict.state);
    }
  }, [selectedDistrict]);

  // Find active state object
  const activeStateObj = useMemo(() => {
    return mapData.states.find(s => s.name === activeStateName) || mapData.states[0];
  }, [activeStateName]);

  // Districts for active state
  const stateDistricts = useMemo(() => {
    return mapData.districts.filter(d => d.state === activeStateName);
  }, [activeStateName]);

  // ViewBox calculation
  const viewBox = useMemo(() => {
    if (currentLevel === 'country') {
      const [vx, vy, vw, vh] = mapData.viewBox;
      if (customZoom === 1) return `${vx} ${vy} ${vw} ${vh}`;
      // Zoom centered
      const newW = vw / customZoom;
      const newH = vh / customZoom;
      const newX = vx + (vw - newW) / 2;
      const newY = vy + (vh - newH) / 2;
      return `${newX} ${newY} ${newW} ${newH}`;
    }

    // State level zoom
    if (activeStateObj && activeStateObj.bbox) {
      const [bx, by, bw, bh] = activeStateObj.bbox;
      // Ensure aspect ratio doesn't distort
      const maxDim = Math.max(bw, bh);
      const cx = bx + bw / 2;
      const cy = by + bh / 2;
      const size = maxDim / customZoom;
      const x = cx - size / 2;
      const y = cy - size / 2;
      return `${x} ${y} ${size} ${size}`;
    }

    return '0 0 800 880';
  }, [currentLevel, activeStateObj, customZoom]);

  // Handle clicking a state
  const handleStateClick = (stateObj) => {
    setActiveStateName(stateObj.name);
    setCurrentLevel('state');
    setCustomZoom(1);
    onSelectState(stateObj.name);
  };

  // Handle clicking a district
  const handleDistrictClick = (districtMapItem) => {
    const fullDistrict = districtsData.find(d => d.id === districtMapItem.id);
    if (fullDistrict) {
      onSelectDistrict(fullDistrict);
    }
  };

  // Zoom controls
  const handleZoomIn = () => setCustomZoom(prev => Math.min(prev * 1.3, 4));
  const handleZoomOut = () => setCustomZoom(prev => Math.max(prev / 1.3, 0.7));
  const handleResetZoom = () => {
    setCustomZoom(1);
    if (currentLevel === 'state') {
      setCurrentLevel('country');
    }
  };

  // Mouse move for tooltip positioning
  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // Filtered districts list for quick search
  const filteredDistricts = useMemo(() => {
    if (!districtSearch.trim()) return stateDistricts;
    return stateDistricts.filter(d => 
      d.name.toLowerCase().includes(districtSearch.toLowerCase())
    );
  }, [stateDistricts, districtSearch]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl ${className}`}
    >
      {/* Top Header & Breadcrumb Nav */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <button
              onClick={() => {
                setCurrentLevel('country');
                setCustomZoom(1);
              }}
              className={`hover:text-blue-400 transition-colors flex items-center gap-1.5 ${
                currentLevel === 'country' ? 'text-blue-400 font-semibold' : ''
              }`}
            >
              <span>🇮🇳 India Health Map</span>
            </button>

            {currentLevel === 'state' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-white font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {activeStateName}
                </span>
                {selectedDistrict && selectedDistrict.state === activeStateName && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-sky-300 font-semibold">
                      {selectedDistrict.name}
                    </span>
                  </>
                )}
              </>
            )}
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            {currentLevel === 'country' 
              ? 'Click any State to View State Overview' 
              : `${activeStateName} — Click Any District to View Health Profile`}
          </h2>
        </div>

        {/* View Switcher & Zoom Controls */}
        <div className="flex items-center gap-2">
          {currentLevel === 'state' && (
            <button
              onClick={() => {
                setCurrentLevel('country');
                setCustomZoom(1);
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
              title="Return to National India Map"
            >
              <span>⬅ All India</span>
            </button>
          )}

          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 shadow-inner">
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Reset View"
              aria-label="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Map Canvas */}
      <div className="relative w-full h-[460px] sm:h-[540px] bg-slate-950/70 overflow-hidden flex items-center justify-center select-none">
        <svg
          viewBox={viewBox}
          className="w-full h-full transition-all duration-700 ease-out cursor-grab active:cursor-grabbing"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Soft shadow filter */}
            <filter id="map-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* LEVEL 1: NATIONAL VIEW (Render States) */}
          {currentLevel === 'country' && (
            <g className="transition-all duration-500">
              {mapData.states.map((st) => {
                const isHovered = hoveredItem && hoveredItem.type === 'state' && hoveredItem.name === st.name;
                const isSelected = activeStateName === st.name;

                return (
                  <path
                    key={st.name}
                    d={st.path}
                    onClick={() => handleStateClick(st)}
                    onMouseEnter={() => setHoveredItem({ type: 'state', ...st })}
                    onMouseLeave={() => setHoveredItem(null)}
                    fill={st.health_color}
                    fillOpacity={isHovered ? 0.95 : isSelected ? 0.85 : 0.65}
                    stroke={isSelected ? '#ffffff' : isHovered ? '#38bdf8' : '#0f172a'}
                    strokeWidth={isSelected ? 2.5 : isHovered ? 1.8 : 0.8}
                    className="transition-all duration-200 cursor-pointer hover:filter drop-shadow"
                    style={{
                      transformOrigin: `${st.center[0]}px ${st.center[1]}px`,
                      filter: isHovered ? 'brightness(1.2)' : 'none'
                    }}
                  />
                );
              })}
            </g>
          )}

          {/* LEVEL 2: STATE VIEW (Render Districts) */}
          {currentLevel === 'state' && (
            <g className="transition-all duration-500">
              {/* Outer boundary of the active state as a subtle background highlight */}
              {activeStateObj && activeStateObj.path && (
                <path
                  d={activeStateObj.path}
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth="2.5"
                  strokeOpacity="0.4"
                />
              )}

              {/* District polygons */}
              {stateDistricts.map((d) => {
                const isHovered = hoveredItem && hoveredItem.type === 'district' && hoveredItem.id === d.id;
                const isSelected = selectedDistrict && selectedDistrict.id === d.id;

                return (
                  <path
                    key={d.id}
                    d={d.path}
                    onClick={() => handleDistrictClick(d)}
                    onMouseEnter={() => setHoveredItem({ type: 'district', ...d })}
                    onMouseLeave={() => setHoveredItem(null)}
                    fill={d.health_color}
                    fillOpacity={isSelected ? 0.95 : isHovered ? 0.9 : 0.6}
                    stroke={isSelected ? '#ffffff' : isHovered ? '#38bdf8' : '#1e293b'}
                    strokeWidth={isSelected ? 3 : isHovered ? 2 : 0.9}
                    className="transition-all duration-150 cursor-pointer"
                    style={{
                      filter: isSelected ? 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.8))' : isHovered ? 'brightness(1.25)' : 'none'
                    }}
                  />
                );
              })}
            </g>
          )}
        </svg>

        {/* Dynamic Hover Tooltip */}
        {hoveredItem && (
          <div
            className="absolute pointer-events-none z-30 bg-slate-900/95 border border-slate-700/80 rounded-xl px-3.5 py-2.5 shadow-2xl backdrop-blur-md max-w-xs transition-transform duration-75 text-xs animate-fade-in"
            style={{
              left: `${Math.min(Math.max(16, mousePos.x + 16), 560)}px`,
              top: `${Math.min(Math.max(16, mousePos.y - 40), 440)}px`
            }}
          >
            {hoveredItem.type === 'state' ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-white text-sm">{hoveredItem.name}</span>
                  <span 
                    className="px-2 py-0.5 rounded text-[10px] font-semibold text-white"
                    style={{ backgroundColor: hoveredItem.health_color }}
                  >
                    {hoveredItem.health_status}
                  </span>
                </div>
                <div className="text-slate-300 text-[11px] flex items-center justify-between gap-4 pt-1 border-t border-slate-800">
                  <span>Districts: <strong className="text-white">{hoveredItem.district_count}</strong></span>
                  <span>Avg Vulnerability: <strong className="text-white">{hoveredItem.avg_compound_score}/6</strong></span>
                </div>
                {hoveredItem.mission_mode_count > 0 && (
                  <div className="text-rose-400 text-[11px] font-medium flex items-center gap-1 pt-0.5">
                    <ShieldAlert className="w-3 h-3 shrink-0" />
                    <span>{hoveredItem.mission_mode_count} High Priority Mission Districts</span>
                  </div>
                )}
                <div className="text-blue-400 text-[10px] font-medium pt-1">
                  👆 Click to view State Overview & Districts
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-white text-sm">{hoveredItem.name}</span>
                  <span 
                    className="px-2 py-0.5 rounded text-[10px] font-semibold text-white"
                    style={{ backgroundColor: hoveredItem.health_color }}
                  >
                    {hoveredItem.health_status}
                  </span>
                </div>
                <div className="text-slate-300 text-[11px]">
                  <span>Vulnerability Score: <strong className="text-white">{hoveredItem.compound_score}/6</strong></span>
                </div>
                <div className="text-slate-400 text-[11px] truncate">
                  Priority: <span className="text-slate-200">{hoveredItem.primary_priority}</span>
                </div>
                <div className="text-emerald-400 text-[10px] font-medium pt-1">
                  👆 Click to open complete health profile
                </div>
              </div>
            )}
          </div>
        )}

        {/* Legend Box in Bottom Left */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800/80 rounded-xl p-2.5 sm:p-3 backdrop-blur shadow-lg text-[11px] space-y-1.5 max-w-[220px]">
          <span className="font-semibold text-slate-300 block text-[10px] uppercase tracking-wider">
            Healthcare Performance Tier
          </span>
          <div className="grid grid-cols-1 gap-1 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-slate-300">Performing Well (Low Gap)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-400 shrink-0" />
              <span className="text-slate-300">Moderate Healthcare</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
              <span className="text-slate-300">Needs Healthcare Boost</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
              <span className="text-slate-300">Urgent Intervention (High Deficit)</span>
            </div>
          </div>
        </div>

        {/* Quick Instructions Badge in Bottom Right */}
        <div className="hidden sm:flex items-center gap-1.5 absolute bottom-3 right-3 bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-400 backdrop-blur">
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>{currentLevel === 'country' ? 'Click any state to inspect its districts' : 'Click any district to view profile'}</span>
        </div>
      </div>

      {/* District Selector Tray (Visible when a State is zoomed in) */}
      {currentLevel === 'state' && (
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">
                Districts in {activeStateName} ({stateDistricts.length})
              </span>
              <span className="text-[11px] text-slate-400">
                • Select directly from map or below:
              </span>
            </div>

            {/* Quick District Filter */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Find district..."
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Interactive District Chips */}
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
            {filteredDistricts.map(d => {
              const isSelected = selectedDistrict && selectedDistrict.id === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => handleDistrictClick(d)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/50'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span 
                    className="w-2 h-2 rounded-full shrink-0" 
                    style={{ backgroundColor: d.health_color }}
                  />
                  <span>{d.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
