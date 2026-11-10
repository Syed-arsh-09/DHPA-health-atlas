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
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActivePage('overview')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">DHPA</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">
                  India Atlas
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">District Healthcare Priority Clustering</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick District Search Bar */}
          <div className="relative">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search 706 districts..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="w-48 sm:w-64 bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Autocomplete Dropdown */}
            {isSearchOpen && filteredDistricts.length > 0 && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 overflow-hidden"
                onMouseLeave={() => setIsSearchOpen(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Select District
                </div>
                {filteredDistricts.map(d => (
                  <button
                    key={d.id}
                    onClick={() => handleSelectSearch(d)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800/80 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
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
        <div className="md:hidden flex overflow-x-auto py-2.5 space-x-1 border-t border-slate-800 scrollbar-none">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
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
