import { useState, useEffect } from 'react';
import Map from './components/Map';
import SuburbPanel from './components/SuburbPanel';
import MethodologyPanel from './components/MethodologyPanel';

function Legend() {
  return (
    <div className="flex items-center gap-3 bg-gray-900/90 backdrop-blur-md rounded-lg px-3 py-2 border border-gray-700/50 text-xs">
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-green-500/60" />
        <span className="text-gray-300">Low</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-yellow-500/60" />
        <span className="text-gray-300">Moderate</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-orange-500/60" />
        <span className="text-gray-300">High</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-red-500/60" />
        <span className="text-gray-300">Very High</span>
      </div>
    </div>
  );
}

export default function App() {
  const [selectedSuburb, setSelectedSuburb] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [showMethodology, setShowMethodology] = useState(false);

  useEffect(() => {
    fetch('/data/suburb-risk.json')
      .then((r) => r.json())
      .then(setRiskData);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 overflow-hidden">
      {/* Header */}
      <header className="relative z-[1000] flex items-center justify-between px-4 py-3 bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">Melbourne Safety Map</h1>
            <p className="text-[11px] text-gray-400 leading-tight">Know before you go</p>
          </div>
        </div>
        <button
          onClick={() => setShowMethodology(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors cursor-pointer border border-gray-700/50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Methodology
        </button>
      </header>

      {/* Map area */}
      <div className="flex-1 relative">
        <Map onSuburbClick={setSelectedSuburb} />

        {/* Legend — bottom left */}
        <div className="absolute bottom-6 left-4 z-[1000]">
          <Legend />
        </div>

        {/* Suburb Panel — right side */}
        {riskData && (
          <SuburbPanel
            suburbName={selectedSuburb}
            riskData={riskData}
            onClose={() => setSelectedSuburb(null)}
          />
        )}
      </div>

      {/* Methodology modal */}
      {showMethodology && (
        <MethodologyPanel onClose={() => setShowMethodology(false)} />
      )}
    </div>
  );
}
