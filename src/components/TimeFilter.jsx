const TIME_OPTIONS = [
  { key: 'daytime', label: 'Daytime', sub: '6am – 6pm', icon: '☀' },
  { key: 'evening', label: 'Evening', sub: '6pm – 12am', icon: '🌆' },
  { key: 'late_night', label: 'Late Night', sub: '12am – 6am', icon: '🌙' },
];

export default function TimeFilter({ selected, onChange }) {
  return (
    <div className="flex gap-1.5 bg-gray-900/90 backdrop-blur-md rounded-xl p-1.5 border border-gray-700/50 shadow-2xl">
      {TIME_OPTIONS.map(({ key, label, sub, icon }) => {
        const active = selected === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-200 cursor-pointer whitespace-nowrap
              ${active
                ? 'bg-gray-700 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              }
            `}
          >
            <span className="text-base">{icon}</span>
            <div className="text-left">
              <div className="leading-tight">{label}</div>
              <div className={`text-[10px] leading-tight ${active ? 'text-gray-300' : 'text-gray-500'}`}>
                {sub}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
