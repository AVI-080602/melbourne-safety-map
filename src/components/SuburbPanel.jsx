import { getLabelForScore, getColorForScore } from '../data/riskUtils';

const BADGE_STYLES = {
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const BADGE_LABELS = {
  green: 'LOW',
  yellow: 'MODERATE',
  orange: 'HIGH',
  red: 'VERY HIGH',
};

export default function SuburbPanel({ suburbName, riskData, onClose }) {
  if (!suburbName || !riskData[suburbName]) return null;

  const suburb = riskData[suburbName];
  const score = suburb.score;
  const label = getLabelForScore(score);
  const color = getColorForScore(score);

  return (
    <div className="absolute top-0 right-0 h-full w-80 max-w-[90vw] z-[1000] animate-slide-in">
      <div className="h-full bg-gray-900/95 backdrop-blur-md border-l border-gray-700/50 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-gray-700/50">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">{suburbName}</h2>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${BADGE_STYLES[label]}`}>
                {BADGE_LABELS[label]} RISK
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700/50 rounded-lg cursor-pointer"
              aria-label="Close panel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Risk Score Bar */}
        <div className="p-5 border-b border-gray-700/50">
          <div className="text-sm text-gray-400 mb-2">Risk Score</div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${score}%`, backgroundColor: color }}
              />
            </div>
            <span className="text-lg font-bold text-white min-w-[2.5rem] text-right">{score}</span>
          </div>

        </div>

        {/* Top Crimes */}
        <div className="p-5 border-b border-gray-700/50">
          <div className="text-sm text-gray-400 mb-3">Top Crime Types</div>
          <div className="space-y-2">
            {suburb.top_crimes.map((crime, i) => (
              <div key={crime} className="flex items-center gap-2.5">
                <span className="text-xs text-gray-500 font-mono w-4">{i + 1}.</span>
                <span className="text-sm text-gray-200">{crime}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Tips */}
        <div className="p-5">
          <div className="text-sm text-gray-400 mb-2">Safety Tips</div>
          <p className="text-sm text-gray-300 leading-relaxed">{suburb.tips}</p>
        </div>
      </div>
    </div>
  );
}
