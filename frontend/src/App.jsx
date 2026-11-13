import React, { useState } from 'react';
import Navbar from './components/Navbar';
import GlobalCursor from './components/GlobalCursor';
import HomeOverview from './views/HomeOverview';
import StateAnalysis from './views/StateAnalysis';
import CategoryAnalysis from './views/CategoryAnalysis';
import DistrictProfile from './views/DistrictProfile';
import OverlappingVulnerabilities from './views/OverlappingVulnerabilities';
import Methodology from './views/Methodology';

import districtsData from './data/districts.json';
import metadataData from './data/metadata.json';

export default function App() {
  const [activePage, setActivePage] = useState('overview');
  const [selectedState, setSelectedState] = useState('Uttar Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState(districtsData[0]);

  // Handler for quick state navigation from Home Overview
  const handleNavigateState = (stateName) => {
    setSelectedState(stateName);
    setActivePage('state');
  };

  // Handler for district selection from search or tables
  const handleSelectDistrict = (district) => {
    setSelectedDistrict(district);
    setSelectedState(district.state);
    setActivePage('district');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Global Interactive Cursor */}
      <GlobalCursor />

      {/* Top Navigation */}
      <Navbar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onSelectDistrict={handleSelectDistrict}
        districts={districtsData}
      />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activePage === 'overview' && (
          <HomeOverview 
            districts={districtsData} 
            metadata={metadataData} 
            onNavigateState={handleNavigateState}
            onNavigateDistrict={handleSelectDistrict}
          />
        )}

        {activePage === 'state' && (
          <StateAnalysis 
            districts={districtsData} 
            metadata={metadataData} 
            selectedState={selectedState} 
            setSelectedState={setSelectedState} 
            onSelectDistrict={handleSelectDistrict}
          />
        )}

        {activePage === 'category' && (
          <CategoryAnalysis 
            districts={districtsData} 
            metadata={metadataData} 
            onSelectDistrict={handleSelectDistrict}
          />
        )}

        {activePage === 'district' && (
          <DistrictProfile 
            districts={districtsData} 
            metadata={metadataData} 
            selectedDistrict={selectedDistrict} 
            setSelectedDistrict={setSelectedDistrict}
          />
        )}

        {activePage === 'vulnerabilities' && (
          <OverlappingVulnerabilities 
            districts={districtsData} 
            metadata={metadataData} 
            onSelectDistrict={handleSelectDistrict}
          />
        )}

        {activePage === 'methodology' && (
          <Methodology 
            metadata={metadataData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-bold text-slate-300">DHPA India Health Atlas</span> • District Healthcare Inequality Detection & Service Priority Clustering
          </div>
          <div className="text-slate-400">
            NFHS-5 District Evidence Engine • 706 Districts • 47 Validated Features
          </div>
        </div>
      </footer>
    </div>
  );
}
