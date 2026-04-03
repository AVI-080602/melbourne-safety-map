import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import L from 'leaflet';
import { getLabelForScore, getColorForScore } from '../data/riskUtils';

const MELBOURNE_CENTER = [-37.8136, 144.9631];
const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

function HeatLayer({ coords, riskData }) {
  const map = useMap();
  const heatRef = useRef(null);

  useEffect(() => {
    if (heatRef.current) {
      map.removeLayer(heatRef.current);
    }

    const points = [];
    for (const [suburb, [lat, lng]] of Object.entries(coords)) {
      const data = riskData[suburb];
      if (!data) continue;
      // Intensity: normalise score to 0-1
      const intensity = data.score / 100;
      points.push([lat, lng, intensity]);
    }

    const heat = L.heatLayer(points, {
      radius: 35,
      blur: 25,
      maxZoom: 15,
      max: 1.0,
      minOpacity: 0.3,
      gradient: {
        0.0: '#22c55e',
        0.3: '#22c55e',
        0.45: '#eab308',
        0.65: '#f97316',
        0.85: '#ef4444',
        1.0: '#dc2626',
      },
    });

    heat.addTo(map);
    heatRef.current = heat;

    return () => {
      if (heatRef.current) {
        map.removeLayer(heatRef.current);
      }
    };
  }, [map, coords, riskData]);

  return null;
}

function SuburbMarkers({ coords, riskData, onSuburbClick }) {
  return (
    <>
      {Object.entries(coords).map(([suburb, [lat, lng]]) => {
        const data = riskData[suburb];
        if (!data) return null;
        const color = getColorForScore(data.score);
        return (
          <CircleMarker
            key={suburb}
            center={[lat, lng]}
            radius={6}
            pathOptions={{
              fillColor: color,
              fillOpacity: 0.7,
              color: color,
              weight: 1.5,
              opacity: 0.9,
            }}
            eventHandlers={{
              click: () => onSuburbClick(suburb),
              mouseover: (e) => {
                e.target.setStyle({ fillOpacity: 1, weight: 2.5, color: '#fff' });
              },
              mouseout: (e) => {
                e.target.setStyle({ fillOpacity: 0.7, weight: 1.5, color });
              },
            }}
          >
            <Tooltip
              className="dark-tooltip"
              sticky
            >
              <strong>{suburb}</strong>
              <br />
              Risk: {getLabelForScore(data.score).toUpperCase()} ({data.score})
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}

export default function Map({ onSuburbClick }) {
  const [coords, setCoords] = useState(null);
  const [riskData, setRiskData] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/data/suburb-coords.json').then((r) => r.json()),
      fetch('/data/suburb-risk.json').then((r) => r.json()),
    ]).then(([c, risk]) => {
      setCoords(c);
      setRiskData(risk);
    });
  }, []);

  if (!coords || !riskData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-950">
        <div className="text-gray-400 text-lg">Loading map...</div>
      </div>
    );
  }

  return (
    <MapContainer
      center={MELBOURNE_CENTER}
      zoom={11}
      className="flex-1 w-full"
      zoomControl={true}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url={DARK_TILES}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
      />
      <HeatLayer coords={coords} riskData={riskData} />
      <SuburbMarkers coords={coords} riskData={riskData} onSuburbClick={onSuburbClick} />
    </MapContainer>
  );
}
