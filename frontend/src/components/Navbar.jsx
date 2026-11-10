import React, { useState } from 'react';
import { 
  Activity, 
  MapPin, 
  Layers, 
  FileText, 
  AlertTriangle, 
  BookOpen, 
  Search,
  ChevronRight
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onSelectDistrict, districts }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'state', label: 'State Analysis', icon: MapPin },
    { id: 'category', label: 'Category Analysis', icon: Layers },
    { id: 'district', label: 'District Profile', icon: FileText },
    { id: 'vulnerabilities', label: 'Overlapping Deficits', icon: AlertTriangle },
    { id: 'methodology', label: 'Model & Methods', icon: BookOpen },
  ];

  const filteredDistricts = searchQuery.trim().length > 1 
    ? districts.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        d.state.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 7)
    : [];

  const handleSelectSearch = (district) => {
    onSelectDistrict(district);
    setActivePage('district');
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Platform Name */}
          <button 
            type="button"
            onClick={() => setActivePage('overview')} 
            className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-1 -ml-1 transition-opacity hover:opacity-90"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-base tracking-tight text-white">DHPA India</span>
                <span className="text-xs text-slate-400 font-normal hidden sm:inline">Health Atlas</span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">District Healthcare Priority Clustering</p>
            </div>
          </button>

          {/* Primary Navigation */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick District Search Bar */}
          <div className="relative shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search 706 districts..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="w-44 sm:w-64 bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Autocomplete Dropdown */}
            {isSearchOpen && filteredDistricts.length > 0 && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-50 overflow-hidden"
                onMouseLeave={() => setIsSearchOpen(false)}
              >
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                  Select District
                </div>
                {filteredDistricts.map(d => (
                  <button
                    key={d.id}
                    onClick={() => handleSelectSearch(d)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors">
                        {d.name}
                      </div>
                      <div className="text-xs text-slate-400">{d.state}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex overflow-x-auto py-2 space-x-1 border-t border-slate-800 scrollbar-none">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive 
                    ? 'bg-slate-800 text-white border border-slate-700' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
