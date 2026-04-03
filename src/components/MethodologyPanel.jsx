const SEVERITY_LEVELS = [
  {
    score: 5,
    label: 'Violent / Life-threatening',
    color: '#ef4444',
    crimes: [
      'Homicide and related offences',
      'Serious assault (family violence & non-FV)',
      'Aggravated & non-aggravated robbery',
      'Neglect or ill treatment of people',
      'Terrorism offences',
    ],
  },
  {
    score: 4,
    label: 'Threatening / Dangerous',
    color: '#f97316',
    crimes: [
      'Common assault (family violence & non-FV)',
      'Assault on police / emergency services',
      'Stalking & threatening behaviour',
      'Dangerous driving',
      'Arson & bushfire',
      'Firearms, weapons & explosives offences',
      'Residential aggravated burglary',
      'Breach of family violence / intervention order',
      'Riot and affray',
    ],
  },
  {
    score: 3,
    label: 'Personal Property Crime',
    color: '#eab308',
    crimes: [
      'Harassment & private nuisance',
      'Burglary / break and enter',
      'Motor vehicle theft & steal from vehicle',
      'Drug dealing & trafficking',
      'Drug manufacturing',
      'Hacking & escape custody',
    ],
  },
  {
    score: 2,
    label: 'Property / Financial Crime',
    color: '#a3a3a3',
    crimes: [
      'Criminal damage & property damage',
      'Shoplifting, bicycle theft & other theft',
      'Forgery, deception & fraud',
      'Receiving stolen goods',
      'Cultivate drugs',
      'Bribery, privacy offences',
    ],
  },
  {
    score: 1,
    label: 'Minor / Regulatory',
    color: '#6b7280',
    crimes: [
      'Graffiti & fare evasion',
      'Drug use & possession',
      'Drunk and disorderly, offensive conduct',
      'Begging, defamation',
      'Regulatory & driving offences',
    ],
  },
];

const RISK_CLASSES = [
  { range: '0 – 30', label: 'Low', color: '#22c55e' },
  { range: '31 – 55', label: 'Moderate', color: '#eab308' },
  { range: '56 – 80', label: 'High', color: '#f97316' },
  { range: '80+', label: 'Very High', color: '#ef4444' },
];

export default function MethodologyPanel({ onClose }) {
  return (
    <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700/50 rounded-xl shadow-2xl w-[560px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 p-5 border-b border-gray-700/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Methodology</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700/50 rounded-lg cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Data source */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-1">Data Source</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Crime Statistics Agency Victoria — Recorded Offences by Local Government Area, year ending December 2025. Scores use severity-weighted crime rates per 100,000 population.
            </p>
          </div>

          {/* Risk classes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Risk Classes</h3>
            <div className="grid grid-cols-4 gap-2">
              {RISK_CLASSES.map(({ range, label, color }) => (
                <div key={label} className="text-center p-2 rounded-lg bg-gray-800/50">
                  <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: color }} />
                  <div className="text-xs font-semibold text-gray-200">{label}</div>
                  <div className="text-[10px] text-gray-500">{range}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Severity scale */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Crime Severity Scale (1–5)</h3>
            <div className="space-y-4">
              {SEVERITY_LEVELS.map(({ score, label, color, crimes }) => (
                <div key={score} className="flex gap-3">
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: color + '20', color }}
                  >
                    {score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-200 mb-1">{label}</div>
                    <ul className="space-y-0.5">
                      {crimes.map((crime) => (
                        <li key={crime} className="text-xs text-gray-400">{crime}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How score is calculated */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-1">How Scores Are Calculated</h3>
            <ol className="text-sm text-gray-400 leading-relaxed space-y-1 list-decimal list-inside">
              <li>Each offence type gets a severity weight (1–5)</li>
              <li>Crime rate per 100k population is multiplied by severity</li>
              <li>Weighted rates are summed per Local Government Area</li>
              <li>Scores are normalised to 0–100 (capped at 95th percentile)</li>
              <li>Each suburb inherits its LGA's score</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
