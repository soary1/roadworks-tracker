import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { iconByType } from '../mapIcons';
import './MapView.css';

const events = [
  { id: 1, type: 'danger', title: 'Incident', lat: -18.913, lon: 47.520, description: 'Accident sur la RN7' },
  { id: 2, type: 'works', title: 'Travaux', lat: -18.910, lon: 47.535, description: 'Réfection du revêtement' },
  { id: 3, type: 'warning', title: 'Risque', lat: -18.905, lon: 47.545, description: 'Signalisation défectueuse' },
  { id: 4, type: 'water', title: 'Inondation', lat: -18.920, lon: 47.530, description: 'Débordement à Analakely' },
  { id: 5, type: 'ok', title: 'Validation', lat: -18.907, lon: 47.525, description: 'Zone stabilisée' },
];

export default function MapView() {
  const navigate = useNavigate();

  return (
    <div className="map-page">
      {/* Header */}
      <header className="map-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Retour au Dashboard
        </button>
        <h1>🗺️ Carte des Signalements</h1>
        <div className="header-actions">
          <button className="filter-btn">
            <svg viewBox="0 0 24 24" fill="none">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Filtres
          </button>
        </div>
      </header>

      {/* Map Container */}
      <div className="map-container">
        <MapContainer 
          center={[-18.91, 47.52]} 
          zoom={13} 
          className="map-inner" 
          scrollWheelZoom
        >
          <TileLayer 
            url="http://localhost:8082/styles/basic-preview/512/{z}/{x}/{y}.png" 
            attribution="© OpenStreetMap contributors" 
          />

          {events.map((event) => (
            <Marker 
              key={event.id} 
              position={[event.lat, event.lon]} 
              icon={iconByType[event.type]}
            >
              <Popup>
                <div className="popup-content">
                  <strong>{event.title}</strong>
                  <p>{event.description}</p>
                  <small>Type : {event.type}</small>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="map-legend">
          <h4>Légende</h4>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#ef4444' }}></span>
              <span>Danger</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#f59e0b' }}></span>
              <span>Travaux</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#eab308' }}></span>
              <span>Attention</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#3b82f6' }}></span>
              <span>Inondation</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ background: '#10b981' }}></span>
              <span>Terminé</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
