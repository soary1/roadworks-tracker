import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useState } from 'react'
import PropTypes from 'prop-types'
import { iconByType } from '../mapIcons'

export function MapView({ events }) {
  const [expandedId, setExpandedId] = useState(null)

  const toggleExpanded = (id) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <MapContainer center={[-18.91, 47.52]} zoom={13} className="map-inner" scrollWheelZoom>
      <TileLayer
        url="http://localhost:8089/styles/basic-preview/512/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />

      {events.map((event) => {
        const icon = iconByType[event.icon_key] || iconByType.warning
        const entreprise = event.detail_problem.entreprise_assign
        const isExpanded = expandedId === event.id
        return (
          <Marker key={event.id} position={[event.lat, event.lon]} icon={icon}>
            <Popup>
              <div className="popup-card">
                <header className="popup-card__header">
                  <span className="popup-icon">{event.illustration_problem}</span>
                  <div>
                    <p className="popup-eyebrow">Signalement</p>
                    <h3>{event.type_problem.replace(/_/g, ' ')}</h3>
                  </div>
                  <span className="popup-badge">{event.detail_problem.etat}</span>
                </header>

                <p className="popup-description">{event.detail_problem.description}</p>

                <div className="popup-grid">
                  <div>
                    <p className="label">Date</p>
                    <strong>{new Date(event.detail_problem.date_problem).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <p className="label">Surface</p>
                    <strong>{event.detail_problem.surface_m2} m²</strong>
                  </div>
                  <div>
                    <p className="label">Budget</p>
                    <strong>{event.detail_problem.budget.toLocaleString()} Ar</strong>
                  </div>
                  <div>
                    <p className="label">Entreprise</p>
                    <strong>{entreprise?.name ?? 'Non attribué'}</strong>
                  </div>
                </div>

                <button className="popup-toggle" type="button" onClick={() => toggleExpanded(event.id)}>
                  {isExpanded ? 'Masquer le détail' : 'Voir plus de détails'}
                </button>

                {isExpanded && (
                  <div className="popup-extra">
                    <div>
                      <p className="label">Coordonnées</p>
                      <strong>
                        {event.lat.toFixed(5)}, {event.lon.toFixed(5)}
                      </strong>
                    </div>
                    <div>
                      <p className="label">Identifiant</p>
                      <strong>#{event.id}</strong>
                    </div>
                    <div>
                      <p className="label">Type</p>
                      <strong>{event.icon_key}</strong>
                    </div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}

MapView.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      type_problem: PropTypes.string.isRequired,
      illustration_problem: PropTypes.string.isRequired,
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
      icon_key: PropTypes.string.isRequired,
      detail_problem: PropTypes.shape({
        etat: PropTypes.string.isRequired,
        date_problem: PropTypes.string.isRequired,
        surface_m2: PropTypes.number.isRequired,
        budget: PropTypes.number.isRequired,
        entreprise_assign: PropTypes.shape({
          id: PropTypes.number,
          name: PropTypes.string,
        }),
        description: PropTypes.string.isRequired,
      }).isRequired,
    })
  ).isRequired,
}
