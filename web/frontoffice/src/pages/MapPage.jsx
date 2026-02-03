import { useEffect, useMemo, useState } from 'react'
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

const isValidDate = (value) => {
  const d = new Date(value)
  return !Number.isNaN(d.getTime())
}

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
  const [filters, setFilters] = useState({
    query: '',
    status: 'all',
    type: 'all',
    budget: 'all',
    dateFrom: '',
    dateTo: '',
  })

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

  const statusOptions = useMemo(() => {
    const unique = new Set(events.map((event) => slugify(event.detail_problem.etat)))
    return ['all', ...Array.from(unique)]
  }, [events])

  const typeOptions = useMemo(() => {
    const unique = new Set(events.map((event) => slugify(event.type_problem)))
    return ['all', ...Array.from(unique)]
  }, [events])

  const filteredEvents = useMemo(() => {
    const normalizedQuery = filters.query.trim().toLowerCase()

    const matchesBudget = (budget) => {
      if (filters.budget === 'all') return true
      if (filters.budget === 'low') return budget < 1_000_000
      if (filters.budget === 'mid') return budget >= 1_000_000 && budget < 5_000_000
      if (filters.budget === 'high') return budget >= 5_000_000
      return true
    }

    return events.filter((event) => {
      const status = slugify(event.detail_problem.etat)
      const type = slugify(event.type_problem)
      const eventDate = new Date(event.detail_problem.date_problem)

      const matchesQuery =
        !normalizedQuery ||
        event.type_problem.toLowerCase().includes(normalizedQuery) ||
        event.detail_problem.description.toLowerCase().includes(normalizedQuery) ||
        (event.detail_problem.entreprise_assign?.name || '').toLowerCase().includes(normalizedQuery)

      const matchesStatus = filters.status === 'all' || status === filters.status
      const matchesType = filters.type === 'all' || type === filters.type
      const matchesDateFrom =
        !filters.dateFrom || (isValidDate(eventDate) && eventDate >= new Date(filters.dateFrom))
      const matchesDateTo =
        !filters.dateTo || (isValidDate(eventDate) && eventDate <= new Date(filters.dateTo + 'T23:59:59'))

      return (
        matchesQuery &&
        matchesStatus &&
        matchesType &&
        matchesBudget(event.detail_problem.budget) &&
        matchesDateFrom &&
        matchesDateTo
      )
    })
  }, [events, filters])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({ query: '', status: 'all', type: 'all', budget: 'all', dateFrom: '', dateTo: '' })
  }

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
      return <MapView events={filteredEvents} />
    }

    if (activeView === 'dashboard') {
      return <DashboardView events={filteredEvents} />
    }

    return (
      <section className="list-view">
        <h2>Liste détaillée</h2>
        <ul>
          {filteredEvents.map((event) => (
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
        <div className="brand-block">
          <img src={logo} alt="Roadworks Tracker" className="app-logo" />
          <div>
            <p className="eyebrow">Roadworks Tracker</p>
            <h1>Suivi des incidents et travaux</h1>
            <p className="subtitle">Visualisez, filtrez et pilotez les interventions en temps réel.</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="badge badge-live">Flux en direct</div>
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
        </div>
      </header>

      <section className="filters-panel">
        <div className="filters-header">
          <div>
            <p className="eyebrow">Affinez l'affichage</p>
            <h2>Filtres intelligents</h2>
            <p className="filters-subtitle">
              Recherchez par mot-clé, statut, type ou budget pour ne voir que ce qui compte.
            </p>
          </div>
          <button className="ghost-button" onClick={resetFilters}>Réinitialiser</button>
        </div>

        <div className="filters-grid">
          <label className="field">
            <span>Recherche rapide</span>
            <div className="input-with-icon">
              <span>🔎</span>
              <input
                type="search"
                placeholder="Incident, entreprise, description…"
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
              />
            </div>
          </label>

          <label className="field">
            <span>Statut</span>
            <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'Tous' : option.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Type de problème</span>
            <select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)}>
              {typeOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'Tous' : option.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Budget estimé</span>
            <div className="pill-toggle">
              {[
                { key: 'all', label: 'Tous' },
                { key: 'low', label: '< 1M Ar' },
                { key: 'mid', label: '1M - 5M Ar' },
                { key: 'high', label: '> 5M Ar' },
              ].map((item) => (
                <button
                  key={item.key}
                  className={filters.budget === item.key ? 'active' : ''}
                  onClick={() => handleFilterChange('budget', item.key)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </label>

          <label className="field o">
            <span>Depuis le</span>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </label>

          <label className="field date-field">
            <span>Jusqu'au</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </label>
        </div>

        <div className="filters-foot">
          <div className="stat-chip">
            <span className="dot dot-success"></span>
            <strong>{filteredEvents.length}</strong>
            <p>résultats affichés</p>
          </div>
          <div className="stat-chip">
            <span className="dot dot-warning"></span>
            <strong>{events.length}</strong>
            <p>signalements au total</p>
          </div>
        </div>
      </section>

      <main className="app-main">{renderView()}</main>
    </div>
  )
}

export default MapPage
