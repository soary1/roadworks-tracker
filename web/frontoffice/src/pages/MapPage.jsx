import { useEffect, useState } from 'react'
import { MapView } from '../components/MapView'
import { DashboardView } from '../components/DashboardView'
import logo from '../assets/logo.png'
import './MapPage.css'

const locationCoordinates = {
  Analakely: { lat: -18.913, lon: 47.52 },
  Isoraka: { lat: -18.91, lon: 47.535 },
  'Lac Anosy': { lat: -18.91, lon: 47.51 },
}

const iconTypeMap = {
  incident: 'danger',
  travaux: 'travaux_routier',
  'travaux routier': 'travaux_routier',
  danger: 'danger',
  warning: 'warning',
  'montee d eau': 'montee_d_eau',
  'route fermee': 'route_fermee',
  'accident routier': 'accident_routier',
}

const views = [
  { key: 'map', label: 'Carte' },
  { key: 'dashboard', label: 'Tableau de bord' },
  { key: 'list', label: 'Liste' },
]

const defaultCoords = { lat: -18.91, lon: 47.52 }

const parseCoordsFromLocation = (location) => {
  if (!location || typeof location !== 'string') return null
  const parts = location.split(',').map((part) => part.trim())
  if (parts.length !== 2) return null

  const lat = Number(parts[0])
  const lon = Number(parts[1])
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null

  return { lat, lon }
}

const slugify = (value = '') =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')

const mapTypeKey = (typeProblem) => {
  if (!typeProblem) return 'warning'
  const normalized = typeProblem.trim().toLowerCase()
  return iconTypeMap[normalized] || slugify(typeProblem) || 'warning'
}

const mapCoords = (location) =>
  parseCoordsFromLocation(location) || locationCoordinates[location] || defaultCoords

const adaptDtoToEvent = (dto) => {
  const detail = dto.detail ?? {}
  const coords = mapCoords(dto.location)

  return {
    id: dto.id,
    type_problem: dto.typeProblem || 'incident',
    illustration_problem: dto.illustrationProblem || '📍',
    icon_key: mapTypeKey(dto.typeProblem),
    lat: coords.lat,
    lon: coords.lon,
    detail_problem: {
      etat: detail.etat || 'inconnu',
      date_problem: detail.dateProblem ?? new Date().toISOString(),
      surface_m2: Number(detail.surfaceM2 ?? 0),
      budget: Number(detail.budget ?? 0),
      entreprise_assign: detail.entrepriseAssign ?? { id: null, name: '—' },
      description: detail.description ?? 'Aucune description disponible.',
    },
  }
}

export function MapPage() {
  const [activeView, setActiveView] = useState('map')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch('http://localhost:8080/api/signalements')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Impossible de récupérer les signalements.')
        }
        return response.json()
      })
      .then((data) => {
        setEvents(data.map(adaptDtoToEvent))
        setError(null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const renderView = () => {
    if (loading) {
      return (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Chargement des signalements…</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="error-container">
          <div className="error">{error}</div>
        </div>
      )
    }

    if (activeView === 'map') {
      return <MapView events={events} />
    }

    if (activeView === 'dashboard') {
      return <DashboardView events={events} />
    }

    return (
      <section className="list-view">
        <h2>Liste détaillée</h2>
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              <strong>
                {event.illustration_problem} {event.type_problem.replace(/_/g, ' ')}
              </strong>
              <p>{event.detail_problem.description}</p>
              <small>
                <span><strong>Etat:</strong> {event.detail_problem.etat}</span>
                <span><strong>Budget:</strong> {event.detail_problem.budget.toLocaleString()} Ar</span>
              </small>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <img src={logo} alt="Roadworks Tracker" className="app-logo" />
          <div>
            <p className="eyebrow">Roadworks Tracker</p>
            <h1>Suivi des incidents et travaux</h1>
          </div>
        </div>
        <nav className="view-nav">
          {views.map((view) => (
            <button
              key={view.key}
              className={activeView === view.key ? 'active' : ''}
              onClick={() => setActiveView(view.key)}
            >
              {view.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="app-main">{renderView()}</main>
    </div>
  )
}

export default MapPage
